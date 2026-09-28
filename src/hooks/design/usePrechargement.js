import { useEffect, useState } from "react";

// Précharge des images (et attend les polices) avant de lever un rideau :
// une photo qui se révèle doit être là quand le cadre s'ouvre, pas une
// seconde après. Même principe que useAssetsLoader (l'accueil), avec deux
// différences :
//   * la liste peut arriver tard (celle du catalogue vient du serveur) :
//     tant qu'elle vaut null, on attend ;
//   * un délai maximal : une image lente (Cloudinary) ne doit pas garder la
//     page fermée. Passé ce délai, on ouvre quand même.
// Une fois prêt, on le reste.

export function usePrechargement(sources, delaiMax = 2500) {
    const [pret, setPret] = useState(false);
    const cle = sources == null ? null : sources.join("|");

    useEffect(() => {
        if (cle == null || pret) return undefined;
        let fini = false;
        const terminer = () => {
            if (fini) return;
            fini = true;
            setPret(true);
        };

        const liste = cle ? cle.split("|") : [];
        let restant = liste.length + 1;
        const un = () => {
            restant -= 1;
            if (restant <= 0) terminer();
        };
        liste.forEach((src) => {
            const img = new Image();
            img.onload = un;
            img.onerror = un;
            img.src = src;
        });
        (document.fonts?.ready ?? Promise.resolve()).then(un);

        const minuterie = setTimeout(terminer, delaiMax);
        return () => {
            fini = true;
            clearTimeout(minuterie);
        };
    }, [cle, pret, delaiMax]);

    return pret;
}
