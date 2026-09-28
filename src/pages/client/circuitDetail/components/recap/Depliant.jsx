import { useState } from "react";

// Un volet. Titre, compte facultatif, et un signe « + » dont le trait vertical
// s'efface à l'ouverture — un scaleY, donc rien de repeint.
//
// La hauteur s'anime par `grid-template-rows` de 0fr à 1fr : la seule façon
// d'ouvrir une hauteur inconnue sans aller la mesurer en JavaScript. Le contenu
// reste donc monté, replié ou non, et le lecteur d'écran le suit par
// `aria-expanded`.
export default function Depliant({ titre, compte, ouvertParDefaut = false, children }) {
    const [ouvert, setOuvert] = useState(ouvertParDefaut);

    return (
        <section className={`cx-depliant${ouvert ? " cx-depliant--ouvert" : ""}`}>
            <button
                type="button"
                aria-expanded={ouvert}
                onClick={() => setOuvert((o) => !o)}
                className="cx-depliant__bouton"
            >
                <span className="cx-depliant__titre font-body-strong">
                    {titre}
                    {compte > 0 && (
                        <span className="cx-depliant__compte font-body-strong tabular-nums">
                            {String(compte).padStart(2, "0")}
                        </span>
                    )}
                </span>
                <span aria-hidden className="cx-depliant__signe" />
            </button>

            <div className="cx-depliant__corps">
                <div>
                    <div className="cx-depliant__dedans">{children}</div>
                </div>
            </div>
        </section>
    );
}
