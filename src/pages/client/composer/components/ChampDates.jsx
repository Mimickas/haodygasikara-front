import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";
import { fr } from "react-day-picker/locale";
import "react-day-picker/style.css";
import { FaArrowRight } from "react-icons/fa6";
import { nuitsEntre, versDate, versIso } from "../../../../functions/composer/itineraire";

// Les dates du voyage, écrites comme la ligne de méta des circuits de
// l'accueil : « 2 NOV. → 10 NOV. 2026 | 8 NUITS ». Un clic ouvre le
// calendrier : deux mois côte à côte, les jours passés grisés.
//
// Le calendrier sort de la colonne (portail) : il est plus large qu'elle, et
// la colonne défile — il y serait rogné.

const court = (iso) => versDate(iso)?.toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) ?? "";
const long = (iso) => versDate(iso)?.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) ?? "";

const MARGE = 16;

export default function ChampDates({ arrivee, depart, onChange, desactive = false }) {
    const [ouvert, setOuvert] = useState(false);
    const [position, setPosition] = useState(null);
    const declencheur = useRef(null);
    const panneau = useRef(null);
    const nuits = nuitsEntre(arrivee, depart);

    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    const fermer = useCallback(() => setOuvert(false), []);

    // Posé sous le déclencheur, ramené dans l'écran s'il en débordait.
    useLayoutEffect(() => {
        if (!ouvert) return;
        const cadre = declencheur.current?.getBoundingClientRect();
        const largeur = panneau.current?.offsetWidth ?? 0;
        if (!cadre) return;
        setPosition({
            top: cadre.bottom + 14,
            left: Math.max(MARGE, Math.min(cadre.left, window.innerWidth - largeur - MARGE)),
        });
    }, [ouvert]);

    useEffect(() => {
        if (!ouvert) return undefined;
        const dehors = (e) => {
            if (panneau.current?.contains(e.target) || declencheur.current?.contains(e.target)) return;
            fermer();
        };
        const echap = (e) => { if (e.key === "Escape") fermer(); };
        // Défiler ou redimensionner déplacerait le déclencheur sous le calendrier
        const defilement = (e) => { if (!panneau.current?.contains(e.target)) fermer(); };
        document.addEventListener("pointerdown", dehors);
        document.addEventListener("keydown", echap);
        window.addEventListener("resize", fermer);
        window.addEventListener("scroll", defilement, true);
        return () => {
            document.removeEventListener("pointerdown", dehors);
            document.removeEventListener("keydown", echap);
            window.removeEventListener("resize", fermer);
            window.removeEventListener("scroll", defilement, true);
        };
    }, [ouvert, fermer]);

    const choisir = (plage) => {
        onChange(versIso(plage?.from) ?? null, versIso(plage?.to) ?? null);
        if (plage?.from && plage?.to && plage.to > plage.from) fermer();
    };

    return (
        <div className="cx-cp-dates">
            <button ref={declencheur} type="button" className="cx-cp-dates__declencheur" disabled={desactive}
                onClick={() => setOuvert((o) => !o)} aria-expanded={ouvert} aria-haspopup="dialog">
                {arrivee || depart ? (
                    <>
                        <span>{arrivee ? court(arrivee) : "Arrivée"}</span>
                        <FaArrowRight size={9} className="cx-cp-dates__fleche" />
                        <span>{depart ? long(depart) : "Départ"}</span>
                        {nuits && (
                            <>
                                <span className="cx-cp-dates__sep" aria-hidden="true" />
                                <span>{nuits} nuit{nuits > 1 ? "s" : ""}</span>
                            </>
                        )}
                    </>
                ) : (
                    <span className="cx-cp-dates__vide">Choisir les dates</span>
                )}
            </button>

            {ouvert && createPortal(
                <div ref={panneau} className="cx-cp-dates__panneau" role="dialog" aria-label="Dates du voyage"
                    style={position ?? { visibility: "hidden" }}>
                    <DayPicker
                        mode="range"
                        locale={fr}
                        numberOfMonths={window.innerWidth < 720 ? 1 : 2}
                        selected={{ from: versDate(arrivee) ?? undefined, to: versDate(depart) ?? undefined }}
                        onSelect={choisir}
                        disabled={{ before: aujourdhui }}
                        defaultMonth={versDate(arrivee) ?? aujourdhui}
                        min={1}
                        className="cx-cp-calendrier"
                    />
                    <div className="cx-cp-dates__pied">
                        <span>{nuits ? `${nuits} nuit${nuits > 1 ? "s" : ""} sur place` : arrivee ? "Choisissez le départ" : "Choisissez l'arrivée"}</span>
                        {(arrivee || depart) && (
                            <button type="button" className="cx-cp-lien-espace" onClick={() => onChange(null, null)}>Effacer</button>
                        )}
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}
