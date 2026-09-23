export default function MultiSelectField({ value = [], onChange, options = [] }) {
    // Comparaison par chaine, des deux cotes : ce champ sert aussi bien des
    // identifiants numeriques (les tags) que des noms de constantes (les
    // langues, les transports). L ancienne version comparait via Number(), ce
    // qui donnait NaN sur une valeur texte — aucune option ne s allumait jamais.
    const memeValeur = (a, b) => String(a) === String(b);

    function toggle(v) {
        const deja = value.some(x => memeValeur(x, v));
        onChange(deja ? value.filter(x => !memeValeur(x, v)) : [...value, v]);
    }

    return (
        <div className="flex flex-wrap gap-2">
            {options.map(opt => {
                const selected = value.some(v => memeValeur(v, opt.value));
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