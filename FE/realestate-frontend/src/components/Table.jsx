
export default function Table({ columns, rows, emptyText = "No data" }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="text-left px-4 py-3 font-semibold text-slate-700">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {rows.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-slate-500" colSpan={columns.length}>
                {emptyText}
              </td>
            </tr>
          ) : (
            rows.map((r, idx) => (
              <tr key={idx} className="border-t border-slate-100 hover:bg-slate-50/50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-slate-800">
                    {c.render ? c.render(r) : r[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
