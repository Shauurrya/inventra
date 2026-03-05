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
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const { role } = await req.json();
        const updated = await prisma.user.update({
            where: { id: params.id },
            data: { role },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        if (params.id === (session.user as any).id) {
            return NextResponse.json({ error: "Cannot remove yourself" }, { status: 400 });
        }

        await prisma.user.delete({ where: { id: params.id } });
        return NextResponse.json({ message: "User removed" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to remove user" }, { status: 500 });
    }
}
