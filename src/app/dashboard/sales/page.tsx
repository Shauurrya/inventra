"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { AnimatedNumber } from "@/components/charts/AnimatedNumber";
import { formatINR } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function SalesPage() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ finishedProductId: "", quantitySold: 0, sellingPricePerUnit: 0, customerName: "", saleDate: new Date().toISOString().split("T")[0], notes: "" });
    const [panelOpen, setPanelOpen] = useState(false);

    const { data: products = [] } = useQuery({ queryKey: ["finished-products"], queryFn: async () => { const r = await fetch("/api/finished-products"); return r.json(); } });
    const { data: history, isLoading } = useQuery({ queryKey: ["sales-history"], queryFn: async () => { const r = await fetch("/api/sales?limit=20"); return r.json(); } });

    const selectedProduct = products.find((p: any) => p.id === formData.finishedProductId);
    const totalRevenue = formData.quantitySold * (formData.sellingPricePerUnit || 0);
    const historyTotalRevenue = history?.entries?.reduce((s: number, e: any) => s + Number(e.revenueAmount), 0) || 0;

    const mutation = useMutation({
        mutationFn: async (data: any) => { const r = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }); if (!r.ok) throw new Error((await r.json()).error); return r.json(); },
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sales-history"] }); toast.success("Sale recorded!"); setFormData({ finishedProductId: "", quantitySold: 0, sellingPricePerUnit: 0, customerName: "", saleDate: new Date().toISOString().split("T")[0], notes: "" }); setPanelOpen(false); },
        onError: (e: any) => toast.error(e.message),
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-white">Sales</h1><p className="text-xs text-slate-500">Record sales — stock auto-deducted</p></div>
                <button onClick={() => setPanelOpen(true)} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg transition-colors">+ Record Sale</button>
            </div>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4"><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Total Revenue</p><AnimatedNumber value={historyTotalRevenue} formatFn={(n) => formatINR(n)} className="text-2xl font-black text-emerald-400 mt-1" /></div>
                <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4"><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Total Sales</p><AnimatedNumber value={history?.entries?.length || 0} className="text-2xl font-black text-white mt-1" /></div>
                <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4"><p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Units Sold</p><AnimatedNumber value={history?.entries?.reduce((s: number, e: any) => s + Number(e.quantitySold), 0) || 0} className="text-2xl font-black text-white mt-1" /></div>
            </div>

            {/* Sales Table */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Sales History</span>
                </div>
                <table className="w-full text-sm">
                    <thead><tr className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-700/30"><th className="text-left px-4 py-2">Date</th><th className="text-left px-4 py-2">Product</th><th className="text-right px-4 py-2">Qty</th><th className="text-right px-4 py-2">Revenue</th><th className="text-left px-4 py-2">Customer</th></tr></thead>
                    <tbody>
                        {history?.entries?.map((e: any) => (
                            <tr key={e.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                                <td className="px-4 py-2.5 text-slate-400 font-mono text-xs">{new Date(e.saleDate).toLocaleDateString("en-IN")}</td>
                                <td className="px-4 py-2.5 text-slate-200 font-medium">{e.finishedProduct.name}</td>
                                <td className="px-4 py-2.5 text-right font-mono text-white">{Number(e.quantitySold)}</td>
                                <td className="px-4 py-2.5 text-right font-semibold text-emerald-400">{formatINR(e.revenueAmount)}</td>
                                <td className="px-4 py-2.5 text-slate-500">{e.customerName || "—"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {(!history?.entries || history.entries.length === 0) && <div className="text-center py-12 text-slate-500 text-sm">No sales yet</div>}
            </motion.div>

            {/* Record Sale Panel */}
            {panelOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setPanelOpen(false)} />
                    <motion.div initial={{ x: 500 }} animate={{ x: 0 }} className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0d1117] border-l border-slate-700/50 z-50 overflow-y-auto p-6 space-y-4">
                        <div className="flex items-center justify-between"><h3 className="text-lg font-bold text-white">Record Sale</h3><button onClick={() => setPanelOpen(false)} className="text-slate-500 hover:text-white">✕</button></div>
                        <div><label className="text-xs text-slate-400">Product</label><select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.finishedProductId} onChange={(e) => { const p = products.find((pr: any) => pr.id === e.target.value); setFormData({ ...formData, finishedProductId: e.target.value, sellingPricePerUnit: p ? Number(p.sellingPrice) : 0 }); }}><option value="">Select...</option>{products.map((p: any) => <option key={p.id} value={p.id}>{p.name} ({Number(p.quantityInStock)} in stock)</option>)}</select></div>
                        <div><label className="text-xs text-slate-400">Quantity</label><input type="number" min="1" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.quantitySold || ""} onChange={(e) => setFormData({ ...formData, quantitySold: Number(e.target.value) })} /></div>
                        <div><label className="text-xs text-slate-400">Price/Unit (₹)</label><input type="number" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.sellingPricePerUnit} onChange={(e) => setFormData({ ...formData, sellingPricePerUnit: Number(e.target.value) })} /></div>
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3"><p className="text-xs text-emerald-400/60">Total Revenue</p><p className="text-xl font-black text-emerald-400">{formatINR(totalRevenue)}</p></div>
                        <div><label className="text-xs text-slate-400">Customer</label><input className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} /></div>
                        <div><label className="text-xs text-slate-400">Date</label><input type="date" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={formData.saleDate} onChange={(e) => setFormData({ ...formData, saleDate: e.target.value })} /></div>
                        <button onClick={() => mutation.mutate(formData)} disabled={mutation.isPending || !formData.finishedProductId || !formData.quantitySold} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg transition-colors">
                            {mutation.isPending ? "Recording..." : "Record Sale"}
                        </button>
                    </motion.div>
                </>
            )}
        </div>
    );
}
