export default function TextareaComponent({ value, setValue, placeholder, className = "", rows = 4 }) {
    return (
        <textarea
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={`w-full px-4 py-2.5 rounded-md text-sm outline-none transition-all resize-none ${className}`}
            style={{
                boxShadow: "var(--shadow-normal)",
                color: "var(--text-secondary)",
            }}
            onFocus={e => {
                e.currentTarget.style.borderColor = "var(--brand-terre)"
                e.currentTarget.style.boxShadow = "0 0 8px rgba(217, 78, 43, 0.35)"
                e.currentTarget.style.backgroundColor = "var(--bg-card)"
            }}
            onBlur={e => {
                e.currentTarget.style.borderColor = "none"
                e.currentTarget.style.boxShadow = "var(--shadow-normal)"
                e.currentTarget.style.backgroundColor = "transparent"
            }}
        />
    )
}