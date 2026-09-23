import { enParagraphes } from "../../../../../utils/format";

// ── A propos ──────────────────────────────────────────────────────────────
// L'accroche editoriale, juste sous le hero. Memes elements qu'avant — la
// mention, le titre, le texte — mais la largeur est occupee au lieu d'etre
// laissee :
//
//   * LA MENTION passe au-dessus, pleine largeur. En rail a gauche, elle
//     portait un mot et rien d'autre sur toute la hauteur du bloc.
//   * LE TITRE tient la colonne de gauche, LE TEXTE celle de droite. La
//     mesure de lecture reste a 62 caracteres — ce qui a change, c'est que
//     le tiers qui restait blanc porte maintenant le titre.
//
// Sous 1024 px les deux colonnes s'empilent : on retombe sur la mise en page
// d'origine (cf. .cx-tete dans index.css).
export default function CircuitApropos({ notes }) {
    const paragraphes = enParagraphes(notes);
    if (!paragraphes.length) return null;

    return (
        <section className="cx-about" data-header-text="var(--text-primary)">
            <div className="cx-tete">
                <span className="cx-tete__mention cx-label cx-label--accent font-body-strong">
                    À propos
                </span>

                <h2 className="cx-tete__titre font-title">
                    L&rsquo;esprit du voyage
                </h2>

                <div className="min-w-0">
                    {paragraphes.map((texte, i) => (
                        <p
                            key={i}
                            className={i === 0 ? "cx-tete__chapo font-body" : "cx-tete__texte font-body"}
                        >
                            {texte}
                        </p>
                    ))}
                </div>
            </div>
        </section>
    );
}
