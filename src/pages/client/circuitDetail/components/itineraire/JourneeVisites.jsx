// ── Les visites d'une journee ─────────────────────────────────────────────
// `VisiteDetaille { id, poi, inclus, note }` — ce qu'on fait dans la journee.
//
// Le bloc se pose entre le recit et la nuit, et un cran SOUS l'hebergement :
// la nuitee est le point fixe de la journee (un nom, un lieu, des photos), les
// visites sont une liste. L'ecart ne se joue pas sur le corps mais sur la
// FAMILLE — la nuitee en Abhaya, la serif des titres ; les visites en Barlow.
// Deux tailles voisines dans la meme fonte se seraient disputees le regard.
//
// Une visite comprise ne porte aucune marque : on ne decore pas ce qui est
// acquis. Seule l'option se signale — c'est une ligne de devis en plus.
export default function JourneeVisites({ visites = [] }) {
    if (!visites.length) return null;

    return (
        <section className="cx-visites">
            <div className="cx-visites__tete">
                <span className="cx-label cx-label--legende font-body-strong">
                    Visites et activit&eacute;s
                </span>
                {/* Le compte en exposant, comme l'entete de l'itineraire —
                    meme motif, un niveau plus bas. */}
                <span className="cx-visites__compte font-body-strong tabular-nums">
                    {String(visites.length).padStart(2, "0")}
                </span>
            </div>

            <ul className="cx-visites__liste">
                {visites.map((visite, i) => (
                    <li key={visite?.id ?? i} className="cx-visite">
                        <h5 className="cx-visite__nom font-body-strong">
                            {visite?.poi?.nom}
                            {visite?.poi?.categorie?.nom && (
                                <span className="cx-visite__type font-body-strong">
                                    {visite.poi.categorie.nom}
                                </span>
                            )}
                        </h5>

                        {!visite?.inclus && (
                            <span className="cx-visite__option font-body-strong">
                                En option
                            </span>
                        )}

                        {visite?.note && (
                            <p className="cx-visite__note font-body">{visite.note}</p>
                        )}
                    </li>
                ))}
            </ul>
        </section>
    );
}
