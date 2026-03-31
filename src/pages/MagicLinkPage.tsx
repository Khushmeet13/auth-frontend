import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import { Page } from "../App";
import { authApi } from "../api/services";
import { useApiError } from "../hooks/useApiError";

interface Props { navigate: (p: Page) => void; }

export default function MagicLinkPage({ navigate }: Props) {
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/\S+@\S+\.\S+/.test(email)) { handleError(new Error("Enter a valid email")); return; }
    clearError(); setLoading(true);
    try {
      await authApi.sendMagicLink(email);
      setSent(true);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  if (sent) return (
    <AuthLayout title="Check your inbox" subtitle="We sent you a magic link">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <svg className="w-9 h-9 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
            </div>
          </div>
        </div>
        <div>
          <p className="text-white/60 text-sm mb-1">Magic link sent to</p>
          <p className="text-white font-medium">{email}</p>
        </div>
        <div className="text-left bg-white/[0.03] border border-white/[0.07] rounded-xl p-4 space-y-2">
          {["Check your email inbox","Click the magic link","You'll be signed in automatically"].map((step,i)=>(
            <div key={i} className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center flex-shrink-0">
                <span className="text-[10px] text-violet-400 font-semibold">{i+1}</span>
              </div>
              <span className="text-sm text-white/60">{step}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-white/30">Link expires in 15 minutes</p>
        <button onClick={()=>{setSent(false);setEmail("");}} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Use a different email</button>
      </div>
      <button onClick={()=>navigate("login")} className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back to login
      </button>
    </AuthLayout>
  );

  return (
    <AuthLayout title="Magic link" subtitle="Sign in without a password">
      <div className="mb-5 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/[0.07]">
        <p className="text-sm text-white/50">Enter your email and we'll send you a one-click sign-in link.</p>
      </div>
      {error && <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com"
          value={email} onChange={e=>{setEmail(e.target.value);clearError();}}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
        <Button type="submit" fullWidth loading={loading}>Send magic link</Button>
      </form>
      <button onClick={()=>navigate("login")} className="mt-6 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back to login
      </button>
    </AuthLayout>
  );
}
