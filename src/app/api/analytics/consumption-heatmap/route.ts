import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const companyId = (session.user as any).companyId;

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const materials = await prisma.rawMaterial.findMany({
            where: { companyId, isDeleted: false },
            select: { id: true, name: true },
        });

        // Try MaterialConsumptionLog first
        const logs = await prisma.materialConsumptionLog.findMany({
            where: { companyId, consumptionDate: { gte: thirtyDaysAgo } },
            orderBy: { consumptionDate: "asc" },
        });

        if (logs.length > 0) {
            const data: any[] = [];
            const dates = Array.from(new Set(logs.map((l) => l.consumptionDate.toISOString().split("T")[0]))).sort();
            for (const date of dates) {
                const row: any = { date };
                for (const m of materials) {
                    const log = logs.find((l) => l.rawMaterialId === m.id && l.consumptionDate.toISOString().split("T")[0] === date);
                    row[m.name] = log ? Number(log.quantityConsumed) : 0;
                }
                data.push(row);
            }
            return NextResponse.json({ materials: materials.map((m) => m.name), data });
        }

        // Fallback: aggregate from stock movements
        const movements = await prisma.stockMovement.findMany({
            where: { companyId, type: "PRODUCTION_OUT", itemType: "RAW_MATERIAL", createdAt: { gte: thirtyDaysAgo } },
        });

        const dayMap: Record<string, Record<string, number>> = {};
        for (const mv of movements) {
            const d = mv.createdAt.toISOString().split("T")[0];
            if (!dayMap[d]) dayMap[d] = {};
            const mat = materials.find((m) => m.id === mv.itemId);
            if (mat) {
                dayMap[d][mat.name] = (dayMap[d][mat.name] || 0) + Math.abs(Number(mv.quantityChange));
            }
        }

        const data = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b)).map(([date, vals]) => {
            const row: any = { date };
            materials.forEach((m) => { row[m.name] = vals[m.name] || 0; });
            return row;
        });

        return NextResponse.json({ materials: materials.map((m) => m.name), data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
