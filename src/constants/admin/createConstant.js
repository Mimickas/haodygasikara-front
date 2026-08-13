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
        [
            { name: "dateDebut", label: "Date de début", type: "date", placeholder: "Date de début du circuit" },
            { name: "dateFin", label: "Date de fin", type: "date", placeholder: "Date de fin du circuit" },
        ],
        [
            { name: "notes", label: "Notes", type: "textarea", placeholder: "Ajoutez des notes sur le circuit…" },
        ],
        [
            { name: "steps",      label: "Étapes",            type: "steps", defaultValue: [] },
        ],
        
    ]
};

export default createConstant;