import { useLocation, Link } from "react-router-dom";
import { FaUser, FaArrowRight } from "react-icons/fa6";
import { useState, useRef, useEffect } from "react";
import gsap from "gsap";
import MenuRevealLink from "../../../../hooks/design/MenuRevealLink";

const navLinks = [
    { label: "Découvrir", href: "/",        img: "/img/beautiful-waterfall-streaming-into-river-surrounded-by-greens.jpg" },
    { label: "Circuit",   href: "/circuit", img: "/img/lemur.webp" },
    { label: "Carte",     href: "/carte",   img: "/img/menu/carte.jpg" },
];

export default function HeaderClient() {
    const { pathname } = useLocation();
    const isHero = pathname === "/";
    const [menuOpen, setMenuOpen] = useState(false);

    const textColor  = !menuOpen ? "var(--text-inverse)"       : "var(--text-primary)";
    const mutedColor = !menuOpen ? "var(--text-inverse-muted)" : "var(--text-muted)";

    const panelRef = useRef(null);
    const revealRef = useRef(null);
    const mousePos = useRef({ x: 0, y: 0 });
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (menuOpen) {
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, scale: 1.05 },
                { opacity: 1, scale: 1, duration: 1, ease: "power3.out" }
            );
        }
    }, [menuOpen]);

    const closeMenu = () => {
        gsap.to(panelRef.current, {
            opacity: 0,
            scale: 1.05,
            duration: 0.7,
            ease: "power3.inOut",
            onComplete: () => setMenuOpen(false),
        });
    };

    const handleMouseEnter = (img) => {
        const el = revealRef.current;
        el.style.backgroundImage = `url(${img})`;
        gsap.killTweensOf(el);
        gsap.to(el, { opacity: 1, scale: 1, duration: 0.6, ease: "expo.out" });
    };

    const handleMouseLeave = () => {
        gsap.to(revealRef.current, { opacity: 0, scale: 0.8, duration: 0.5, ease: "expo.out" });
    };

    const handleMouseMove = (e) => {
        mousePos.current = { x: e.clientX, y: e.clientY };
        const velX = mousePos.current.x - lastPos.current.x;
        lastPos.current = { x: e.clientX, y: e.clientY };

        gsap.to(revealRef.current, {
            x: e.clientX,
            y: e.clientY,
            skewX: gsap.utils.clamp(-20, 20, velX * 0.6),
            rotation: gsap.utils.clamp(-8, 8, velX * 0.2),
            duration: 0.9,
            ease: "expo.out",
        });
    };

    return (
        <>
            <header
                className="fixed top-0 left-0 right-0 z-50 grid grid-cols-3 items-center py-6 px-16 uppercase text-sm transition-colors duration-300"
                style={{
                    backgroundColor: isHero ? "transparent" : "var(--bg-card)",
                    borderBottom: isHero ? "none" : "1px solid var(--border)",
                }}
            >
                <div
                    className="flex items-center gap-2 font-body-strong uppercase text-sm duration-200 hover:opacity-80 cursor-pointer"
                    style={{ color: textColor }}
                    onClick={() => (menuOpen ? closeMenu() : setMenuOpen(true))}
                >
                    <div className="flex flex-col gap-1">
                        <span className={`w-10 border border-t-1.5 transition-transform duration-300 ease-in-out ${
                            menuOpen ? "rotate-15 translate-y-[3px]" : ""
                        }`} style={{ borderColor: textColor }}></span>
                        <span className={`w-10 border border-t-1.5 transition-transform duration-300 ease-in-out ${
                            menuOpen ? "-rotate-15 -translate-y-[3px]" : ""
                        }`} style={{ borderColor: textColor }}></span>
                    </div>
                    <div>Menu</div>
                </div>

                <div className="flex justify-center">
                    <Link to="/">
                        {/* <img src="/img/logo/logo-2-horizontal.png" className="w-36" alt="Logo" /> */}
                        <span className={`font-abhaya-bold text-2xl ${menuOpen ? "text-[var(--text-primary)]":"text-[var(--text-inverse)]"}`}>HaodyGasikara</span>
                    </Link>
                </div>

                <div className="flex justify-end items-center gap-6 font-body" style={{ color: textColor }}>


                    <button
                        className="flex items-center gap-2 rounded-md py-2 px-4 cursor-pointer transition-colors font-body-strong uppercase text-sm"
                        style={{ color: textColor }}
                    >
                        <FaUser />
                        <span>Se connecter</span>
                    </button>
                </div>
            </header>

            {menuOpen && (
                <div
                    ref={panelRef}
                    onMouseMove={handleMouseMove}
                    className="fixed inset-0 z-40 flex flex-col justify-center px-16 overflow-hidden"
                    style={{ backgroundColor: "var(--bg-card)" }}
                >
                    <div
                        ref={revealRef}
                        className="pointer-events-none fixed top-0 left-0 z-0"
                        style={{
                            width: "320px",
                            height: "420px",
                            marginLeft: "-160px",
                            marginTop: "-210px",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            borderRadius: "var(--radius-md)",
                            opacity: 0,
                            transform: "scale(0.8)",
                        }}
                    />

                    <nav className="relative z-10 flex flex-col">
                        <nav className="relative z-10 flex flex-col">
                            {navLinks.map(({ label, href, img }) => (
                                <MenuRevealLink
                                    key={href}
                                    label={label}
                                    href={href}
                                    img={img}
                                    onClick={closeMenu}
                                />
                            ))}
                        </nav>
                    </nav>
                </div>
            )}
        </>
    );
}