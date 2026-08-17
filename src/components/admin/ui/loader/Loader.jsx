// components/ui/Loader.jsx

// bloc skeleton de base — réutilise ta charte
function SkeletonBox({ className = "" }) {
    return <div className={`skeleton-box ${className}`} />;
}

// variante KPI : 4 cartes fantômes
function KpiLoader() {
    return (
        <div className="mb-5 flex items-center justify-between gap-4 w-full">
            {Array.from({ length: 4 }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 w-full"
                    style={{ boxShadow: "var(--shadow-normal)", borderRadius: "var(--radius-lg)", backgroundColor: "var(--bg-card)" }}
                >
                    <SkeletonBox className="h-4 w-2/3" />
                    <SkeletonBox className="h-8 w-1/2 my-2" />
                    <SkeletonBox className="h-4 w-3/4" />
                </div>
            ))}
        </div>
    );
}

// variante table : n lignes fantômes
function TableLoader({ rows = 5, cols = 4 }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex gap-4 w-full">
                    {Array.from({ length: cols }).map((_, c) => (
                        <SkeletonBox key={c} className="h-6 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// variante spinner : pour boutons, petites zones
function Spinner({ size = 20 }) {
    return (
        <div
            className="animate-spin rounded-full"
            style={{
                width: size, height: size,
                border: "2px solid var(--bg-sunken)",
                borderTopColor: "var(--brand-terre)",
            }}
        />
    );
}

// point d'entrée unique
export default function Loader({ variant = "spinner", ...props }) {
    switch (variant) {
        case "kpi":     return <KpiLoader {...props} />;
        case "table":   return <TableLoader {...props} />;
        case "spinner": return <Spinner {...props} />;
        default:        return <Spinner {...props} />;
    }
}