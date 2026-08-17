import { formatDate } from "../../utils/format";

const dataTableConstant = {
    tagsGroupColumns: [
        { key: "id",          label: "ID" },
        { key: "name",         label: "Nom" },
        { key: "slug",       label: "Slug"},
        { key: "createdAt",       label: "Créé le"},
        { key: "actions",   label: "Actions", type: "actions" },
    ],
    tagColumns: [
        { key: "id",          label: "ID", type:"normal" },
        { key: "name",         label: "Nom", type:"normal" },
        { key: "slug",       label: "Slug", type:"normal" },
        { key: "tagGroup",       label: "Groupe de Tags", type:"object",
            objectKeys: [
                { key: "name", label: "Nom" },
                { key: "slug", label: "Slug" },
            ]
        },
        { key: "createdAt", label: "Créé le", type: "normal", render: formatDate },
        { key: "actions",   label: "Actions", type: "actions" },
    ],
    destination: [
        { key: "id",          label: "ID" },
        { key: "imageUrls",   label: "Images",    render: val => val?.[0] ? <img src={val[0]} className="h-10 w-10 object-cover rounded" /> : "—" },
        { key: "nom",         label: "Nom" },
        { key: "description", label: "Description" },
        { key: "lat",         label: "Latitude" },
        { key: "lng",         label: "Longitude" },
        { key: "videoUrl",    label: "Vidéo",     render: val => val ? <a href={val} target="_blank" rel="noreferrer">▶ Voir</a> : "—" },
        { key: "stars",       label: "Étoiles",   render: val => val ? "★".repeat(val) : "—" },
        { key: "tags",        label: "Tags",      render: val => val?.join(", ") ?? "—" },
        { key: "createdAt",   label: "Créé le",   render: val => new Date(val).toLocaleDateString("fr-FR") },
        { key: "actions",   label: "Actions", type: "actions" },
    ],
    circuit: [
        { key: "id",         label: "ID" },
        { key: "name",        label: "Nom" },
        { key: "dateDebut",  label: "Début",     render: val => val ? new Date(val).toLocaleDateString("fr-FR") : "—" },
        { key: "dateFin",    label: "Fin",       render: val => val ? new Date(val).toLocaleDateString("fr-FR") : "—" },
        { key: "isTemplate", label: "Modèle",    render: val => val ? "Oui" : "Non" },
        { key: "steps",      label: "Étapes",    render: val => `${val?.length ?? 0} étape(s)` },
        { key: "notes",      label: "Notes",     render: val => val || "—" },
        { key: "createdAt",  label: "Créé le",   render: val => new Date(val).toLocaleDateString("fr-FR") },
        { key: "actions",    label: "Actions",   type: "actions" },
    ],
}

export default dataTableConstant;