import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import OAuthButtons from "../components/OAuthButtons";
import Divider from "../components/Divider";
import { Page } from "../App";
import { authApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { useApiError } from "../hooks/useApiError";

interface Props { navigate: (p: Page, email?: string, tempToken?: string) => void; }

export default function LoginPage({ navigate }: Props) {
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]  = useState(false);
  const [errors, setErrors]    = useState<Record<string,string>>({});
  const { setAuth }            = useAuth();
  const { error, handleError, clearError } = useApiError();

  const validate = () => {
    const e: Record<string,string> = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    clearError();
    setLoading(true);
    try {
      const { data } = await authApi.login({ email, password });
      if (data.data.mfaRequired) {
        navigate("mfa", email, data.data.tempToken);
      } else {
        setAuth(data.data.accessToken!, data.data.user!);
        navigate("dashboard");
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const EyeIcon = () => showPass
    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account">
      <OAuthButtons
        onGoogle={() => { window.location.href = authApi.googleUrl(); }}
        onGithub={() => { window.location.href = authApi.githubUrl(); }}
        onSAML={() => navigate("oauth-callback")}
      />
      <Divider />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Email" type="email" placeholder="you@example.com"
          value={email} onChange={e => { setEmail(e.target.value); setErrors(p=>({...p,email:""})); }}
          error={errors.email}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
        <Input label="Password" type={showPass?"text":"password"} placeholder="••••••••"
          value={password} onChange={e => { setPassword(e.target.value); setErrors(p=>({...p,password:""})); }}
          error={errors.password}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
          rightElement={<button type="button" onClick={()=>setShowPass(v=>!v)} className="text-white/30 hover:text-white/60 transition-colors"><EyeIcon/></button>}
        />
        <div className="flex justify-end">
          <button type="button" onClick={()=>navigate("forgot-password")}
            className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
            Forgot password?
          </button>
        </div>
        <Button type="submit" fullWidth loading={loading}>Sign in</Button>
      </form>

      <Divider label="more options" />
      <div className="grid grid-cols-2 gap-2">
        <button onClick={()=>navigate("magic-link")}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/[0.07] hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-200 group">
          <svg className="w-5 h-5 text-white/30 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          <span className="text-[11px] text-white/40 group-hover:text-white/70 transition-colors">Magic Link</span>
        </button>
        <button onClick={()=>navigate("passkey")}
          className="flex flex-col items-center gap-1.5 p-3 rounded-xl border border-white/[0.07] hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all duration-200 group">
          <svg className="w-5 h-5 text-white/30 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.999-4.659.999-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
          <span className="text-[11px] text-white/40 group-hover:text-white/70 transition-colors">Passkey</span>
        </button>
      </div>
      <p className="text-center text-sm text-white/40 mt-6">
        Don't have an account?{" "}
        <button onClick={()=>navigate("register")} className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Create one</button>
      </p>
    </AuthLayout>
  );
}
