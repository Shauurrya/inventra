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

        const materials = await prisma.rawMaterial.findMany({
            where: { companyId, isDeleted: false },
            orderBy: { name: "asc" },
        });

        return NextResponse.json(materials);
    } catch (error) {
        console.error("Get raw materials error:", error);
        return NextResponse.json({ error: "Failed to fetch raw materials" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const permError = checkPermission(session, "raw-materials:create");
        if (permError) {
            return NextResponse.json({ error: permError }, { status: 403 });
        }

        const companyId = (session.user as any).companyId;

        const body = await req.json();
        const { name, unit, openingStock, minimumStockLevel, costPerUnit } = body;

        if (!name || name.length < 2) {
            return NextResponse.json({ error: "Name must be at least 2 characters" }, { status: 400 });
        }
        if (minimumStockLevel === undefined || minimumStockLevel < 0) {
            return NextResponse.json({ error: "Minimum stock level is required" }, { status: 400 });
        }

        const material = await prisma.rawMaterial.create({
            data: {
                name,
                unit: unit || "piece",
                quantityInStock: openingStock || 0,
                minimumStockLevel: minimumStockLevel || 0,
                costPerUnit: costPerUnit || 0,
                companyId,
            },
        });

        // Create stock movement for opening stock if > 0
        if (openingStock > 0) {
            await prisma.stockMovement.create({
                data: {
                    type: "MANUAL_ADJUSTMENT",
                    itemType: "RAW_MATERIAL",
                    itemId: material.id,
                    quantityChange: openingStock,
                    balanceAfter: openingStock,
                    notes: "Opening stock",
                    companyId,
                },
            });
        }

        return NextResponse.json(material, { status: 201 });
    } catch (error) {
        console.error("Create raw material error:", error);
        return NextResponse.json({ error: "Failed to create raw material" }, { status: 500 });
    }
}
