// ← options Oui / Non partagées : un <select> renvoie toujours une chaîne, la page la repasse en booléen
const repasOptions = [
    { label: "Inclus",     value: "true"  },
    { label: "Non inclus", value: "false" },
];

const createConstant = {
    tags: [
        [
            { name: "name",   label: "Nom",     type: "text",   placeholder: "Nom du tag" },
            
        ],
        [
            { name: "slug", label: "Slug", type: "text", placeholder: "Slug du tag" },
        ],
        [
            { name: "idTagGroup", label: "Groupe de Tags", type: "dropdown", placeholder: "Sélectionner un groupe" },
        ],
    ],
    tagsGroups: [
        [
            { name: "name",   label: "Nom",     type: "text",   placeholder: "Nom du tag" },
            
        ],
        [
            { name: "slug", label: "Slug", type: "text", placeholder: "Slug du tag" },
        ],
    ],

    destinations: [
        [
            { name: "nom",         label: "Nom",              type: "text",     placeholder: "Nom du lieu" },
            { name: "stars",       label: "Étoiles (0-5)",    type: "number",   placeholder: "4" },
        ],
        [
            { name: "description", label: "Description",     type: "textarea", placeholder: "Décris le lieu…" },
        ],
        [
            { name: "lat",         label: "Latitude",        type: "number",   placeholder: "-18.8792" },
            { name: "lng",         label: "Longitude",       type: "number",   placeholder: "47.5079" },
        ],
        [
            { name: "tagIds",      label: "Tags",            type: "multiselect", defaultValue: [] },
        ],
        [
            { name: "imageUrls",      label: "Images",          type: "image",    folder: "places",        defaultValue: [] },
        ],
        [
            { name: "videoUrl",    label: "Vidéo",           type: "video",    folder: "places/videos", defaultValue: "" },
        ],
    ],

    circuits: [
        [
            { name: "name", label: "Nom", type: "text", placeholder: "Nom du circuit" },
            { name: "isTemplate", label: "Modèle", type: "radio", defaultValue: "false" },
        ],
        // ← pas de dates ici : elles se saisissent dans « Dates de départ », une ligne par départ
        [
            { name: "notes", label: "Notes", type: "textarea", placeholder: "Ajoutez des notes sur le circuit…" },
        ],
        [
            { name: "imageUrls", label: "Images", type: "image", placeholder: "Images du circuit", folder: "circuits",        defaultValue: [] },
        ],
        [
            { name: "videoUrl",  label: "Vidéo",  type: "video", placeholder: "Vidéo du circuit",  folder: "circuits/videos", defaultValue: "" },
        ],
        [
            { name: "steps",      label: "Étapes",            type: "steps", defaultValue: [] },
        ],

        // ── La fiche technique ──────────────────────────────────────────
        // Tout est facultatif : un champ laissé vide disparaît simplement de
        // la fiche côté client, il n'y écrit pas « non communiqué ».
        // Les options des listes viennent de /admin/circuit/enums — les enums
        // du back, jamais recopiés ici.
        [
            { name: "styleVoyage",     label: "Style de voyage",  type: "dropdown", placeholder: "Non précisé" },
            { name: "niveauPhysique",  label: "Niveau physique",  type: "dropdown", placeholder: "Non précisé" },
        ],
        [
            // « Tous âges » est une promesse : elle se coche, elle ne se déduit
            // pas de deux champs laissés vides. Sans rien de coché ni de saisi,
            // la ligne « Âges » n'apparaît tout simplement pas côté client.
            { name: "tousAges", label: "Accueil", type: "dropdown", placeholder: "Non précisé",
              options: [{ label: "Tous âges — aucune limite", value: "true" }] },
        ],
        [
            { name: "ageMin",          label: "Âge minimum",      type: "number", placeholder: "Ex : 8" },
            { name: "ageMax",          label: "Âge maximum",      type: "number", placeholder: "Ex : 70" },
            { name: "tailleGroupeMin", label: "Groupe — minimum", type: "number", placeholder: "2" },
            { name: "tailleGroupeMax", label: "Groupe — maximum", type: "number", placeholder: "12" },
        ],
        [
            { name: "langues",    label: "Langues d'accompagnement", type: "multiselect", defaultValue: [] },
        ],
        [
            { name: "transports", label: "Déplacements",             type: "multiselect", defaultValue: [] },
        ],
        [
            // Les thèmes du VOYAGE : ceux des étapes qualifient des lieux
            { name: "tagIds",     label: "Thèmes du voyage",         type: "multiselect", defaultValue: [] },
        ],
        [
            // Seulement ce que le programme ne sait pas dire : vols, assurance,
            // véhicule privé, pourboires. Nuitées, repas et visites se déduisent.
            { name: "inclusions", label: "Compris / non compris",    type: "inclusions",  defaultValue: [] },
        ],

    ],

    categoryTarifs: [
        [
            { name: "name", label: "Nom",  type: "text", placeholder: "Nom de la catégorie (ex : Adulte)" },
        ],
        [
            { name: "code", label: "Code", type: "text", placeholder: "Code de la catégorie (ex : ADULTE)" },
        ],
    ],

    devises: [
        [
            { name: "name", label: "Nom",  type: "text", placeholder: "Nom de la devise (ex : Ariary)" },
        ],
        [
            { name: "code", label: "Code", type: "text", placeholder: "Code ISO à 3 lettres (ex : MGA)" },
        ],
    ],

    conditionTarifs: [
        [
            { name: "type",     label: "Type",      type: "dropdown", placeholder: "Sélectionner un type" },
            { name: "operator", label: "Opérateur", type: "dropdown", placeholder: "Sélectionner un opérateur" },
        ],
        [
            { name: "value",    label: "Valeur",    type: "number",   placeholder: "Valeur de la condition (ex : 18)" },
        ],
    ],

    circuitDateTarifs: [
        [
            { name: "circuitId", label: "Circuit",        type: "dropdown", placeholder: "Sélectionner un circuit" },
        ],
        [
            // ← pas de date de retour à saisir : le back la calcule avec la durée du programme
            { name: "dateDebut", label: "Date de départ", type: "date" },
        ],
    ],

    circuitTarifs: [
        [
            // ← le prix se rattache à une date de départ, pas au circuit : le même voyage
            //   peut coûter plus cher en décembre qu'en octobre
            { name: "circuitDateTarifId", label: "Date de départ",   type: "dropdown", placeholder: "Sélectionner une date de départ" },
        ],
        [
            { name: "categoryTarifId", label: "Catégorie de tarif",  type: "dropdown", placeholder: "Sélectionner une catégorie" },
            { name: "deviseId",        label: "Devise",              type: "dropdown", placeholder: "Sélectionner une devise" },
        ],
        [
            { name: "price",           label: "Prix",                type: "number",   placeholder: "Prix du tarif" },
        ],
    ],

    circuitTarifConditions: [
        [
            { name: "circuitTarifId",   label: "Tarif de circuit", type: "dropdown", placeholder: "Sélectionner un tarif" },
        ],
        [
            { name: "conditionTarifId", label: "Condition",        type: "dropdown", placeholder: "Sélectionner une condition" },
        ],
    ],

    categoryPois: [
        [
            { name: "name", label: "Nom",  type: "text", placeholder: "Nom de la catégorie (ex : Hôtel)" },
        ],
        [
            { name: "code",          label: "Code",        type: "text",     placeholder: "Code de la catégorie (ex : HOTEL)" },
            { name: "isHebergement", label: "Hébergement", type: "dropdown", placeholder: "On peut y dormir ?", defaultValue: "false",
                options: [
                    { label: "Oui, on y passe la nuit", value: "true"  },
                    { label: "Non",                     value: "false" },
                ]
            },
        ],
    ],

    pois: [
        [
            { name: "destinationId", label: "Destination",   type: "dropdown", placeholder: "Sélectionner une destination" },
            { name: "categoryPoiId", label: "Catégorie",     type: "dropdown", placeholder: "Sélectionner une catégorie" },
        ],
        [
            { name: "nom",           label: "Nom",           type: "text",     placeholder: "Nom du lieu (ex : Hôtel du Lac)" },
            { name: "stars",         label: "Étoiles (0-5)", type: "number",   placeholder: "4" },
        ],
        [
            { name: "description",   label: "Description",   type: "textarea", placeholder: "Ce qui rend ce lieu unique…" },
        ],
        [
            { name: "lat",           label: "Latitude",      type: "number",   placeholder: "-22.5556" },
            { name: "lng",           label: "Longitude",     type: "number",   placeholder: "45.4056" },
        ],
        [
            { name: "imageUrls",     label: "Photos",        type: "image",    folder: "pois",        defaultValue: [] },
        ],
        [
            { name: "videoUrl",      label: "Vidéo",         type: "video",    folder: "pois/videos", defaultValue: "" },
        ],
    ],

    circuitDays: [
        [
            { name: "circuitStepId", label: "Étape du circuit",   type: "dropdown", placeholder: "Sélectionner une étape" },
        ],
        [
            { name: "jour",          label: "Jour dans l'étape",  type: "number",   placeholder: "1" },
            { name: "titre",         label: "Titre du jour",      type: "text",     placeholder: "Ex : Canyons et piscines naturelles" },
        ],
        [
            { name: "description",   label: "Déroulé",            type: "textarea", placeholder: "Racontez la journée…" },
        ],
        [
            // ← options filtrées par l'étape choisie : seuls les hébergements de sa destination
            { name: "hebergementId", label: "Hébergement du soir", type: "dropdown", placeholder: "Aucun (pas de nuit ce jour-là)", dependsOn: "circuitStepId" },
        ],
        [
            { name: "petitDejeuner", label: "Petit-déjeuner",     type: "dropdown", placeholder: "Choisir", defaultValue: "false", options: repasOptions },
            { name: "dejeuner",      label: "Déjeuner",           type: "dropdown", placeholder: "Choisir", defaultValue: "false", options: repasOptions },
            { name: "diner",         label: "Dîner",              type: "dropdown", placeholder: "Choisir", defaultValue: "false", options: repasOptions },
        ],
    ],

    circuitDayPois: [
        [
            { name: "circuitDayId", label: "Jour du programme",  type: "dropdown", placeholder: "Sélectionner un jour" },
        ],
        [
            // ← options filtrées par le jour choisi : seuls les POI de la destination de son étape
            { name: "poiId",        label: "Visite ou activité", type: "dropdown", placeholder: "Sélectionner un point d'intérêt", dependsOn: "circuitDayId" },
        ],
        [
            { name: "inclus",       label: "Dans le prix",       type: "dropdown", placeholder: "Choisir", defaultValue: "true",
                options: [
                    { label: "Incluse",   value: "true"  },
                    { label: "En option", value: "false" },
                ]
            },
        ],
        [
            { name: "note",         label: "Précision",          type: "text",     placeholder: "Ex : entrée du parc et guide local compris" },
        ],
    ],
};

export default createConstant;