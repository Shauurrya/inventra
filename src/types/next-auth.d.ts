import "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            name: string;
            email: string;
            role: string;
            companyId: string;
            companyName: string;
        };
    }

    interface User {
        id: string;
        name: string;
        email: string;
        role: string;
        companyId: string;
        companyName: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        companyId: string;
        companyName: string;
    }
}
