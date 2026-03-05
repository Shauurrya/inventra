import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const [rawMaterials, finishedProducts] = await Promise.all([
            prisma.rawMaterial.findMany({
                where: { companyId, isDeleted: false },
                select: {
                    id: true, name: true, unit: true, quantityInStock: true,
                    minimumStockLevel: true, costPerUnit: true,
                },
            }),
            prisma.finishedProduct.findMany({
                where: { companyId, isDeleted: false },
                select: {
                    id: true, name: true, sku: true, quantityInStock: true, sellingPrice: true,
                },
            }),
        ]);

        return NextResponse.json({ rawMaterials, finishedProducts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
    }
}
