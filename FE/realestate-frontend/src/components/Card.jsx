
export default function Card({ title, subtitle, right, children }) {
  return (
    <div className="rounded-3xl bg-white border border-slate-200 shadow-sm">
      {(title || right) && (
        <div className="p-5 flex items-start justify-between gap-4 border-b border-slate-100">
          <div>
            {title && <div className="text-lg font-semibold">{title}</div>}
            {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
          </div>
          {right}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
