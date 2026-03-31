import { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MagicLinkPage from "./pages/MagicLinkPage";
import MFAPage from "./pages/MFAPage";
import { OAuthCallbackPage, ForgotPasswordPage, EmailVerifyPage } from "./pages/OAuthCallbackPage";
import PasskeyPage from "./pages/PasskeyPage";
import DashboardPage from "./pages/DashboardPage";
import { useAuth } from "./context/AuthContext";
import { authApi } from "./api/services";

export type Page =
  | "login" | "register" | "magic-link" | "mfa" | "passkey"
  | "oauth-callback" | "forgot-password" | "verify-email" | "dashboard";

export default function App() {
  const [page, setPage] = useState<Page>("login");
  const [userEmail, setUserEmail] = useState("");
  const [mfaTempToken, setMfaTempToken] = useState("");
  const { user, isLoading, setAuth } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");
    if (error) { window.history.replaceState({}, "", "/"); setPage("login"); return; }
    if (token) {
      window.history.replaceState({}, "", "/");
      localStorage.setItem("accessToken", token);
      authApi.getMe().then(({ data }) => { setAuth(token, data.data.user); setPage("dashboard"); })
        .catch(() => { localStorage.removeItem("accessToken"); setPage("login"); });
    }
  }, []);

  useEffect(() => {
    if (!isLoading && user) setPage("dashboard");
  }, [isLoading, user]);

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex gap-2">
        {["bg-violet-500","bg-cyan-500","bg-fuchsia-500"].map((c,i)=>(
          <div key={i} className={`w-2 h-2 rounded-full ${c} animate-bounce`} style={{animationDelay:`${i*0.15}s`}}/>
        ))}
      </div>
    </div>
  );

  const navigate = (p: Page, email?: string, tempToken?: string) => {
    if (email) setUserEmail(email);
    if (tempToken) setMfaTempToken(tempToken);
    setPage(p);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" style={{fontFamily:"'Sora',sans-serif"}}>
      {page==="login"           && <LoginPage navigate={navigate}/>}
      {page==="register"        && <RegisterPage navigate={navigate}/>}
      {page==="magic-link"      && <MagicLinkPage navigate={navigate}/>}
      {page==="mfa"             && <MFAPage navigate={navigate} email={userEmail} tempToken={mfaTempToken}/>}
      {page==="passkey"         && <PasskeyPage navigate={navigate}/>}
      {page==="oauth-callback"  && <OAuthCallbackPage navigate={navigate}/>}
      {page==="forgot-password" && <ForgotPasswordPage navigate={navigate}/>}
      {page==="verify-email"    && <EmailVerifyPage navigate={navigate} email={userEmail}/>}
      {page==="dashboard"       && <DashboardPage navigate={navigate}/>}
    </div>
  );
}
