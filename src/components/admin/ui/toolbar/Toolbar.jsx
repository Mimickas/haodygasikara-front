import { FaMagnifyingGlass, FaArrowDownWideShort } from "react-icons/fa6";

// ── La barre d'un écran d'administration ──────────────────────────────────
//
// La même sur toutes les pages : recherche soulignée, tri, filtres en
// capitales espacées, puis les actions — une seule en aplat (l'action
// principale), les autres au trait. Branchée sur useListeAdmin :
//
//   <Toolbar liste={liste} placeholder="Rechercher une destination…"
//            actions={[{ libelle: "Exporter", onClick: liste.exporter },
//                      { libelle: "Nouvelle destination", onClick: creer, primaire: true }]} />

// `enPlus` : un réglage propre à la page (une période, par exemple), rangé
// avec la recherche et le tri, dans le même style (ad-barre__tri).
export default function Toolbar({ liste, placeholder = "Rechercher…", actions = [], enPlus = null }) {
    const avecTri = (liste?.tris?.length ?? 0) > 1;
    const avecFiltres = (liste?.filtres?.length ?? 0) > 1;

    return (
        <div className="ad-barre">
            <div className="ad-barre__ligne">
                <div className="ad-barre__outils">
                    {liste?.setRecherche && (
                        <label className="field-line ad-barre__recherche">
                            <FaMagnifyingGlass className="text-xs shrink-0" style={{ color: "var(--text-muted)" }} aria-hidden="true" />
                            <input
                                type="search"
                                value={liste.recherche}
                                onChange={(e) => liste.setRecherche(e.target.value)}
                                placeholder={placeholder}
                                aria-label={placeholder}
                                className="field-input w-full bg-transparent outline-none font-body text-sm"
                                style={{ color: "var(--text-primary)" }}
                            />
                        </label>
                    )}

                    {avecTri && (
                        <label className="ad-barre__tri font-body-strong">
                            <FaArrowDownWideShort className="text-xs shrink-0" aria-hidden="true" />
                            <span className="sr-only">Trier</span>
                            <select value={liste.tri ?? ""} onChange={(e) => liste.setTri(e.target.value)} aria-label="Trier">
                                {liste.tris.map((t) => <option key={t.cle} value={t.cle}>{t.libelle}</option>)}
                            </select>
                        </label>
                    )}

                    {enPlus}
                </div>

                {actions.length > 0 && (
                    <div className="ad-barre__actions">
                        {actions.filter((a) => a.onClick).map((a) => (
                            <button key={a.libelle} type="button" onClick={a.onClick} disabled={a.disabled}
                                className={`ad-bouton font-body-strong${a.primaire ? " ad-bouton--plein" : ""}`}>
                                {a.libelle}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {avecFiltres && (
                <div className="ad-filtres" role="tablist" aria-label="Filtrer la liste">
                    {liste.filtres.map((f) => (
                        <button key={f.cle} type="button" role="tab" aria-selected={liste.filtre === f.cle}
                            className={`ad-filtre font-body-strong${liste.filtre === f.cle ? " ad-filtre--actif" : ""}`}
                            onClick={() => liste.setFiltre(f.cle)}>
                            {f.libelle} <span className="ad-filtre__compte">{f.compte}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
