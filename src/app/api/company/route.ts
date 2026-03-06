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

        const company = await prisma.company.findUnique({
            where: { id: companyId },
            select: { id: true, name: true, industry: true, address: true },
        });

        if (!company) {
            return NextResponse.json({ error: "Company not found" }, { status: 404 });
        }

        return NextResponse.json(company);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch company" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const body = await req.json();

        // Only update fields that are actually provided and non-empty
        const updateData: any = {};
        if (body.name && body.name.trim()) updateData.name = body.name.trim();
        if (body.industry !== undefined) updateData.industry = body.industry;
        if (body.address !== undefined) updateData.address = body.address;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const updated = await prisma.company.update({
            where: { id: companyId },
            data: updateData,
        });

        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update company" }, { status: 500 });
    }
}

