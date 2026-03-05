import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const body = await req.json();
        const { finishedProductId, rawMaterialId, quantityRequired } = body;

        if (!finishedProductId || !rawMaterialId || !quantityRequired) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        const bom = await prisma.billOfMaterials.upsert({
            where: {
                finishedProductId_rawMaterialId: {
                    finishedProductId,
                    rawMaterialId,
                },
            },
            update: { quantityRequired },
            create: {
                finishedProductId,
                rawMaterialId,
                quantityRequired,
                companyId,
            },
            include: { rawMaterial: true },
        });

        return NextResponse.json(bom, { status: 201 });
    } catch (error) {
        console.error("BOM upsert error:", error);
        return NextResponse.json({ error: "Failed to update BOM" }, { status: 500 });
    }
}
