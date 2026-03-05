"use client";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-[var(--bg-base)]">
            <Sidebar />
            <div className="md:ml-60 transition-all duration-300">
                <TopBar />
                <main className="p-4 md:p-6 max-w-[1600px] mx-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
