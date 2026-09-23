import { useRef } from "react";
import RowActions from "../../crud/rowActions/RowActions";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function DataTable({ columns, data, loading = false, skeletonRows = 5, onRowClick, onEdit, onDelete }) {
    const tbodyRef = useRef(null);
    const isEmpty = !loading && (!data || data.length === 0);

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
        // ← angle vif et filet d'un pixel : la table se détache par son cadre, pas par une ombre
        <div
            className="w-full overflow-x-auto scroll-fine"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
        >
            <table className="w-full text-sm">

                <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-strong)" }}>
                        {columns.map((col, i) => (
                            <th key={i}
                                className="px-5 pt-5 pb-3.5 font-body-strong text-[11px] uppercase leading-none whitespace-nowrap"
                                style={{
                                    color: "var(--text-muted)",
                                    letterSpacing: "0.1em",
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
                                    <td key={j} className="px-5 py-4">
                                        <div
                                            className="skeleton-box h-4"
                                            style={{
                                                borderRadius: 0,
                                                width: col.type === "actions" ? "60px" : "70%",
                                                marginLeft: col.type === "actions" ? "auto" : 0,
                                            }}
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))
                        : isEmpty
                            ? (
                                // ← une table vide le dit, au lieu d'afficher un cadre muet
                                <tr>
                                    <td colSpan={columns.length} className="px-5 py-16 text-center">
                                        <p className="font-body-strong text-2xl leading-none" style={{ color: "var(--text-secondary)" }}>
                                            Aucun élément pour le moment
                                        </p>
                                        <p className="font-body text-sm mt-3" style={{ color: "var(--text-muted)" }}>
                                            Les enregistrements apparaîtront ici dès leur création.
                                        </p>
                                    </td>
                                </tr>
                            )
                            : data.map((row, i) => (
                                <tr
                                    key={i}
                                    onClick={() => onRowClick?.(row)}
                                    className="transition-colors duration-150"
                                    style={{
                                        borderBottom: i === data.length - 1 ? "none" : "1px solid var(--border-muted)",
                                        cursor: onRowClick ? "pointer" : "default",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--bg-hover)"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "transparent"}
                                >
                                    {columns.map((col, j) => {
                                        if (col.type === "actions") {
                                            return (
                                                <td key={j} className="px-5 py-2">
                                                    <RowActions id={row.id} onEdit={onEdit} onDelete={onDelete} />
                                                </td>
                                            );
                                        }
                                        if (col.type === "object") {
                                            return (
                                                <td key={j} className="px-5 py-4 font-body">
                                                    {col.objectKeys.map((objKey, k) => (
                                                        <div
                                                            key={k}
                                                            className={k === 0 ? "" : "text-xs mt-0.5"}
                                                            style={{ color: k === 0 ? "var(--text-primary)" : "var(--text-muted)" }}
                                                        >
                                                            {row[col.key]?.[objKey.key] ?? "—"}
                                                        </div>
                                                    ))}
                                                </td>
                                            );
                                        }
                                        // ← l'identifiant est une méta, pas une donnée : il passe en retrait
                                        const isId = col.key === "id";
                                        return (
                                            <td
                                                key={j}
                                                className={`px-5 py-4 font-body ${isId ? "text-xs tabular-nums" : ""}`}
                                                style={{ color: isId ? "var(--text-muted)" : "var(--text-primary)" }}
                                            >
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
