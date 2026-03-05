"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hexagon } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "", industry: "other" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
            if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Registration failed"); }
            router.push("/login?registered=true");
        } catch (err: any) { setError(err.message); }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4"><Hexagon className="w-6 h-6 text-white" /></div>
                    <h1 className="text-2xl font-black text-white">Create Account</h1>
                    <p className="text-sm text-slate-500 mt-1">Start managing your inventory</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-2xl p-6 space-y-4">
                    {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{error}</div>}
                    <div><label className="text-xs text-slate-400">Full Name</label><input required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400">Username</label><input type="text" required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Choose a username" autoComplete="username" /></div>
                    <div><label className="text-xs text-slate-400">Password</label><input type="password" required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400">Company Name</label><input required className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400">Industry</label><select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}><option value="woodwork">Woodwork & Furniture</option><option value="textile">Textile</option><option value="metalwork">Metalwork</option><option value="food_processing">Food Processing</option><option value="other">Other</option></select></div>
                    <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-all">{loading ? "Creating..." : "Create Account"}</button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-4">Already have an account? <Link href="/login" className="text-blue-400 hover:text-blue-300">Sign In</Link></p>
            </div>
        </div>
    );
}
