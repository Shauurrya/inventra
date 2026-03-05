import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const url = new URL(req.url);
        const startDate = url.searchParams.get("startDate") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
        const endDate = url.searchParams.get("endDate") || new Date().toISOString();

        const start = new Date(startDate);
        const end = new Date(endDate);
        const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

        // Get all raw materials
        const materials = await prisma.rawMaterial.findMany({
            where: { companyId, isDeleted: false },
        });

        // Get consumption movements in period
        const movements = await prisma.stockMovement.findMany({
            where: {
                companyId,
                itemType: "RAW_MATERIAL",
                type: "PRODUCTION_OUT",
                createdAt: { gte: start, lte: end },
            },
        });

        // Aggregate consumption per material
        const consumptionMap: Record<string, number> = {};
        movements.forEach((m) => {
            const consumed = Math.abs(Number(m.quantityChange));
            consumptionMap[m.itemId] = (consumptionMap[m.itemId] || 0) + consumed;
        });

        const report = materials.map((m) => {
            const totalConsumed = consumptionMap[m.id] || 0;
            const avgDaily = totalConsumed / daysDiff;
            const currentStock = Number(m.quantityInStock);
            const daysUntilStockout = avgDaily > 0 ? Math.floor(currentStock / avgDaily) : null;

            return {
                id: m.id,
                name: m.name,
                unit: m.unit,
                totalConsumed,
                avgDailyConsumption: Math.round(avgDaily * 100) / 100,
                currentStock,
                daysUntilStockout,
            };
        }).sort((a, b) => (a.daysUntilStockout ?? 9999) - (b.daysUntilStockout ?? 9999));

        return NextResponse.json(report);
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate consumption report" }, { status: 500 });
    }
}
