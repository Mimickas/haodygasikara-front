import { useEffect, useMemo, useRef, useState } from "react";
import { FaMagnifyingGlass, FaChevronDown, FaXmark } from "react-icons/fa6";

// ── Choisir dans une longue liste ──────────────────────────────────────────
//
// Un <select> tient tant qu'il y a dix options. À cent, on fait défiler en
// aveugle ; à mille — mille circuits, un jour de programme par jour de chaque
// circuit — il n'est plus utilisable du tout : on ne peut ni chercher, ni
// comparer, ni savoir ce qu'on regarde.
//
// Ici : un champ qui dit ce qui est choisi, et qui s'ouvre sur une recherche.
// On tape trois lettres, on voit les lignes qui correspondent avec leur
// information secondaire (la région, la durée, la destination), et on choisit.
// La recherche ignore la casse et les accents, comme celle des tableaux, et
// accepte les mots dans n'importe quel ordre : « boby trek » trouve « Trek du
// pic Boby ».
//
// Options : { value, label, sousTitre? } — `sousTitre` est la ligne grise qui
// permet de distinguer deux homonymes.

const sansAccent = (v) =>
    String(v ?? "").normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export default function ChampRecherche({
    id,
    value,
    onChange,
    options = [],
    placeholder = "Choisir…",
    placeholderRecherche = "Rechercher…",
    invalide = false,
    desactive = false,
}) {
    const [ouvert, setOuvert] = useState(false);
    const [terme, setTerme] = useState("");
    const [survol, setSurvol] = useState(0);
    // Le panneau se pose en repère fixe, mesuré sur le bouton : dans la liste
    // d'étapes — qui a son propre défilement — un panneau en absolu serait
    // rogné par le cadre, et on ne verrait qu'une bande de deux pixels.
    const [ancre, setAncre] = useState(null);

    const cadre = useRef(null);
    const champRecherche = useRef(null);
    const listeRef = useRef(null);

    const choisi = useMemo(
        () => options.find((o) => String(o.value) === String(value)) ?? null,
        [options, value]);

    const resultats = useMemo(() => {
        const mots = sansAccent(terme).trim().split(/\s+/).filter(Boolean);
        if (!mots.length) return options;
        return options.filter((o) => {
            const texte = sansAccent(`${o.label} ${o.sousTitre ?? ""}`);
            return mots.every((m) => texte.includes(m));
        });
    }, [options, terme]);

    // À l'ouverture : le curseur dans la recherche, et le survol sur l'option
    // déjà choisie plutôt que sur la première de la liste.
    useEffect(() => {
        if (!ouvert) return;
        setTerme("");
        const i = options.findIndex((o) => String(o.value) === String(value));
        setSurvol(i >= 0 ? i : 0);
        champRecherche.current?.focus();
    }, [ouvert, options, value]);

    // Un clic ailleurs referme : on n'oblige pas à viser la petite croix.
    useEffect(() => {
        if (!ouvert) return undefined;
        const dehors = (e) => { if (!cadre.current?.contains(e.target)) setOuvert(false); };
        document.addEventListener("mousedown", dehors);
        return () => document.removeEventListener("mousedown", dehors);
    }, [ouvert]);

    // La position du panneau : sous le bouton, ou au-dessus s'il n'y a pas la
    // place en bas. Recalculée au défilement — `capture` attrape aussi celui
    // des cadres intérieurs — et au redimensionnement.
    useEffect(() => {
        if (!ouvert) return undefined;
        const poser = () => {
            const r = cadre.current?.getBoundingClientRect();
            if (!r) return;
            const placeEnBas = window.innerHeight - r.bottom;
            setAncre({
                left: r.left,
                largeur: r.width,
                ...(placeEnBas < 280 && r.top > placeEnBas
                    ? { bas: window.innerHeight - r.top + 4, hauteur: r.top - 16 }
                    : { haut: r.bottom + 4, hauteur: placeEnBas - 16 }),
            });
        };
        poser();
        window.addEventListener("scroll", poser, true);
        window.addEventListener("resize", poser);
        return () => {
            window.removeEventListener("scroll", poser, true);
            window.removeEventListener("resize", poser);
        };
    }, [ouvert]);

    // L'option survolée reste visible quand on descend au clavier.
    useEffect(() => {
        if (!ouvert) return;
        listeRef.current?.children[survol]?.scrollIntoView({ block: "nearest" });
    }, [survol, ouvert]);

    const choisir = (option) => {
        onChange(option ? String(option.value) : "");
        setOuvert(false);
    };

    const auClavier = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setSurvol((i) => Math.min(i + 1, resultats.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setSurvol((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();                       // ← sinon le formulaire s'envoie
            if (resultats[survol]) choisir(resultats[survol]);
        } else if (e.key === "Escape") {
            e.preventDefault();
            setOuvert(false);
        }
    };

    return (
        <div className="ad-choix" ref={cadre}>
            <button
                id={id}
                type="button"
                disabled={desactive}
                onClick={() => setOuvert((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={ouvert}
                aria-invalid={invalide || undefined}
                className={`ad-champ ad-choix__bouton font-body${invalide ? " ad-champ--faux" : ""}`}
            >
                <span className={choisi ? "ad-choix__valeur" : "ad-choix__vide"}>
                    {choisi ? choisi.label : placeholder}
                </span>
                <span className="ad-choix__gestes">
                    {choisi && !desactive && (
                        // Revenir à « rien choisi » : un champ facultatif doit pouvoir se vider
                        <span
                            role="button"
                            tabIndex={-1}
                            aria-label="Effacer le choix"
                            title="Effacer"
                            onClick={(e) => { e.stopPropagation(); choisir(null); }}
                            className="ad-choix__effacer"
                        >
                            <FaXmark className="text-xs" aria-hidden="true" />
                        </span>
                    )}
                    <FaChevronDown className="text-[10px] shrink-0" aria-hidden="true" />
                </span>
            </button>

            {ouvert && ancre && (
                <div
                    className="ad-choix__panneau"
                    style={{
                        left: ancre.left,
                        width: ancre.largeur,
                        top: ancre.haut,
                        bottom: ancre.bas,
                        maxHeight: Math.max(200, Math.min(360, ancre.hauteur)),
                    }}
                >
                    <label className="ad-choix__recherche">
                        <FaMagnifyingGlass className="text-xs shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                        <input
                            ref={champRecherche}
                            type="search"
                            value={terme}
                            onChange={(e) => { setTerme(e.target.value); setSurvol(0); }}
                            onKeyDown={auClavier}
                            placeholder={placeholderRecherche}
                            aria-label={placeholderRecherche}
                            aria-controls={`${id}-liste`}
                            className="ad-choix__saisie font-body"
                        />
                    </label>

                    {resultats.length === 0 ? (
                        <p className="ad-choix__aucun font-body">
                            Aucun résultat pour « {terme} ».
                        </p>
                    ) : (
                        <>
                            <ul id={`${id}-liste`} role="listbox" ref={listeRef} className="ad-choix__liste">
                                {resultats.map((o, i) => {
                                    const actif = String(o.value) === String(value);
                                    return (
                                        <li
                                            key={o.value}
                                            role="option"
                                            aria-selected={actif}
                                            onMouseEnter={() => setSurvol(i)}
                                            onClick={() => choisir(o)}
                                            className={`ad-choix__option${i === survol ? " ad-choix__option--survol" : ""}${actif ? " ad-choix__option--choisie" : ""}`}
                                        >
                                            <span className="ad-choix__option-titre font-body-strong">{o.label}</span>
                                            {o.sousTitre && (
                                                <span className="ad-choix__option-sous font-body">{o.sousTitre}</span>
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                            {/* Combien de lignes sur combien : on sait si la recherche a mordu */}
                            <p className="ad-choix__compte font-body">
                                {resultats.length} sur {options.length}
                            </p>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
