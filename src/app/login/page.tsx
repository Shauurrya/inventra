"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Hexagon, Eye, EyeOff, Shield, BookOpen, Eye as EyeIcon } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email: email.trim(),
                password,
                redirect: false,
            });
            setLoading(false);

            if (res?.error) {
                setError("Invalid username or password");
            } else {
                router.push("/dashboard");
            }
        } catch {
            setLoading(false);
            setError("Something went wrong. Please try again.");
        }
    };

    const fillCredentials = (username: string, pwd: string) => {
        setEmail(username);
        setPassword(pwd);
        setError("");
    };

    return (
        <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                        <Hexagon className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-2xl font-black text-white">Welcome back</h1>
                    <p className="text-sm text-slate-500 mt-1">Sign in to Inventra</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-[var(--bg-card)] border border-slate-700/50 rounded-2xl p-6 space-y-4">
                    {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{error}</div>}

                    <div>
                        <label className="text-xs text-slate-400">Username</label>
                        <input
                            type="text"
                            required
                            className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="admin"
                            autoComplete="username"
                        />
                    </div>

                    <div>
                        <label className="text-xs text-slate-400">Password</label>
                        <div className="relative mt-1">
                            <input
                                type={showPw ? "text" : "password"}
                                required
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-white pr-10 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="admin123"
                                autoComplete="current-password"
                            />
                            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg disabled:opacity-50 transition-all">
                        {loading ? "Signing in..." : "Sign In"}
                    </button>

                    {/* Demo Credentials Table */}
                    <div className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-4 mt-4">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Demo Credentials — Click to fill</p>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => fillCredentials("admin", "admin123")}
                                className="w-full flex items-center gap-3 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 transition-colors text-left group"
                            >
                                <Shield className="w-4 h-4 text-purple-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-purple-400">Admin</span>
                                    <p className="text-[10px] text-slate-500">Full access • admin / admin123</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillCredentials("auditor", "audit123")}
                                className="w-full flex items-center gap-3 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 transition-colors text-left group"
                            >
                                <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-blue-400">Auditor</span>
                                    <p className="text-[10px] text-slate-500">View + Add expenses • auditor / audit123</p>
                                </div>
                            </button>
                            <button
                                type="button"
                                onClick={() => fillCredentials("viewer", "view123")}
                                className="w-full flex items-center gap-3 p-2 rounded-lg bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 transition-colors text-left group"
                            >
                                <EyeIcon className="w-4 h-4 text-green-400 shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <span className="text-xs font-semibold text-green-400">Viewer</span>
                                    <p className="text-[10px] text-slate-500">Read-only access • viewer / view123</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </form>

                <p className="text-center text-sm text-slate-500 mt-4">
                    Don&apos;t have an account? <Link href="/register" className="text-blue-400 hover:text-blue-300">Register</Link>
                </p>
            </div>
        </div>
    );
}
