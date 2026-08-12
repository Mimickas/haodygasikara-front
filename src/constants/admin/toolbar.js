const toolbar = {
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
}

export default toolbar;