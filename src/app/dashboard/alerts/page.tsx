"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bell, CheckCircle } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function AlertsPage() {
    const queryClient = useQueryClient();
    const { data: alerts = [], isLoading } = useQuery({ queryKey: ["alerts"], queryFn: async () => { const r = await fetch("/api/alerts"); return r.json(); } });

    const markRead = useMutation({
        mutationFn: async (id: string) => { await fetch(`/api/alerts/${id}/read`, { method: "PATCH" }); },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["alerts"] }),
    });

    const unread = alerts.filter((a: any) => !a.isRead);
    const read = alerts.filter((a: any) => a.isRead);

    return (
        <div className="space-y-5">
            <div><h1 className="text-xl font-bold text-white">Alerts</h1><p className="text-xs text-slate-500">Low stock notifications and warnings</p></div>

            {/* Unread */}
            {unread.length > 0 && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-red-400">🔴 Unread ({unread.length})</p>
                    {unread.map((a: any) => (
                        <div key={a.id} className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="w-5 h-5 text-red-400 animate-pulse-dot flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{a.rawMaterial?.name || "Material"} is below minimum stock</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{new Date(a.alertTriggeredAt).toLocaleString("en-IN")}</p>
                                </div>
                            </div>
                            <button onClick={() => markRead.mutate(a.id)} className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Mark Read</button>
                        </div>
                    ))}
                </motion.div>
            )}

            {unread.length === 0 && (
                <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-12 text-center">
                    <CheckCircle className="w-12 h-12 text-emerald-500/30 mx-auto mb-3" />
                    <p className="text-lg font-bold text-white">All Clear</p>
                    <p className="text-sm text-slate-500">No unread alerts</p>
                </div>
            )}

            {/* Read */}
            {read.length > 0 && (
                <div className="space-y-2">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">History ({read.length})</p>
                    {read.map((a: any) => (
                        <div key={a.id} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 flex items-center gap-3 opacity-60">
                            <Bell className="w-4 h-4 text-slate-600 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-slate-400">{a.rawMaterial?.name || "Material"} — low stock alert</p>
                                <p className="text-[10px] text-slate-600">{new Date(a.alertTriggeredAt).toLocaleString("en-IN")}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
