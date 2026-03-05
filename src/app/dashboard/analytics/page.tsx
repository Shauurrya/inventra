"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    ScatterChart, Scatter, ZAxis, Cell, BarChart, Bar, RadialBarChart, RadialBar,
    Treemap, Legend
} from "recharts";
import { AnimatedNumber } from "@/components/charts/AnimatedNumber";
import { SparkLine } from "@/components/charts/SparkLine";
import { chartTheme } from "@/components/charts/chartTheme";
import { formatINR } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

export default function AnalyticsPage() {
    const { data: sparklines } = useQuery({
        queryKey: ["analytics-sparklines"],
        queryFn: async () => { const r = await fetch("/api/analytics/sparklines"); return r.json(); },
    });

    const { data: raceData } = useQuery({
        queryKey: ["analytics-race"],
        queryFn: async () => { const r = await fetch("/api/analytics/cumulative-production"); return r.json(); },
    });

    const { data: bubbleData } = useQuery({
        queryKey: ["analytics-bubble"],
        queryFn: async () => { const r = await fetch("/api/analytics/bubble-chart"); return r.json(); },
    });

    const { data: velocity } = useQuery({
        queryKey: ["analytics-velocity"],
        queryFn: async () => { const r = await fetch("/api/analytics/stock-velocity"); return r.json(); },
    });

    const { data: heatmapData } = useQuery({
        queryKey: ["analytics-heatmap"],
        queryFn: async () => { const r = await fetch("/api/analytics/consumption-heatmap"); return r.json(); },
    });

    const revValues = sparklines?.revenue?.map((r: any) => r.value) || [];
    const prodValues = sparklines?.production?.map((r: any) => r.value) || [];
    const totalRev = revValues.reduce((a: number, b: number) => a + b, 0);
    const totalProd = prodValues.reduce((a: number, b: number) => a + b, 0);

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-white flex items-center gap-2">📈 Analytics Intelligence</h1>
                    <p className="text-xs text-slate-500 mt-1">Last 30 days · Deep insights into your manufacturing operations</p>
                </div>
            </div>

            {/* Row 1: Four Trend Metrics */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: "Total Revenue", value: totalRev, format: (n: number) => formatINR(n), spark: revValues, color: "#10b981" },
                    { label: "Units Produced", value: totalProd, format: (n: number) => n.toLocaleString("en-IN"), spark: prodValues, color: "#f97316" },
                    { label: "Materials Consumed (₹)", value: totalRev * 0.4, format: (n: number) => formatINR(n), spark: revValues.map((v: number) => v * 0.4), color: "#ef4444" },
                    { label: "Avg Batch Size", value: totalProd > 0 ? Math.round(totalProd / Math.max(1, prodValues.filter((v: number) => v > 0).length)) : 0, format: (n: number) => String(Math.round(n)), spark: prodValues, color: "#8b5cf6" },
                ].map((stat, i) => (
                    <motion.div key={i} variants={fadeUp} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">{stat.label}</span>
                        <AnimatedNumber value={stat.value} formatFn={stat.format} className="block text-2xl font-black text-white mt-1" />
                        {stat.spark.length > 0 && (
                            <div className="mt-2">
                                <SparkLine data={stat.spark} color={stat.color} width={200} height={32} />
                                <div className="flex justify-between text-[9px] text-slate-600 mt-1">
                                    <span>Min: {stat.format(Math.min(...stat.spark))}</span>
                                    <span>Max: {stat.format(Math.max(...stat.spark))}</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </motion.div>

            {/* Row 2: Race Chart + Bubble Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                {/* Race Chart */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-3 bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Multi-Product Production Race</h3>
                    {raceData?.data?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={raceData.data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid {...chartTheme.grid} />
                                <XAxis dataKey="date" tick={{ ...chartTheme.axis.tick }} tickFormatter={(d) => { try { return new Date(d).getDate().toString(); } catch { return d; } }} />
                                <YAxis tick={{ ...chartTheme.axis.tick }} />
                                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} labelFormatter={(d) => { try { return new Date(d).toLocaleDateString("en-IN"); } catch { return d; } }} />
                                <Legend formatter={(v) => <span className="text-xs text-slate-400">{v}</span>} />
                                {raceData.products?.map((product: string, i: number) => (
                                    <Line key={product} type="monotone" dataKey={product} stroke={chartTheme.colors[i % chartTheme.colors.length]} strokeWidth={2} dot={false} animationDuration={1500} />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-20 text-slate-500 text-sm">No production data for race chart</div>
                    )}
                </motion.div>

                {/* Bubble Chart */}
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="lg:col-span-2 bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">Cost vs Revenue vs Volume</h3>
                    {bubbleData && bubbleData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <ScatterChart margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
                                <CartesianGrid {...chartTheme.grid} />
                                <XAxis type="number" dataKey="x" name="Cost" tick={{ ...chartTheme.axis.tick }} label={{ value: "Cost ₹", position: "bottom", fill: "#64748b", fontSize: 10 }} />
                                <YAxis type="number" dataKey="y" name="Price" tick={{ ...chartTheme.axis.tick }} label={{ value: "Price ₹", angle: -90, position: "left", fill: "#64748b", fontSize: 10 }} />
                                <ZAxis type="number" dataKey="z" range={[60, 400]} name="Units" />
                                <Tooltip contentStyle={chartTheme.tooltip.contentStyle} formatter={(v: any, name: string) => [name === "Cost" || name === "Price" ? formatINR(v) : v, name]} />
                                <Scatter data={bubbleData} animationDuration={1200}>
                                    {bubbleData.map((d: any, i: number) => <Cell key={i} fill={d.color} fillOpacity={0.7} />)}
                                </Scatter>
                            </ScatterChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-20 text-slate-500 text-sm">No product data</div>
                    )}
                </motion.div>
            </div>

            {/* Row 3: Stock Velocity Gauges */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Stock Velocity — Days Remaining</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {velocity?.map((m: any, i: number) => {
                        const pct = Math.min(100, (m.daysRemaining / 60) * 100);
                        const color = m.daysRemaining < 7 ? "#ef4444" : m.daysRemaining < 30 ? "#f59e0b" : "#10b981";
                        return (
                            <div key={m.id} className="text-center p-3 rounded-lg bg-slate-800/30 border border-slate-700/30">
                                <div className="relative w-16 h-16 mx-auto mb-2">
                                    <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                        <circle cx="18" cy="18" r="15" fill="none" stroke="#1f2937" strokeWidth="3" />
                                        <motion.circle
                                            cx="18" cy="18" r="15" fill="none" stroke={color} strokeWidth="3"
                                            strokeDasharray={`${pct * 0.94} 100`}
                                            strokeLinecap="round"
                                            initial={{ strokeDasharray: "0 100" }}
                                            animate={{ strokeDasharray: `${pct * 0.94} 100` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                        />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                        {m.daysRemaining > 99 ? "99+" : m.daysRemaining}
                                    </span>
                                </div>
                                <p className="text-[10px] text-slate-400 truncate">{m.name}</p>
                                <p className="text-[9px] text-slate-600">{m.avgDailyConsumption}/{m.unit}/day</p>
                            </div>
                        );
                    })}
                    {(!velocity || velocity.length === 0) && <p className="col-span-full text-center py-8 text-slate-500 text-sm">No velocity data</p>}
                </div>
            </motion.div>

            {/* Row 4: Consumption Heatmap */}
            <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">Consumption Heatmap</h3>
                {heatmapData?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            {/* Header row with dates */}
                            <div className="flex gap-px mb-1 ml-24">
                                {heatmapData.data.slice(-14).map((d: any, i: number) => (
                                    <div key={i} className="w-8 text-center text-[8px] text-slate-600">
                                        {new Date(d.date).getDate()}
                                    </div>
                                ))}
                            </div>
                            {/* Material rows */}
                            {heatmapData.materials?.map((mat: string) => {
                                const values = heatmapData.data.slice(-14).map((d: any) => d[mat] || 0);
                                const maxVal = Math.max(...values, 1);
                                return (
                                    <div key={mat} className="flex items-center gap-px mb-px">
                                        <span className="w-24 text-[10px] text-slate-500 pr-2 text-right truncate">{mat}</span>
                                        {values.map((v: number, i: number) => {
                                            const intensity = v / maxVal;
                                            return (
                                                <div
                                                    key={i}
                                                    className="w-8 h-6 rounded-sm transition-colors hover:ring-1 hover:ring-white/20 cursor-pointer"
                                                    style={{ backgroundColor: intensity > 0 ? `rgba(59, 130, 246, ${0.1 + intensity * 0.8})` : "#1e293b" }}
                                                    title={`${mat}: ${v} on ${heatmapData.data.slice(-14)[i]?.date}`}
                                                />
                                            );
                                        })}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-12 text-slate-500 text-sm">No consumption data for heatmap</div>
                )}
            </motion.div>
        </div>
    );
}
