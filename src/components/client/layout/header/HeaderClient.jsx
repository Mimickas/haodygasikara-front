import { Link } from "react-router-dom";
import { FaUser, FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import MenuRevealLink from "../../../../hooks/design/MenuRevealLink";
import { useHeaderTextColor } from "../../../../hooks/design/animations/useHeaderTextColor";

const navLinks = [
    { label: "Découvrir", href: "/",        img: "/img/beautiful-waterfall-streaming-into-river-surrounded-by-greens.jpg" },
    { label: "Circuit",   href: "/circuit", img: "/img/lemur.webp" },
    { label: "Carte",     href: "/carte",   img: "/img/menu/carte.jpg" },
];

// TODO : remplacer par les vrais profils Haodygasikara
const socials = [
    { label: "Instagram", href: "https://www.instagram.com/haodygasikara", Icon: FaInstagram },
    { label: "Facebook",  href: "https://www.facebook.com/haodygasikara",  Icon: FaFacebookF },
    { label: "X",         href: "https://x.com/haodygasikara",             Icon: FaXTwitter },
];

const CONTACT = {
    email: "contact@haodygasikara.com",
    tel: "+261 34 27 013 74",
    telHref: "+261342701374",
    adresse: ["Villa Saphir, Toamasina 501", "Madagascar"],
};

const PANEL_EASE = "expo.inOut";
const OPEN_DURATION = 0.85;
const CLOSE_DURATION = 0.7;

export default function HeaderClient() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [headerHeight, setHeaderHeight] = useState(84);

    const scopeRef = useRef(null);
    const panelRef = useRef(null);
    const textColor = useHeaderTextColor(scopeRef);

    // Menu ouvert = fond clair plein écran : toute la barre repasse en sombre,
    // sinon le X et « Se connecter » restent blancs sur blanc.
    const barColor = menuOpen ? "var(--text-primary)" : textColor;

    useEffect(() => {
        const measure = () => setHeaderHeight(scopeRef.current?.offsetHeight ?? 84);
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, []);

    // Ouverture : le panneau gagne en hauteur et pousse la page vers le bas
    useEffect(() => {
        if (!menuOpen) return;

        const panel = panelRef.current;
        const main = document.querySelector("main");
        const hauteur = window.innerHeight - (scopeRef.current?.offsetHeight ?? 84);

        const overflowAvant = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const tl = gsap.timeline();
        tl.fromTo(panel, { height: 0 }, { height: hauteur, duration: OPEN_DURATION, ease: PANEL_EASE });
        if (main) tl.fromTo(main, { y: 0 }, { y: hauteur, duration: OPEN_DURATION, ease: PANEL_EASE }, 0);
        // clearProps est indispensable : un transform inline qui traine ferait de
        // ces blocs le bloc conteneur des enfants en position fixed — l'image qui
        // suit le curseur se recalerait alors sur le lien au lieu de la fenêtre.
        tl.from("[data-menu-item]", {
            y: 40,
            opacity: 0,
            duration: 0.7,
            stagger: 0.07,
            ease: "power3.out",
            clearProps: "transform",
        }, OPEN_DURATION * 0.45);

        return () => {
            tl.kill();
            document.body.style.overflow = overflowAvant;
        };
    }, [menuOpen]);

    const closeMenu = useCallback(() => {
        const panel = panelRef.current;
        const main = document.querySelector("main");

        if (!panel) {
            setMenuOpen(false);
            return;
        }

        const tl = gsap.timeline({
            onComplete: () => {
                if (main) gsap.set(main, { clearProps: "transform" });
                setMenuOpen(false);
            },
        });
        tl.to(panel, { height: 0, duration: CLOSE_DURATION, ease: PANEL_EASE });
        if (main) tl.to(main, { y: 0, duration: CLOSE_DURATION, ease: PANEL_EASE }, 0);
    }, []);

    useEffect(() => {
        if (!menuOpen) return;
        const onKey = (e) => e.key === "Escape" && closeMenu();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [menuOpen, closeMenu]);

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
                    onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
                    aria-expanded={menuOpen}
                >
                    <span className="flex flex-col gap-1">
                        <span
                            className={`block w-10 transition-all duration-300 ease-in-out ${menuOpen ? "rotate-[15deg] translate-y-[3px]" : ""}`}
                            style={{ borderColor: barColor, borderTopWidth: "1.5px", borderTopStyle: "solid" }}
                        />
                        <span
                            className={`block w-10 transition-all duration-300 ease-in-out ${menuOpen ? "-rotate-[15deg] -translate-y-[3px]" : ""}`}
                            style={{ borderColor: barColor, borderTopWidth: "1.5px", borderTopStyle: "solid" }}
                        />
                    </span>
                    <span>{menuOpen ? "Fermer" : "Menu"}</span>
                </button>

                <div data-header-logo className="flex justify-center">
                    <Link to="/" onClick={menuOpen ? closeMenu : undefined}>
                        <span className="font-abhaya-bold text-2xl transition-colors duration-300" style={{ color: barColor }}>
                            HaodyGasikara
                        </span>
                    </Link>
                </div>

                <div data-header-cta className="flex justify-end items-center gap-6 font-body">
                    <button
                        type="button"
                        className="flex items-center gap-2 rounded-md py-2 px-4 cursor-pointer transition-colors font-body-strong uppercase text-sm"
                        style={{ color: barColor }}
                    >
                        <FaUser />
                        <span>Se connecter</span>
                    </button>
                </div>
            </header>

            {/* ── Panneau : sa hauteur passe de 0 à plein écran et repousse la page ── */}
            {menuOpen && (
                <div
                    ref={panelRef}
                    className="fixed left-0 right-0 z-40 overflow-hidden"
                    style={{ top: `${headerHeight}px`, height: 0, backgroundColor: "var(--bg-card)" }}
                >
                    {/* hauteur figée : le contenu se dévoile, il ne s'écrase pas */}
                    <div
                        className="flex flex-col px-16 pt-10 pb-9"
                        style={{ height: `${window.innerHeight - headerHeight}px` }}
                    >
                        {/* Les liens occupent toute la largeur du panneau */}
                        <nav className="flex-1 flex flex-col justify-center min-h-0">
                            {navLinks.map(({ label, href, img }) => (
                                <div key={href} data-menu-item>
                                    <MenuRevealLink label={label} href={href} img={img} onClick={closeMenu} />
                                </div>
                            ))}
                        </nav>

                        {/* Les infos passent en pied, sur trois colonnes */}
                        <div className="grid grid-cols-12 gap-10 pt-7" style={{ borderTop: "1px solid var(--border)" }}>
                            <div data-menu-item className="col-span-4">
                                <p className="font-body-strong text-[10px] uppercase tracking-[0.45em] mb-4" style={{ color: "var(--brand-terre)" }}>
                                    Nous écrire
                                </p>
                                <a
                                    href={`mailto:${CONTACT.email}`}
                                    className="block font-body text-sm mb-1.5 transition-colors duration-300"
                                    style={{ color: "var(--text-primary)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                                >
                                    {CONTACT.email}
                                </a>
                                <a
                                    href={`tel:${CONTACT.telHref}`}
                                    className="block font-body text-sm transition-colors duration-300"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                                >
                                    {CONTACT.tel}
                                </a>
                            </div>

                            <div data-menu-item className="col-span-4">
                                <p className="font-body-strong text-[10px] uppercase tracking-[0.45em] mb-4" style={{ color: "var(--brand-terre)" }}>
                                    Nous trouver
                                </p>
                                {CONTACT.adresse.map((ligne) => (
                                    <p key={ligne} className="font-body text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                                        {ligne}
                                    </p>
                                ))}
                            </div>

                            <div data-menu-item className="col-span-4 flex flex-col items-end justify-between gap-5">
                                <div className="flex items-center gap-7">
                                    {socials.map(({ label, href, Icon }) => (
                                        <a
                                            key={label}
                                            href={href}
                                            target="_blank"
                                            rel="noreferrer noopener"
                                            aria-label={label}
                                            className="flex items-center gap-2.5 transition-colors duration-300"
                                            style={{ color: "var(--text-muted)" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                                        >
                                            <Icon className="text-base" />
                                            <span className="font-body text-[10px] uppercase tracking-[0.3em]">{label}</span>
                                        </a>
                                    ))}
                                </div>

                                <span className="font-body text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                                    Devis sur mesure sous 48 h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
