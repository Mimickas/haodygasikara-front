import { formatDate, formatDateCourte, formatPrice } from "../../utils/format";

// La même notation partout : des étoiles pleines, « — » sans note
const etoiles = (val) => val ? <span aria-label={`${val} étoiles`} style={{ color: "var(--brand-ocre)" }}>{"★".repeat(val)}</span> : "—";

const nomVoyageur = (client) => [client?.prenom, client?.nom].filter(Boolean).join(" ") || client?.email || "—";

const dataTableConstant = {
    tagsGroupColumns: [
        { key: "name",      label: "Groupe", render: val => <span className="font-body-strong">{val}</span>, texte: val => val },
        { key: "slug",      label: "Identifiant", render: val => <span style={{ color: "var(--text-muted)" }}>{val}</span>, texte: val => val },
        { key: "createdAt", label: "Créé le", render: formatDateCourte },
        { key: "actions",   label: "Actions", type: "actions" },
    ],
    tagColumns: [
        { key: "name",      label: "Étiquette", render: val => <span className="font-body-strong">{val}</span>, texte: val => val },
        { key: "tagGroup",  label: "Groupe", render: val => val?.name ?? "—", texte: val => val?.name ?? "" },
        { key: "slug",      label: "Identifiant", render: val => <span style={{ color: "var(--text-muted)" }}>{val}</span>, texte: val => val },
        { key: "createdAt", label: "Créée le", render: formatDateCourte },
        { key: "actions",   label: "Actions", type: "actions" },
    ],
    // L'essentiel pour reconnaître une destination d'un coup d'œil ; le détail
    // (description, coordonnées, vidéo) est dans la fiche, pas dans la liste.
    destination: [
        { key: "imageUrls",   label: "Photo",      export: false,
            render: val => val?.[0]
                ? <img src={val[0]} alt="" loading="lazy" className="h-11 w-11 object-cover" />
                : <span style={{ color: "var(--text-muted)" }}>—</span> },
        { key: "nom",         label: "Destination", render: val => <span className="font-body-strong">{val}</span>, texte: val => val },
        { key: "stars",       label: "Note",       render: etoiles, texte: val => val ?? "" },
        { key: "tags",        label: "Étiquettes", render: val => val?.length ? val.join(", ") : "—" },
        { key: "createdAt",   label: "Créée le",   render: formatDateCourte },
        { key: "actions",     label: "Actions",    type: "actions" },
    ],
    circuit: [
        { key: "imageUrls",  label: "Photo",     export: false,
            render: val => val?.[0]
                ? <img src={val[0]} alt="" loading="lazy" className="h-11 w-11 object-cover" />
                : <span style={{ color: "var(--text-muted)" }}>—</span> },
        { key: "name",       label: "Circuit",   render: val => <span className="font-body-strong">{val}</span>, texte: val => val },
        { key: "dureeJours", label: "Durée",     render: val => val ? `${val} jour${val > 1 ? "s" : ""}` : "À programmer", texte: val => val ?? 0 },
        { key: "steps",      label: "Étapes",    render: val => val?.length ?? 0, texte: val => val?.length ?? 0 },
        { key: "isTemplate", label: "Catalogue",
            render: val => <span className={`ad-dv-pastille ${val ? "ad-cv-pastille--FINALISE" : "ad-cv-pastille--BROUILLON"}`}>{val ? "Publié" : "Non publié"}</span>,
            texte: val => val ? "Publié" : "Non publié" },
        { key: "createdAt",  label: "Créé le",   render: formatDateCourte },
        { key: "actions",    label: "Actions",   type: "actions" },
    ],
    categoryPoiColumns: [
        { key: "name",          label: "Catégorie",   render: val => <span className="font-body-strong">{val}</span>, texte: val => val },
        { key: "code",          label: "Code",        render: val => <span style={{ color: "var(--text-muted)" }}>{val}</span>, texte: val => val },
        { key: "isHebergement", label: "Hébergement", render: val => val ? "Oui" : "Non" },
        { key: "actions",       label: "Actions",     type: "actions" },
    ],
    poiColumns: [
        { key: "imageUrls",      label: "Photo",       export: false,
            render: val => val?.[0]
                ? <img src={val[0]} alt="" loading="lazy" className="h-11 w-11 object-cover" />
                : <span style={{ color: "var(--text-muted)" }}>—</span> },
        { key: "nom",            label: "Point d'intérêt", render: val => <span className="font-body-strong">{val}</span>, texte: val => val },
        { key: "categoryPoi",    label: "Catégorie",   render: val => val?.name ?? "—", texte: val => val?.name ?? "" },
        { key: "destinationNom", label: "Destination" },
        { key: "stars",          label: "Étoiles",     render: etoiles, texte: val => val ?? "" },
        { key: "actions",        label: "Actions",     type: "actions" },
    ],
    // Pas de colonne d'actions : la ligne ouvre le dossier, où se traitent les demandes.
    demandeDevisColumns: [
        { key: "reference",     label: "Référence",   render: val => <span className="font-body-strong">{val}</span>, texte: val => val },
        { key: "createdAt",     label: "Reçue le",    render: val => formatDate(val) },
        { key: "client",        label: "Voyageur",    render: nomVoyageur, texte: nomVoyageur },
        { key: "circuit",       label: "Circuit",     render: val => val?.nom ?? "—", texte: val => val?.nom ?? "" },
        { key: "dateDebut",     label: "Départ",      render: (val, row) => row?.datesAConvenir ? "À convenir" : formatDateCourte(val),
            texte: (val, row) => row?.datesAConvenir ? "À convenir" : (val ?? "") },
        { key: "nombreVoyageurs", label: "Voyageurs", render: val => val ? `${val} pers.` : "—", texte: val => val ?? "" },
        { key: "montantPropose", label: "Devis",      render: (val, row) => val == null ? "—" : `${formatPrice(val)} ${row?.deviseProposee ?? ""}`,
            texte: (val, row) => val == null ? "" : `${val} ${row?.deviseProposee ?? ""}` },
        { key: "statutAffiche", label: "Statut",      render: (val, row) => <>
                <span className={`ad-dv-pastille ad-dv-pastille--${val}`}>{row?.statutLibelle ?? val}</span>
                {row?.emailErreur && <span className="ad-dv-alerte font-body-strong">E-mail non parti</span>}
            </>,
            texte: (val, row) => `${row?.statutLibelle ?? val}${row?.emailErreur ? " (e-mail non parti)" : ""}` },
    ],
}

export default dataTableConstant;
