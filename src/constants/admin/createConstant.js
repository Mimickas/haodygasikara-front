// ── Les champs des formulaires de l'administration ────────────────────────
//
// Une déclaration par formulaire, lue par la page de création comme par la
// fenêtre des listes (ChampFormulaire). Chaque champ porte ses LIMITES avec
// lui — `obligatoire`, `min`, `max`, `maxLength`, `maxItems` — vérifiées avant
// l'envoi par validationChamps.js, avec le message posé sous le champ.
//
// Les bornes sont celles du serveur (les records de dto/request) quand il en a,
// et celles du métier quand il n'en a pas : un circuit de 110 jours ou un
// groupe de 400 voyageurs passait les deux.
//
// `aide` : la phrase grise sous le champ, quand le libellé ne suffit pas.
// `recherche` : force la recherche même sur une courte liste.

// Madagascar, bornes larges : de la Grande Terre à Nosy Be et Sainte-Marie.
// Une latitude positive ou une longitude à 2° est une faute de saisie, pas un
// lieu — et elle posait un point au milieu de l'Atlantique sur la carte.
const LAT = { min: -26, max: -11 };
const LNG = { min: 42, max: 51.5 };
const AIDE_GPS = "Coordonnée à Madagascar. Relevée sur une carte, en degrés décimaux.";

// Les étoiles de l'agence, comme côté serveur (0 à 5)
const ETOILES = { type: "number", min: 0, max: 5, unite: "étoile" };

const createConstant = {
    // L'identifiant se déduit du nom s'il reste vide (« Parc national » → parc-national)
    tags: [
        [
            { name: "name",       label: "Nom",         type: "text",     placeholder: "Nom de l'étiquette (ex : Plage)",
              obligatoire: true, maxLength: 100 },
        ],
        [
            { name: "idTagGroup", label: "Groupe",      type: "dropdown", placeholder: "Sélectionner un groupe",
              obligatoire: true },
            { name: "slug",       label: "Identifiant", type: "text",     placeholder: "Déduit du nom si vide",
              maxLength: 100 },
        ],
    ],
    tagsGroups: [
        [
            { name: "name",       label: "Nom",         type: "text",     placeholder: "Nom du groupe (ex : Thématique)",
              obligatoire: true, maxLength: 100 },
        ],
        [
            { name: "slug",       label: "Identifiant", type: "text",     placeholder: "Déduit du nom si vide",
              maxLength: 100 },
        ],
    ],

    destinations: [
        [
            { name: "nom",         label: "Nom",              type: "text",     placeholder: "Nom du lieu",
              obligatoire: true, maxLength: 255 },
            { name: "stars",       label: "Étoiles (0-5)",    type: "number",   placeholder: "4", ...ETOILES },
        ],
        [
            // Le serveur la refuse vide : la dire obligatoire ici évite un
            // aller-retour pour l'apprendre.
            { name: "description", label: "Description",     type: "textarea", placeholder: "Décris le lieu…",
              obligatoire: true },
        ],
        [
            { name: "lat",         label: "Latitude",        type: "number",   placeholder: "-18.8792",
              obligatoire: true, entier: false, step: "any", ...LAT, aide: AIDE_GPS },
            { name: "lng",         label: "Longitude",       type: "number",   placeholder: "47.5079",
              obligatoire: true, entier: false, step: "any", ...LNG },
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
            { name: "name", label: "Nom", type: "text", placeholder: "Nom du circuit",
              obligatoire: true, maxLength: 255 },
            { name: "isTemplate", label: "Modèle", type: "radio", defaultValue: "false",
              aide: "Un modèle publié apparaît au catalogue public." },
        ],
        // ← pas de dates ici : un circuit de l'agence est un programme, pas un
        //   calendrier. C'est le voyageur qui donne sa date en demandant son devis.
        [
            // Refusées vides par le serveur, elles aussi.
            { name: "notes", label: "Notes", type: "textarea", placeholder: "Ajoutez des notes sur le circuit…",
              obligatoire: true },
        ],
        [
            { name: "imageUrls", label: "Images", type: "image", placeholder: "Images du circuit", folder: "circuits",        defaultValue: [] },
        ],
        [
            { name: "videoUrl",  label: "Vidéo",  type: "video", placeholder: "Vidéo du circuit",  folder: "circuits/videos", defaultValue: "" },
        ],
        [
            // Les étapes du voyage : un lieu, un nombre de jours. Renseignées,
            // elles FONT FOI ; laissées vides, elles se déduisent du programme
            // ci-dessous (les journées consécutives au même coucher forment un
            // séjour, cf. ProgrammeService côté serveur).
            { name: "steps", label: "Étapes du circuit", type: "etapes", defaultValue: [] },
        ],
        [
            // Le programme jour par jour : le détail du parcours — ce qu'on
            // fait, où l'on dort, ce qu'on mange. L'ancien écran « Jour par
            // jour » a disparu au profit de celui-ci.
            { name: "days", label: "Programme jour par jour", type: "programme", defaultValue: [] },
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
              options: [{ label: "Tous âges — aucune limite", value: "true" }],
              aide: "À laisser vide si une borne d'âge est renseignée à côté." },
        ],
        [
            { name: "ageMin",          label: "Âge minimum",      type: "number", placeholder: "Ex : 8",
              min: 0, max: 120, unite: "an" },
            { name: "ageMax",          label: "Âge maximum",      type: "number", placeholder: "Ex : 70",
              min: 0, max: 120, unite: "an" },
            { name: "tailleGroupeMin", label: "Groupe — minimum", type: "number", placeholder: "2",
              min: 1, max: 60, unite: "voyageur" },
            { name: "tailleGroupeMax", label: "Groupe — maximum", type: "number", placeholder: "12",
              min: 1, max: 60, unite: "voyageur" },
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

    categoryPois: [
        [
            { name: "name", label: "Nom",  type: "text", placeholder: "Nom de la catégorie (ex : Hôtel)",
              obligatoire: true, maxLength: 100 },
        ],
        [
            { name: "code",          label: "Code",        type: "text",     placeholder: "Code de la catégorie (ex : HOTEL)",
              obligatoire: true, maxLength: 50,
              aide: "En majuscules, sans espace. Il ne change plus ensuite." },
            { name: "isHebergement", label: "Hébergement", type: "dropdown", placeholder: "On peut y dormir ?", defaultValue: "false",
                obligatoire: true,
                options: [
                    { label: "Oui, on y passe la nuit", value: "true"  },
                    { label: "Non",                     value: "false" },
                ]
            },
        ],
    ],

    pois: [
        [
            { name: "destinationId", label: "Destination",   type: "dropdown", placeholder: "Sélectionner une destination",
              obligatoire: true, recherche: true, placeholderRecherche: "Nom du lieu…" },
            { name: "categoryPoiId", label: "Catégorie",     type: "dropdown", placeholder: "Sélectionner une catégorie",
              obligatoire: true },
        ],
        [
            { name: "nom",           label: "Nom",           type: "text",     placeholder: "Nom du lieu (ex : Hôtel du Lac)",
              obligatoire: true, maxLength: 255 },
            { name: "stars",         label: "Étoiles (0-5)", type: "number",   placeholder: "4", ...ETOILES },
        ],
        [
            { name: "description",   label: "Description",   type: "textarea", placeholder: "Ce qui rend ce lieu unique…" },
        ],
        [
            { name: "lat",           label: "Latitude",      type: "number",   placeholder: "-22.5556",
              entier: false, step: "any", ...LAT, aide: AIDE_GPS },
            { name: "lng",           label: "Longitude",     type: "number",   placeholder: "45.4056",
              entier: false, step: "any", ...LNG },
        ],
        [
            { name: "imageUrls",     label: "Photos",        type: "image",    folder: "pois",        defaultValue: [] },
        ],
        [
            { name: "videoUrl",      label: "Vidéo",         type: "video",    folder: "pois/videos", defaultValue: "" },
        ],
    ],

};

export default createConstant;
