"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useState } from "react";
import { Boxes, Grid, List, Download, Search, Plus } from "lucide-react";
import { toast } from "sonner";
import { StockHealthBar } from "@/components/charts/StockHealthBar";
import { SparkLine } from "@/components/charts/SparkLine";
import { AnimatedNumber } from "@/components/charts/AnimatedNumber";
import { formatINR, formatNumber, getStockStatus, generateCSV, downloadCSV } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function RawMaterialsPage() {
    const queryClient = useQueryClient();
    const [view, setView] = useState<"grid" | "table">("grid");
    const [search, setSearch] = useState("");
    const [panelOpen, setPanelOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        unit: "piece",
        openingStock: 0,
        minimumStockLevel: 0,
        costPerUnit: 0,
    });

    const { data: materials = [], isLoading } = useQuery({
        queryKey: ["raw-materials"],
        queryFn: async () => { const r = await fetch("/api/raw-materials"); return r.json(); },
    });

    const addMutation = useMutation({
        mutationFn: async (data: any) => {
            const r = await fetch("/api/raw-materials", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!r.ok) throw new Error((await r.json()).error);
            return r.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["raw-materials"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
            toast.success("Raw material added successfully!");
            setFormData({ name: "", unit: "piece", openingStock: 0, minimumStockLevel: 0, costPerUnit: 0 });
            setPanelOpen(false);
        },
        onError: (e: any) => toast.error(e.message),
    });

    const filtered = materials.filter((m: any) => m.name.toLowerCase().includes(search.toLowerCase()));
    const totalValue = materials.reduce((s: number, m: any) => s + Number(m.quantityInStock) * Number(m.costPerUnit), 0);
    const criticalCount = materials.filter((m: any) => Number(m.quantityInStock) < Number(m.minimumStockLevel)).length;
    const lowCount = materials.filter((m: any) => { const r = Number(m.minimumStockLevel) > 0 ? Number(m.quantityInStock) / Number(m.minimumStockLevel) : 99; return r >= 1 && r < 1.5; }).length;
    const okCount = materials.length - criticalCount - lowCount;

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl font-bold text-white">Raw Materials</h1>
                    <p className="text-xs text-slate-500">Track stock levels, costs, and consumption</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input className="bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white w-48" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
                    <div className="flex bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                        <button onClick={() => setView("grid")} className={`p-1.5 rounded ${view === "grid" ? "bg-blue-500/20 text-blue-400" : "text-slate-500"}`}><Grid className="w-4 h-4" /></button>
                        <button onClick={() => setView("table")} className={`p-1.5 rounded ${view === "table" ? "bg-blue-500/20 text-blue-400" : "text-slate-500"}`}><List className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => setPanelOpen(true)} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg transition-colors flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Material</button>
                </div>
            </div>

            {/* Summary Bar */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 flex items-center gap-4 overflow-x-auto text-xs font-mono">
                <span className="text-slate-400">Total: <span className="text-white font-bold">{materials.length}</span></span>
                <span className="text-slate-600">│</span>
                <span className="text-slate-400">Value: <span className="text-blue-400 font-bold">{formatINR(totalValue)}</span></span>
                <span className="text-slate-600">│</span>
                <span className="text-red-400">🔴 Critical: {criticalCount}</span>
                <span className="text-slate-600">│</span>
                <span className="text-amber-400">🟡 Low: {lowCount}</span>
                <span className="text-slate-600">│</span>
                <span className="text-emerald-400">🟢 OK: {okCount}</span>
            </div>

            {/* Grid View */}
            {view === "grid" ? (
                <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {filtered.map((m: any, i: number) => {
                        const status = getStockStatus(Number(m.quantityInStock), Number(m.minimumStockLevel));
                        const isCritical = status.variant === "critical";
                        return (
                            <motion.div key={m.id} variants={fadeUp} className={`bg-[var(--bg-card)] border rounded-xl p-4 transition-all hover:border-slate-600 ${isCritical ? "border-red-500/30 glow-red" : "border-slate-700/50"}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold text-white truncate">{m.name}</h3>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isCritical ? "bg-red-500/20 text-red-400" : status.variant === "low" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>{status.label}</span>
                                </div>
                                <AnimatedNumber value={Number(m.quantityInStock)} className="text-2xl font-black text-white" />
                                <span className="text-xs text-slate-500 ml-1">{m.unit}</span>
                                <div className="mt-3">
                                    <StockHealthBar current={Number(m.quantityInStock)} minimum={Number(m.minimumStockLevel)} maximum={m.maxStockLevel ? Number(m.maxStockLevel) : undefined} label="" unit={m.unit} />
                                </div>
                                <div className="mt-3 flex justify-between text-[10px] text-slate-500">
                                    <span>Min: {formatNumber(m.minimumStockLevel)} {m.unit}</span>
                                    <span>{formatINR(Number(m.costPerUnit))}/{m.unit}</span>
                                </div>
                                <div className="mt-1 text-xs text-slate-400">Value: <span className="text-blue-400 font-semibold">{formatINR(Number(m.quantityInStock) * Number(m.costPerUnit))}</span></div>
                            </motion.div>
                        );
                    })}
                </motion.div>
            ) : (
                /* Table View */
                <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/30">
                            <th className="text-left px-4 py-3">Material</th><th className="text-left px-4 py-3">Unit</th><th className="text-right px-4 py-3">Stock</th><th className="text-right px-4 py-3">Min</th><th className="text-right px-4 py-3">Value</th><th className="px-4 py-3">Status</th>
                        </tr></thead>
                        <tbody>
                            {filtered.map((m: any) => {
                                const status = getStockStatus(Number(m.quantityInStock), Number(m.minimumStockLevel));
                                return (
                                    <tr key={m.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-200">{m.name}</td>
                                        <td className="px-4 py-3 text-slate-500">{m.unit}</td>
                                        <td className="px-4 py-3 text-right font-mono text-white">{formatNumber(m.quantityInStock)}</td>
                                        <td className="px-4 py-3 text-right font-mono text-slate-500">{formatNumber(m.minimumStockLevel)}</td>
                                        <td className="px-4 py-3 text-right text-blue-400">{formatINR(Number(m.quantityInStock) * Number(m.costPerUnit))}</td>
                                        <td className="px-4 py-3"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${status.variant === "critical" ? "bg-red-500/20 text-red-400" : status.variant === "low" ? "bg-amber-500/20 text-amber-400" : "bg-emerald-500/20 text-emerald-400"}`}>{status.label}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add Material Panel */}
            {panelOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelOpen(false)} />
                    <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0d1117] border-l border-slate-700/50 z-50 overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-white">Add Raw Material</h3><button onClick={() => setPanelOpen(false)} className="text-slate-500 hover:text-white">✕</button></div>

                        <div><label className="text-xs text-slate-400">Material Name *</label><input className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" placeholder="e.g. Teak Wood, Steel Rod..." value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} /></div>

                        <div><label className="text-xs text-slate-400">Unit</label>
                            <select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })}>
                                <option value="piece">Piece</option>
                                <option value="kg">Kilogram (kg)</option>
                                <option value="litre">Litre</option>
                                <option value="metre">Metre</option>
                                <option value="sqft">Square Feet (sqft)</option>
                                <option value="box">Box</option>
                                <option value="bundle">Bundle</option>
                                <option value="roll">Roll</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div><label className="text-xs text-slate-400">Opening Stock</label><input type="number" min="0" step="0.01" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.openingStock || ""} onChange={(e) => setFormData({ ...formData, openingStock: Number(e.target.value) })} /></div>
                            <div><label className="text-xs text-slate-400">Minimum Stock Level *</label><input type="number" min="0" step="0.01" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.minimumStockLevel || ""} onChange={(e) => setFormData({ ...formData, minimumStockLevel: Number(e.target.value) })} /></div>
                        </div>

                        <div><label className="text-xs text-slate-400">Cost Per Unit (₹)</label><input type="number" min="0" step="0.01" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.costPerUnit || ""} onChange={(e) => setFormData({ ...formData, costPerUnit: Number(e.target.value) })} /></div>

                        {formData.openingStock > 0 && formData.costPerUnit > 0 && (
                            <div className="bg-slate-800/50 rounded-lg p-3">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Opening Value</p>
                                <p className="text-lg font-bold text-blue-400">{formatINR(formData.openingStock * formData.costPerUnit)}</p>
                            </div>
                        )}

                        <button
                            onClick={() => addMutation.mutate(formData)}
                            disabled={addMutation.isPending || !formData.name || formData.name.length < 2}
                            className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors mt-4"
                        >
                            {addMutation.isPending ? "Adding..." : "Add Raw Material"}
                        </button>
                    </motion.div>
                </>
            )}
        </div>
    );
}
