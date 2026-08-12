export default function SelectComponent({ value, onChange, options = [], placeholder = "Select an option", className = "" }) {
    return (
        <select
            value={value}
            onChange={onChange}
            className={`w-full px-4 py-2.5 rounded-md text-sm outline-none transition-all border-0 bg-transparent ${className}`}
            style={{
                boxShadow: "var(--shadow-normal)",
                color: "var(--text-secondary)",
                appearance: "none",
                WebkitAppearance: "none",
            }}
            onFocus={e => {
                e.currentTarget.style.boxShadow = "0 0 8px rgba(217, 78, 43, 0.35)";
                e.currentTarget.style.backgroundColor = "var(--bg-card)";
            }}
            onBlur={e => {
                e.currentTarget.style.boxShadow = "var(--shadow-normal)";
                e.currentTarget.style.backgroundColor = "transparent";
            }}
        >
            <option value="">{placeholder}</option>
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
}