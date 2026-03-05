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

        await prisma.lowStockAlert.update({
            where: { id: params.id },
            data: { isRead: true },
        });

        return NextResponse.json({ message: "Alert marked as read" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update alert" }, { status: 500 });
    }
}
