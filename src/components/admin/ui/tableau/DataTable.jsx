import RowActions from "../../crud/rowActions/RowActions";

export default function DataTable({ columns, data, onRowClick, onEdit, onDelete }) {

    return (
        <div className="w-full overflow-x-auto rounded-lg" style={{ boxShadow: "var(--shadow-normal)" }}>
            <table className="w-full text-sm">

                <thead>
                    <tr style={{ backgroundColor: "var(--bg-secondary)", borderBottom: "1px solid var(--border)" }}>
                        {columns.map((col, i) => (
                            <th key={i}
                                className="px-4 py-3 font-medium whitespace-nowrap"
                                style={{
                                    color: "var(--text-muted)",
                                    textAlign: col.type === "actions" ? "right" : "left",
                                }}>
                                {col.label}
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {data && data.map((row, i) => (
                        <tr key={i}
                            onClick={() => onRowClick?.(row)}
                            className="transition-colors duration-150"
                            style={{
                                borderBottom: "1px solid var(--border-muted)",
                                cursor: onRowClick ? "pointer" : "default",
                            }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "var(--bg-card)"}
                        >
                            {columns.map((col, j) => {
                                // ── Colonne actions ──
                                if (col.type === "actions") {
                                    return (
                                        <td key={j} className="px-4 py-3">
                                            <RowActions
                                                id={row.id}
                                                onEdit={onEdit}
                                                onDelete={onDelete}
                                            />
                                        </td>
                                    );
                                }
                                // ── Colonne objet ──
                                if (col.type === "object") {
                                    return (
                                        <td key={j} className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                                            {col.objectKeys.map((objKey, k) => (
                                                <div key={k}>{row[col.key]?.[objKey.key] ?? "—"}</div>
                                            ))}
                                        </td>
                                    );
                                }
                                // ── Colonne normale ──
                                return (
                                    <td key={j} className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>

            </table>
        </div>
    );
}