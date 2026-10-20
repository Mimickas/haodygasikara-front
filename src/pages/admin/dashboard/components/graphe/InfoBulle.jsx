// La bulle au survol d'une barre : le chiffre d'abord, en gras ; ce qu'il
// compte ensuite. `lignes(d)` rend des [valeur, libellé, couleur?].
export default function InfoBulle({ active, payload, lignes }) {
    if (!active || !payload?.length) return null;
    const d = payload[0].payload;
    return (
        <div className="ad-tb-bulle font-body">
            <p className="ad-tb-bulle__titre font-body-strong">{d.nom}</p>
            {lignes(d).map(([valeur, libelle, couleur]) => (
                <p key={libelle} className="ad-tb-bulle__ligne">
                    {couleur && <span className="ad-tb-bulle__trait" style={{ backgroundColor: couleur }} />}
                    <span className="font-body-strong">{valeur}</span> {libelle}
                </p>
            ))}
        </div>
    );
}
