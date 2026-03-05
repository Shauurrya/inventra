import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== "ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const companyId = (session.user as any).companyId;

        const { email, name, role } = await req.json();

        if (!email || !name) {
            return NextResponse.json({ error: "Email and name are required" }, { status: 400 });
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 409 });
        }

        const tempPassword = Math.random().toString(36).slice(-8);
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: role || "STAFF",
                companyId,
            },
        });

        console.log(`[DEV] Invite sent to ${email} with temporary password: ${tempPassword}`);

        return NextResponse.json({
            message: "User invited successfully",
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            tempPassword: process.env.NODE_ENV === "development" ? tempPassword : undefined,
        }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to invite user" }, { status: 500 });
    }
}
