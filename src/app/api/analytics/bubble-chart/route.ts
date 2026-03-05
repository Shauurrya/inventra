import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const companyId = (session.user as any).companyId;

        const products = await prisma.finishedProduct.findMany({
            where: { companyId, isDeleted: false },
            include: { billOfMaterials: { include: { rawMaterial: true } } },
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const data = await Promise.all(
            products.map(async (p) => {
                const bomCost = p.billOfMaterials.reduce(
                    (sum, b) => sum + Number(b.quantityRequired) * Number(b.rawMaterial.costPerUnit), 0
                );

                const salesAgg = await prisma.salesEntry.aggregate({
                    where: { companyId, finishedProductId: p.id, saleDate: { gte: thirtyDaysAgo } },
                    _sum: { quantitySold: true, revenueAmount: true },
                });

                const unitsSold = Number(salesAgg._sum.quantitySold) || 0;
                const revenue = Number(salesAgg._sum.revenueAmount) || 0;
                const margin = Number(p.sellingPrice) > 0
                    ? ((Number(p.sellingPrice) - bomCost) / Number(p.sellingPrice)) * 100
                    : 0;

                return {
                    name: p.name,
                    x: Math.round(bomCost),
                    y: Number(p.sellingPrice),
                    z: unitsSold,
                    revenue,
                    margin: Math.round(margin),
                    color: margin > 50 ? "#10b981" : margin > 20 ? "#f59e0b" : "#ef4444",
                };
            })
        );

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
