"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import Link from "next/link";
import { Package, ChevronRight } from "lucide-react";
import { AnimatedNumber } from "@/components/charts/AnimatedNumber";
import { formatINR, formatNumber } from "@/lib/utils";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };

export default function ProductsPage() {
    const { data: products = [], isLoading } = useQuery({
        queryKey: ["finished-products"],
        queryFn: async () => { const r = await fetch("/api/finished-products"); return r.json(); },
    });

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div><h1 className="text-xl font-bold text-white">Products</h1><p className="text-xs text-slate-500">Finished goods catalog with BOM details</p></div>
            </div>

            <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {products.map((p: any) => (
                    <motion.div key={p.id} variants={fadeUp}>
                        <Link href={`/dashboard/products/${p.id}`}>
                            <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all group cursor-pointer">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="w-9 h-9 bg-blue-500/10 rounded-lg flex items-center justify-center"><Package className="w-4 h-4 text-blue-400" /></div>
                                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                                </div>
                                <h3 className="text-sm font-bold text-white mb-1">{p.name}</h3>
                                {p.sku && <p className="text-[10px] text-slate-500 font-mono mb-3">{p.sku}</p>}
                                <div className="grid grid-cols-2 gap-2 text-center">
                                    <div className="bg-slate-800/50 rounded-lg p-2"><p className="text-xs text-slate-500">Stock</p><p className="text-lg font-black text-white">{formatNumber(p.quantityInStock)}</p></div>
                                    <div className="bg-slate-800/50 rounded-lg p-2"><p className="text-xs text-slate-500">Price</p><p className="text-lg font-black text-emerald-400">{formatINR(p.sellingPrice)}</p></div>
                                </div>
                                {p.category && <p className="text-[9px] text-slate-600 mt-2 uppercase tracking-wider">{p.category}</p>}
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </motion.div>

            {products.length === 0 && !isLoading && (
                <div className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-12 text-center">
                    <Package className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                    <p className="text-lg font-bold text-white">No Products Yet</p>
                    <p className="text-sm text-slate-500">Create finished products and define their Bill of Materials</p>
                </div>
            )}
        </div>
    );
}
