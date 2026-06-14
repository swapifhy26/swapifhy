import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, Bell, Shield, Key, Trash2, User } from "lucide-react";
import { SkillTagManager } from "../components/SkillTagManager";
import { API_URL } from "../lib/api";

export default function Settings() {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [marketingEmails, setMarketingEmails] = useState(false);
    
    const [bio, setBio] = useState("");
    const [hobbies, setHobbies] = useState("");
    const [teachSkills, setTeachSkills] = useState<string[]>([]);
    const [learnSkills, setLearnSkills] = useState<string[]>([]);
    const [saving, setSaving] = useState(false);

    // Change password
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMessage, setPwMessage] = useState("");
    const [pwError, setPwError] = useState("");

    const handleChangePassword = async () => {
        setPwError("");
        setPwMessage("");
        if (newPassword.length < 8) {
            setPwError("New password must be at least 8 characters.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPwError("New passwords do not match.");
            return;
        }
        setPwSaving(true);
        try {
            const token = localStorage.getItem("swapifhy_token");
            const res = await fetch(`${API_URL}/api/user/password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();
            if (res.ok) {
                setPwMessage("Password updated successfully.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setPwError(data.error || "Failed to update password.");
            }
        } catch {
            setPwError("Connection error. Try again.");
        } finally {
            setPwSaving(false);
        }
    };

    React.useEffect(() => {
        const token = localStorage.getItem("swapifhy_token");
        if (token) {
            fetch(`${API_URL}/api/user/profile`, { headers: { "Authorization": `Bearer ${token}` } })
                .then(res => res.json())
                .then(data => {
                    if (data.user) {
                        setBio(data.user.bio || "");
                        setHobbies(data.user.hobbies || "");
                        setTeachSkills(data.user.teachSkills?.map((s: any) => s.name) || []);
                        setLearnSkills(data.user.learnSkills?.map((s: any) => s.name) || []);
                    }
                })
                .catch(console.error);
        }
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            const token = localStorage.getItem("swapifhy_token");
            await fetch(`${API_URL}/api/user/profile`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({ bio, hobbies, teach: teachSkills.join(","), learn: learnSkills.join(",") })
            });
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };
    
    return (
        <div className="w-full min-h-screen bg-background relative overflow-hidden pt-32 pb-40">
            {/* Background Details */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="mesh-orb orb-blue opacity-10 top-[-10%] left-[-10%]" />
                <div className="mesh-orb orb-pink opacity-5 bottom-[-10%] right-[-10%]" />
            </div>

            <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-4xl mx-auto px-6 relative z-10">
                <div className="mb-16">
                    <h1 className="text-4xl md:text-5xl font-heading font-black tracking-tighter text-foreground mb-4 uppercase italic leading-none">
                        ACCOUNT <span className="text-gradient-elite font-tech">SETTINGS</span>
                    </h1>
                    <p className="text-muted-foreground text-sm font-medium tracking-tight uppercase opacity-60">
                        Manage your account preferences and security settings
                    </p>
                </div>

                <div className="space-y-8">
                    {/* Profile & Skills Panel */}
                    <div className="p-10 rounded-[3rem] glass-card border-border relative overflow-hidden shadow-2xl">
                        <h2 className="text-sm font-tech font-black mb-8 flex items-center gap-4 text-foreground uppercase tracking-[0.4em]">
                            <User className="text-primary w-5 h-5" /> PROFILE & SKILLS PREFERENCES
                        </h2>
                        
                        <div className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Your Bio</label>
                                    <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Summarize your professional essence..." rows={4} className="w-full bg-surface border border-border rounded-[2rem] py-6 px-8 placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-all resize-none font-medium text-base shadow-inner" />
                                </div>
                                <div className="space-y-4">
                                    <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-[0.4em] ml-2">Hobbies & Interests</label>
                                    <textarea value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="What do you enjoy doing outside of work?" rows={4} className="w-full bg-surface border border-border rounded-[2rem] py-6 px-8 text-foreground placeholder:text-muted/20 focus:outline-none focus:border-secondary/50 transition-all resize-none font-medium text-base shadow-inner" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                <SkillTagManager 
                                    title="Skills to Teach" 
                                    tags={teachSkills} 
                                    onUpdate={setTeachSkills} 
                                    color="bg-primary/10 border-primary/20 text-primary"
                                />
                                <SkillTagManager 
                                    title="Skills to Learn" 
                                    tags={learnSkills} 
                                    onUpdate={setLearnSkills} 
                                    color="bg-secondary/10 border-secondary/20 text-secondary"
                                />
                            </div>

                            <div className="pt-8 border-t border-border flex items-center justify-end">
                                <button onClick={handleSave} disabled={saving} className="btn-gradient px-10 py-4 text-xs font-black uppercase tracking-[0.4em] rounded-full">
                                    {saving ? "SAVING..." : "Save Profile Preferences"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notifications Panel */}
                    <div className="p-10 rounded-[3rem] glass-card border-border relative overflow-hidden shadow-2xl">
                        <h2 className="text-sm font-tech font-black mb-8 flex items-center gap-4 text-foreground uppercase tracking-[0.4em]">
                            <Bell className="text-primary w-5 h-5" /> NOTIFICATIONS
                        </h2>
                        
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-surface/50 border border-white/5 rounded-2xl">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Global Push Notifications</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Receive real-time alerts for new matches and messages</p>
                                </div>
                                <button 
                                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                    className={`w-14 h-7 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-primary' : 'bg-surface border border-white/10'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${notificationsEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                            
                            <div className="flex items-center justify-between p-6 bg-surface/50 border border-white/5 rounded-2xl">
                                <div>
                                    <h4 className="text-sm font-bold text-foreground">Marketing & Updates</h4>
                                    <p className="text-xs text-muted-foreground mt-1">Receive platform updates, feature drops, and ecosystem news</p>
                                </div>
                                <button 
                                    onClick={() => setMarketingEmails(!marketingEmails)}
                                    className={`w-14 h-7 rounded-full p-1 transition-colors ${marketingEmails ? 'bg-primary' : 'bg-surface border border-white/10'}`}
                                >
                                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${marketingEmails ? 'translate-x-7' : 'translate-x-0'}`} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Panel */}
                    <div className="p-10 rounded-[3rem] glass-card border-border relative overflow-hidden shadow-2xl">
                        <h2 className="text-sm font-tech font-black mb-8 flex items-center gap-4 text-foreground uppercase tracking-[0.4em]">
                            <Shield className="text-secondary w-5 h-5" /> SECURITY & ACCESS
                        </h2>
                        
                        <div className="space-y-6">
                            <button
                                onClick={() => setShowPasswordForm(!showPasswordForm)}
                                className="w-full flex items-center justify-between p-6 bg-surface/50 border border-white/5 rounded-2xl hover:bg-white/5 transition-all group text-left"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <Key className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">Update Password</h4>
                                        <p className="text-xs text-muted-foreground mt-1">Change your account password</p>
                                    </div>
                                </div>
                            </button>

                            {showPasswordForm && (
                                <div className="p-6 bg-surface/50 border border-white/5 rounded-2xl space-y-4">
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={e => setCurrentPassword(e.target.value)}
                                        placeholder="Current password"
                                        className="w-full bg-surface border border-border rounded-xl py-3 px-5 text-foreground placeholder:text-muted/30 focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    />
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="New password (min 8 characters)"
                                        className="w-full bg-surface border border-border rounded-xl py-3 px-5 text-foreground placeholder:text-muted/30 focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    />
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        className="w-full bg-surface border border-border rounded-xl py-3 px-5 text-foreground placeholder:text-muted/30 focus:outline-none focus:border-primary/50 transition-all text-sm"
                                    />
                                    {pwError && <p className="text-red-400 text-xs">{pwError}</p>}
                                    {pwMessage && <p className="text-green-400 text-xs">{pwMessage}</p>}
                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleChangePassword}
                                            disabled={pwSaving}
                                            className="btn-gradient px-8 py-3 text-[10px] font-black uppercase tracking-[0.3em] rounded-full"
                                        >
                                            {pwSaving ? "UPDATING..." : "Update Password"}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="p-10 rounded-[3rem] border border-red-500/20 bg-red-500/5 relative overflow-hidden shadow-2xl mt-12">
                        <h2 className="text-sm font-tech font-black mb-6 flex items-center gap-4 text-red-400 uppercase tracking-[0.4em]">
                            <Trash2 className="text-red-500 w-5 h-5" /> DANGER ZONE
                        </h2>
                        <p className="text-xs text-muted-foreground mb-6 max-w-lg">
                            Deleting your account is irreversible. All your data, matches, and conversations will be permanently removed from the platform.
                        </p>
                        <button className="px-8 py-3 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.1)] hover:shadow-[0_0_25px_rgba(239,68,68,0.4)]">
                            Delete Account
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
