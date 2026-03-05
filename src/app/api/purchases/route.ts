import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const purchases = await prisma.rawMaterialPurchase.findMany({
            where: { companyId },
            include: {
                rawMaterial: { select: { name: true, unit: true } },
                user: { select: { name: true } },
            },
            orderBy: { purchaseDate: "desc" },
        });

        return NextResponse.json(purchases);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch purchases" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const permError = checkPermission(session, "purchases:create");
        if (permError) {
            return NextResponse.json({ error: permError }, { status: 403 });
        }

        const companyId = (session.user as any).companyId;
        const userId = (session.user as any).id;

        const body = await req.json();
        const { rawMaterialId, quantityPurchased, costPerUnit, supplierName, purchaseDate, notes } = body;

        if (!rawMaterialId || !quantityPurchased || quantityPurchased <= 0) {
            return NextResponse.json({ error: "Material and quantity are required" }, { status: 400 });
        }

        const totalCost = quantityPurchased * (costPerUnit || 0);

        const result = await prisma.$transaction(async (tx) => {
            const purchase = await tx.rawMaterialPurchase.create({
                data: {
                    rawMaterialId,
                    quantityPurchased,
                    costPerUnit: costPerUnit || 0,
                    totalCost,
                    purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
                    supplierName: supplierName || null,
                    notes: notes || null,
                    companyId,
                    createdBy: userId,
                },
            });

            const updatedMaterial = await tx.rawMaterial.update({
                where: { id: rawMaterialId },
                data: {
                    quantityInStock: { increment: quantityPurchased },
                    costPerUnit: costPerUnit || undefined,
                },
            });

            await tx.stockMovement.create({
                data: {
                    type: "PURCHASE_IN",
                    itemType: "RAW_MATERIAL",
                    itemId: rawMaterialId,
                    quantityChange: quantityPurchased,
                    balanceAfter: Number(updatedMaterial.quantityInStock),
                    referenceId: purchase.id,
                    notes: `Purchased ${quantityPurchased} units${supplierName ? ` from ${supplierName}` : ""}`,
                    companyId,
                },
            });

            return purchase;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Purchase error:", error);
        return NextResponse.json({ error: "Failed to record purchase" }, { status: 500 });
    }
}
