import { formatDate, formatDateCourte, formatPoi, formatPrice } from "../../utils/format";

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
        { key: "dureeJours", label: "Durée",     render: val => `${val ?? 0} jour(s)` },
        { key: "nbDeparts",  label: "Départs",   render: val => `${val ?? 0} date(s)` },
        { key: "isTemplate", label: "Modèle",    render: val => val ? "Oui" : "Non" },
        { key: "steps",      label: "Étapes",    render: val => `${val?.length ?? 0} étape(s)` },
        { key: "notes",      label: "Notes",     render: val => val || "—" },
        { key: "createdAt",  label: "Créé le",   render: val => new Date(val).toLocaleDateString("fr-FR") },
        { key: "actions",    label: "Actions",   type: "actions" },
    ],
    categoryTarifColumns: [
        { key: "id",      label: "ID" },
        { key: "name",    label: "Nom" },
        { key: "code",    label: "Code" },
        { key: "actions", label: "Actions", type: "actions" },
    ],
    deviseColumns: [
        { key: "id",      label: "ID" },
        { key: "name",    label: "Nom" },
        { key: "code",    label: "Code" },
        { key: "actions", label: "Actions", type: "actions" },
    ],
    conditionTarifColumns: [
        { key: "id",              label: "ID" },
        { key: "libelle",         label: "Condition" },
        { key: "typeLibelle",     label: "Type" },
        { key: "operatorSymbole", label: "Opérateur" },
        { key: "value",           label: "Valeur" },
        { key: "actions",         label: "Actions", type: "actions" },
    ],
    circuitDateTarifColumns: [
        { key: "id",            label: "ID" },
        { key: "circuitNom",    label: "Circuit" },
        { key: "dateDebut",     label: "Départ",  render: formatDateCourte },
        { key: "dateFin",       label: "Retour",  render: formatDateCourte },
        { key: "dureeJours",    label: "Durée",   render: val => `${val} jour(s)` },
        { key: "circuitTarifs", label: "Tarifs",  render: val => `${val?.length ?? 0} tarif(s)` },
        { key: "actions",       label: "Actions", type: "actions" },
    ],
    circuitTarifColumns: [
        { key: "id",            label: "ID" },
        { key: "circuitNom",    label: "Circuit" },
        { key: "dateDebut",     label: "Départ",    render: formatDateCourte },
        { key: "categoryTarif", label: "Catégorie", type: "object",
            objectKeys: [
                { key: "name", label: "Nom" },
                { key: "code", label: "Code" },
            ]
        },
        // Prix formaté à la française (séparateur de milliers)
        { key: "price",         label: "Prix",      render: formatPrice },
        { key: "devise",        label: "Devise",    type: "object",
            objectKeys: [
                { key: "name", label: "Nom" },
                { key: "code", label: "Code" },
            ]
        },
        { key: "conditions",    label: "Conditions", render: val => `${val?.length ?? 0} condition(s)` },
        { key: "actions",       label: "Actions",   type: "actions" },
    ],
    circuitTarifConditionColumns: [
        { key: "id",             label: "ID" },
        { key: "circuitTarifLibelle", label: "Tarif" },
        { key: "conditionTarif", label: "Condition", type: "object",
            objectKeys: [
                { key: "libelle", label: "Condition" },
            ]
        },
        { key: "actions",        label: "Actions", type: "actions" },
    ],
    categoryPoiColumns: [
        { key: "id",            label: "ID" },
        { key: "name",          label: "Nom" },
        { key: "code",          label: "Code" },
        { key: "isHebergement", label: "Hébergement", render: val => val ? "Oui" : "Non" },
        { key: "actions",       label: "Actions", type: "actions" },
    ],
    poiColumns: [
        { key: "id",             label: "ID" },
        { key: "imageUrls",      label: "Images",      render: val => val?.[0] ? <img src={val[0]} alt="" className="h-10 w-10 object-cover" /> : "—" },
        { key: "nom",            label: "Nom" },
        { key: "categoryPoi",    label: "Catégorie",   type: "object",
            objectKeys: [
                { key: "name", label: "Nom" },
                { key: "code", label: "Code" },
            ]
        },
        { key: "destinationNom", label: "Destination" },
        { key: "stars",          label: "Étoiles",     render: val => val ? "★".repeat(val) : "—" },
        { key: "videoUrl",       label: "Vidéo",       render: val => val ? <a href={val} target="_blank" rel="noreferrer">▶ Voir</a> : "—" },
        { key: "actions",        label: "Actions",     type: "actions" },
    ],
    reservationColumns: [
        { key: "id",              label: "ID" },
        { key: "createdAt",       label: "Reçue le",   render: val => formatDate(val) },
        { key: "client",          label: "Client" },
        { key: "email",           label: "E-mail" },
        { key: "circuitNom",      label: "Circuit" },
        // Le départ, pas la durée : c'est la date qui engage
        { key: "dateDebut",       label: "Départ",     render: val => formatDateCourte(val) },
        { key: "detailVoyageurs", label: "Voyageurs",  render: (val, row) => val || `${row?.voyageurs ?? 0} pers.` },
        // Le total est figé à l'enregistrement : il ne se recalcule pas
        { key: "total",           label: "Total",      render: (val, row) => val == null ? "—" : `${formatPrice(val)} ${row?.devise ?? ""}` },
        { key: "statutLibelle",   label: "Statut",     render: (val, row) => val || row?.statut || "—" },
        { key: "actions",         label: "Actions",    type: "actions" },
    ],

    circuitDayColumns: [
        { key: "id",           label: "ID" },
        { key: "circuitNom",   label: "Circuit" },
        // Jour du circuit entier + destination, calculé dans la page
        { key: "jourLibelle",  label: "Jour" },
        { key: "titre",        label: "Titre",       render: val => val || "—" },
        { key: "hebergement",  label: "Hébergement", render: val => val ? formatPoi(val) : "—" },
        { key: "repasLibelle", label: "Repas" },
        { key: "pois",         label: "Visites",     render: val => `${val?.length ?? 0} visite(s)` },
        { key: "actions",      label: "Actions",     type: "actions" },
    ],
    circuitDayPoiColumns: [
        { key: "id",                label: "ID" },
        { key: "circuitDayLibelle", label: "Jour" },
        { key: "poi",               label: "Visite / activité", type: "object",
            objectKeys: [
                { key: "nom",            label: "Nom" },
                { key: "destinationNom", label: "Destination" },
            ]
        },
        { key: "inclus",            label: "Prix",      render: val => val ? "Incluse" : "En option" },
        { key: "note",              label: "Précision", render: val => val || "—" },
        { key: "actions",           label: "Actions",   type: "actions" },
    ],
}

export default dataTableConstant;