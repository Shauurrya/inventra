"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Factory, CheckCircle, XCircle, AlertTriangle, ChevronRight } from "lucide-react";
import { AnimatedNumber } from "@/components/charts/AnimatedNumber";
import { chartTheme } from "@/components/charts/chartTheme";
import { formatINR } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from "recharts";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ProductionPage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ finishedProductId: "", quantityProduced: 0, productionDate: new Date().toISOString().split("T")[0], notes: "" });
    const [materialCheck, setMaterialCheck] = useState<any[]>([]);
    const [panelOpen, setPanelOpen] = useState(false);

    const { data: products = [] } = useQuery({ queryKey: ["finished-products"], queryFn: async () => { const r = await fetch("/api/finished-products"); return r.json(); } });
    const { data: history, isLoading } = useQuery({ queryKey: ["production-history"], queryFn: async () => { const r = await fetch("/api/production?limit=30"); return r.json(); } });

    const checkMaterials = useCallback(async () => {
        if (!formData.finishedProductId || !formData.quantityProduced) { setMaterialCheck([]); return; }
        try {
            const [bomRes, matRes] = await Promise.all([fetch(`/api/bom/${formData.finishedProductId}`), fetch("/api/raw-materials")]);
            const [bom, materials] = await Promise.all([bomRes.json(), matRes.json()]);
            setMaterialCheck(bom.map((b: any) => {
                const mat = materials.find((m: any) => m.id === b.rawMaterialId);
                const req = Number(b.quantityRequired) * formData.quantityProduced;
                const avail = mat ? Number(mat.quantityInStock) : 0;
                return { name: b.rawMaterial.name, unit: b.rawMaterial.unit, required: req, available: avail, cost: mat ? Number(mat.costPerUnit) : 0, status: avail < req ? "INSUFFICIENT" : avail - req < Number(mat?.minimumStockLevel || 0) ? "LOW" : "SUFFICIENT" };
            }));
        } catch { setMaterialCheck([]); }
    }, [formData.finishedProductId, formData.quantityProduced]);

    useEffect(() => { const t = setTimeout(checkMaterials, 400); return () => clearTimeout(t); }, [checkMaterials]);

    const hasInsufficient = materialCheck.some((m) => m.status === "INSUFFICIENT");
    const totalCost = materialCheck.reduce((s, m) => s + m.required * m.cost, 0);
    const selectedProduct = products.find((p: any) => p.id === formData.finishedProductId);
    const expectedRevenue = selectedProduct ? Number(selectedProduct.sellingPrice) * formData.quantityProduced : 0;

    const mutation = useMutation({
        mutationFn: async (data: any) => { const r = await fetch("/api/production", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!r.ok) throw new Error((await r.json()).error); return r.json(); },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["production-history"] }); queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] }); toast.success("Production recorded!"); setFormData({ finishedProductId: "", quantityProduced: 0, productionDate: new Date().toISOString().split("T")[0], notes: "" }); setPanelOpen(false); },
        onError: (e: any) => toast.error(e.message),
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white">Production</h1>
                    <p className="text-xs text-slate-500">Record production runs — materials auto-deducted via BOM</p>
                </div>
                <button onClick={() => setPanelOpen(true)} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors">+ New Production Run</button>
            </div>

            {/* Live Production Board */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Production Board</span>
                    <div className="flex items-center gap-2 text-xs"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span><span className="text-emerald-400">LIVE</span></div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/30"><th className="text-left px-4 py-2 w-12">#</th><th className="text-left px-4 py-2">Product</th><th className="text-right px-4 py-2">Qty</th><th className="text-left px-4 py-2">Status</th><th className="text-left px-4 py-2">Time</th><th className="text-left px-4 py-2">By</th></tr></thead>
                        <tbody className="font-mono text-sm">
                            {history?.entries?.map((e: any, i: number) => (
                                <motion.tr key={e.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                    <td className="px-4 py-2.5 text-slate-500">{history.entries.length - i}</td>
                                    <td className="px-4 py-2.5 text-slate-200 font-sans font-medium">{e.finishedProduct.name}</td>
                                    <td className="px-4 py-2.5 text-right text-orange-400 font-bold">{Number(e.quantityProduced)} u</td>
                                    <td className="px-4 py-2.5"><span className="text-emerald-400 text-xs">✅ Done</span></td>
                                    <td className="px-4 py-2.5 text-slate-500 text-xs">{new Date(e.productionDate).toLocaleDateString("en-IN")}</td>
                                    <td className="px-4 py-2.5 text-slate-500 text-xs font-sans">{e.user.name}</td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                    {(!history?.entries || history.entries.length === 0) && <div className="text-center py-12 text-slate-500 text-sm">No production records</div>}
                </div>
            </motion.div>

            {/* Right Panel for Recording */}
            {panelOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelOpen(false)} />
                    <motion.div initial={{ x: 500 }} animate={{ x: 0 }} exit={{ x: 500 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0d1117] border-l border-slate-700/50 z-50 overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-white">Record Production</h3><button onClick={() => setPanelOpen(false)} className="text-slate-500 hover:text-white">✕</button></div>

                        <div><label className="text-xs text-slate-400">Product</label>
                            <select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.finishedProductId} onChange={(e) => setFormData({ ...formData, finishedProductId: e.target.value })}>
                                <option value="">Select product...</option>
                                {products.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div><label className="text-xs text-slate-400">Quantity</label><input type="number" min="1" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.quantityProduced || ""} onChange={(e) => setFormData({ ...formData, quantityProduced: Number(e.target.value) })} /></div>
                        <div><label className="text-xs text-slate-400">Date</label><input type="date" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.productionDate} onChange={(e) => setFormData({ ...formData, productionDate: e.target.value })} /></div>
                        <div><label className="text-xs text-slate-400">Notes</label><textarea className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" rows={2} value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} /></div>

                        {materialCheck.length > 0 && (
                            <div className="space-y-2 mt-4">
                                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Material Check</p>
                                {materialCheck.map((m, i) => (
                                    <div key={i} className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs ${m.status === "INSUFFICIENT" ? "bg-red-500/10 border border-red-500/20" : m.status === "LOW" ? "bg-amber-500/10 border border-amber-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
                                        <span className="text-slate-300">{m.name}</span>
                                        <span className="font-mono">{m.required} / {m.available} {m.unit}</span>
                                        {m.status === "SUFFICIENT" && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                                        {m.status === "LOW" && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                                        {m.status === "INSUFFICIENT" && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                                    </div>
                                ))}
                                <div className="grid grid-cols-3 gap-2 mt-3">
                                    <div className="bg-slate-800/50 rounded-lg p-2 text-center"><p className="text-[9px] text-slate-500">Material Cost</p><p className="text-sm font-bold text-white">{formatINR(totalCost)}</p></div>
                                    <div className="bg-slate-800/50 rounded-lg p-2 text-center"><p className="text-[9px] text-slate-500">Expected Revenue</p><p className="text-sm font-bold text-emerald-400">{formatINR(expectedRevenue)}</p></div>
                                    <div className="bg-slate-800/50 rounded-lg p-2 text-center"><p className="text-[9px] text-slate-500">Margin</p><p className="text-sm font-bold text-purple-400">{expectedRevenue > 0 ? Math.round(((expectedRevenue - totalCost) / expectedRevenue) * 100) : 0}%</p></div>
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => mutation.mutate(formData)}
                            disabled={mutation.isPending || hasInsufficient || !formData.finishedProductId || !formData.quantityProduced}
                            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors mt-4"
                        >
                            {mutation.isPending ? "Recording..." : hasInsufficient ? "Insufficient Materials" : "Record Production"}
                        </button>
                    </motion.div>
                </>
            )}
        </div>
    );
}
