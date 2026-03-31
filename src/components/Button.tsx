import { ButtonHTMLAttributes, ReactNode } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "ghost" | "outline";
  loading?: boolean;
  fullWidth?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  ...rest
}: Props) {
  const base = `
    relative inline-flex items-center justify-center gap-2
    px-4 py-3 rounded-xl text-sm font-medium
    transition-all duration-200 cursor-pointer
    disabled:opacity-40 disabled:cursor-not-allowed
    ${fullWidth ? "w-full" : ""}
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-violet-600 to-violet-500
      text-white shadow-lg shadow-violet-500/20
      hover:from-violet-500 hover:to-violet-400
      hover:shadow-violet-500/30
      active:scale-[0.98]
    `,
    ghost: `
      text-white/60 hover:text-white hover:bg-white/[0.06]
      active:scale-[0.98]
    `,
    outline: `
      border border-white/[0.12] text-white/80
      hover:bg-white/[0.06] hover:border-white/20
      active:scale-[0.98]
    `,
  };

  return (
    <button
      disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
