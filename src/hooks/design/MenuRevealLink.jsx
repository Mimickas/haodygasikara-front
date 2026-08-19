import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa6";
import { useImageRevealHover } from "./useImageRevealHover";

export default function MenuRevealLink({ label, href, img, onClick }) {
    const { linkRef, revealRef, innerRef, imgRef } = useImageRevealHover(img);

    return (
        <Link
            ref={linkRef}
            to={href}
            onClick={onClick}
            className="group relative flex items-center justify-between py-8 hover:text-[var(--brand-terre)]"
            style={{ borderBottom: "1px solid var(--border)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        >
            <span
                className="font-abhaya-bold text-7xl transition-colors duration-300"  
            >
                {label}
            </span>

            <FaArrowRight
                className="text-3xl transition-transform duration-300 group-hover:translate-x-2"
                style={{ color: "var(--text-muted)" }}
            />

            <div
                ref={revealRef}
                className="hover-reveal pointer-events-none fixed top-0 left-0"
                style={{ opacity: 0, width: "280px", height: "360px", zIndex: 100 }}
            >
                <div ref={innerRef} className="hover-reveal__inner" style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "var(--radius-md)" }}>
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