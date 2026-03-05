import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/permissions";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const permError = checkPermission(session, "stock:adjust");
        if (permError) {
            return NextResponse.json({ error: permError }, { status: 403 });
        }

        const companyId = (session.user as any).companyId;

        const body = await req.json();
        const { itemType, itemId, adjustedQuantity, reason, notes } = body;

        if (!itemType || !itemId || adjustedQuantity === undefined) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (itemType === "RAW_MATERIAL") {
            const material = await prisma.rawMaterial.findFirst({
                where: { id: itemId, companyId },
            });
            if (!material) {
                return NextResponse.json({ error: "Material not found" }, { status: 404 });
            }

            const previousStock = Number(material.quantityInStock);
            const quantityChange = adjustedQuantity - previousStock;

            await prisma.$transaction(async (tx) => {
                await tx.rawMaterial.update({
                    where: { id: itemId },
                    data: { quantityInStock: adjustedQuantity },
                });

                await tx.stockMovement.create({
                    data: {
                        type: "MANUAL_ADJUSTMENT",
                        itemType: "RAW_MATERIAL",
                        itemId,
                        quantityChange,
                        balanceAfter: adjustedQuantity,
                        notes: `${reason}${notes ? `: ${notes}` : ""}`,
                        companyId,
                    },
                });
            });
        } else {
            const product = await prisma.finishedProduct.findFirst({
                where: { id: itemId, companyId },
            });
            if (!product) {
                return NextResponse.json({ error: "Product not found" }, { status: 404 });
            }

            const previousStock = Number(product.quantityInStock);
            const quantityChange = adjustedQuantity - previousStock;

            await prisma.$transaction(async (tx) => {
                await tx.finishedProduct.update({
                    where: { id: itemId },
                    data: { quantityInStock: adjustedQuantity },
                });

                await tx.stockMovement.create({
                    data: {
                        type: "MANUAL_ADJUSTMENT",
                        itemType: "FINISHED_PRODUCT",
                        itemId,
                        quantityChange,
                        balanceAfter: adjustedQuantity,
                        notes: `${reason}${notes ? `: ${notes}` : ""}`,
                        companyId,
                    },
                });
            });
        }

        return NextResponse.json({ message: "Stock adjusted successfully" });
    } catch (error) {
        console.error("Stock adjustment error:", error);
        return NextResponse.json({ error: "Failed to adjust stock" }, { status: 500 });
    }
}
