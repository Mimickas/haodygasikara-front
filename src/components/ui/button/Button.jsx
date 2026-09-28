// Le bouton d'appel du site public : angle vif, comme tout le reste. Deux
// variantes seulement — l'aplat et le contour ocre du hero de l'accueil.
// L'administration a les siens (.ad-bouton).
const STYLES = {
    primary: {
        base: { backgroundColor: "var(--cta-bg)", color: "var(--cta-text)", border: "none" },
        hover: { backgroundColor: "var(--cta-bg-hover)" },
    },
    primaryBorder: {
        base: { backgroundColor: "transparent", color: "var(--brand-ocre)", border: "1px solid var(--brand-ocre)" },
        hover: { backgroundColor: "var(--brand-ocre)", color: "var(--cta-text)" },
    },
};

export default function Button({ value, onClick, variant = "primary", className, disabled = false, type = "button" }) {
    const current = STYLES[variant] ?? STYLES.primary;

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`text-sm font-body-strong transition-all duration-200 whitespace-nowrap px-6 py-2 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} ${className || ""}`}
            style={current.base}
            onMouseEnter={e => { if (!disabled) Object.assign(e.currentTarget.style, current.hover); }}
            onMouseLeave={e => Object.assign(e.currentTarget.style, current.base)}
        >
            {value}
        </button>
    );
}
