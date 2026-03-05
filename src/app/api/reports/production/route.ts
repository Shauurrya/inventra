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
            where.productionDate = {};
            if (startDate) where.productionDate.gte = new Date(startDate);
            if (endDate) where.productionDate.lte = new Date(endDate);
        }

        const entries = await prisma.productionEntry.findMany({
            where,
            include: {
                finishedProduct: { select: { name: true, sku: true } },
                user: { select: { name: true } },
            },
            orderBy: { productionDate: "desc" },
        });

        const totalUnits = entries.reduce((s, e) => s + Number(e.quantityProduced), 0);
        const productCounts: Record<string, number> = {};
        entries.forEach((e) => {
            const name = e.finishedProduct.name;
            productCounts[name] = (productCounts[name] || 0) + Number(e.quantityProduced);
        });

        const mostProduced = Object.entries(productCounts).sort((a, b) => b[1] - a[1])[0];

        return NextResponse.json({
            entries,
            summary: {
                totalUnits,
                totalRuns: entries.length,
                mostProducedProduct: mostProduced ? mostProduced[0] : "N/A",
                mostProducedQuantity: mostProduced ? mostProduced[1] : 0,
            },
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to generate production report" }, { status: 500 });
    }
}
