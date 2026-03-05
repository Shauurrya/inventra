import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const alerts = await prisma.lowStockAlert.findMany({
            where: { companyId },
            include: {
                rawMaterial: {
                    select: { name: true, quantityInStock: true, minimumStockLevel: true, unit: true },
                },
            },
            orderBy: { alertTriggeredAt: "desc" },
        });

        return NextResponse.json(alerts);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
    }
}
