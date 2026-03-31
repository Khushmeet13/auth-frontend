import { useState, useEffect } from "react";
import { Page } from "../App";
import { useAuth } from "../context/AuthContext";
import { userApi, mfaApi, authApi, Session } from "../api/services";
import { useApiError } from "../hooks/useApiError";

interface Props { navigate: (p: Page) => void; }
type Tab = "overview" | "security" | "sessions" | "rbac";

export default function DashboardPage({ navigate }: Props) {
  const { user, clearAuth, refreshUser } = useAuth();
  const [tab, setTab]                   = useState<Tab>("overview");
  const [sessions, setSessions]         = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [mfaSetup, setMfaSetup]         = useState<{ qrCode: string; secret: string } | null>(null);
  const [mfaOtp, setMfaOtp]             = useState("");
  const [mfaLoading, setMfaLoading]     = useState(false);
  const [mfaMsg, setMfaMsg]             = useState("");
  const [previewRole, setPreviewRole]   = useState<"user" | "moderator" | "admin">("user");
  const { error, handleError }          = useApiError();

  useEffect(() => { if (user) setPreviewRole(user.role); }, [user]);

  useEffect(() => {
    if (tab === "sessions") {
      setSessionsLoading(true);
      userApi.getSessions()
        .then(({ data }) => setSessions(data.data.sessions))
        .catch(() => {})
        .finally(() => setSessionsLoading(false));
    }
  }, [tab]);

  const handleLogout = async () => { await clearAuth(); navigate("login"); };

  const handleRevokeSession = async (id: string) => {
    try { await userApi.revokeSession(id); setSessions(s => s.filter(x => x._id !== id)); }
    catch (err) { handleError(err); }
  };

  const handleRevokeAll = async () => {
    try {
      await userApi.revokeAllSessions();
      const { data } = await userApi.getSessions();
      setSessions(data.data.sessions);
    } catch (err) { handleError(err); }
  };

  const handleMFASetup = async () => {
    setMfaLoading(true); setMfaMsg("");
    try { const { data } = await mfaApi.setup(); setMfaSetup(data.data); }
    catch (err) { handleError(err); }
    finally { setMfaLoading(false); }
  };

  const handleMFAConfirm = async () => {
    if (mfaOtp.length !== 6) return;
    setMfaLoading(true);
    try {
      await mfaApi.confirm(mfaOtp);
      setMfaMsg("MFA enabled successfully!"); setMfaSetup(null); setMfaOtp("");
      await refreshUser();
    } catch (err) { handleError(err); }
    finally { setMfaLoading(false); }
  };

  const handleMFADisable = async () => {
    const otp = window.prompt("Enter your 6-digit OTP to disable MFA:");
    if (!otp) return;
    try { await mfaApi.disable(otp); setMfaMsg("MFA disabled."); await refreshUser(); }
    catch (err) { handleError(err); }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "security", label: "Auth Methods" },
    { key: "sessions", label: "Sessions" },
    { key: "rbac",     label: "RBAC" },
  ];

  const PERMS = [
    { label: "View own profile",  user: true,  moderator: true,  admin: true  },
    { label: "Edit own profile",  user: true,  moderator: true,  admin: true  },
    { label: "View other users",  user: false, moderator: true,  admin: true  },
    { label: "Moderate content",  user: false, moderator: true,  admin: true  },
    { label: "Delete users",      user: false, moderator: false, admin: true  },
    { label: "Manage roles",      user: false, moderator: false, admin: true  },
    { label: "View audit logs",   user: false, moderator: false, admin: true  },
    { label: "Access API keys",   user: false, moderator: false, admin: true  },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[20%] w-[400px] h-[400px] rounded-full bg-violet-600/6 blur-[120px]" />
        <div className="absolute bottom-[10%] left-[10%] w-[300px] h-[300px] rounded-full bg-cyan-500/5 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-white/90">AuthSystem</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.07]">
              <div className="w-5 h-5 rounded-full bg-violet-500/30 flex items-center justify-center">
                <span className="text-[10px] text-violet-300 font-bold">{user?.name?.slice(0,2).toUpperCase()||"U"}</span>
              </div>
              <span className="text-xs text-white/60">{user?.name || user?.email}</span>
              <span className="text-[10px] text-violet-400 bg-violet-500/15 px-1.5 py-0.5 rounded-full capitalize">{user?.role}</span>
            </div>
            <button onClick={handleLogout} className="text-xs text-white/30 hover:text-white/60 transition-colors px-3 py-1.5 rounded-lg hover:bg-white/[0.04]">
              Sign out
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Security Dashboard</h1>
          <p className="text-sm text-white/40">Manage authentication methods and account security</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Email",    value: user?.email?.split("@")[0] || "—",          color: "text-white/70" },
            { label: "Verified", value: user?.isVerified ? "Yes" : "No",             color: user?.isVerified ? "text-emerald-400" : "text-red-400" },
            { label: "MFA",      value: user?.mfaEnabled ? "Enabled" : "Disabled",  color: user?.mfaEnabled ? "text-emerald-400" : "text-yellow-400" },
            { label: "Role",     value: user?.role || "user",                        color: "text-violet-400" },
          ].map(s => (
            <div key={s.label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl p-4">
              <p className="text-xs text-white/40 mb-1.5">{s.label}</p>
              <p className={`text-base font-semibold capitalize ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-white/[0.03] border border-white/[0.07] rounded-xl w-fit">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 ${tab===t.key?"bg-white/[0.08] text-white font-medium":"text-white/40 hover:text-white/70"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── OVERVIEW ── */}
        {tab === "overview" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-base font-medium text-white mb-4">Security overview</h2>
              {[
                { label: "Email verified",      ok: user?.isVerified || false },
                { label: "Two-factor auth",     ok: user?.mfaEnabled || false },
                { label: "Google OAuth linked", ok: !!user?.googleId },
                { label: "GitHub OAuth linked", ok: !!user?.githubId },
                { label: "Passkeys registered", ok: (user?.passkeys?.length || 0) > 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
                  <span className="text-sm text-white/70">{item.label}</span>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${item.ok?"text-emerald-400":"text-yellow-400"}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${item.ok?"bg-emerald-400":"bg-yellow-400"}`} />
                    {item.ok ? "Active" : "Not set"}
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
              <h2 className="text-base font-medium text-white mb-4">Account info</h2>
              {[
                { label: "Name",       value: user?.name || "—" },
                { label: "Email",      value: user?.email || "—" },
                { label: "Role",       value: user?.role || "—" },
                { label: "Member since", value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—" },
                { label: "Last login", value: user?.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "—" },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between py-2.5 border-b border-white/[0.05] last:border-0 gap-4">
                  <span className="text-sm text-white/50 flex-shrink-0">{item.label}</span>
                  <span className="text-sm text-white/80 text-right truncate capitalize">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── AUTH METHODS ── */}
        {tab === "security" && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-medium text-white">Authentication methods</h2>
              <p className="text-xs text-white/40 mt-0.5">Manage how you sign in to your account</p>
            </div>

            {mfaMsg && <div className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-400">{mfaMsg}</div>}
            {error  && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

            {/* Password */}
            <div className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <div className="w-9 h-9 rounded-xl bg-violet-500/15 border border-violet-500/20 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white/90">Password</p>
                <p className="text-xs text-white/40">Email + password login</p>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Active</span>
            </div>

            {/* MFA */}
            <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${user?.mfaEnabled?"bg-violet-500/15 border border-violet-500/20":"bg-white/[0.04] border border-white/[0.06]"}`}>
                  <svg className={`w-4 h-4 ${user?.mfaEnabled?"text-violet-400":"text-white/30"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90">Two-Factor Auth (TOTP)</p>
                  <p className="text-xs text-white/40">Google Authenticator / Authy</p>
                </div>
                {user?.mfaEnabled
                  ? <button onClick={handleMFADisable} className="text-xs text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-all">Disable</button>
                  : <button onClick={handleMFASetup} disabled={mfaLoading} className="text-xs text-violet-400 border border-violet-500/20 px-3 py-1.5 rounded-lg hover:bg-violet-500/10 transition-all disabled:opacity-50">{mfaLoading?"Loading...":"Enable"}</button>
                }
              </div>
              {mfaSetup && (
                <div className="mt-4 pt-4 border-t border-white/[0.07] space-y-4">
                  <p className="text-xs text-white/50">Scan with Google Authenticator or Authy:</p>
                  <div className="flex justify-center">
                    <img src={mfaSetup.qrCode} alt="QR Code" className="w-48 h-48 rounded-xl border border-white/[0.08] bg-white p-2"/>
                  </div>
                  <div className="bg-black/20 rounded-lg px-3 py-2 text-xs text-white/40 font-mono break-all">Manual: {mfaSetup.secret}</div>
                  <div className="flex gap-2">
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="6-digit code"
                      value={mfaOtp} onChange={e=>setMfaOtp(e.target.value.replace(/\D/g,"").slice(0,6))}
                      className="flex-1 bg-white/[0.06] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-violet-500/60 tracking-widest font-mono"/>
                    <button onClick={handleMFAConfirm} disabled={mfaOtp.length!==6||mfaLoading}
                      className="px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-sm rounded-xl transition-all disabled:opacity-40">
                      {mfaLoading?"Verifying...":"Verify"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Google OAuth */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${user?.googleId?"border-white/[0.08] bg-white/[0.02]":"border-white/[0.04] opacity-60"}`}>
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              </div>
              <div className="flex-1"><p className="text-sm font-medium text-white/90">Google OAuth</p><p className="text-xs text-white/40">Sign in with Google</p></div>
              {user?.googleId
                ? <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Linked</span>
                : <button onClick={()=>{window.location.href=authApi.googleUrl();}} className="text-xs text-white/50 border border-white/[0.12] px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all">Link</button>
              }
            </div>

            {/* GitHub OAuth */}
            <div className={`flex items-center gap-4 p-4 rounded-xl border ${user?.githubId?"border-white/[0.08] bg-white/[0.02]":"border-white/[0.04] opacity-60"}`}>
              <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                <svg className="w-4 h-4 fill-white/60" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 17.07 3.633 16.7 3.633 16.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
              </div>
              <div className="flex-1"><p className="text-sm font-medium text-white/90">GitHub OAuth</p><p className="text-xs text-white/40">Sign in with GitHub</p></div>
              {user?.githubId
                ? <span className="text-[10px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">Linked</span>
                : <button onClick={()=>{window.location.href=authApi.githubUrl();}} className="text-xs text-white/50 border border-white/[0.12] px-3 py-1.5 rounded-lg hover:bg-white/[0.06] transition-all">Link</button>
              }
            </div>
          </div>
        )}

        {/* ── SESSIONS ── */}
        {tab === "sessions" && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-medium text-white">Active sessions</h2>
                <p className="text-xs text-white/40 mt-0.5">Devices currently signed in</p>
              </div>
              <button onClick={handleRevokeAll} className="text-xs text-red-400 px-3 py-1.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 transition-all">
                Revoke all others
              </button>
            </div>
            {sessionsLoading ? (
              <div className="flex justify-center py-8">
                <div className="flex gap-2">{["bg-violet-500","bg-cyan-500","bg-fuchsia-500"].map((c,i)=>(
                  <div key={i} className={`w-2 h-2 rounded-full ${c} animate-bounce`} style={{animationDelay:`${i*0.15}s`}}/>
                ))}</div>
              </div>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-white/30 text-center py-6">No active sessions</p>
            ) : (
              <div className="space-y-3">
                {sessions.map((s, i) => (
                  <div key={s._id} className={`flex items-center gap-4 p-4 rounded-xl border ${i===0?"border-violet-500/20 bg-violet-500/5":"border-white/[0.07] bg-white/[0.02]"}`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${i===0?"bg-violet-500/20 text-violet-400":"bg-white/[0.04] text-white/40"}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-white/90 truncate">{s.userAgent?.slice(0,55)||"Unknown"}...</p>
                        {i===0&&<span className="text-[10px] text-violet-400 bg-violet-400/10 border border-violet-400/20 px-2 py-0.5 rounded-full flex-shrink-0">Current</span>}
                      </div>
                      <p className="text-xs text-white/35 mt-0.5">{s.ipAddress} · {new Date(s.createdAt).toLocaleDateString()}</p>
                    </div>
                    {i!==0&&(
                      <button onClick={()=>handleRevokeSession(s._id)} className="text-xs text-white/30 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                        Revoke
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── RBAC ── */}
        {tab === "rbac" && (
          <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-6">
            <h2 className="text-base font-medium text-white mb-1">Role-based access control</h2>
            <p className="text-xs text-white/40 mb-5">Your role: <span className="text-violet-400 capitalize font-medium">{user?.role}</span></p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(["user","moderator","admin"] as const).map(r=>(
                <button key={r} onClick={()=>setPreviewRole(r)}
                  className={`p-4 rounded-xl border text-left transition-all ${previewRole===r?"border-violet-500/40 bg-violet-500/10":"border-white/[0.07] hover:border-white/[0.14] bg-white/[0.02]"}`}>
                  <div className={`text-xs font-semibold mb-1 capitalize ${previewRole===r?"text-violet-300":"text-white/60"}`}>{r}</div>
                  <div className="text-[11px] text-white/30">{r==="user"?"Basic":r==="moderator"?"Moderate":"Full"} access</div>
                </button>
              ))}
            </div>
            <p className="text-sm text-white/60 mb-3">Permissions for <span className="text-violet-400 capitalize">{previewRole}</span></p>
            <div className="space-y-1">
              {PERMS.map(p=>{
                const has=p[previewRole];
                return (
                  <div key={p.label} className={`flex items-center justify-between py-2.5 px-3 rounded-lg ${has?"bg-white/[0.03]":"opacity-40"}`}>
                    <span className="text-sm text-white/70">{p.label}</span>
                    <div className={`flex items-center gap-1.5 text-xs font-medium ${has?"text-emerald-400":"text-white/20"}`}>
                      {has
                        ?<><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Allowed</>
                        :<><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>Denied</>
                      }
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
