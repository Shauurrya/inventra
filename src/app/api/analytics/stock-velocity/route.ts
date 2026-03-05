import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const companyId = (session.user as any).companyId;

        const materials = await prisma.rawMaterial.findMany({
            where: { companyId, isDeleted: false },
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const result = await Promise.all(
            materials.map(async (m) => {
                const movements = await prisma.stockMovement.findMany({
                    where: {
                        companyId,
                        itemId: m.id,
                        itemType: "RAW_MATERIAL",
                        type: "PRODUCTION_OUT",
                        createdAt: { gte: thirtyDaysAgo },
                    },
                });

                const totalConsumed = movements.reduce((s, mv) => s + Math.abs(Number(mv.quantityChange)), 0);
                const days = Math.max(1, Math.ceil((Date.now() - thirtyDaysAgo.getTime()) / (86400000)));
                const avgDaily = totalConsumed / days;
                const daysRemaining = avgDaily > 0 ? Math.round(Number(m.quantityInStock) / avgDaily) : 999;

                return {
                    id: m.id,
                    name: m.name,
                    unit: m.unit,
                    currentStock: Number(m.quantityInStock),
                    avgDailyConsumption: Math.round(avgDaily * 100) / 100,
                    daysRemaining,
                    minimumStock: Number(m.minimumStockLevel),
                };
            })
        );

        return NextResponse.json(result.sort((a, b) => a.daysRemaining - b.daysRemaining));
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
