"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
    LayoutDashboard, ClipboardList, Package, Boxes, Factory, ShoppingCart,
    Truck, BarChart3, LineChart, Bell, Settings, LogOut, ChevronLeft,
    Menu, X, Hexagon
} from "lucide-react";
import { canAccessRoute, getRoleLabel, getRoleBadgeColor } from "@/lib/permissions";

type NavItem = { href: string; icon: any; label: string; isNew?: boolean; hasBadge?: boolean; };

const navSections: { label: string; items: NavItem[] }[] = [
    {
        label: "OVERVIEW",
        items: [
            { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
            { href: "/dashboard/inventory", icon: ClipboardList, label: "Inventory" },
        ],
    },
    {
        label: "OPERATIONS",
        items: [
            { href: "/dashboard/raw-materials", icon: Boxes, label: "Raw Materials" },
            { href: "/dashboard/products", icon: Package, label: "Products" },
            { href: "/dashboard/production", icon: Factory, label: "Production" },
            { href: "/dashboard/sales", icon: ShoppingCart, label: "Sales" },
        ],
    },
    {
        label: "INTELLIGENCE",
        items: [
            { href: "/dashboard/reports", icon: BarChart3, label: "Reports" },
            { href: "/dashboard/analytics", icon: LineChart, label: "Analytics", isNew: true },
        ],
    },
    {
        label: "SYSTEM",
        items: [
            { href: "/dashboard/alerts", icon: Bell, label: "Alerts", hasBadge: true },
            { href: "/dashboard/settings", icon: Settings, label: "Settings" },
        ],
    },
];

export function Sidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const userRole = (session?.user as any)?.role as string | undefined;

    const { data: alerts } = useQuery({
        queryKey: ["unread-alerts-count"],
        queryFn: async () => {
            const res = await fetch("/api/alerts?unread=true");
            const data = await res.json();
            return data.filter((a: any) => !a.isRead).length;
        },
        refetchInterval: 30000,
    });

    useEffect(() => { setMobileOpen(false); }, [pathname]);

    // Filter navigation sections based on user role
    const filteredSections = navSections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => canAccessRoute(userRole, item.href)),
        }))
        .filter((section) => section.items.length > 0);

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="px-4 py-5 flex items-center gap-3 border-b border-slate-700/50">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Hexagon className="w-4 h-4 text-white" />
                </div>
                {!collapsed && (
                    <div className="min-w-0">
                        <h1 className="text-sm font-bold text-white tracking-wide">INVENTRA</h1>
                        <p className="text-[10px] text-slate-500 truncate">{(session?.user as any)?.companyName || "Inventor Solutions"}</p>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
                {filteredSections.map((section) => (
                    <div key={section.label}>
                        {!collapsed && (
                            <p className="px-3 mb-1 text-[10px] font-semibold uppercase tracking-widest text-slate-500">{section.label}</p>
                        )}
                        {section.items.map((item) => {
                            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                            return (
                                <Link key={item.href} href={item.href}>
                                    <div className={`group relative flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${active
                                        ? "bg-blue-500/10 text-blue-400"
                                        : "text-slate-400 hover:bg-slate-700/30 hover:text-slate-200"
                                        }`}>
                                        {active && (
                                            <motion.div
                                                layoutId="sidebar-active"
                                                className="absolute left-0 top-1 bottom-1 w-[3px] bg-blue-500 rounded-full"
                                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <item.icon className="w-4 h-4 flex-shrink-0" />
                                        {!collapsed && (
                                            <>
                                                <span className="flex-1">{item.label}</span>
                                                {item.isNew && (
                                                    <span className="text-[9px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded-full">NEW</span>
                                                )}
                                                {item.hasBadge && alerts > 0 && (
                                                    <span className="text-[10px] font-bold bg-red-500 text-white min-w-[18px] h-[18px] flex items-center justify-center rounded-full animate-pulse-dot">{alerts}</span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </nav>

            {/* User */}
            <div className="px-3 py-4 border-t border-slate-700/50">
                {!collapsed ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {session?.user?.name?.[0] || "U"}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-200 truncate">{session?.user?.name}</p>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getRoleBadgeColor(userRole || "")}`}>
                                {getRoleLabel(userRole || "")}
                            </span>
                        </div>
                        <button onClick={() => signOut({ callbackUrl: "/login" })} className="text-slate-500 hover:text-red-400 transition-colors" title="Logout">
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <button onClick={() => signOut({ callbackUrl: "/login" })} className="w-full flex items-center justify-center text-slate-500 hover:text-red-400 py-2" title="Logout">
                        <LogOut className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-[#0d1117] border-r border-slate-700/50 z-40 transition-all duration-300 ${collapsed ? "w-16" : "w-60"}`}>
                <SidebarContent />
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-8 w-6 h-6 bg-slate-700 border border-slate-600 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-600 transition-all"
                >
                    <ChevronLeft className={`w-3 h-3 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                </button>
            </aside>

            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(true)} className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 bg-slate-800 border border-slate-700 rounded-lg flex items-center justify-center text-slate-300">
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" onClick={() => setMobileOpen(false)} />
                        <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }} className="fixed left-0 top-0 h-screen w-64 bg-[#0d1117] border-r border-slate-700/50 z-50">
                            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
