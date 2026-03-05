import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const product = await prisma.finishedProduct.findFirst({
            where: { id: params.id, companyId },
            include: {
                billOfMaterials: { include: { rawMaterial: true } },
            },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

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

        const product = await prisma.finishedProduct.findFirst({
            where: { id: params.id, companyId },
        });
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        const body = await req.json();
        const updated = await prisma.finishedProduct.update({
            where: { id: params.id },
            data: {
                name: body.name ?? product.name,
                sku: body.sku ?? product.sku,
                description: body.description ?? product.description,
                sellingPrice: body.sellingPrice ?? product.sellingPrice,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
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

        await prisma.finishedProduct.update({
            where: { id: params.id },
            data: { isDeleted: true },
        });

        return NextResponse.json({ message: "Product deleted" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
