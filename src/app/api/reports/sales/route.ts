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
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");

        const where: any = { companyId };
        if (startDate || endDate) {
            where.saleDate = {};
            if (startDate) where.saleDate.gte = new Date(startDate);
            if (endDate) where.saleDate.lte = new Date(endDate);
        }

        const entries = await prisma.salesEntry.findMany({
            where,
            include: {
                finishedProduct: { select: { name: true, sku: true } },
                user: { select: { name: true } },
            },
            orderBy: { saleDate: "desc" },
        });

        const totalUnits = entries.reduce((s, e) => s + Number(e.quantitySold), 0);
        const totalRevenue = entries.reduce((s, e) => s + Number(e.revenueAmount), 0);

        const productRevenue: Record<string, number> = {};
        entries.forEach((e) => {
            const name = e.finishedProduct.name;
            productRevenue[name] = (productRevenue[name] || 0) + Number(e.revenueAmount);
        });

        const bestSelling = Object.entries(productRevenue).sort((a, b) => b[1] - a[1])[0];

        const daysDiff = startDate && endDate
            ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)))
            : 30;

        return NextResponse.json({
            entries,
            summary: {
                totalUnits,
                totalRevenue,
                bestSellingProduct: bestSelling ? bestSelling[0] : "N/A",
                avgRevenuePerDay: Math.round(totalRevenue / daysDiff),
            },
            productRevenue: Object.entries(productRevenue).map(([name, revenue]) => ({ name, revenue })),
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate sales report" }, { status: 500 });
    }
}
