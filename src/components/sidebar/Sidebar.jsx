import {
    FaUserPlus,
    FaAngleDown,
    FaAnglesLeft,
    FaArrowRightFromBracket,
} from 'react-icons/fa6'
import SidebarListMenu from './js/SidebarListMenu';
import { Link, NavLink } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import gsap from "gsap";
import { useAuth } from '../../hooks/useAuth';

/* =============================================================================
   SIDEBAR — meme doctrine que le panneau circuit (cf. index.css)
   =============================================================================
   Ce qui a change par rapport a la version precedente, et pourquoi :

     1. LA COLONNE. Le pied etait en `position: absolute; bottom: 0`. A huit
        entrees ca tenait ; a treize il passe par-dessus la navigation. La
        sidebar est maintenant une vraie colonne flex : entete et bandeau en
        shrink-0, navigation en flex-1 qui defile (scroll-fine, deja dans la
        charte), pied en shrink-0 colle en bas sans jamais recouvrir.
     2. L'ETAT ACTIF. Un simple changement de couleur de texte ne se lit pas en
        balayage. Un filet vertical Terre colle au bord gauche se lit, lui.
     3. LES ANGLES. Plus aucun rayon : les lignes vont d'un bord a l'autre,
        c'est le vide et le filet d'un pixel qui separent, jamais une ombre.
     4. LES MICRO-TITRES. Capitales a 0.1em de chasse — au-dela, un mot cesse
        d'etre lu et devient un motif.
     5. UN SEUL ACCENT. var(--brand-terre), rien d'autre.
   ========================================================================== */

export default function Sidebar({ collapsed, onToggle, ouvertMobile = false, onFermerMobile }) {
    const { user, logout } = useAuth();
    const [sortie, setSortie] = useState(false);
    const nom = [user?.prenom, user?.nom].filter(Boolean).join(" ") || user?.email || "Administrateur";
    const initiales = `${user?.prenom?.[0] ?? ""}${user?.nom?.[0] ?? ""}`.toUpperCase() || "HR";
    const seDeconnecter = async () => {
        setSortie(true);
        try { await logout(); } finally { setSortie(false); }
    };

    const [openMenus, setOpenMenus] = useState(
        SidebarListMenu.map((_, i) => i)
    );

    const containerRefs = useRef([]);
    const itemRefs = useRef(
        SidebarListMenu.map((menu) => menu.items.map(() => null))
    );

    const toggleMenu = (index) => {
        const isOpen = openMenus.includes(index);
        const container = containerRefs.current[index];
        const items = itemRefs.current[index];

        if (!isOpen) {
            setOpenMenus((prev) => [...prev, index]);
            gsap.set(container, { height: 'auto' });
            const fullH = container.offsetHeight;
            gsap.fromTo(container,
                { height: 0 },
                { height: fullH, duration: 0.28, ease: 'power2.out' }
            );
            gsap.fromTo(items,
                { opacity: 0, y: -8 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.22,
                    ease: 'power2.out',
                    stagger: 0.06,
                    delay: 0.05
                }
            );
        } else {
            setOpenMenus((prev) => prev.filter((i) => i !== index));
            gsap.to(items, {
                opacity: 0,
                y: -5,
                duration: 0.1,
                ease: 'power2.in',
                stagger: { each: 0.04, from: 'end' },
                onComplete: () => {
                    gsap.to(container, { height: 0, duration: 0.12, ease: 'power2.in' });
                }
            });
        }
    };

    /* Repli / depli de la colonne : GSAP pose une hauteur en ligne sur les
       conteneurs, React ne la connait pas. Sans cette resynchronisation, un
       groupe ferme reapparait ouvert au retour du mode replie. Replie, tous
       les groupes sont deroules — il n'y a plus de titre pour les rouvrir. */
    useEffect(() => {
        containerRefs.current.forEach((container, index) => {
            if (!container) return;
            const items = (itemRefs.current[index] || []).filter(Boolean);
            const shown = collapsed || openMenus.includes(index);
            gsap.set(container, { height: shown ? 'auto' : 0 });
            gsap.set(items, { opacity: shown ? 1 : 0, y: 0 });
        });
        // volontairement sur `collapsed` seul : l'accordeon gere deja ses
        // propres transitions quand la colonne est depliee.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collapsed]);

    /* Survol d'une entree : on ne repeint pas la ligne active, son fond est
       deja pose par le style de NavLink. aria-current="page" est mis par
       NavLink lui-meme, c'est la source de verite la moins couteuse ici. */
    const handleEnter = (e) => {
        if (e.currentTarget.getAttribute("aria-current") === "page") return;
        e.currentTarget.style.backgroundColor = "var(--bg-hover)";
    };
    const handleLeave = (e) => {
        if (e.currentTarget.getAttribute("aria-current") === "page") return;
        e.currentTarget.style.backgroundColor = "transparent";
    };

    return (<>
        {/* Sur mobile, un voile derrière la colonne : un toucher dehors la referme */}
        {ouvertMobile && (
            <div className="fixed inset-0 z-30 lg:hidden" style={{ backgroundColor: "rgba(20, 14, 10, 0.4)" }}
                onClick={onFermerMobile} aria-hidden="true" />
        )}
        <aside
            className={`fixed left-0 top-0 h-screen flex-col overflow-hidden lg:flex lg:z-10 ${ouvertMobile ? "flex z-40" : "hidden"}`}
            style={{
                width: collapsed ? "5rem" : "17rem",
                backgroundColor: "var(--bg-card)",
                borderRight: "1px solid var(--border)",
                transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
        >

            {/* ---------- ENTETE ----------
                Hauteur calee sur celle du Header (h-17) : les deux filets d'un
                pixel se rejoignent exactement au coin, c'est ce raccord-la qui
                fait qu'une interface a l'air dessinee et non assemblee. */}
            <div
                className="h-17 shrink-0 flex items-center gap-3 px-5"
                style={{
                    justifyContent: collapsed ? "center" : "space-between",
                    borderBottom: "1px solid var(--border)",
                }}
            >
                {!collapsed && (
                    <img
                        src="/img/logo/logo-2-horizontal.png"
                        alt="Haodygasikara"
                        className="w-auto shrink-0"
                        style={{ height: "2.1rem" }}
                    />
                )}
                <button
                    onClick={onToggle}
                    aria-label={collapsed ? "Agrandir" : "Réduire"}
                    className="w-8 h-8 flex items-center justify-center shrink-0 transition-colors"
                    style={{ color: "var(--text-muted)" }}
                    onMouseEnter={e => {
                        e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                        e.currentTarget.style.color = "var(--brand-terre)";
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = "var(--text-muted)";
                    }}
                >
                    <FaAnglesLeft
                        className="text-xs"
                        style={{
                            transform: collapsed ? "rotate(180deg)" : "none",
                            transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                    />
                </button>
            </div>

            {/* ---------- BANDEAU D'ACTION ----------
                Pleine largeur, d'un bord a l'autre, angle vif. C'est le seul
                aplat de marque de la colonne : il ne se repete nulle part
                ailleurs, donc il porte. */}
            <Link to="/admin/haodygasikara/utilisateurs?nouveau=1" className="shrink-0">
                <div
                    className="h-13 flex items-center gap-3.5 px-5 cursor-pointer transition-colors"
                    style={{
                        backgroundColor: "var(--brand-terre)",
                        justifyContent: collapsed ? "center" : "flex-start",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--brand-terre-600)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--brand-terre)")}
                >
                    <FaUserPlus className="text-base shrink-0" style={{ color: "#FFFFFF" }} />
                    {!collapsed && (
                        <span
                            className="font-body-strong text-xs uppercase whitespace-nowrap"
                            style={{ color: "#FFFFFF", letterSpacing: "0.1em" }}
                        >
                            Créer un admin
                        </span>
                    )}
                </div>
            </Link>

            {/* ---------- NAVIGATION ----------
                flex-1 + min-h-0 : sans min-h-0 un enfant flex refuse de
                retrecir sous son contenu et la barre de defilement n'apparait
                jamais. C'est ce qui garantit que le pied reste visible a
                treize entrees comme a huit. */}
            <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden scroll-fine pb-4">
                {SidebarListMenu.map((menu, index) => {
                    const isOpen = openMenus.includes(index);
                    return (
                        <div key={index}>

                            {/* Replie : le titre disparait, un filet prend sa
                                place. Un groupe reste un groupe meme sans son
                                nom, a condition que le vide le dise. */}
                            {collapsed
                                ? index > 0 && (
                                    <div
                                        className="mx-6 my-3"
                                        style={{ height: "1px", backgroundColor: "var(--border)" }}
                                    />
                                )
                                : (
                                    <button
                                        type="button"
                                        onClick={() => toggleMenu(index)}
                                        className="w-full flex items-center justify-between px-5 pt-6 pb-2.5 transition-colors cursor-pointer"
                                        style={{ color: "var(--text-muted)" }}
                                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-secondary)")}
                                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                                    >
                                        <span
                                            className="font-body-strong text-[11px] uppercase leading-none"
                                            style={{ letterSpacing: "0.1em" }}
                                        >
                                            {menu.name}
                                        </span>
                                        <FaAngleDown
                                            className="text-[10px] shrink-0"
                                            style={{
                                                transform: isOpen ? "rotate(180deg)" : "none",
                                                transition: "transform 0.28s ease",
                                            }}
                                        />
                                    </button>
                                )}

                            <div
                                ref={(el) => (containerRefs.current[index] = el)}
                                style={{ overflow: 'hidden' }}
                            >
                                {menu.items.map((item, i) => {
                                    const Icon = item.icon;
                                    return (
                                        <div
                                            ref={(el) => (itemRefs.current[index][i] = el)}
                                            key={i}
                                        >
                                            <NavLink
                                                to={item.link}
                                                end={item.link === "/admin/haodygasikara"}
                                                title={collapsed ? item.name : undefined}
                                                onMouseEnter={handleEnter}
                                                onMouseLeave={handleLeave}
                                                className="relative flex items-center w-full"
                                                style={({ isActive }) => ({
                                                    height: "2.5rem",
                                                    gap: collapsed ? "0" : "0.875rem",
                                                    paddingLeft: collapsed ? "0" : "1.25rem",
                                                    paddingRight: collapsed ? "0" : "1rem",
                                                    justifyContent: collapsed ? "center" : "flex-start",
                                                    color: isActive ? "var(--brand-terre)" : "var(--text-secondary)",
                                                    backgroundColor: isActive ? "var(--bg-hover)" : "transparent",
                                                    transition: "background-color 0.18s ease, color 0.18s ease",
                                                })}
                                            >
                                                {({ isActive }) => (
                                                    <>
                                                        {/* Le marqueur d'etat : un filet Terre colle au
                                                            bord, visible aussi bien replie que deplie. */}
                                                        <span
                                                            aria-hidden="true"
                                                            className="absolute left-0 top-0 bottom-0"
                                                            style={{
                                                                width: "2px",
                                                                backgroundColor: isActive ? "var(--brand-terre)" : "transparent",
                                                            }}
                                                        />
                                                        <Icon className="text-base shrink-0" />
                                                        {!collapsed && (
                                                            <span
                                                                className={`text-sm truncate ${isActive ? "font-body-strong" : "font-body"}`}
                                                            >
                                                                {item.name}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </NavLink>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )
                })}
            </nav>

            {/* ---------- PIED ----------
                Detache par un filet d'un pixel, pas par une ombre : une ombre
                sur un fond ivoire fait une tache sale, elle desature le papier
                au lieu de le creuser. */}
            <div
                className="shrink-0"
                style={{ borderTop: "1px solid var(--border)" }}
            >
                {!collapsed && (
                    <p
                        className="font-body-strong text-[11px] uppercase leading-none px-5 pt-4 pb-2.5"
                        style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
                    >
                        Compte
                    </p>
                )}

                {/* Le compte connecté, et la seule porte de sortie de l'administration */}
                <div
                    className="flex items-center"
                    style={{
                        minHeight: "3.25rem",
                        gap: collapsed ? "0" : "0.875rem",
                        paddingLeft: collapsed ? "0" : "1.25rem",
                        paddingRight: collapsed ? "0" : "0.75rem",
                        marginBottom: collapsed ? "0.75rem" : "0.5rem",
                        justifyContent: collapsed ? "center" : "flex-start",
                        flexDirection: collapsed ? "column" : "row",
                    }}
                >
                    {/* Carre plein, angle vif : le rond etait le dernier rayon
                        de complaisance qui restait dans la colonne. */}
                    <div
                        className="w-9 h-9 flex items-center justify-center shrink-0 font-body-strong text-xs"
                        style={{ backgroundColor: "var(--brand-terre)", color: "#FFFFFF" }}
                        title={collapsed ? nom : undefined}
                    >
                        {initiales}
                    </div>
                    {!collapsed && (
                        <span className="flex flex-col min-w-0 flex-1 gap-1">
                            <span className="font-body-strong text-sm truncate" style={{ color: "var(--text-primary)" }}>
                                {nom}
                            </span>
                            <span className="font-body text-xs truncate" style={{ color: "var(--text-muted)" }}>
                                {user?.email}
                            </span>
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={seDeconnecter}
                        disabled={sortie}
                        title="Se déconnecter"
                        aria-label="Se déconnecter"
                        className="w-9 h-9 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        style={{ color: "var(--text-muted)", marginTop: collapsed ? "0.5rem" : 0 }}
                        onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = "var(--bg-hover)";
                            e.currentTarget.style.color = "var(--brand-terre)";
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = "transparent";
                            e.currentTarget.style.color = "var(--text-muted)";
                        }}
                    >
                        <FaArrowRightFromBracket className="text-sm" />
                    </button>
                </div>
            </div>
        </aside>
    </>);
}
