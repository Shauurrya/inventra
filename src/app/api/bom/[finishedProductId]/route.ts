import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { finishedProductId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const bom = await prisma.billOfMaterials.findMany({
            where: { finishedProductId: params.finishedProductId, companyId },
            include: { rawMaterial: true },
        });

        return NextResponse.json(bom);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch BOM" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { finishedProductId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        // Here finishedProductId is actually the BOM line item id  
        await prisma.billOfMaterials.delete({
            where: { id: params.finishedProductId },
        });

        return NextResponse.json({ message: "BOM line removed" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete BOM line" }, { status: 500 });
    }
}
