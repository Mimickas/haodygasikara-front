import { HEURES_PROMESSE } from "./outils";

// « Bonjour », « Bonsoir » : l'écran s'ouvre sur la même phrase que la personne
// qui entre dans le bureau.
const salutation = () => {
    const h = new Date().getHours();
    if (h < 6) return "Bonne nuit";
    if (h < 18) return "Bonjour";
    return "Bonsoir";
};

// L'écran s'ouvrait sur quatre chiffres, sans un mot pour dire ce qu'on
// regarde. Une phrase d'abord : qui arrive, et ce qui l'attend.
export default function Accueil({ prenom, chargement, enAttente }) {
    return (
        <section className="ad-tb-accueil">
            <h2 className="ad-tb-accueil__titre font-title">
                {salutation()}{prenom ? ` ${prenom}` : ""}.
            </h2>
            <p className="ad-tb-accueil__texte font-body">
                {chargement
                    ? "Lecture des demandes en cours…"
                    : enAttente > 0
                        ? `${enAttente} demande${enAttente > 1 ? "s" : ""} de devis attend${enAttente > 1 ? "ent" : ""} une réponse. La promesse faite au voyageur est de ${HEURES_PROMESSE} h.`
                        : "Aucune demande en attente : les voyageurs ont tous eu leur réponse."}
            </p>
        </section>
    );
}
