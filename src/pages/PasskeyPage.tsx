import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Button from "../components/Button";
import Input from "../components/Input";
import { Page } from "../App";
import { passkeyApi } from "../api/services";
import { useAuth } from "../context/AuthContext";
import { useApiError } from "../hooks/useApiError";
import { startRegistration, startAuthentication } from "@simplewebauthn/browser";

interface Props { navigate: (p: Page) => void; }

type Step = "intro" | "authenticating" | "success" | "error";

export default function PasskeyPage({ navigate }: Props) {
  const [step, setStep]   = useState<Step>("intro");
  const [email, setEmail] = useState("");
  const { setAuth }       = useAuth();
  const { error, handleError, clearError } = useApiError();

  const handleLogin = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) { handleError(new Error("Enter a valid email first")); return; }
    clearError(); setStep("authenticating");
    try {
      const { data: optData } = await passkeyApi.authOptions(email);
      const assertion = await startAuthentication(optData.data.options as never);
      const { data } = await passkeyApi.authVerify(optData.data.userId, assertion as never);
      setAuth(data.data.accessToken, data.data.user);
      setStep("success");
      setTimeout(() => navigate("dashboard"), 1200);
    } catch (err) {
      handleError(err); setStep("error");
    }
  };

  return (
    <AuthLayout title="Sign in with passkey" subtitle="Use your device biometrics">
      {step === "intro" && (
        <div className="space-y-6">
          <div className="text-center py-4">
            <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.999-4.659.999-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
            </div>
            <p className="text-white/60 text-sm">Use your fingerprint, face, or device PIN. No password required.</p>
          </div>

          {error && <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>}

          <Input label="Email address" type="email" placeholder="you@example.com"
            value={email} onChange={e=>{setEmail(e.target.value);clearError();}}
            icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>}
          />

          <Button fullWidth onClick={handleLogin}>Continue with passkey</Button>
          <button onClick={()=>navigate("login")} className="w-full text-sm text-white/30 hover:text-white/60 transition-colors">Use password instead</button>
        </div>
      )}

      {step === "authenticating" && (
        <div className="text-center py-8 space-y-6">
          <div className="relative flex items-center justify-center">
            <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center animate-pulse">
              <svg className="w-12 h-12 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.999-4.659.999-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4"/></svg>
            </div>
          </div>
          <div>
            <p className="text-white font-medium">Waiting for biometric</p>
            <p className="text-sm text-white/40 mt-1">Touch the sensor or look at the camera</p>
          </div>
        </div>
      )}

      {step === "success" && (
        <div className="text-center py-8 space-y-4">
          <div className="w-24 h-24 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <svg className="w-12 h-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          </div>
          <p className="text-white font-medium">Verified!</p>
          <p className="text-sm text-white/40">Signing you in...</p>
        </div>
      )}

      {step === "error" && (
        <div className="space-y-4">
          <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">{error}</div>
          <Button fullWidth variant="outline" onClick={()=>{setStep("intro");clearError();}}>Try again</Button>
          <button onClick={()=>navigate("login")} className="w-full text-sm text-white/30 hover:text-white/60 transition-colors">Back to login</button>
        </div>
      )}
    </AuthLayout>
  );
}
