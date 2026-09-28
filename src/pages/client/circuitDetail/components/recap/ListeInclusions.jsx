// Une liste d'inclusions — comprises, ou non.
//
// Pas de coche verte ni de croix rouge : le volet qui la contient porte deja
// le titre, et l'encre plus douce suffit pour ce qui n'est pas compris. Une
// coche verte est le vocabulaire d'un comparateur de prix, pas d'une maison de
// voyage, et elle oblige a regarder une icone pour lire un mot.
//
// Le poste (Transport, Vols, Assurance...) se pose en petites capitales a
// droite, exactement comme le type d'une visite : un seul registre pour tout le
// petit texte de la page.
export default function ListeInclusions({ lignes = [], exclu = false }) {
    if (!lignes.length) return null;

    return (
        <ul>
            {lignes.map((ligne, i) => (
                <li key={ligne?.id ?? i} className={`cx-ligne${exclu ? " cx-ligne--exclu" : ""}`}>
                    <span className="cx-ligne__libelle font-body">{ligne?.libelle}</span>
                    {ligne?.categorie?.libelle && (
                        <span className="cx-ligne__poste font-body-strong">
                            {ligne.categorie.libelle}
                        </span>
                    )}
                </li>
            ))}
        </ul>
    );
}
