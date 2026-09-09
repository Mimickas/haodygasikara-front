import { FaChevronDown } from "react-icons/fa6";
import { MOIS } from "../../../constants/client/indicatifs";

// Jour / mois / année sur un seul filet, plutôt qu'un <input type="date">.
// Le sélecteur natif impose son propre habillage, impossible à accorder au
// reste — et il oblige à naviguer un calendrier pour une année de naissance.
const ANNEE_MAX = new Date().getFullYear() - 16; // âge minimum pour un compte
const ANNEE_MIN = ANNEE_MAX - 90;

export default function ChampDateNaissance({ label = "Date de naissance", valeur, onChange }) {
    const maj = (cle) => (v) => onChange({ ...valeur, [cle]: v });

    const chiffres = (v, max) => v.replace(/\D/g, "").slice(0, max);

    return (
        <div>
            <span className="block font-body-strong text-[10px] uppercase tracking-[0.35em] mb-4" style={{ color: "var(--text-muted)" }}>
                {label}
            </span>

            <div className="field-line flex items-center gap-4 pb-3">
                <input
                    type="text"
                    inputMode="numeric"
                    value={valeur.jour}
                    onChange={(e) => maj("jour")(chiffres(e.target.value, 2))}
                    onBlur={(e) => e.target.value && maj("jour")(e.target.value.padStart(2, "0"))}
                    placeholder="JJ"
                    aria-label="Jour"
                    required
                    className="field-input bg-transparent outline-none font-body text-base text-center"
                    style={{ color: "var(--text-primary)", width: "2.5em" }}
                />

                <span className="shrink-0" style={{ width: "1px", height: "18px", backgroundColor: "var(--border-strong)" }} />

                <div className="relative flex-1 min-w-0">
                    <select
                        value={valeur.mois}
                        onChange={(e) => maj("mois")(e.target.value)}
                        aria-label="Mois"
                        required
                        className="w-full bg-transparent outline-none font-body text-base appearance-none cursor-pointer pr-6"
                        style={{ color: valeur.mois ? "var(--text-primary)" : "var(--text-muted)" }}
                    >
                        <option value="">Mois</option>
                        {MOIS.map((m, i) => (
                            <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                        ))}
                    </select>
                    <FaChevronDown
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] pointer-events-none"
                        style={{ color: "var(--text-muted)" }}
                    />
                </div>

                <span className="shrink-0" style={{ width: "1px", height: "18px", backgroundColor: "var(--border-strong)" }} />

                <input
                    type="text"
                    inputMode="numeric"
                    value={valeur.annee}
                    onChange={(e) => maj("annee")(chiffres(e.target.value, 4))}
                    placeholder="AAAA"
                    aria-label="Année"
                    required
                    className="field-input bg-transparent outline-none font-body text-base text-center"
                    style={{ color: "var(--text-primary)", width: "4em" }}
                />
            </div>

            <p className="font-body text-[10px] uppercase tracking-[0.25em] mt-3" style={{ color: "var(--text-muted)" }}>
                Entre {ANNEE_MIN} et {ANNEE_MAX}
            </p>
        </div>
    );
}
