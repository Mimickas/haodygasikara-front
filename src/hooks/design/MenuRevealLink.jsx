import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { useImageRevealHover } from "./useImageRevealHover";

/**
 * Lien de navigation du panneau menu.
 *
 * Le titre au format d'affiche et l'image qui suit le curseur donnent le ton ;
 * la note, elle, dit ce qu'on trouve derriere le lien. Trois mots seuls
 * (« Decouvrir », « Circuit », « Carte ») ne renseignent personne.
 */
export default function MenuRevealLink({ label, href, img, note, onClick }) {
    const { linkRef, revealRef, innerRef, imgRef } = useImageRevealHover(img);

    return (
        <Link
            ref={linkRef}
            to={href}
            onClick={onClick}
            className="group relative flex items-end justify-between gap-10 py-6"
            style={{ borderBottom: "1px solid var(--border)", color: "var(--text-primary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        >
            {/* Titre et note dans la meme colonne : posee en face, sur douze
                colonnes, la note se retrouvait orpheline au milieu du vide. */}
            <span className="min-w-0 transition-transform duration-500 ease-out group-hover:translate-x-3">
                <span
                    className="block font-abhaya-bold leading-[0.95]"
                    style={{ fontSize: "clamp(2.75rem, 4.6vw, 4.5rem)" }}
                >
                    {label}
                </span>

                {/* La note garde sa couleur propre : sinon tout le bloc virerait
                    a l'orange d'un seul coup au survol. */}
                <span
                    className="block font-body text-[15px] leading-relaxed mt-2.5 max-w-md"
                    style={{ color: "var(--text-muted)" }}
                >
                    {note}
                </span>
            </span>

            <span className="shrink-0 pb-1.5">
                <FaArrowRight className="text-xl transition-transform duration-500 ease-out group-hover:translate-x-2" />
            </span>

            <div
                ref={revealRef}
                className="hover-reveal pointer-events-none fixed top-0 left-0"
                style={{ opacity: 0, width: "280px", height: "360px", zIndex: 100 }}
            >
                <div
                    ref={innerRef}
                    className="hover-reveal__inner"
                    style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "var(--radius-md)" }}
                >
                    <div
                        ref={imgRef}
                        className="hover-reveal__img"
                        style={{
                            width: "100%",
                            height: "100%",
                            backgroundImage: `url(${img})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                        }}
                    />
                </div>
            </div>
        </Link>
    );
}
