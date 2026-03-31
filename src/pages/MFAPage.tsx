import { useState, useRef, useEffect } from "react";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import { Page } from "../App";
import { mfaApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { useApiError } from "../hooks/useApiError";

interface Props { navigate: (p: Page) => void; email: string; tempToken: string; }

export default function MFAPage({ navigate, email, tempToken }: Props) {
  const [otp, setOtp]       = useState<string[]>(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const inputs = useRef<(HTMLInputElement|null)[]>([]);
  const { setAuth } = useAuth();
  const { error, handleError, clearError } = useApiError();

  useEffect(() => { inputs.current[0]?.focus(); }, []);
  useEffect(() => {
    if (countdown > 0) { const t = setTimeout(()=>setCountdown(c=>c-1),1000); return ()=>clearTimeout(t); }
  }, [countdown]);

  const handleChange = (i: number, val: string) => {
    const digit = val.replace(/\D/g,"").slice(-1);
    const next = [...otp]; next[i] = digit; setOtp(next); clearError();
    if (digit && i < 5) inputs.current[i+1]?.focus();
  };
  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key==="Backspace" && !otp[i] && i>0) inputs.current[i-1]?.focus();
  };
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g,"").slice(0,6);
    const next = Array(6).fill("");
    pasted.split("").forEach((d,i) => { next[i]=d; });
    setOtp(next); inputs.current[Math.min(pasted.length,5)]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) { handleError(new Error("Enter all 6 digits")); return; }
    clearError(); setLoading(true);
    try {
      const { data } = await mfaApi.verify(code, tempToken);
      setAuth(data.data.accessToken, data.data.user);
      navigate("dashboard");
    } catch (err) {
      handleError(err);
      setOtp(Array(6).fill("")); inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Two-factor auth" subtitle="Enter the 6-digit code from your authenticator">
      <div className="mb-6 flex items-center gap-3 px-4 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20">
        <svg className="w-4 h-4 text-violet-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
        <div>
          <p className="text-xs text-violet-300 font-medium">Signing in as</p>
          <p className="text-xs text-white/60">{email}</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="text-xs font-medium text-white/60 uppercase tracking-wider block mb-3">Authenticator code</label>
          <div className="flex gap-2" onPaste={handlePaste}>
            {otp.map((digit,i) => (
              <input key={i} ref={el=>{inputs.current[i]=el;}}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)}
                className={`w-full aspect-square text-center text-lg font-semibold rounded-xl bg-white/[0.06] border transition-all duration-200 outline-none caret-violet-400 ${digit?"text-white":"text-white/20"} border-white/[0.08] focus:border-violet-500/60 focus:bg-white/[0.08]`}
              />
            ))}
          </div>
        </div>
        <Button type="submit" fullWidth loading={loading} disabled={otp.join("").length<6}>Verify code</Button>
      </form>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-white/40">Didn't get a code?</span>
        {countdown>0
          ? <span className="text-sm text-white/30">Resend in {countdown}s</span>
          : <button onClick={()=>setCountdown(30)} className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Resend code</button>
        }
      </div>
      <button onClick={()=>navigate("login")} className="mt-4 text-sm text-white/30 hover:text-white/60 transition-colors flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        Back to login
      </button>
    </AuthLayout>
  );
}
