import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { FaArrowLeft, FaArrowRight, FaXmark } from "react-icons/fa6";

import { imageCloudinary } from "../../../../utils/image";
// La fiche d'une destination, ouverte sur le côté sans quitter le créateur.
// Elle s'ouvre comme le panneau du menu : le volet glisse, la photo se pose
// en zoom arrière, le nom monte de sous son cadre, le reste suit. Elle se
// referme de la même façon, en sens inverse.

const SOBRE = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

export default function FicheDestination({ destination: d, onFermer, onAjouter }) {
    const [image, setImage] = useState(0);
    const images = d.images?.length ? d.images : d.image ? [d.image] : [];
    const voile = useRef(null);
    const panneau = useRef(null);
    const fermeture = useRef(false);

    useLayoutEffect(() => {
        if (SOBRE()) return undefined;
        const p = panneau.current;
        const tl = gsap.timeline();
        tl.fromTo(voile.current, { backgroundColor: "rgba(37, 26, 18, 0)" }, { backgroundColor: "rgba(37, 26, 18, 0.45)", duration: 0.6, ease: "power2.out" }, 0)
            .fromTo(p, { xPercent: 100 }, { xPercent: 0, duration: 0.95, ease: "power4.inOut", clearProps: "transform" }, 0)
            .fromTo(p.querySelectorAll("[data-fiche-media]"), { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "power2.out", clearProps: "transform" }, 0.25)
            .from(p.querySelectorAll("[data-fiche-ligne]"), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.08, clearProps: "transform" }, 0.55)
            .from(p.querySelectorAll("[data-fiche-apparait]"), { y: 24, opacity: 0, duration: 0.8, ease: "power3.out", stagger: 0.06, clearProps: "transform,opacity" }, 0.7);
        return () => tl.kill();
    }, []);

    const fermer = useCallback((apres) => {
        if (fermeture.current) return;
        fermeture.current = true;
        const finir = () => { apres?.(); onFermer(); };
        if (SOBRE()) { finir(); return; }
        gsap.timeline({ onComplete: finir })
            .to(panneau.current, { xPercent: 100, duration: 0.75, ease: "power4.inOut" }, 0)
            .to(voile.current, { backgroundColor: "rgba(37, 26, 18, 0)", duration: 0.5, ease: "power2.in" }, 0.25);
    }, [onFermer]);

    useEffect(() => {
        const touche = (e) => {
            if (e.key === "Escape") fermer();
            if (e.key === "ArrowRight") setImage((i) => Math.min(i + 1, images.length - 1));
            if (e.key === "ArrowLeft") setImage((i) => Math.max(i - 1, 0));
        };
        window.addEventListener("keydown", touche);
        return () => window.removeEventListener("keydown", touche);
    }, [fermer, images.length]);

    const groupes = d.tags.reduce((acc, t) => {
        (acc[t.groupe ?? "Autres"] ??= []).push(t.nom);
        return acc;
    }, {});

    return (
        <div ref={voile} className="cx-cp-fiche-voile" onClick={() => fermer()}>
            <aside ref={panneau} className="cx-cp-fiche" onClick={(e) => e.stopPropagation()} aria-label={d.nom} data-lenis-prevent>
                <div className="cx-cp-fiche__media">
                    <div data-fiche-media className="cx-cp-fiche__media-cadre">
                        {images.length > 0 && <img key={images[image]} src={imageCloudinary(images[image], 1200)} alt={d.nom} decoding="async" className="cx-cp-fiche__image" />}
                    </div>
                    <button type="button" className="cx-cp-fiche__fermer" onClick={() => fermer()} aria-label="Fermer">
                        <FaXmark size={13} />
                    </button>
                    {images.length > 1 && (
                        <div className="cx-cp-fiche__navigation">
                            <button type="button" onClick={() => setImage((i) => Math.max(i - 1, 0))} disabled={image === 0} aria-label="Photo précédente"><FaArrowLeft size={11} /></button>
                            <span>{String(image + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
                            <button type="button" onClick={() => setImage((i) => Math.min(i + 1, images.length - 1))} disabled={image === images.length - 1} aria-label="Photo suivante"><FaArrowRight size={11} /></button>
                        </div>
                    )}
                </div>

                <div className="cx-cp-fiche__corps">
                    <span className="cx-cp-masque"><span data-fiche-ligne className="cx-cp-surtitre">Destination</span></span>
                    <h2 className="cx-cp-fiche__nom">
                        <span className="cx-cp-masque"><span data-fiche-ligne className="cx-cp-fiche__nom-ligne">{d.nom}</span></span>
                    </h2>
                    {d.description && <p data-fiche-apparait className="cx-cp-fiche__description">{d.description}</p>}

                    {Object.keys(groupes).length > 0 && (
                        <dl data-fiche-apparait className="cx-cp-fiche__tags">
                            {Object.entries(groupes).map(([g, noms]) => (
                                <div key={g} className="cx-cp-fiche__tag-ligne">
                                    <dt className="cx-cp-fiche__groupe">{g}</dt>
                                    <dd className="cx-cp-fiche__valeurs">{noms.join(" · ")}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    {d.videoUrl && (
                        <a data-fiche-apparait href={d.videoUrl} target="_blank" rel="noreferrer" className="cx-cp-lien-espace cx-cp-fiche__video">
                            Voir la vidéo
                        </a>
                    )}
                </div>

                {onAjouter && (
                    <div className="cx-cp-fiche__pied" data-fiche-apparait>
                        <button type="button" className="cx-cp-cta cx-cp-cta--large"
                            onClick={() => fermer(() => onAjouter(d))}>
                            <span>{d.dejaChoisie ? "L'ajouter à nouveau" : "Ajouter à mon voyage"}</span>
                            <FaArrowRight size={11} />
                        </button>
                    </div>
                )}
            </aside>
        </div>
    );
}
