export default function Button({ value, onClick, variant = "primary", className }) {

    const styles = {
        primary: {
            base: { backgroundColor: "var(--cta-bg)", color: "var(--cta-text)", border: "none" },
            hover: { backgroundColor: "var(--cta-bg-hover)" },
        },
        primaryBorder: {
            base: { backgroundColor: "transparent", color: "var(--brand-ocre)", border: "1px solid var(--brand-ocre)" },
            hover: { backgroundColor: "var(--brand-ocre)", color: "var(--cta-text)" },
        },
        secondary: {
            base: { color: "var(--cta-secondary-text)",boxShadow: "var(--shadow-normal)"},
            hover: { backgroundColor: "var(--cta-secondary-bg-hover)" },
        },
        outline: {
            base: { backgroundColor: "transparent", color: "var(--cta-outline-text)", border: "1px solid var(--cta-outline-border)" },
            hover: { color: "var(--cta-outline-hover)", borderColor: "var(--cta-outline-hover)" },
        },
        accent: {
            base: { backgroundColor: "var(--cta-accent-bg)", color: "var(--cta-accent-text)", border: "none" },
            hover: { backgroundColor: "var(--cta-accent-bg-hover)" },
        },
        dark: {
            base: { backgroundColor: "var(--cta-dark-bg)", color: "var(--cta-dark-text)", border: "none" },
            hover: { opacity: 0.85 },
        },
    }

    const current = styles[variant] ?? styles.primary

    return (
        <button
            onClick={onClick}
            className={`text-sm font-medium cursor-pointer transition-all duration-200 rounded-[var(--radius-sm)] whitespace-nowrap px-6 py-2 ${className || ''}`}
            style={current.base }
            onMouseEnter={e => Object.assign(e.currentTarget.style, current.hover)}
            onMouseLeave={e => Object.assign(e.currentTarget.style, current.base)}
        >
            {value}
        </button>
    )
}