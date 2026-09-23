import { FaPen, FaTrash } from "react-icons/fa6";

export default function RowActions({ id, onEdit, onDelete }) {
    return (
        <div className="flex items-center justify-end gap-1">
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onEdit?.(id); }}
                aria-label="Modifier"
                title="Modifier"
                className="w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                    e.currentTarget.style.color = "var(--brand-terre)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                }}
            >
                <FaPen className="text-xs" />
            </button>
            <button
                type="button"
                onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                aria-label="Supprimer"
                title="Supprimer"
                className="w-8 h-8 flex items-center justify-center transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--error-bg)";
                    e.currentTarget.style.color = "var(--error-text)";
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--text-muted)";
                }}
            >
                <FaTrash className="text-xs" />
            </button>
        </div>
    );
}
