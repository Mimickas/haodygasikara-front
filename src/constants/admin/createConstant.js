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
            { name: "images",      label: "Images",          type: "image",    folder: "places",        defaultValue: [] },
        ],
        [
            { name: "videoUrl",    label: "Vidéo",           type: "video",    folder: "places/videos", defaultValue: "" },
        ],
    ],
};

export default createConstant;