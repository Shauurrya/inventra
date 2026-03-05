"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { StockHealthBar } from "@/components/charts/StockHealthBar";
import { AnimatedNumber } from "@/components/charts/AnimatedNumber";
import { chartTheme } from "@/components/charts/chartTheme";
import { formatINR, formatNumber, getStockStatus, generateCSV, downloadCSV } from "@/lib/utils";
import { Download } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function InventoryPage() {
    const { data, isLoading } = useQuery({
        queryKey: ["inventory-report"],
        queryFn: async () => { const r = await fetch("/api/reports/inventory"); return r.json(); },
    });

    const rawMaterials = data?.rawMaterials || [];
    const finishedProducts = data?.finishedProducts || [];
    const totalRawValue = rawMaterials.reduce((s: number, m: any) => s + Number(m.quantityInStock) * Number(m.costPerUnit), 0);
    const okCount = rawMaterials.filter((m: any) => Number(m.quantityInStock) >= Number(m.minimumStockLevel) * 1.5).length;
    const lowCount = rawMaterials.filter((m: any) => { const r = Number(m.minimumStockLevel) > 0 ? Number(m.quantityInStock) / Number(m.minimumStockLevel) : 99; return r >= 1 && r < 1.5; }).length;
    const critCount = rawMaterials.filter((m: any) => Number(m.quantityInStock) < Number(m.minimumStockLevel)).length;

    const donutData = [
        { name: "OK", value: okCount, fill: "#10b981" },
        { name: "Low", value: lowCount, fill: "#f59e0b" },
        { name: "Critical", value: critCount, fill: "#ef4444" },
    ].filter((d) => d.value > 0);

    // Kanban groups for finished products
    const kanban = {
        outOfStock: finishedProducts.filter((p: any) => Number(p.quantityInStock) === 0),
        lowStock: finishedProducts.filter((p: any) => { const q = Number(p.quantityInStock); return q > 0 && q < 5; }),
        inStock: finishedProducts.filter((p: any) => { const q = Number(p.quantityInStock); return q >= 5 && q <= 50; }),
        wellStocked: finishedProducts.filter((p: any) => Number(p.quantityInStock) > 50),
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-white">Inventory Overview</h1><p className="text-xs text-slate-500">Complete view of stock levels and health</p></div>
                <button onClick={() => { if (!rawMaterials.length) return; downloadCSV("inventory", generateCSV(["Name", "Unit", "Stock", "Min", "Value", "Status"], rawMaterials.map((m: any) => [m.name, m.unit, String(m.quantityInStock), String(m.minimumStockLevel), String(Number(m.quantityInStock) * Number(m.costPerUnit)), getStockStatus(Number(m.quantityInStock), Number(m.minimumStockLevel)).label]))); }} className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs text-slate-300 hover:text-white transition-colors">
                    <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
            </div>

            {/* Hero Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="md:col-span-1 bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-5 flex flex-col items-center justify-center">
                    {donutData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={180}>
                            <PieChart>
                                <Pie data={donutData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value" animationDuration={1200}>
                                    {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                                </Pie>
                                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-10 text-slate-500 text-sm">No materials</div>
                    )}
                </motion.div>

                <motion.div variants={fadeUp} initial="hidden" animate="show" className="md:col-span-2 bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Total Inventory Value</p>
                    <AnimatedNumber value={totalRawValue} formatFn={(n) => formatINR(n)} className="text-3xl font-black text-white" />
                    <div className="grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-emerald-500/10 rounded-lg p-3 text-center"><p className="text-2xl font-black text-emerald-400">{okCount}</p><p className="text-[10px] text-emerald-400/60">OK</p></div>
                        <div className="bg-amber-500/10 rounded-lg p-3 text-center"><p className="text-2xl font-black text-amber-400">{lowCount}</p><p className="text-[10px] text-amber-400/60">Low</p></div>
                        <div className="bg-red-500/10 rounded-lg p-3 text-center"><p className="text-2xl font-black text-red-400">{critCount}</p><p className="text-[10px] text-red-400/60">Critical</p></div>
                    </div>
                </motion.div>
            </div>

            {/* Stock Bars */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Raw Material Stock Levels</h3>
                <div className="space-y-2">
                    {rawMaterials.sort((a: any, b: any) => {
                        const ra = Number(a.minimumStockLevel) > 0 ? Number(a.quantityInStock) / Number(a.minimumStockLevel) : 99;
                        const rb = Number(b.minimumStockLevel) > 0 ? Number(b.quantityInStock) / Number(b.minimumStockLevel) : 99;
                        return ra - rb;
                    }).map((m: any, i: number) => (
                        <StockHealthBar key={m.id} label={m.name} current={Number(m.quantityInStock)} minimum={Number(m.minimumStockLevel)} maximum={m.maxStockLevel ? Number(m.maxStockLevel) : undefined} unit={m.unit} delay={i * 0.08} />
                    ))}
                </div>
            </motion.div>

            {/* Finished Goods Kanban */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Finished Goods — Kanban View</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                        { title: "🔴 Out of Stock", items: kanban.outOfStock, color: "border-red-500/30" },
                        { title: "🟡 Low Stock", items: kanban.lowStock, color: "border-amber-500/30" },
                        { title: "🟢 In Stock", items: kanban.inStock, color: "border-emerald-500/30" },
                        { title: "📦 Well Stocked", items: kanban.wellStocked, color: "border-blue-500/30" },
                    ].map((col) => (
                        <div key={col.title} className={`border ${col.color} rounded-lg bg-slate-800/20 p-3`}>
                            <p className="text-xs font-semibold text-slate-400 mb-2">{col.title}</p>
                            <div className="space-y-2">
                                {col.items.length > 0 ? col.items.map((p: any) => (
                                    <div key={p.id} className="bg-slate-800/50 rounded-lg p-2.5">
                                        <p className="text-sm font-medium text-slate-200 truncate">{p.name}</p>
                                        <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                                            <span className="font-mono">{Number(p.quantityInStock)} units</span>
                                            <span>{formatINR(p.sellingPrice)}</span>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-[10px] text-slate-600 text-center py-4">None</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
