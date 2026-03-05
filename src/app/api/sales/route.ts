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

        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get("page") || "1");
        const limit = parseInt(url.searchParams.get("limit") || "20");
        const productId = url.searchParams.get("productId");
        const startDate = url.searchParams.get("startDate");
        const endDate = url.searchParams.get("endDate");

        const where: any = { companyId };
        if (productId) where.finishedProductId = productId;
        if (startDate || endDate) {
            where.saleDate = {};
            if (startDate) where.saleDate.gte = new Date(startDate);
            if (endDate) where.saleDate.lte = new Date(endDate);
        }

        const [entries, total] = await Promise.all([
            prisma.salesEntry.findMany({
                where,
                include: {
                    finishedProduct: { select: { name: true, sku: true } },
                    user: { select: { name: true } },
                },
                orderBy: { saleDate: "desc" },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.salesEntry.count({ where }),
        ]);

        return NextResponse.json({ entries, total, page, limit });
    } catch (error) {
        console.error("Get sales error:", error);
        return NextResponse.json({ error: "Failed to fetch sales" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const permError = checkPermission(session, "sales:create");
        if (permError) {
            return NextResponse.json({ error: permError }, { status: 403 });
        }

        const companyId = (session.user as any).companyId;
        const userId = (session.user as any).id;

        const body = await req.json();
        const { finishedProductId, quantitySold, sellingPricePerUnit, customerName, saleDate, notes } = body;

        if (!finishedProductId || !quantitySold || quantitySold <= 0) {
            return NextResponse.json({ error: "Product and quantity are required" }, { status: 400 });
        }

        const product = await prisma.finishedProduct.findFirst({
            where: { id: finishedProductId, companyId },
        });

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        if (Number(product.quantityInStock) < quantitySold) {
            return NextResponse.json(
                { error: `Insufficient stock. Available: ${product.quantityInStock} units` },
                { status: 400 }
            );
        }

        const revenueAmount = quantitySold * (sellingPricePerUnit || Number(product.sellingPrice));

        const result = await prisma.$transaction(async (tx) => {
            const entry = await tx.salesEntry.create({
                data: {
                    finishedProductId,
                    quantitySold,
                    saleDate: saleDate ? new Date(saleDate) : new Date(),
                    customerName: customerName || null,
                    notes: notes || null,
                    revenueAmount,
                    companyId,
                    createdBy: userId,
                },
            });

            const updatedProduct = await tx.finishedProduct.update({
                where: { id: finishedProductId },
                data: { quantityInStock: { decrement: quantitySold } },
            });

            await tx.stockMovement.create({
                data: {
                    type: "SALE_OUT",
                    itemType: "FINISHED_PRODUCT",
                    itemId: finishedProductId,
                    quantityChange: -quantitySold,
                    balanceAfter: Number(updatedProduct.quantityInStock),
                    referenceId: entry.id,
                    notes: `Sold ${quantitySold} units${customerName ? ` to ${customerName}` : ""}`,
                    companyId,
                },
            });

            return entry;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        console.error("Sales error:", error);
        return NextResponse.json({ error: "Failed to record sale" }, { status: 500 });
    }
}
