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

        const products = await prisma.finishedProduct.findMany({
            where: { companyId, isDeleted: false },
            select: { id: true, name: true },
        });

        const entries = await prisma.productionEntry.findMany({
            where: { companyId, productionDate: { gte: thirtyDaysAgo } },
            orderBy: { productionDate: "asc" },
        });

        // Build cumulative data per day per product
        const dayMap: Record<string, Record<string, number>> = {};
        const cumulative: Record<string, number> = {};
        products.forEach((p) => (cumulative[p.name] = 0));

        for (let i = 29; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split("T")[0];
            dayMap[key] = { ...cumulative };
        }

        for (const e of entries) {
            const key = new Date(e.productionDate).toISOString().split("T")[0];
            const product = products.find((p) => p.id === e.finishedProductId);
            if (product && dayMap[key] !== undefined) {
                cumulative[product.name] = (cumulative[product.name] || 0) + Number(e.quantityProduced);
                // Update all subsequent days
                const dates = Object.keys(dayMap).sort();
                const idx = dates.indexOf(key);
                for (let j = idx; j < dates.length; j++) {
                    dayMap[dates[j]][product.name] = cumulative[product.name];
                }
            }
        }

        const data = Object.entries(dayMap).map(([date, prods]) => ({ date, ...prods }));

        return NextResponse.json({
            products: products.map((p) => p.name),
            data,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
