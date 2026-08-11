export default function MultiSelectField({ value = [], onChange, options = [] }) {
    function toggle(id) {
        if (value.includes(id)) {
            onChange(value.filter(v => v !== id));
        } else {
            onChange([...value, id]);
        }
    }

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => {
                const selected = value.includes(opt.value);
                return (
                    <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggle(opt.value)}
                        className="text-sm px-3.5 py-1.5 cursor-pointer transition-all duration-200"
                        style={{
                            borderRadius: "var(--radius-pill)",
                            backgroundColor: selected ? "var(--brand-terre)" : "var(--bg-card)",
                            color: selected ? "#fff" : "var(--text-secondary)",
                            border: `1px solid ${selected ? "var(--brand-terre)" : "var(--border-strong)"}`,
                            boxShadow: selected ? "var(--cta-shadow)" : "var(--shadow-normal)",
                            fontWeight: selected ? 500 : 400,
                        }}
                        onMouseEnter={e => {
                            if (!selected) {
                                e.currentTarget.style.borderColor = "var(--brand-terre)";
                                e.currentTarget.style.color = "var(--brand-terre)";
                            }
                        }}
                        onMouseLeave={e => {
                            if (!selected) {
                                e.currentTarget.style.borderColor = "var(--border-strong)";
                                e.currentTarget.style.color = "var(--text-secondary)";
                            }
                        }}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}