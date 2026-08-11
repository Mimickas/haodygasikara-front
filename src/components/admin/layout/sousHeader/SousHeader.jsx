import Button from "../../../ui/button/Button";

const TITLES = {
    "/admin/haodygasikara": "Tableau de bord",
    "/admin/haodygasikara/circuits": "Circuits",
    "/admin/haodygasikara/devis": "Demandes de devis",
    "/admin/haodygasikara/destinations": "Destinations",
    "/admin/haodygasikara/destinations/create": "Création de destination",  // ← 
    "/admin/haodygasikara/tags": "Étiquettes",
    "/admin/haodygasikara/tags-groups": "Groupes d'Étiquettes",
    "/admin/haodygasikara/tags/create": "Création d'étiquette",  // ←
    "/admin/haodygasikara/utilisateurs": "Utilisateurs",
    "/admin/haodygasikara/parametres": "Paramètres",
};

export default function SousHeader({ toolbarConfigs, actions }) {
  
    const title = TITLES[location.pathname] || "Administration";
    return <>
        <div className="flex items-center h-20 justify-between" >
        
            <div className="flex items-center gap-4">
                <h1
                    className="font-abhaya-bold text-2xl lg:text-3xl"
                    style={{ color: "var(--text-primary)" }}
                >
                    {title}
                </h1>
            </div>

            <div className="flex items-center gap-2">
                {toolbarConfigs.ctaAction.map((action, index) => (
                    <Button
                        key={index}
                        value={action.value}
                        variant={action.variant}
                        onClick={actions[action.name]}  
                    />
                ))}
            </div>

        </div>
</>
}