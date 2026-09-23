const toolbar = {
    // Pas de bouton « Nouvelle réservation » : une réservation naît d'une
    // demande du visiteur, elle ne s'invente pas depuis le back-office.
    reservations:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher un client, un circuit...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },

    tagsGroup:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouveau Groupe d'Étiquettes", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },

    tags:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouveau Étiquette", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    destinations:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouveau Destination", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    circuits:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouveau Circuit", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    categoryTarifs:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouvelle catégorie de tarif", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    devises:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouvelle devise", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    conditionTarifs:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouvelle condition", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    circuitDateTarifs:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouvelle date de départ", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    circuitTarifs:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouveau tarif de circuit", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    circuitTarifConditions:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Rattacher une condition", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    categoryPois:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouvelle catégorie de POI", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    pois:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Nouveau point d'intérêt", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    circuitDays:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Programmer un jour", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
    circuitDayPois:{
        ctaAction: [
            { name: "export",  value: "Export", variant: "secondary"  },
            { name: "create",  value: "Ajouter une visite", variant: "primary" },
        ],
        filter:[
            { name:"search", placeholder:"Rechercher...", value:"", onChange:()=>console.log("search") },
            { name:"sort", Value:"Sort", variant:"secondary", onClick:()=>console.log("sort") },
        ]
    },
}

export default toolbar;