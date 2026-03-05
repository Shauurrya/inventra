import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { checkPermission } from "@/lib/permissions";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const productId = url.searchParams.get("productId");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");

        const where: any = { companyId };
        if (productId) where.finishedProductId = productId;
        if (startDate || endDate) {
            where.productionDate = {};
            if (startDate) where.productionDate.gte = new Date(startDate);
            if (endDate) where.productionDate.lte = new Date(endDate);
        }

        const [entries, total] = await Promise.all([
            prisma.productionEntry.findMany({
                where,
                include: {
                    finishedProduct: { select: { name: true, sku: true } },
                    user: { select: { name: true } },
                },
                orderBy: { productionDate: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.productionEntry.count({ where }),
        ]);

        return NextResponse.json({ entries, total, page, limit });
    } catch (error) {
        console.error("Get production error:", error);
        return NextResponse.json({ error: "Failed to fetch production entries" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const permError = checkPermission(session, "production:create");
        if (permError) {
            return NextResponse.json({ error: permError }, { status: 403 });
        }

        const companyId = (session.user as any).companyId;
        const userId = (session.user as any).id;

        const body = await req.json();
        const { finishedProductId, quantityProduced, productionDate, notes } = body;

        if (!finishedProductId || !quantityProduced || quantityProduced <= 0) {
            return NextResponse.json(
                { error: "Product and quantity are required" },
                { status: 400 }
            );
        }

        // Fetch BOM for the product
        const bomItems = await prisma.billOfMaterials.findMany({
            where: { finishedProductId, companyId },
            include: { rawMaterial: true },
        });

        if (bomItems.length === 0) {
            return NextResponse.json(
                { error: "No Bill of Materials defined for this product. Please set up the BOM first." },
                { status: 400 }
            );
        }

        // Check material availability
        const shortages: Array<{
            material: string;
            required: number;
            available: number;
            unit: string;
        }> = [];

        for (const bom of bomItems) {
            const required = Number(bom.quantityRequired) * quantityProduced;
            const available = Number(bom.rawMaterial.quantityInStock);
            if (available < required) {
                shortages.push({
                    material: bom.rawMaterial.name,
                    required,
                    available,
                    unit: bom.rawMaterial.unit,
                });
            }
        }

        if (shortages.length > 0) {
            return NextResponse.json(
                {
                    error: "Insufficient raw materials for production",
                    shortages,
                },
                { status: 400 }
            );
        }

        // Execute production in a transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create production entry
            const entry = await tx.productionEntry.create({
                data: {
                    finishedProductId,
                    quantityProduced,
                    productionDate: productionDate ? new Date(productionDate) : new Date(),
                    notes: notes || null,
                    companyId,
                    createdBy: userId,
                },
            });

            // 2. Deduct raw materials and create stock movements
            for (const bom of bomItems) {
                const deduction = Number(bom.quantityRequired) * quantityProduced;
                const updatedMaterial = await tx.rawMaterial.update({
                    where: { id: bom.rawMaterialId },
                    data: {
                        quantityInStock: { decrement: deduction },
                    },
                });

                await tx.stockMovement.create({
                    data: {
                        type: "PRODUCTION_OUT",
                        itemType: "RAW_MATERIAL",
                        itemId: bom.rawMaterialId,
                        quantityChange: -deduction,
                        balanceAfter: Number(updatedMaterial.quantityInStock),
                        referenceId: entry.id,
                        notes: `Deducted for production of ${quantityProduced} units`,
                        companyId,
                    },
                });

                // Check for low stock alerts
                if (Number(updatedMaterial.quantityInStock) < Number(updatedMaterial.minimumStockLevel)) {
                    await tx.lowStockAlert.upsert({
                        where: {
                            id: `alert-${bom.rawMaterialId}`,
                        },
                        update: {
                            alertTriggeredAt: new Date(),
                            isRead: false,
                        },
                        create: {
                            rawMaterialId: bom.rawMaterialId,
                            companyId,
                            isRead: false,
                        },
                    });
                }
            }

            // 3. Add to finished product stock
            const updatedProduct = await tx.finishedProduct.update({
                where: { id: finishedProductId },
                data: {
                    quantityInStock: { increment: quantityProduced },
                },
            });

            // 4. Create stock movement for finished product
            await tx.stockMovement.create({
                data: {
                    type: "PRODUCTION_IN",
                    itemType: "FINISHED_PRODUCT",
                    itemId: finishedProductId,
                    quantityChange: quantityProduced,
                    balanceAfter: Number(updatedProduct.quantityInStock),
                    referenceId: entry.id,
                    notes: `Produced ${quantityProduced} units`,
                    companyId,
                },
            });

            return entry;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Production error:", error);
        return NextResponse.json(
            { error: "Failed to record production. Transaction rolled back." },
            { status: 500 }
        );
    }
}
