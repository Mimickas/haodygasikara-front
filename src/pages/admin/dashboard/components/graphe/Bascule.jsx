// Passe du graphique au tableau, et retour : les mêmes chiffres, sans la couleur.
export default function Bascule({ tableau, onBascule }) {
    return (
        <button type="button" className="ad-tb-lien font-body-strong" aria-pressed={tableau} onClick={() => onBascule(!tableau)}>
            {tableau ? "Voir le graphique" : "Voir le tableau"}
        </button>
    );
}
