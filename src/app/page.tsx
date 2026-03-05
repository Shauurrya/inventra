import Link from "next/link";
import { Hexagon, BarChart3, Boxes, Factory, Bell, Shield, Zap, ArrowRight } from "lucide-react";

const features = [
    { icon: Boxes, title: "Real-Time Inventory Tracking", desc: "Monitor raw material stocks with live updates and low-stock alerts. Never run out of production materials.", color: "text-blue-400 bg-blue-500/10" },
    { icon: Factory, title: "Bill of Materials & Production", desc: "Define recipes, auto-deduct materials on production, track output. Full manufacturing workflow.", color: "text-orange-400 bg-orange-500/10" },
    { icon: BarChart3, title: "Analytics Intelligence", desc: "F1-grade dashboards with sparklines, heatmaps, race charts, and stock velocity gauges.", color: "text-purple-400 bg-purple-500/10" },
    { icon: Bell, title: "Automated Alerts", desc: "Get notified before stockouts happen. Smart threshold-based alerts for every material.", color: "text-red-400 bg-red-500/10" },
    { icon: Shield, title: "Role-Based Access", desc: "Admin and Staff roles. Control who can produce, sell, or manage settings across your team.", color: "text-emerald-400 bg-emerald-500/10" },
    { icon: Zap, title: "Built for Indian MSMEs", desc: "INR formatting, GST-ready, industry-specific defaults. Designed for small manufacturers.", color: "text-amber-400 bg-amber-500/10" },
];

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-base)]">
            {/* Nav */}
            <nav className="border-b border-slate-800 bg-[var(--bg-base)]/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><Hexagon className="w-4 h-4 text-white" /></div>
                        <span className="text-sm font-bold text-white tracking-wide">INVENTRA</span>
                    </div>
                    <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how" className="hover:text-white transition-colors">How It Works</a>
                        <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Sign In</Link>
                        <Link href="/register" className="text-sm px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all">Start Free</Link>
                    </div>
                </div>
            </nav>

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-4 py-24 md:py-32 text-center">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold px-3 py-1 rounded-full mb-6">
                    🇮🇳 Made in India — For Indian Manufacturers
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
                    Smart Inventory for<br /><span className="text-gradient">Smart Manufacturers</span>
                </h1>
                <p className="text-lg text-slate-400 mt-6 max-w-2xl mx-auto">
                    Inventra automates raw material tracking, production deductions, and stock alerts — built specifically for Indian manufacturing MSMEs.
                </p>
                <div className="flex items-center justify-center gap-4 mt-8">
                    <Link href="/register" className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2 text-sm">
                        Start Free — No Credit Card <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link href="/login" className="px-6 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:bg-slate-800 transition-all text-sm">
                        View Demo
                    </Link>
                </div>
                <p className="text-xs text-slate-600 mt-4">Free tier available · No credit card required · 2-minute setup</p>
            </section>

            {/* Features */}
            <section id="features" className="max-w-6xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-blue-400 mb-2">FEATURES</p>
                    <h2 className="text-3xl font-black text-white">Everything You Need to Run a Factory</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {features.map((f, i) => (
                        <div key={i} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-5 hover:border-slate-600 transition-colors group">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                                <f.icon className="w-5 h-5" />
                            </div>
                            <h3 className="text-sm font-bold text-white mb-2">{f.title}</h3>
                            <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* How It Works */}
            <section id="how" className="max-w-4xl mx-auto px-4 py-20">
                <div className="text-center mb-12">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-orange-400 mb-2">HOW IT WORKS</p>
                    <h2 className="text-3xl font-black text-white">Three Steps to Smart Manufacturing</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { step: "01", title: "Add Materials", desc: "Add your raw materials with stock levels, costs, and minimum thresholds." },
                        { step: "02", title: "Define Products", desc: "Create finished products and define their Bill of Materials (recipe)." },
                        { step: "03", title: "Produce & Sell", desc: "Record production — materials auto-deduct. Record sales — stock updates automatically." },
                    ].map((s, i) => (
                        <div key={i} className="text-center">
                            <div className="text-4xl font-black text-slate-800 mb-3">{s.step}</div>
                            <h3 className="text-sm font-bold text-white mb-2">{s.title}</h3>
                            <p className="text-xs text-slate-500">{s.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-12">
                    <h2 className="text-3xl font-black text-white mb-4">Ready to Transform Your Factory?</h2>
                    <p className="text-slate-400 mb-6">Join hundreds of Indian manufacturers using Inventra</p>
                    <Link href="/register" className="inline-flex px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all">Get Started Free</Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-slate-800 py-8">
                <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2"><Hexagon className="w-3.5 h-3.5" /> Inventra by Inventor Solutions Pvt. Ltd.</div>
                    <p>© 2025 All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
