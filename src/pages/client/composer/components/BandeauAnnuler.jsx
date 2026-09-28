import { useEffect } from "react";

// « Isalo retirée — Annuler ». Un retrait se rattrape d'un clic (ou Ctrl+Z)
// pendant six secondes : le voyageur ose manipuler son itinéraire parce
// qu'aucun geste n'est définitif.

const DUREE_MS = 6000;

export default function BandeauAnnuler({ annulable, onAnnuler, onFermer }) {
    useEffect(() => {
        if (!annulable) return undefined;
        const t = setTimeout(onFermer, DUREE_MS);
        return () => clearTimeout(t);
    }, [annulable, onFermer]);

    if (!annulable) return null;
    return (
        <div className="cx-cp-bandeau" role="status" key={annulable.le}>
            <span>{annulable.texte}</span>
            <button type="button" className="cx-cp-bandeau__annuler" onClick={onAnnuler}>Annuler</button>
        </div>
    );
}
