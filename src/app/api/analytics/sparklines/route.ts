import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const companyId = (session.user as any).companyId;

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        // Try snapshots first
        const snapshots = await prisma.dailySnapshot.findMany({
            where: { companyId, snapshotDate: { gte: sevenDaysAgo } },
            orderBy: { snapshotDate: "asc" },
        });

        if (snapshots.length >= 3) {
            return NextResponse.json({
                revenue: snapshots.map((s) => ({ date: s.snapshotDate, value: Number(s.dailyRevenue) })),
                production: snapshots.map((s) => ({ date: s.snapshotDate, value: Number(s.dailyProductionUnits) })),
                inventoryValue: snapshots.map((s) => ({ date: s.snapshotDate, value: Number(s.totalInventoryValue) })),
                materialsAtRisk: snapshots.map((s) => ({ date: s.snapshotDate, value: 0 })),
            });
        }

        // Fallback: generate from transactions
        const days: any[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            d.setHours(0, 0, 0, 0);
            const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);

            const rev = await prisma.salesEntry.aggregate({
                where: { companyId, saleDate: { gte: d, lt: next } },
                _sum: { revenueAmount: true },
            });
            const prod = await prisma.productionEntry.aggregate({
                where: { companyId, productionDate: { gte: d, lt: next } },
                _sum: { quantityProduced: true },
            });
            days.push({
                date: d.toISOString().split("T")[0],
                revenue: Number(rev._sum.revenueAmount) || 0,
                production: Number(prod._sum.quantityProduced) || 0,
            });
        }

        return NextResponse.json({
            revenue: days.map((d) => ({ date: d.date, value: d.revenue })),
            production: days.map((d) => ({ date: d.date, value: d.production })),
            inventoryValue: days.map((d) => ({ date: d.date, value: 0 })),
            materialsAtRisk: days.map((d) => ({ date: d.date, value: 0 })),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
