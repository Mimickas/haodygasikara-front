import { FaPen, FaTrash } from "react-icons/fa6";

export default function RowActions({ id, onEdit, onDelete }) {
    return (
        <div className="flex items-center justify-end gap-2">
            <button
                onClick={(e) => { e.stopPropagation(); onEdit?.(id); }}
                aria-label="Modifier"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
                <FaPen className="text-sm" />
            </button>
            <button
                onClick={(e) => { e.stopPropagation(); onDelete?.(id); }}
                aria-label="Supprimer"
                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                style={{ color: "var(--error-text)" }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--error-bg)")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
                <FaTrash className="text-sm" />
            </button>
        </div>
    );
}