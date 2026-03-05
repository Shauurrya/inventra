import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/permissions";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const products = await prisma.finishedProduct.findMany({
            where: { companyId, isDeleted: false },
            include: {
                billOfMaterials: { include: { rawMaterial: true } },
                _count: { select: { billOfMaterials: true } },
            },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(products);
    } catch (error) {
        console.error("Get products error:", error);
        return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const permError = checkPermission(session, "products:create");
        if (permError) {
            return NextResponse.json({ error: permError }, { status: 403 });
        }

        const companyId = (session.user as any).companyId;

        const body = await req.json();
        const { name, sku, description, sellingPrice, openingStock } = body;

        if (!name) {
            return NextResponse.json({ error: "Product name is required" }, { status: 400 });
        }
        if (!sellingPrice || sellingPrice <= 0) {
            return NextResponse.json({ error: "Selling price must be greater than 0" }, { status: 400 });
        }

        const product = await prisma.finishedProduct.create({
            data: {
                name,
                sku: sku || null,
                description: description || null,
                sellingPrice,
                quantityInStock: openingStock || 0,
                companyId,
            },
        });

        if (openingStock > 0) {
            await prisma.stockMovement.create({
                data: {
                    type: "MANUAL_ADJUSTMENT",
                    itemType: "FINISHED_PRODUCT",
                    itemId: product.id,
                    quantityChange: openingStock,
                    balanceAfter: openingStock,
                    notes: "Opening stock",
                    companyId,
                },
            });
        }

        return NextResponse.json(product, { status: 201 });
    } catch (error) {
        console.error("Create product error:", error);
        return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
    }
}
