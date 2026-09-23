/**
 * Une étape du formulaire : un numéro, un titre, une phrase d'aide.
 *
 * ── Pourquoi des étapes numérotées ──────────────────────────────────────
 * La version précédente empilait trois zones séparées par des filets d'un
 * pixel, toutes du même poids. Un filet sépare bien deux choses de même
 * nature ; il ne dit pas dans quel ordre les faire. Numéroter dit exactement
 * cela — et « 2 sur 3 » se lit sans avoir appris à lire une interface.
 *
 * ── Pourquoi une phrase d'aide ──────────────────────────────────────────
 * Elle coûte trois lignes et évite l'hésitation qui fait abandonner. Elle est
 * écrite en français simple, sans vocabulaire de formulaire : « Qui part ? »
 * plutôt que « Sélection des participants ».
 *
 * Le panneau est posé sur le sable de la page, sans filet autour : c'est la
 * SURFACE qui sépare. Angles vifs et aucune ombre portée — la règle du site
 * ne bouge pas, c'est le moyen de séparation qui change.
 */
export default function EtapeReservation({ numero, titre, aide, children }) {
    return (
        <section className="cx-etape-resa" data-resa-etape>
            <header className="cx-etape-resa__entete">
                <span className="cx-etape-resa__numero font-title tabular-nums">{numero}</span>
                <div className="min-w-0">
                    <h2 className="cx-etape-resa__titre font-body-strong">{titre}</h2>
                    {aide && <span className="cx-etape-resa__aide font-body">{aide}</span>}
                </div>
            </header>

            <div className="cx-etape-resa__corps">{children}</div>
        </section>
    );
}
