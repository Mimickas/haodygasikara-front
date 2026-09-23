import { useState } from "react";
import { FaMagnifyingGlass, FaArrowDownWideShort } from "react-icons/fa6";

export default function Toolbar({ toolbarConfigs, actions }){
    // ← la recherche n'est pas encore branchée sur les pages : on garde la saisie en local
    //   (avant, InputComponent recevait onChange au lieu de setValue et plantait à la frappe)
    const [search, setSearch] = useState("");

    return <>
        <div className="flex items-end justify-between gap-6 pt-8 pb-6">

            <div className="flex items-end gap-8">
                {/* ← champ souligné : le filet passe en terre à la saisie (.field-line, cf. index.css) */}
                <label className="field-line flex items-center gap-3 w-80 pb-2.5">
                    <FaMagnifyingGlass className="text-xs shrink-0" style={{ color: "var(--text-muted)" }} />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher…"
                        className="field-input w-full bg-transparent outline-none font-body text-sm"
                        style={{ color: "var(--text-primary)" }}
                    />
                </label>

                <button
                    type="button"
                    onClick={() => actions?.sort?.()}
                    className="flex items-center gap-2 pb-2.5 font-body-strong text-[11px] uppercase leading-none cursor-pointer transition-colors"
                    style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "var(--brand-terre)")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                >
                    <FaArrowDownWideShort className="text-xs" />
                    Trier
                </button>
            </div>

            <div className="flex items-center gap-2">
                {toolbarConfigs.ctaAction.map((action, index) => {
                    // ← primaire plein, tout le reste en contour : un seul aplat de marque par barre
                    const primary = action.variant === "primary";
                    return (
                        <button
                            key={index}
                            type="button"
                            onClick={actions[action.name]}
                            className="h-10 px-6 font-body-strong text-[11px] uppercase leading-none whitespace-nowrap cursor-pointer transition-colors duration-200"
                            style={primary
                                ? { letterSpacing: "0.1em", backgroundColor: "var(--cta-bg)", color: "var(--cta-text)", border: "1px solid var(--cta-bg)" }
                                : { letterSpacing: "0.1em", backgroundColor: "transparent", color: "var(--cta-outline-text)", border: "1px solid var(--cta-outline-border)" }
                            }
                            onMouseEnter={e => {
                                if (primary) {
                                    e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)";
                                    e.currentTarget.style.borderColor = "var(--cta-bg-hover)";
                                } else {
                                    e.currentTarget.style.color = "var(--cta-outline-hover)";
                                    e.currentTarget.style.borderColor = "var(--cta-outline-hover)";
                                }
                            }}
                            onMouseLeave={e => {
                                if (primary) {
                                    e.currentTarget.style.backgroundColor = "var(--cta-bg)";
                                    e.currentTarget.style.borderColor = "var(--cta-bg)";
                                } else {
                                    e.currentTarget.style.color = "var(--cta-outline-text)";
                                    e.currentTarget.style.borderColor = "var(--cta-outline-border)";
                                }
                            }}
                        >
                            {action.value}
                        </button>
                    );
                })}
            </div>

        </div>
    </>
}
