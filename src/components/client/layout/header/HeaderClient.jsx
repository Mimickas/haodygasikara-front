import { Link } from "react-router-dom";
import { FaUser } from "react-icons/fa6";
import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { useHeaderTextColor } from "../../../../hooks/design/animations/useHeaderTextColor";
import { useAuth } from "../../../../hooks/useAuth";
import Avatar from "../../compte/Avatar";
import MenuPanel from "./MenuPanel";
import AccountPanel from "./AccountPanel";

const PANEL_EASE = "expo.inOut";
const OPEN_DURATION = 0.85;
const CLOSE_DURATION = 0.7;

export default function HeaderClient() {
    // Un seul panneau à la fois : "menu" | "compte" | null.
    // Deux états booléens séparés menaient à un panneau ouvert sans contenu
    // et à un bouton qui ne se refermait jamais.
    const { isAuthenticated, user } = useAuth();

    const [panneau, setPanneau] = useState(null);
    const [headerHeight, setHeaderHeight] = useState(84);

    const scopeRef = useRef(null);
    const panelRef = useRef(null);
    const textColor = useHeaderTextColor(scopeRef);

    const ouvert = panneau !== null;

    // Panneau ouvert = fond clair plein écran : toute la barre repasse en sombre,
    // sinon le X et le bouton compte restent blancs sur blanc.
    const barColor = ouvert ? "var(--text-primary)" : textColor;

    // La hauteur mesuree sert a DEUX endroits : ici (le panneau se pose
    // dessous) et dans la mise en page (le contenu demarre dessous). Elle
    // descend donc dans une variable CSS plutot que d'etre recopiee en dur —
    // un changement de padding sur la barre suivrait sinon a un seul endroit.
    //
    // ResizeObserver, et pas seulement `resize` sur la fenetre : la barre
    // change de hauteur SANS que la fenetre bouge. A la connexion, le bouton
    // compte passe de « Se connecter » au monogramme et au prenom, et la barre
    // gagne 8 px — mesure : 85 → 93. Avec un simple ecouteur de
    // redimensionnement, la variable restait a 85 et le contenu des pages sans
    // hero repassait sous la barre.
    useEffect(() => {
        const barre = scopeRef.current;
        if (!barre) return;

        const measure = () => {
            const hauteur = barre.offsetHeight || 84;
            setHeaderHeight(hauteur);
            document.documentElement.style.setProperty("--entete-hauteur", `${hauteur}px`);
        };

        measure();

        const observateur = new ResizeObserver(measure);
        observateur.observe(barre);
        return () => observateur.disconnect();
    }, []);

    // Déploiement : le panneau gagne en hauteur et pousse la page vers le bas.
    // Ne dépend que de `ouvert` — basculer menu ↔ compte ne rejoue pas l'ouverture.
    useEffect(() => {
        if (!ouvert) return;

        const panel = panelRef.current;
        const main = document.querySelector("main");
        const hauteur = window.innerHeight - (scopeRef.current?.offsetHeight ?? 84);

        // ── Bloquer le defilement SANS decaler la page ─────────────────
        // A l'ouverture, la barre de defilement disparaissait et la page
        // s'elargissait de 12 px : tout sautait vers la droite.
        //
        // `scrollbar-gutter: stable` (index.css) est cense l'eviter, et ne le
        // fait pas ici : il ne reserve la gouttiere que tant qu'une barre peut
        // s'afficher. Des que `overflow` passe a `hidden`, plus de barre, plus
        // de gouttiere. Mesure a l'appui : clientWidth 1588 → 1600.
        //
        // On compense donc la largeur reprise par un padding de meme valeur,
        // mesuree juste avant le blocage plutot que codee en dur — elle depend
        // du systeme et du navigateur.
        const racine = document.documentElement;
        const largeurBarre = window.innerWidth - racine.clientWidth;

        const overflowAvant = racine.style.overflow;
        const paddingAvant = racine.style.paddingRight;

        racine.style.overflow = "hidden";
        if (largeurBarre > 0) racine.style.paddingRight = `${largeurBarre}px`;

        const tl = gsap.timeline();
        tl.fromTo(panel, { height: 0 }, { height: hauteur, duration: OPEN_DURATION, ease: PANEL_EASE });
        if (main) tl.fromTo(main, { y: 0 }, { y: hauteur, duration: OPEN_DURATION, ease: PANEL_EASE }, 0);

        return () => {
            tl.kill();
            racine.style.overflow = overflowAvant;
            racine.style.paddingRight = paddingAvant;
        };
    }, [ouvert]);

    // Entrée du contenu, rejouée quand on bascule d'un panneau à l'autre.
    //
    // Trois temps qui se chevauchent, dans l'esprit du hero d'accueil : la
    // photo se resserre, les lignes de titre montent de sous leur cadre, puis
    // le reste se pose. Ils démarrent ensemble et non l'un après l'autre —
    // enchaînés, l'ouverture durerait trois secondes.
    //
    // clearProps est indispensable : un transform inline qui traine ferait de
    // ces blocs le bloc conteneur des enfants en position fixed — l'image qui
    // suit le curseur se recalerait alors sur le lien au lieu de la fenêtre.
    useEffect(() => {
        if (!panneau) return;

        // Chaque panneau n'a pas tous ces éléments : viser un sélecteur vide
        // ferait crier GSAP dans la console à chaque ouverture du menu.
        const cible = (selecteur) => {
            const trouves = gsap.utils.toArray(selecteur);
            return trouves.length ? trouves : null;
        };

        const media = cible("[data-panel-media]");
        const lignes = cible("[data-panel-mask]");
        const blocs = cible("[data-panel-item]");

        const tl = gsap.timeline({ delay: OPEN_DURATION * 0.4 });

        // La photo entre plus large que son cadre et se pose : le mouvement
        // se lit sans qu'on voie jamais de bord vide.
        if (media) {
            tl.from(media, { scale: 1.18, duration: 1.6, ease: "expo.out", clearProps: "transform" }, 0);
        }

        // Le prénom monte ligne par ligne, chacune découpée par son parent
        if (lignes) {
            tl.from(lignes, {
                yPercent: 115,
                duration: 1.05,
                stagger: 0.08,
                ease: "expo.out",
                clearProps: "transform",
            }, 0.12);
        }

        if (blocs) {
            tl.from(blocs, {
                y: 40,
                opacity: 0,
                duration: 0.7,
                stagger: 0.07,
                ease: "power3.out",
                clearProps: "transform",
            }, 0.22);
        }

        return () => tl.kill();
    }, [panneau]);

    const closePanel = useCallback(() => {
        const panel = panelRef.current;
        const main = document.querySelector("main");

        if (!panel) {
            setPanneau(null);
            return;
        }

        const tl = gsap.timeline({
            onComplete: () => {
                if (main) gsap.set(main, { clearProps: "transform" });
                setPanneau(null);
            },
        });
        tl.to(panel, { height: 0, duration: CLOSE_DURATION, ease: PANEL_EASE });
        if (main) tl.to(main, { y: 0, duration: CLOSE_DURATION, ease: PANEL_EASE }, 0);
    }, []);

    // Même bouton : ferme si son panneau est déjà là, bascule sinon
    const togglePanel = useCallback(
        (nom) => (panneau === nom ? closePanel() : setPanneau(nom)),
        [panneau, closePanel]
    );

    useEffect(() => {
        if (!ouvert) return;
        const onKey = (e) => e.key === "Escape" && closePanel();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [ouvert, closePanel]);

    const menuOuvert = panneau === "menu";
    const compteOuvert = panneau === "compte";

    return (
        <>
            <header
                ref={scopeRef}
                className="fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center py-6 px-16 uppercase text-sm transition-colors duration-300 backdrop-blur-sm"
                style={{ borderBottom: "1px solid var(--border)" }}
            >
                <button
                    data-header-menu
                    type="button"
                    className="flex items-center gap-2 font-body-strong uppercase text-sm duration-200 hover:opacity-80 cursor-pointer w-fit"
                    style={{ color: barColor }}
                    onClick={() => togglePanel("menu")}
                    aria-expanded={menuOuvert}
                >
                    <span className="flex flex-col gap-1">
                        <span
                            className={`block w-10 transition-all duration-300 ease-in-out ${menuOuvert ? "rotate-[15deg] translate-y-[3px]" : ""}`}
                            style={{ borderColor: barColor, borderTopWidth: "1.5px", borderTopStyle: "solid" }}
                        />
                        <span
                            className={`block w-10 transition-all duration-300 ease-in-out ${menuOuvert ? "-rotate-[15deg] -translate-y-[3px]" : ""}`}
                            style={{ borderColor: barColor, borderTopWidth: "1.5px", borderTopStyle: "solid" }}
                        />
                    </span>
                    <span>{menuOuvert ? "Fermer" : "Menu"}</span>
                </button>

                <div data-header-logo className="flex justify-center">
                    <Link to="/" onClick={ouvert ? closePanel : undefined}>
                        <span className="font-abhaya-bold text-2xl transition-colors duration-300" style={{ color: barColor }}>
                            HaodyGasikara
                        </span>
                    </Link>
                </div>

                <div data-header-cta className="flex justify-end items-center gap-6 font-body">
                    <button
                        data-header-compte
                        type="button"
                        className="flex items-center gap-3 py-2 cursor-pointer transition-opacity duration-200 hover:opacity-80 font-body-strong uppercase text-sm"
                        style={{ color: barColor }}
                        onClick={() => togglePanel("compte")}
                        aria-expanded={compteOuvert}
                    >
                        {isAuthenticated ? (
                            <>
                                {/* La photo si le compte en a une, le monogramme
                                    sinon — un seul composant decide, ici comme
                                    dans l'espace voyageur. */}
                                <Avatar user={user} taille={28} bordure={barColor} />
                                <span>{compteOuvert ? "Fermer" : user?.prenom}</span>
                            </>
                        ) : (
                            <>
                                <FaUser />
                                <span>{compteOuvert ? "Fermer" : "Se connecter"}</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* ── Panneau : sa hauteur passe de 0 à plein écran et repousse la page ── */}
            {ouvert && (
                <div
                    ref={panelRef}
                    className="fixed left-0 right-0 z-40 overflow-hidden"
                    style={{ top: `${headerHeight}px`, height: 0, backgroundColor: "var(--bg-card)" }}
                >
                    {/* hauteur figée : le contenu se dévoile, il ne s'écrase pas.
                        Le padding est laissé à chaque panneau : l'espace compte a
                        besoin de saigner jusqu'aux bords. */}
                    <div style={{ height: `${window.innerHeight - headerHeight}px` }}>
                        {menuOuvert ? <MenuPanel onNavigate={closePanel} /> : <AccountPanel onClose={closePanel} />}
                    </div>
                </div>
            )}
        </>
    );
}
