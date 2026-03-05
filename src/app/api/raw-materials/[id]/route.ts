import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const material = await prisma.rawMaterial.findFirst({
            where: { id: params.id, companyId },
        });
        if (!material) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        const body = await req.json();
        const updated = await prisma.rawMaterial.update({
            where: { id: params.id },
            data: {
                name: body.name ?? material.name,
                unit: body.unit ?? material.unit,
                minimumStockLevel: body.minimumStockLevel ?? material.minimumStockLevel,
                costPerUnit: body.costPerUnit ?? material.costPerUnit,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update raw material error:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const material = await prisma.rawMaterial.findFirst({
            where: { id: params.id, companyId },
        });
        if (!material) {
            return NextResponse.json({ error: "Material not found" }, { status: 404 });
        }

        await prisma.rawMaterial.update({
            where: { id: params.id },
            data: { isDeleted: true },
        });

        return NextResponse.json({ message: "Material deleted" });
    } catch (error) {
        console.error("Delete raw material error:", error);
        return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }
}
