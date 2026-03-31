import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export default function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glow blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-cyan-500/8 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[200px] h-[200px] rounded-full bg-fuchsia-500/6 blur-[80px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-400 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 2L14 5.5V10.5L8 14L2 10.5V5.5L8 2Z" fill="white" fillOpacity="0.9" />
            </svg>
          </div>
          <span className="text-sm font-semibold tracking-wide text-white/90">AuthSystem</span>
        </div>

        {/* Card */}
        <div className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-8 backdrop-blur-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-white mb-1 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
