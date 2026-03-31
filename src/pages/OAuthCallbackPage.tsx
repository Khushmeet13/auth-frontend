import { useEffect, useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { Page } from "../App";
import { authApi } from "../api/services";
import { useApiError } from "../hooks/useApiError";

// ── OAuth Callback ──────────────────────────────────────────────
interface CallbackProps { navigate: (p: Page) => void; }

export function OAuthCallbackPage({ navigate }: CallbackProps) {
  const [step, setStep] = useState<"loading"|"done">("loading");
  useEffect(() => {
    // The actual token handling is done in App.tsx via URL params
    // This page just shows loading UI while App.tsx processes the redirect
    const t = setTimeout(() => setStep("done"), 1500);
    const t2 = setTimeout(() => navigate("dashboard"), 2500);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);
  return (
    <AuthLayout title="Signing you in" subtitle="Completing OAuth flow">
      <div className="text-center py-8 space-y-6">
        {step==="loading" ? (
          <>
            <div className="flex justify-center gap-3">
              {["from-violet-600 to-violet-400","from-cyan-600 to-cyan-400","from-fuchsia-600 to-fuchsia-400"].map((g,i)=>(
                <div key={i} className={`w-3 h-3 rounded-full bg-gradient-to-br ${g} animate-bounce`} style={{animationDelay:`${i*150}ms`}}/>
              ))}
            </div>
            <p className="text-white/50 text-sm">Verifying with provider...</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
            </div>
            <p className="text-white font-medium">Authenticated!</p>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

// ── Forgot Password ──────────────────────────────────────────────
interface ForgotProps { navigate: (p: Page) => void; }

export function ForgotPasswordPage({ navigate }: ForgotProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { handleError(new Error("Enter a valid email")); return; }
    clearError(); setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <AuthLayout title="Email sent" subtitle="Check your inbox for reset instructions">
      <div className="text-center space-y-5 py-4">
        <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
        </div>
        <p className="text-sm text-white/50">Reset link sent to <span className="text-white">{email}</span></p>
        <Button fullWidth variant="outline" onClick={()=>navigate("login")}>Back to login</Button>
      </div>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Forgot password?" subtitle="We'll send you a reset link">
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com"
          value={email} onChange={e=>{setEmail(e.target.value);clearError();}}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
        <Button type="submit" fullWidth loading={loading}>Send reset link</Button>
      </form>
      <button onClick={()=>navigate("login")} className="mt-5 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back to login
      </button>
    </AuthLayout>
  );
}

// ── Email Verify ──────────────────────────────────────────────
interface VerifyProps { navigate: (p: Page) => void; email: string; }

export function EmailVerifyPage({ navigate, email }: VerifyProps) {
  const [countdown, setCountdown] = useState(0);
  const [resent, setResent] = useState(false);

  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(()=>setCountdown(c=>c-1),1000); return ()=>clearTimeout(t); }
  }, [countdown]);

  // Handle verify-email token from URL (e.g. user clicked email link)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      window.history.replaceState({}, "", "/");
      authApi.verifyEmail(token).then(()=>navigate("login")).catch(()=>{});
    }
  }, []);

  const handleResend = async () => {
    if (!email) return;
    setCountdown(30);
    try { await authApi.sendMagicLink(email); setResent(true); } catch {}
  };

  return (
    <AuthLayout title="Verify your email" subtitle="One more step before you can sign in">
      <div className="text-center space-y-6 py-2">
        <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.4} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76"/></svg>
        </div>
        <div>
          <p className="text-white/60 text-sm mb-1">We sent a verification email to</p>
          <p className="text-white font-medium">{email}</p>
        </div>
        <div className="text-left bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-2">
          {["Open the email in your inbox","Click the verification link","Come back and sign in"].map((step,i)=>(
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-violet-400 font-semibold">{i+1}</span>
              </div>
              <span className="text-sm text-white/60">{step}</span>
            </div>
          ))}
        </div>
        {resent && <p className="text-xs text-emerald-400">Email resent!</p>}
        {countdown > 0
          ? <p className="text-sm text-white/30">Resend in {countdown}s</p>
          : <button onClick={handleResend} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Resend verification email</button>
        }
        <button onClick={()=>navigate("login")} className="text-sm text-white/30 hover:text-white/60 transition-colors block mx-auto">Back to login</button>
      </div>
    </AuthLayout>
  );
}

export default OAuthCallbackPage;
