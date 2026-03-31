export default function Divider({ label = "or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-white/[0.07]" />
      <span className="text-xs text-white/25 uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px bg-white/[0.07]" />
    </div>
  );
}
