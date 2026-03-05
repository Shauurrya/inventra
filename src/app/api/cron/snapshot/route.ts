import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const secret = req.headers.get("authorization");
        if (secret !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV !== "development") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const companies = await prisma.company.findMany({ select: { id: true } });

        for (const company of companies) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Calculate totals
            const rawMaterials = await prisma.rawMaterial.findMany({
                where: { companyId: company.id, isDeleted: false },
            });

            const totalInventoryValue = rawMaterials.reduce(
                (sum, m) => sum + Number(m.quantityInStock) * Number(m.costPerUnit), 0
            );

            const todaySales = await prisma.salesEntry.aggregate({
                where: { companyId: company.id, saleDate: { gte: today } },
                _sum: { revenueAmount: true },
            });

            const todayProduction = await prisma.productionEntry.aggregate({
                where: { companyId: company.id, productionDate: { gte: today } },
                _sum: { quantityProduced: true },
            });

            const productCount = await prisma.finishedProduct.count({
                where: { companyId: company.id, isDeleted: false },
            });

            await prisma.dailySnapshot.upsert({
                where: { companyId_snapshotDate: { companyId: company.id, snapshotDate: today } },
                create: {
                    companyId: company.id,
                    snapshotDate: today,
                    totalInventoryValue,
                    totalRawMaterialCount: rawMaterials.length,
                    totalProductCount: productCount,
                    dailyRevenue: Number(todaySales._sum.revenueAmount) || 0,
                    dailyProductionUnits: Number(todayProduction._sum.quantityProduced) || 0,
                },
                update: {
                    totalInventoryValue,
                    totalRawMaterialCount: rawMaterials.length,
                    totalProductCount: productCount,
                    dailyRevenue: Number(todaySales._sum.revenueAmount) || 0,
                    dailyProductionUnits: Number(todayProduction._sum.quantityProduced) || 0,
                },
            });

            // Material consumption logs
            const movements = await prisma.stockMovement.findMany({
                where: {
                    companyId: company.id,
                    type: "PRODUCTION_OUT",
                    itemType: "RAW_MATERIAL",
                    createdAt: { gte: today },
                },
            });

            const consumptionMap: Record<string, number> = {};
            for (const m of movements) {
                consumptionMap[m.itemId] = (consumptionMap[m.itemId] || 0) + Math.abs(Number(m.quantityChange));
            }

            for (const [materialId, qty] of Object.entries(consumptionMap)) {
                await prisma.materialConsumptionLog.upsert({
                    where: {
                        companyId_rawMaterialId_consumptionDate: {
                            companyId: company.id,
                            rawMaterialId: materialId,
                            consumptionDate: today,
                        },
                    },
                    create: {
                        companyId: company.id,
                        rawMaterialId: materialId,
                        consumptionDate: today,
                        quantityConsumed: qty,
                    },
                    update: { quantityConsumed: qty },
                });
            }
        }

        return NextResponse.json({ success: true, companiesProcessed: companies.length });
    } catch (error: any) {
        console.error("Cron snapshot error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
