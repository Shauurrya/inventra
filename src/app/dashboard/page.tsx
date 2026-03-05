"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import {
    ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, Legend, Brush
} from "recharts";
import { Package, Factory, TrendingUp, AlertTriangle, BarChart3 } from "lucide-react";
import { AnimatedNumber } from "@/components/charts/AnimatedNumber";
import { SparkLine } from "@/components/charts/SparkLine";
import { StockHealthBar } from "@/components/charts/StockHealthBar";
import { chartTheme } from "@/components/charts/chartTheme";
import { formatINR } from "@/lib/utils";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function DashboardPage() {
    const [lastUpdated, setLastUpdated] = useState(new Date());

    const { data, isLoading } = useQuery({
        queryKey: ["dashboard-summary"],
        queryFn: async () => {
            const res = await fetch("/api/dashboard/summary");
            return res.json();
        },
        refetchInterval: 30000,
    });

    useEffect(() => { if (data) setLastUpdated(new Date()); }, [data]);

    const [clock, setClock] = useState(new Date());
    useEffect(() => { const t = setInterval(() => setClock(new Date()), 1000); return () => clearInterval(t); }, []);

    const rawMaterialCount = data?.rawMaterialCount || 0;
    const productCount = data?.productCount || 0;
    const alertCount = data?.alertCount || 0;
    const totalInventoryValue = data?.totalInventoryValue || 0;
    const monthRevenue = data?.thisMonthRevenue || 0;
    const monthProduction = data?.thisMonthProduction || 0;
    const materialsAtRisk = data?.materialsAtRisk || [];
    const revenueData = data?.revenueChartData || [];
    const topProducts = data?.topProducts || [];
    const recentActivity = data?.recentActivity || [];
    const rawMaterials = data?.stockHealth || [];

    return (
        <div className="space-y-5">
            {/* Status Bar - F1 Style */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 flex items-center gap-4 overflow-x-auto text-xs font-mono">
                <div className="flex items-center gap-2 text-blue-400 font-bold whitespace-nowrap">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span></span>
                    INVENTRA LIVE
                </div>
                <span className="text-slate-600">│</span>
                <span className="text-slate-400 whitespace-nowrap">📦 Materials: <span className="text-white">{rawMaterialCount}</span></span>
                <span className="text-slate-600">│</span>
                <span className="text-slate-400 whitespace-nowrap">🏷 Products: <span className="text-white">{productCount}</span></span>
                <span className="text-slate-600">│</span>
                <span className="text-slate-400 whitespace-nowrap">⚡ Month Production: <span className="text-orange-400">{monthProduction} units</span></span>
                <span className="text-slate-600">│</span>
                <span className="text-slate-400 whitespace-nowrap">💰 Month Revenue: <span className="text-emerald-400">{formatINR(monthRevenue)}</span></span>
                <span className="text-slate-600">│</span>
                {alertCount > 0 ? (
                    <span className="text-red-400 whitespace-nowrap animate-pulse-dot">🔴 Alerts: {alertCount}</span>
                ) : (
                    <span className="text-emerald-400 whitespace-nowrap">✅ All Clear</span>
                )}
                <span className="text-slate-600">│</span>
                <span className="text-slate-500 whitespace-nowrap">🕐 {clock.toLocaleTimeString("en-IN", { hour12: false })}</span>
            </div>

            {/* KPI Cards */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Card 1: Inventory Value */}
                <motion.div variants={fadeUp} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-colors glow-blue">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Inventory Value</span>
                        <Package className="w-4 h-4 text-blue-400" />
                    </div>
                    <AnimatedNumber value={totalInventoryValue} formatFn={(n) => formatINR(n)} className="text-2xl font-black tracking-tight text-white" />
                    <div className="mt-2 flex items-center gap-2">
                        <SparkLine data={[65, 70, 68, 72, 75, 74, 78]} color="#3b82f6" />
                        <span className="text-[10px] text-emerald-400">+4.2%</span>
                    </div>
                </motion.div>

                {/* Card 2: Month Production */}
                <motion.div variants={fadeUp} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 hover:border-orange-500/30 transition-colors glow-orange">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Month Production</span>
                        <Factory className="w-4 h-4 text-orange-400" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <AnimatedNumber value={monthProduction} className="text-2xl font-black tracking-tight text-white" />
                        <span className="text-xs text-slate-500">units</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <SparkLine data={[12, 15, 8, 20, 18, 22, 25]} color="#f97316" />
                        <span className="text-[10px] text-emerald-400">+12%</span>
                    </div>
                </motion.div>

                {/* Card 3: Month Revenue */}
                <motion.div variants={fadeUp} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 hover:border-emerald-500/30 transition-colors glow-green">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Month Revenue</span>
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <AnimatedNumber value={monthRevenue} formatFn={(n) => formatINR(n)} className="text-2xl font-black tracking-tight text-white" />
                    <div className="mt-2 flex items-center gap-2">
                        <SparkLine data={[3000, 5000, 4200, 6100, 5500, 7200, 8000]} color="#10b981" />
                        <span className="text-[10px] text-emerald-400">+8.5%</span>
                    </div>
                </motion.div>

                {/* Card 4: Materials at Risk */}
                <motion.div variants={fadeUp} className={`bg-[var(--bg-card)] border rounded-xl p-4 transition-colors ${alertCount > 0 ? "border-red-500/30 glow-red" : "border-slate-700/50"}`}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">At Risk</span>
                        <AlertTriangle className={`w-4 h-4 ${alertCount > 0 ? "text-red-400 animate-pulse-dot" : "text-slate-600"}`} />
                    </div>
                    <AnimatedNumber value={alertCount} className={`text-2xl font-black tracking-tight ${alertCount > 0 ? "text-red-400" : "text-slate-600"}`} />
                    <div className="mt-2 space-y-1">
                        {materialsAtRisk.slice(0, 3).map((m: any, i: number) => (
                            <p key={i} className="text-[10px] text-red-300/70 truncate">• {m.name}</p>
                        ))}
                        {alertCount === 0 && <p className="text-[10px] text-emerald-400">All materials OK</p>}
                    </div>
                </motion.div>

                {/* Card 5: Avg Batch Size */}
                <motion.div variants={fadeUp} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-colors glow-purple">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Avg Batch Size</span>
                        <BarChart3 className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="flex items-baseline gap-1">
                        <AnimatedNumber value={data?.avgBatchSize || 0} className="text-2xl font-black tracking-tight text-white" />
                        <span className="text-xs text-slate-500">units/run</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                        <SparkLine data={[8, 10, 7, 12, 9, 11, 10]} color="#8b5cf6" />
                        <span className="text-[10px] text-slate-400">stable</span>
                    </div>
                </motion.div>
            </motion.div>

            {/* Main Chart: Revenue vs Production */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-white">Revenue vs Production — Last 30 Days</h3>
                    <span className="text-[10px] text-slate-500 font-mono">DUAL-AXIS CHART</span>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                    <ComposedChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                        <CartesianGrid {...chartTheme.grid} />
                        <XAxis dataKey="date" tick={{ ...chartTheme.axis.tick }} tickFormatter={(d) => { try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric" }); } catch { return d; } }} />
                        <YAxis yAxisId="left" tick={{ ...chartTheme.axis.tick }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <YAxis yAxisId="right" orientation="right" tick={{ ...chartTheme.axis.tick }} />
                        <Tooltip contentStyle={chartTheme.tooltip.contentStyle} formatter={(value: any, name: string) => [name === "revenue" ? formatINR(value) : `${value} units`, name === "revenue" ? "Revenue" : "Production"]} labelFormatter={(d) => { try { return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }); } catch { return d; } }} />
                        <Bar yAxisId="left" dataKey="revenue" fill="#3b82f6" fillOpacity={0.3} stroke="#3b82f6" strokeWidth={1} radius={[4, 4, 0, 0]} animationDuration={1200} />
                        <Line yAxisId="right" type="monotone" dataKey="production" stroke="#f97316" strokeWidth={2} dot={{ fill: "#f97316", r: 3 }} animationDuration={1200} />
                        <Brush dataKey="date" height={20} stroke="#334155" fill="#111827" travellerWidth={8} />
                    </ComposedChart>
                </ResponsiveContainer>
            </motion.div>

            {/* Three-Column Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Stock Health Monitor */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 lg:col-span-1">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Stock Health Monitor</h3>
                    <div className="space-y-2">
                        {rawMaterials.length > 0 ? rawMaterials.sort((a: any, b: any) => {
                            const ra = Number(a.minimumStockLevel) > 0 ? Number(a.quantityInStock) / Number(a.minimumStockLevel) : 999;
                            const rb = Number(b.minimumStockLevel) > 0 ? Number(b.quantityInStock) / Number(b.minimumStockLevel) : 999;
                            return ra - rb;
                        }).map((m: any, i: number) => (
                            <StockHealthBar
                                key={m.id}
                                label={m.name}
                                current={Number(m.quantityInStock)}
                                minimum={Number(m.minimumStockLevel)}
                                maximum={m.maxStockLevel ? Number(m.maxStockLevel) : undefined}
                                unit={m.unit}
                                delay={i * 0.1}
                            />
                        )) : (
                            <p className="text-sm text-slate-500 text-center py-8">No raw materials yet</p>
                        )}
                    </div>
                </motion.div>

                {/* Production Pipeline */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Production Pipeline</h3>
                    <div className="space-y-2 max-h-[360px] overflow-y-auto">
                        {recentActivity?.filter((a: any) => a.type === "production").length > 0 ? (
                            recentActivity.filter((a: any) => a.type === "production").map((a: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-slate-200">{a.product} × <span className="font-mono text-orange-400">{a.qty} units</span></p>
                                        <p className="text-[10px] text-slate-500 font-mono">{a.time}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            topProducts?.map((p: any, i: number) => (
                                <div key={i} className="flex items-start gap-3 py-2 border-b border-slate-700/30 last:border-0">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                    <div className="min-w-0">
                                        <p className="text-sm text-slate-200">{p.name}</p>
                                        <p className="text-[10px] text-slate-500">Revenue: {formatINR(p.revenue || 0)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                        {(!recentActivity || recentActivity.length === 0) && (!topProducts || topProducts.length === 0) && (
                            <p className="text-sm text-slate-500 text-center py-8">No recent production</p>
                        )}
                    </div>
                </motion.div>

                {/* Top Products Donut */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Production Split</h3>
                    {topProducts.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <PieChart>
                                <Pie
                                    data={topProducts.map((p: any) => ({ name: p.name, value: p.units || p.revenue || 1 }))}
                                    cx="50%" cy="50%" innerRadius={55} outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    animationBegin={0} animationDuration={1200} animationEasing="ease-out"
                                >
                                    {topProducts.map((_: any, i: number) => <Cell key={i} fill={chartTheme.colors[i % chartTheme.colors.length]} />)}
                                </Pie>
                                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                                <Legend formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-16 text-slate-500 text-sm">No production data</div>
                    )}
                </motion.div>
            </div>

            {/* Alerts Log */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Activity Log</h3>
                <div className="max-h-[200px] overflow-y-auto font-mono text-[11px] space-y-1">
                    {recentActivity?.length > 0 ? recentActivity.slice(0, 15).map((a: any, i: number) => (
                        <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded hover:bg-slate-800/50">
                            <span className="text-slate-600 w-14 flex-shrink-0">{a.time || "—"}</span>
                            <span className={`w-20 flex-shrink-0 font-bold ${a.type === "sale" ? "text-emerald-400" : a.type === "production" ? "text-orange-400" : "text-blue-400"}`}>
                                {a.type === "sale" ? "⬇ SALE" : a.type === "production" ? "⚡ PROD" : "📦 STOCK"}
                            </span>
                            <span className="text-slate-300 truncate">{a.description || `${a.product} — ${a.qty} units`}</span>
                        </div>
                    )) : (
                        <p className="text-slate-500 text-center py-4">No recent activity</p>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
