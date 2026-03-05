import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
    title: "Inventra — Smart Inventory for Smart Manufacturers | Inventor Solutions",
    description:
        "Inventra automates raw material tracking, production deductions, and stock alerts — built specifically for Indian manufacturing MSMEs. By Inventor Solutions Pvt. Ltd.",
    keywords: [
        "inventory management",
        "MSME",
        "manufacturing",
        "Bill of Materials",
        "stock management",
        "India",
        "Make in India",
    ],
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className="min-h-screen">
                <Providers>{children}</Providers>
            </body>
        </html>
    );
}
