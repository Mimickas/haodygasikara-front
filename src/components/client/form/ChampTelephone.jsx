import { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaMagnifyingGlass } from "react-icons/fa6";
import { INDICATIFS } from "../../../constants/client/indicatifs";

// Sélecteur d'indicatif + numéro, sur un seul filet.
// Écrit à la main plutôt qu'avec un paquet tout fait : les composants
// existants arrivent tous avec leur propre CSS, qui se battrait avec les
// filets et la micro-typo du site.
export default function ChampTelephone({ label = "Téléphone", indicatif, numero, onIndicatif, onNumero }) {
    const [ouvert, setOuvert] = useState(false);
    const [recherche, setRecherche] = useState("");
    const boiteRef = useRef(null);
    const rechercheRef = useRef(null);

    const pays = useMemo(() => {
        const q = recherche.trim().toLowerCase();
        if (!q) return INDICATIFS;
        return INDICATIFS.filter(
            (p) =>
                p.nom.toLowerCase().includes(q) ||
                p.code.toLowerCase().includes(q) ||
                p.indicatif.includes(q)
        );
    }, [recherche]);

    // Fermeture au clic extérieur et à Échap
    useEffect(() => {
        if (!ouvert) return;

        const auClic = (e) => {
            if (!boiteRef.current?.contains(e.target)) setOuvert(false);
        };
        const auClavier = (e) => e.key === "Escape" && setOuvert(false);

        document.addEventListener("mousedown", auClic);
        window.addEventListener("keydown", auClavier);
        rechercheRef.current?.focus();

        return () => {
            document.removeEventListener("mousedown", auClic);
            window.removeEventListener("keydown", auClavier);
        };
    }, [ouvert]);

    const choisir = (p) => {
        onIndicatif(p.indicatif);
        setOuvert(false);
        setRecherche("");
    };

    return (
        <div ref={boiteRef} className="relative">
            <span className="block font-body-strong text-[10px] uppercase tracking-[0.35em] mb-4" style={{ color: "var(--text-muted)" }}>
                {label}
            </span>

            <div className="field-line flex items-center gap-4 pb-3">
                <button
                    type="button"
                    onClick={() => setOuvert((o) => !o)}
                    aria-expanded={ouvert}
                    className="flex items-center gap-2.5 shrink-0 cursor-pointer transition-colors duration-300"
                    style={{ color: "var(--text-primary)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                >
                    <span className="font-body text-base">{indicatif}</span>
                    <FaChevronDown
                        className="text-[9px] transition-transform duration-300"
                        style={{ transform: ouvert ? "rotate(180deg)" : "none" }}
                    />
                </button>

                <span className="shrink-0" style={{ width: "1px", height: "18px", backgroundColor: "var(--border-strong)" }} />

                <input
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    value={numero}
                    onChange={(e) => onNumero(e.target.value.replace(/[^\d\s.-]/g, ""))}
                    placeholder="34 27 013 74"
                    required
                    className="field-input w-full bg-transparent outline-none font-body text-base"
                    style={{ color: "var(--text-primary)" }}
                />
            </div>

            {ouvert && (
                <div
                    className="absolute left-0 right-0 top-full mt-3 z-30"
                    style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-card)" }}
                >
                    <label className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                        <FaMagnifyingGlass className="text-[11px] shrink-0" style={{ color: "var(--text-muted)" }} />
                        <input
                            ref={rechercheRef}
                            value={recherche}
                            onChange={(e) => setRecherche(e.target.value)}
                            placeholder="Rechercher un pays"
                            className="field-input w-full bg-transparent outline-none font-body text-sm"
                            style={{ color: "var(--text-primary)" }}
                        />
                    </label>

                    <div className="scroll-fine overflow-y-auto" style={{ maxHeight: "260px" }}>
                        {pays.length === 0 && (
                            <p className="px-5 py-5 font-body text-sm" style={{ color: "var(--text-muted)" }}>
                                Aucun pays ne correspond.
                            </p>
                        )}

                        {pays.map((p) => {
                            const actif = p.indicatif === indicatif;
                            return (
                                <button
                                    key={p.code}
                                    type="button"
                                    onClick={() => choisir(p)}
                                    className="w-full flex items-center gap-4 px-5 py-3 text-left transition-colors duration-200"
                                    style={{ backgroundColor: actif ? "var(--bg-hover)" : "transparent" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = actif ? "var(--bg-hover)" : "transparent")}
                                >
                                    <span className="font-body text-[10px] uppercase tracking-[0.25em] shrink-0" style={{ color: "var(--text-muted)", width: "28px" }}>
                                        {p.code}
                                    </span>
                                    <span className="font-body text-sm flex-1 truncate" style={{ color: "var(--text-primary)" }}>
                                        {p.nom}
                                    </span>
                                    <span className="font-body text-sm shrink-0" style={{ color: actif ? "var(--brand-terre)" : "var(--text-muted)" }}>
                                        {p.indicatif}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
