"use client";
import { motion } from "framer-motion";

interface StockHealthBarProps {
    current: number;
    minimum: number;
    maximum?: number;
    label: string;
    unit: string;
    delay?: number;
}

export function StockHealthBar({ current, minimum, maximum, label, unit, delay = 0 }: StockHealthBarProps) {
    const max = maximum || Math.max(current * 1.5, minimum * 2);
    const pct = Math.min(100, (current / max) * 100);
    const ratio = minimum > 0 ? current / minimum : 999;
    const color = ratio < 1 ? "#ef4444" : ratio < 1.5 ? "#f59e0b" : "#10b981";
    const bg = ratio < 1 ? "bg-red-500/10" : ratio < 1.5 ? "bg-amber-500/10" : "bg-emerald-500/10";
    const statusLabel = ratio < 1 ? "CRITICAL" : ratio < 1.5 ? "LOW" : "OK";
    const statusColor = ratio < 1 ? "text-red-400" : ratio < 1.5 ? "text-amber-400" : "text-emerald-400";

    return (
        <div className={`p-3 rounded-lg border border-slate-700/50 ${bg} transition-colors`}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-slate-200">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-400">{current.toLocaleString("en-IN")} / {max.toLocaleString("en-IN")} {unit}</span>
                    <span className={`text-[10px] font-bold ${statusColor}`}>{statusLabel}</span>
                </div>
            </div>
            <div className="relative h-2 bg-slate-700/50 rounded-full overflow-hidden">
                {minimum > 0 && (
                    <div className="absolute top-0 h-full w-px bg-amber-500/60 z-10" style={{ left: `${Math.min(100, (minimum / max) * 100)}%` }} />
                )}
                <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay, ease: "easeOut" }}
                />
            </div>
        </div>
    );
}
