import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const body = await req.json();
        const updated = await prisma.company.update({
            where: { id: companyId },
            data: {
                name: body.name,
                industry: body.industry,
                address: body.address,
            },
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
    }
}
