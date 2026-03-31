import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Input from "../components/Input";
import Button from "../components/Button";
import OAuthButtons from "../components/OAuthButtons";
import Divider from "../components/Divider";
import { Page } from "../App";
import { authApi } from "../api/services";
import { useApiError } from "../hooks/useApiError";

interface Props { navigate: (p: Page, email?: string) => void; }

export default function RegisterPage({ navigate }: Props) {
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string,string>>({});
  const [showPass, setShowPass] = useState(false);
  const { error, handleError, clearError } = useApiError();

  const strength = (() => {
    const p = form.password; let s = 0;
    if (p.length>=8) s++; if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++; if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  })();
  const sColors = ["","bg-red-500","bg-yellow-500","bg-blue-500","bg-emerald-500"];
  const sLabels = ["","Weak","Fair","Good","Strong"];
  const sTextColors = ["","text-red-400","text-yellow-400","text-blue-400","text-emerald-400"];

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.name) e.name = "Name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email required";
    if (form.password.length < 8) e.password = "Min 8 characters";
    if (!/[A-Z]/.test(form.password)) e.password = "Must contain uppercase letter";
    if (!/[0-9]/.test(form.password)) e.password = "Must contain a number";
    if (form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    clearError(); setLoading(true);
    try {
      await authApi.register({ name: form.name, email: form.email, password: form.password });
      navigate("verify-email", form.email);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const EyeIcon = () => showPass
    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>;

  return (
    <AuthLayout title="Create account" subtitle="Start building something great">
      <OAuthButtons
        onGoogle={() => { window.location.href = authApi.googleUrl(); }}
        onGithub={() => { window.location.href = authApi.githubUrl(); }}
      />
      <Divider />

      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Full name" type="text" placeholder="John Doe"
          value={form.name} onChange={e => { set("name")(e); setErrors(p=>({...p,name:""})); }}
          error={errors.name}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>}
        />
        <Input label="Email" type="email" placeholder="you@example.com"
          value={form.email} onChange={e => { set("email")(e); setErrors(p=>({...p,email:""})); }}
          error={errors.email}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
        />
        <div>
          <Input label="Password" type={showPass?"text":"password"} placeholder="Min 8 characters"
            value={form.password} onChange={e => { set("password")(e); setErrors(p=>({...p,password:""})); }}
            error={errors.password}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>}
            rightElement={<button type="button" onClick={()=>setShowPass(v=>!v)} className="text-white/30 hover:text-white/60 transition-colors"><EyeIcon/></button>}
          />
          {form.password && (
            <div className="mt-2 space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map(i=>(
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i<=strength ? sColors[strength] : "bg-white/10"}`}/>
                ))}
              </div>
              <p className={`text-[11px] ${sTextColors[strength]}`}>{sLabels[strength]}</p>
            </div>
          )}
        </div>
        <Input label="Confirm password" type="password" placeholder="••••••••"
          value={form.confirm} onChange={e => { set("confirm")(e); setErrors(p=>({...p,confirm:""})); }}
          error={errors.confirm}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>}
        />
        <Button type="submit" fullWidth loading={loading}>Create account</Button>
      </form>
      <p className="text-center text-sm text-white/40 mt-6">
        Already have an account?{" "}
        <button onClick={()=>navigate("login")} className="text-violet-400 hover:text-violet-300 transition-colors font-medium">Sign in</button>
      </p>
    </AuthLayout>
  );
}
