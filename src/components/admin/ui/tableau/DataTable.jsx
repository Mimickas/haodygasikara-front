import { useRef } from "react";
import RowActions from "../../crud/rowActions/RowActions";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function DataTable({ columns, data, loading = false, skeletonRows = 5, onRowClick, onEdit, onDelete }) {
    const tbodyRef = useRef(null);

    useGSAP(() => {
        if (loading) return;                 // n'anime pas les lignes skeleton
        gsap.from(tbodyRef.current.children, {
            opacity: 0,
            y: -5,
            duration: 0.25,
            ease: "power2.out",
            stagger: 0.05,
            force3D: true,           // force l'accélération GPU, stabilise le transform
        });
    }, { scope: tbodyRef, dependencies: [loading] });

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

                <tbody ref={tbodyRef}>
                    {loading
                        ? Array.from({ length: skeletonRows }).map((_, i) => (
                            <tr key={i} style={{ borderBottom: "1px solid var(--border-muted)" }}>
                                {columns.map((col, j) => (
                                    <td key={j} className="px-4 py-3">
                                        <div
                                            className="skeleton-box h-4"
                                            style={{
                                                width: col.type === "actions" ? "60px" : "70%",
                                                marginLeft: col.type === "actions" ? "auto" : 0,
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))
                        : data && data.map((row, i) => (
                            <tr
                                key={i}
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
                                    if (col.type === "actions") {
                                        return (
                                            <td key={j} className="px-4 py-3">
                                                <RowActions id={row.id} onEdit={onEdit} onDelete={onDelete} />
                                            </td>
                                        );
                                    }
                                    if (col.type === "object") {
                                        return (
                                            <td key={j} className="px-4 py-3" style={{ color: "var(--text-primary)" }}>
                                                {col.objectKeys.map((objKey, k) => (
                                                    <div key={k}>{row[col.key]?.[objKey.key] ?? "—"}</div>
                                                ))}
                                            </td>
                                        );
                                    }
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