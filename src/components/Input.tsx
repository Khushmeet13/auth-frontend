import { InputHTMLAttributes, forwardRef } from "react";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, Props>(
  ({ label, error, icon, rightElement, className = "", ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-white/[0.06] border rounded-xl px-4 py-3 text-sm text-white
              placeholder-white/20 outline-none transition-all duration-200
              ${icon ? "pl-10" : ""}
              ${rightElement ? "pr-12" : ""}
              ${error
                ? "border-red-500/50 focus:border-red-400"
                : "border-white/[0.08] focus:border-violet-500/60 focus:bg-white/[0.08]"
              }
              ${className}
            `}
            {...rest}
          />
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
export default Input;
