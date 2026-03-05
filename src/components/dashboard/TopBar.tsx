"use client";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import { Bell, Search } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

const pageTitle: Record<string, string> = {
    "/dashboard": "Command Center",
    "/dashboard/raw-materials": "Raw Materials",
    "/dashboard/products": "Products",
    "/dashboard/production": "Production",
    "/dashboard/sales": "Sales",
    "/dashboard/inventory": "Inventory",
    "/dashboard/reports": "Reports",
    "/dashboard/analytics": "Analytics Intelligence",
    "/dashboard/alerts": "Alerts",
    "/dashboard/settings": "Settings",
};

export function TopBar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const t = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(t);
    }, []);

    const title = Object.entries(pageTitle).find(([k]) => pathname === k || (k !== "/dashboard" && pathname.startsWith(k)))?.[1] || "Dashboard";

    const { data: alertCount = 0 } = useQuery({
        queryKey: ["unread-alerts-count-topbar"],
        queryFn: async () => {
            const res = await fetch("/api/alerts?unread=true");
            const data = await res.json();
            return data.filter((a: any) => !a.isRead).length;
        },
        refetchInterval: 30000,
    });

    return (
        <header className="h-14 border-b border-slate-700/50 bg-[#0d1117]/80 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <h2 className="text-lg font-bold text-white hidden md:block">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Live Indicator */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="font-mono">{now.toLocaleTimeString("en-IN", { hour12: false })}</span>
                </div>

                {/* Alert Bell */}
                <Link href="/dashboard/alerts" className="relative text-slate-400 hover:text-white transition-colors">
                    <Bell className="w-5 h-5" />
                    {alertCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center animate-pulse-dot">{alertCount}</span>
                    )}
                </Link>

                {/* User Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white">
                    {session?.user?.name?.[0] || "U"}
                </div>
            </div>
        </header>
    );
}
