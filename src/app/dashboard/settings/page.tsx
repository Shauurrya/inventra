"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Settings2, Users, Shield } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };
const tabs = [{ key: "company", label: "Company", icon: Settings2 }, { key: "team", label: "Team", icon: Users }, { key: "security", label: "Security", icon: Shield }];

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession();
    const queryClient = useQueryClient();
    const [tab, setTab] = useState("company");
    const [company, setCompany] = useState({ name: "", industry: "", address: "" });
    const [invite, setInvite] = useState({ name: "", email: "", role: "STAFF" });
    const [pw, setPw] = useState({ current: "", newPw: "", confirm: "" });

    // Fetch current company details from API
    const { data: companyData } = useQuery({
        queryKey: ["company-details"],
        queryFn: async () => {
            const r = await fetch("/api/company");
            if (!r.ok) return null;
            return r.json();
        },
    });

    // Pre-populate form with current company data
    useEffect(() => {
        if (companyData) {
            setCompany({
                name: companyData.name || "",
                industry: companyData.industry || "",
                address: companyData.address || "",
            });
        }
    }, [companyData]);

    const companyMut = useMutation({
        mutationFn: async (d: any) => { const r = await fetch("/api/company", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }); if (!r.ok) throw new Error("Failed"); return r.json(); },
        onSuccess: async (data) => {
            toast.success("Company updated");
            queryClient.invalidateQueries({ queryKey: ["company-details"] });
            // Update the session so the sidebar shows the new company name
            await updateSession({ companyName: data.name });
            // Force page reload to refresh session data everywhere
            window.location.reload();
        },
        onError: () => toast.error("Failed to update"),
    });

    const inviteMut = useMutation({
        mutationFn: async (d: any) => { const r = await fetch("/api/users/invite", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }); if (!r.ok) throw new Error((await r.json()).error); return r.json(); },
        onSuccess: (d) => { toast.success(`User invited! Temp password: ${d.temporaryPassword}`); setInvite({ name: "", email: "", role: "STAFF" }); },
        onError: (e: any) => toast.error(e.message),
    });

    const pwMut = useMutation({
        mutationFn: async (d: any) => { const r = await fetch("/api/auth/change-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(d) }); if (!r.ok) throw new Error((await r.json()).error); return r.json(); },
        onSuccess: () => { toast.success("Password changed"); setPw({ current: "", newPw: "", confirm: "" }); },
        onError: (e: any) => toast.error(e.message),
    });

    return (
        <div className="space-y-5">
            <div><h1 className="text-xl font-bold text-white">Settings</h1><p className="text-xs text-slate-500">Manage company, team, and security</p></div>

            <div className="flex gap-1 bg-slate-800/50 border border-slate-700/50 rounded-xl p-1">
                {tabs.map((t) => (<button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${tab === t.key ? "bg-blue-500/20 text-blue-400" : "text-slate-500 hover:text-slate-300"}`}><t.icon className="w-4 h-4" />{t.label}</button>))}
            </div>

            {tab === "company" && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-5 space-y-4 max-w-xl">
                    <div><label className="text-xs text-slate-400">Company Name</label><input className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} placeholder="Enter company name" /></div>
                    <div><label className="text-xs text-slate-400">Industry</label><select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })}><option value="">Select...</option><option value="woodwork">Woodwork & Furniture</option><option value="textile">Textile</option><option value="metalwork">Metalwork</option><option value="food_processing">Food Processing</option><option value="other">Other</option></select></div>
                    <div><label className="text-xs text-slate-400">Address</label><textarea className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" rows={3} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
                    <button onClick={() => companyMut.mutate(company)} disabled={companyMut.isPending || !company.name} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm font-semibold rounded-lg">{companyMut.isPending ? "Saving..." : "Save Changes"}</button>
                </motion.div>
            )}

            {tab === "team" && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-5 space-y-4 max-w-xl">
                    <h3 className="text-sm font-bold text-white">Invite Team Member</h3>
                    <div><label className="text-xs text-slate-400">Name</label><input className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400">Email</label><input type="email" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400">Role</label><select className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value })}><option value="STAFF">Staff</option><option value="ADMIN">Admin</option></select></div>
                    <button onClick={() => inviteMut.mutate(invite)} disabled={inviteMut.isPending || !invite.name || !invite.email} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm font-semibold rounded-lg">Send Invite</button>
                </motion.div>
            )}

            {tab === "security" && (
                <motion.div variants={fadeUp} initial="hidden" animate="show" className="bg-[var(--bg-card)] border border-slate-700/50 rounded-xl p-5 space-y-4 max-w-xl">
                    <h3 className="text-sm font-bold text-white">Change Password</h3>
                    <div><label className="text-xs text-slate-400">Current Password</label><input type="password" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400">New Password</label><input type="password" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={pw.newPw} onChange={(e) => setPw({ ...pw, newPw: e.target.value })} /></div>
                    <div><label className="text-xs text-slate-400">Confirm Password</label><input type="password" className="w-full mt-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} /></div>
                    {pw.newPw && pw.confirm && pw.newPw !== pw.confirm && <p className="text-red-400 text-xs">Passwords don't match</p>}
                    <button onClick={() => pwMut.mutate({ currentPassword: pw.current, newPassword: pw.newPw })} disabled={pwMut.isPending || !pw.current || !pw.newPw || pw.newPw !== pw.confirm} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white text-sm font-semibold rounded-lg">Update Password</button>
                </motion.div>
            )}
        </div>
    );
}

