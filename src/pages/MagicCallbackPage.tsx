// pages/MagicCallbackPage.tsx
import { useEffect } from "react";
import { Page } from "../App";

interface Props { navigate: (p: Page) => void; }

export default function MagicCallbackPage({ navigate }: Props) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("accessToken", token);
      // Clean the token from URL
      window.history.replaceState({}, "", "/dashboard");
      navigate("dashboard");
    } else {
      // e.g. error=invalid_magic_link
      navigate("login");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-white/50 text-sm">Signing you in…</p>
    </div>
  );
}