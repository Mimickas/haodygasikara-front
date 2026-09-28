// Un choix multiple en étiquettes : le même bouton que les filtres de la
// barre d'outils (.ad-filtre) — même rôle, même dessin.
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
        <div className="ad-filtres">
            {options.map(opt => {
                const selected = value.some(v => memeValeur(v, opt.value));
                return (
                    <button
                        key={opt.value}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => toggle(opt.value)}
                        className={`ad-filtre font-body-strong${selected ? " ad-filtre--actif" : ""}`}
                    >
                        {opt.label}
                    </button>
                );
            })}
        </div>
    );
}
