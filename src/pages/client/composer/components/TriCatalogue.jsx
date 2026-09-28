import { useEffect, useRef, useState } from "react";
import { FaChevronDown } from "react-icons/fa6";
import { TRIS } from "../../../../constants/client/composer";

// Le tri, replié en un seul mot : l'ordre choisi et une flèche. Les quatre
// ordres (calculés par le serveur) s'ouvrent dessous.

export default function TriCatalogue({ tri, onChange }) {
    const [ouvert, setOuvert] = useState(false);
    const racine = useRef(null);
    const actuel = TRIS.find((t) => t.valeur === tri) ?? TRIS[0];

    useEffect(() => {
        if (!ouvert) return undefined;
        const dehors = (e) => { if (!racine.current?.contains(e.target)) setOuvert(false); };
        const echap = (e) => { if (e.key === "Escape") setOuvert(false); };
        document.addEventListener("pointerdown", dehors);
        document.addEventListener("keydown", echap);
        return () => {
            document.removeEventListener("pointerdown", dehors);
            document.removeEventListener("keydown", echap);
        };
    }, [ouvert]);

    return (
        <div className="cx-cp-tri" ref={racine}>
            <button type="button" className="cx-cp-tri__declencheur" aria-haspopup="listbox" aria-expanded={ouvert}
                aria-label={`Trier : ${actuel.libelle}`} onClick={() => setOuvert((o) => !o)}>
                {actuel.libelle}
                <FaChevronDown size={8} className={`cx-cp-tri__chevron${ouvert ? " cx-cp-tri__chevron--ouvert" : ""}`} />
            </button>
            {ouvert && (
                <ul className="cx-cp-tri__liste" role="listbox" aria-label="Trier les destinations">
                    {TRIS.map((t) => (
                        <li key={t.valeur}>
                            <button type="button" role="option" aria-selected={t.valeur === tri} className="cx-cp-tri__option"
                                onClick={() => { onChange(t.valeur); setOuvert(false); }}>
                                {t.libelle}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
