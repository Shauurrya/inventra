import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const companyId = (session.user as any).companyId;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            rawMaterials,
            finishedProducts,
            productionThisMonth,
            revenueThisMonth,
            alerts,
            productionEntries,
            salesEntries,
            recentMovements,
        ] = await Promise.all([
            prisma.rawMaterial.findMany({ where: { companyId, isDeleted: false } }),
            prisma.finishedProduct.findMany({ where: { companyId, isDeleted: false } }),
            prisma.productionEntry.aggregate({
                where: { companyId, productionDate: { gte: startOfMonth } },
                _sum: { quantityProduced: true },
                _count: true,
            }),
            prisma.salesEntry.aggregate({
                where: { companyId, saleDate: { gte: startOfMonth } },
                _sum: { revenueAmount: true },
            }),
            prisma.lowStockAlert.count({ where: { companyId, isRead: false } }),
            prisma.productionEntry.findMany({
                where: { companyId, productionDate: { gte: thirtyDaysAgo } },
                include: { finishedProduct: { select: { name: true, sellingPrice: true } }, user: { select: { name: true } } },
                orderBy: { productionDate: "desc" },
            }),
            prisma.salesEntry.findMany({
                where: { companyId, saleDate: { gte: thirtyDaysAgo } },
                include: { finishedProduct: { select: { name: true } }, user: { select: { name: true } } },
                orderBy: { saleDate: "desc" },
            }),
            prisma.stockMovement.findMany({
                where: { companyId },
                orderBy: { createdAt: "desc" },
                take: 20,
            }),
        ]);

        // Total inventory value
        const totalInventoryValue = rawMaterials.reduce((s, m) => s + Number(m.quantityInStock) * Number(m.costPerUnit), 0);

        // Materials at risk
        const materialsAtRisk = rawMaterials.filter((m) => Number(m.quantityInStock) < Number(m.minimumStockLevel));

        // Top products by production
        const productionByProduct: Record<string, { name: string; units: number; revenue: number }> = {};
        for (const e of productionEntries) {
            const key = e.finishedProductId;
            if (!productionByProduct[key]) productionByProduct[key] = { name: e.finishedProduct.name, units: 0, revenue: 0 };
            productionByProduct[key].units += Number(e.quantityProduced);
        }
        for (const s of salesEntries) {
            const key = s.finishedProductId;
            if (productionByProduct[key]) productionByProduct[key].revenue += Number(s.revenueAmount);
        }
        const topProducts = Object.values(productionByProduct).sort((a, b) => b.units - a.units).slice(0, 5);

        // Avg batch size
        const totalProd = Number(productionThisMonth._sum.quantityProduced) || 0;
        const avgBatchSize = productionThisMonth._count > 0 ? Math.round(totalProd / productionThisMonth._count) : 0;

        // Revenue chart data (30 days)
        const revenueChartData: { date: string; revenue: number; production: number }[] = [];
        for (let i = 29; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 86400000);
            const key = d.toISOString().split("T")[0];
            const dayRevenue = salesEntries.filter((s) => new Date(s.saleDate).toISOString().split("T")[0] === key).reduce((s, e) => s + Number(e.revenueAmount), 0);
            const dayProduction = productionEntries.filter((p) => new Date(p.productionDate).toISOString().split("T")[0] === key).reduce((s, e) => s + Number(e.quantityProduced), 0);
            revenueChartData.push({ date: key, revenue: dayRevenue, production: dayProduction });
        }

        // Recent activity
        const recentActivity = [
            ...productionEntries.slice(0, 10).map((e) => ({
                type: "production" as const,
                product: e.finishedProduct.name,
                qty: Number(e.quantityProduced),
                time: new Date(e.productionDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                description: `${e.finishedProduct.name} × ${Number(e.quantityProduced)} units by ${e.user.name}`,
                date: e.productionDate,
            })),
            ...salesEntries.slice(0, 10).map((s) => ({
                type: "sale" as const,
                product: s.finishedProduct.name,
                qty: Number(s.quantitySold),
                time: new Date(s.saleDate).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
                description: `Sold ${Number(s.quantitySold)} × ${s.finishedProduct.name}`,
                date: s.saleDate,
            })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 15);

        return NextResponse.json({
            rawMaterialCount: rawMaterials.length,
            productCount: finishedProducts.length,
            totalInventoryValue,
            thisMonthRevenue: Number(revenueThisMonth._sum.revenueAmount) || 0,
            thisMonthProduction: totalProd,
            alertCount: alerts,
            materialsAtRisk,
            avgBatchSize,
            topProducts,
            revenueChartData,
            recentActivity,
            stockHealth: rawMaterials,
        });
    } catch (error) {
        console.error("Dashboard summary error:", error);
        return NextResponse.json({ error: "Failed to fetch dashboard summary" }, { status: 500 });
    }
}
