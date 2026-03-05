"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Treemap, Legend } from "recharts";
import { chartTheme } from "@/components/charts/chartTheme";
import { formatINR, formatNumber, generateCSV, downloadCSV } from "@/lib/utils";
import { Download } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

const tabs = [
    { key: "inventory", label: "Inventory" },
    { key: "consumption", label: "Consumption" },
    { key: "production", label: "Production" },
    { key: "sales", label: "Sales" },
];

export default function ReportsPage() {
    const [tab, setTab] = useState("inventory");

    const { data: invData } = useQuery({ queryKey: ["report-inventory"], queryFn: async () => { const r = await fetch("/api/reports/inventory"); return r.json(); }, enabled: tab === "inventory" });
    const { data: consData } = useQuery({ queryKey: ["report-consumption"], queryFn: async () => { const r = await fetch("/api/reports/consumption"); return r.json(); }, enabled: tab === "consumption" });
    const { data: prodData } = useQuery({ queryKey: ["report-production"], queryFn: async () => { const r = await fetch("/api/reports/production"); return r.json(); }, enabled: tab === "production" });
    const { data: salesData } = useQuery({ queryKey: ["report-sales"], queryFn: async () => { const r = await fetch("/api/reports/sales"); return r.json(); }, enabled: tab === "sales" });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-white">Reports</h1><p className="text-xs text-slate-500">Detailed reports with export</p></div>
            </div>

            {/* Tab Selector */}
            <div className="flex gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1">
                {tabs.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all ${tab === t.key ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "text-slate-500 hover:text-slate-300"}`}>{t.label}</button>
                ))}
            </div>

            {/* Inventory Tab */}
            {tab === "inventory" && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
                    {/* Treemap */}
                    {invData?.rawMaterials?.length > 0 && (
                        <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Inventory Value Distribution</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <Treemap data={invData.rawMaterials.map((m: any) => ({ name: m.name, size: Number(m.quantityInStock) * Number(m.costPerUnit) }))} dataKey="size" aspectRatio={4 / 3} stroke="var(--bg-base)" fill="#3b82f6" animationDuration={1200}>
                                    <Tooltip contentStyle={chartTheme.tooltip.contentStyle} formatter={(v: any) => formatINR(v)} />
                                </Treemap>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm"><thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/30"><th className="text-left px-4 py-2">Material</th><th className="text-right px-4 py-2">Stock</th><th className="text-right px-4 py-2">Value</th><th className="px-4 py-2">Status</th></tr></thead>
                            <tbody>{invData?.rawMaterials?.map((m: any) => (<tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30"><td className="px-4 py-2 text-slate-200">{m.name}</td><td className="px-4 py-2 text-right font-mono text-white">{formatNumber(m.quantityInStock)} {m.unit}</td><td className="px-4 py-2 text-right text-blue-400">{formatINR(Number(m.quantityInStock) * Number(m.costPerUnit))}</td><td className="px-4 py-2 text-center"><span className={`text-[10px] px-2 py-0.5 rounded-full ${Number(m.quantityInStock) < Number(m.minimumStockLevel) ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"}`}>{Number(m.quantityInStock) < Number(m.minimumStockLevel) ? "LOW" : "OK"}</span></td></tr>))}</tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Consumption Tab */}
            {tab === "consumption" && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
                    {consData?.materials?.length > 0 && (
                        <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Consumption Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <AreaChart data={consData?.materials || []}>
                                    <defs>{chartTheme.colors.slice(0, 4).map((c, i) => (<linearGradient key={i} id={`g${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.3} /><stop offset="100%" stopColor={c} stopOpacity={0} /></linearGradient>))}</defs>
                                    <CartesianGrid {...chartTheme.grid} />
                                    <XAxis dataKey="name" tick={{ ...chartTheme.axis.tick }} />
                                    <YAxis tick={{ ...chartTheme.axis.tick }} />
                                    <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                                    <Area type="monotone" dataKey="totalConsumed" stroke="#3b82f6" fill="url(#g0)" animationDuration={1200} name="Total Consumed" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm"><thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/30"><th className="text-left px-4 py-2">Material</th><th className="text-right px-4 py-2">Consumed</th><th className="text-right px-4 py-2">Avg/Day</th><th className="text-right px-4 py-2">Days Left</th></tr></thead>
                            <tbody>{consData?.materials?.map((m: any) => (<tr key={m.name} className="border-b border-slate-800/50 hover:bg-slate-800/30"><td className="px-4 py-2 text-slate-200">{m.name}</td><td className="px-4 py-2 text-right font-mono text-orange-400">{formatNumber(m.totalConsumed)} {m.unit}</td><td className="px-4 py-2 text-right font-mono text-slate-400">{m.avgDaily?.toFixed(1)}</td><td className="px-4 py-2 text-right"><span className={`font-mono font-bold ${m.daysRemaining < 7 ? "text-red-400" : m.daysRemaining < 30 ? "text-amber-400" : "text-emerald-400"}`}>{m.daysRemaining || "∞"}</span></td></tr>))}</tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Production Tab */}
            {tab === "production" && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
                    {prodData?.entries?.length > 0 && (
                        <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Production Volume</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={prodData.entries.slice(-14)}>
                                    <CartesianGrid {...chartTheme.grid} />
                                    <XAxis dataKey="date" tick={{ ...chartTheme.axis.tick }} tickFormatter={(d) => { try { return new Date(d).getDate().toString(); } catch { return d; } }} />
                                    <YAxis tick={{ ...chartTheme.axis.tick }} />
                                    <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                                    <Bar dataKey="quantity" fill="#f97316" radius={[4, 4, 0, 0]} animationDuration={1200} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                    <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm"><thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/30"><th className="text-left px-4 py-2">Product</th><th className="text-right px-4 py-2">Units</th><th className="text-right px-4 py-2">Runs</th></tr></thead>
                            <tbody>{prodData?.summary?.map((p: any) => (<tr key={p.name} className="border-b border-slate-800/50 hover:bg-slate-800/30"><td className="px-4 py-2 text-slate-200">{p.name}</td><td className="px-4 py-2 text-right font-mono font-bold text-orange-400">{p.totalProduced}</td><td className="px-4 py-2 text-right font-mono text-slate-400">{p.productionRuns}</td></tr>))}</tbody>
                        </table>
                    </div>
                </motion.div>
            )}

            {/* Sales Tab */}
            {tab === "sales" && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 text-center"><p className="text-[10px] text-slate-500 uppercase">Total Revenue</p><p className="text-xl font-black text-emerald-400 mt-1">{formatINR(salesData?.summary?.totalRevenue || 0)}</p></div>
                        <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 text-center"><p className="text-[10px] text-slate-500 uppercase">Units Sold</p><p className="text-xl font-black text-white mt-1">{salesData?.summary?.totalUnitsSold || 0}</p></div>
                        <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 text-center"><p className="text-[10px] text-slate-500 uppercase">Avg Order</p><p className="text-xl font-black text-white mt-1">{formatINR(salesData?.summary?.avgOrderValue || 0)}</p></div>
                    </div>
                    <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl overflow-hidden">
                        <table className="w-full text-sm"><thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/30"><th className="text-left px-4 py-2">Product</th><th className="text-right px-4 py-2">Units</th><th className="text-right px-4 py-2">Revenue</th></tr></thead>
                            <tbody>{salesData?.products?.map((p: any) => (<tr key={p.name} className="border-b border-slate-800/50 hover:bg-slate-800/30"><td className="px-4 py-2 text-slate-200">{p.name}</td><td className="px-4 py-2 text-right font-mono text-white">{p.unitsSold}</td><td className="px-4 py-2 text-right font-semibold text-emerald-400">{formatINR(p.revenue)}</td></tr>))}</tbody>
                        </table>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
