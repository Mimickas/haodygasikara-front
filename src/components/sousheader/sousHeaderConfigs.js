const sousHeaderConfigs = {
    destinations: {
        links: [
            { name: "Overview", key: "overview" },
            { name: "Orders",   key: "orders" },
        ],
        actions: [
            { name: "Export",   variant: "outline",  id: "export"   },
            { name: "Ajouter Destination", variant: "primary",  id: "ajouter-destination" },
        ]
    },
    
    produits: {
        links: [
            { name: "All products", key: "products" },
            { name: "Inventory",    key: "inventory" },
        ],
        actions: [
            { name: "+ Add product", variant: "primary", onClick: () => {} },
        ]
    }
};
  
export default sousHeaderConfigs;