import { useNavigate } from "react-router-dom";
import createConstant from "../../constants/admin/createConstant";
import { getDestinationsApi } from "../../api/admin/destinations";
import { findByIdCircuitApi, findCircuitEnumsApi } from "../../api/admin/circuit";
import { findAllTags } from "../../api/admin/tag";
import { findAllPoisApi } from "../../api/admin/poiApi";

// Chaque champ à options va chercher les siennes ici, par son nom. Les
// référentiels de la fiche technique viennent des enums du back : le
// formulaire n'en recopie aucun, et ajouter une langue ou un moyen de
// transport ne se fait donc qu'à un seul endroit.
const buildFields = (destinationOptions, enums, tagOptions, poiOptions) => {
    const optionsParChamp = {
        styleVoyage:    enums?.styles ?? [],
        niveauPhysique: enums?.niveaux ?? [],
        langues:        enums?.langues ?? [],
        transports:     enums?.transports ?? [],
        tagIds:         tagOptions,
        inclusions:     enums?.categoriesInclusion ?? [],
    };

    return createConstant.circuits.map(group =>
        group.map(field => {
            // Les étapes ne prennent pas une liste d'options : il leur faut
            // les lieux.
            if (field.type === "etapes") {
                return { ...field, destinations: destinationOptions };
            }
            // Le programme ne prend pas une liste d'options : il lui faut les
            // lieux, les points d'interet et les moyens de transport.
            if (field.type === "programme") {
                return {
                    ...field,
                    destinations: destinationOptions,
                    pois: poiOptions,
                    transports: enums?.transports ?? [],
                };
            }
            return optionsParChamp[field.name]
                ? { ...field, options: optionsParChamp[field.name] }
                : field;
        })
    );
};

// `sousTitre` : la ligne grise de la recherche. Deux lieux peuvent porter des
// noms proches — ses etiquettes et sa note disent lequel on regarde.
const toDestinationOptions = (destinations) =>
    (destinations ?? []).map(p => ({
        label: p.name || p.nom,
        value: p.id,
        sousTitre: [
            (p.tags ?? []).slice(0, 3).join(", "),
            p.stars ? "\u2605".repeat(p.stars) : null,
        ].filter(Boolean).join(" \u00b7 "),
    }));

const toTagOptions = (tags) =>
    (tags ?? []).map(t => ({ label: t.name || t.nom, value: t.id }));

// Les POI, a plat : le champ du programme les range lui-meme par destination
// pour ne proposer, chaque journee, que ceux des lieux qu'elle traverse.
const toPoiOptions = (pois) =>
    (pois ?? []).map(p => ({
        id: p.id,
        nom: p.nom,
        destinationId: p.destinationId,
        destinationNom: p.destinationNom,
        categorie: p.categoryPoi?.name ?? null,
        isHebergement: Boolean(p.categoryPoi?.isHebergement),
    }));

// Les trois référentiels arrivent ensemble : en série, le bouton « créer »
// resterait sans réponse le temps de trois allers-retours.
export const chargerReferentielsCircuit = async () => {
    const [destinationRes, enumsRes, tagsRes, poisRes] = await Promise.all([
        getDestinationsApi(),
        findCircuitEnumsApi(),
        findAllTags(),
        findAllPoisApi(),
    ]);
    return buildFields(
        toDestinationOptions(destinationRes?.data),
        enumsRes?.data,
        toTagOptions(tagsRes?.data),
        toPoiOptions(poisRes?.data),
    );
};

// Le formulaire d'un circuit existant : champs et valeurs, en un appel.
export const chargerFormulaireCircuit = async (id) => {
    const [fields, circuitRes] = await Promise.all([
        chargerReferentielsCircuit(),
        findByIdCircuitApi(id),
    ]);
    const circuit = circuitRes.data.data;

    // La réponse porte déjà les noms de champs du formulaire
    // (styleVoyage, ageMin, langues, tagIds, inclusions…) : le spread
    // suffit, et seules les valeurs d'une autre forme sont reprises.
    const values = {
        ...circuit,
        imageUrls: circuit.imageUrls ?? [],   // ← URLs déjà en ligne : le champ image les affiche telles quelles
        videoUrl: circuit.videoUrl ?? "",
        // Les étapes, relues telles que l'écran va les reposer. Le serveur les
        // renvoie déduites du programme quand l'agence ne les a pas saisies :
        // l'écran les montre donc telles qu'elles sont en base, et les
        // réenregistrer les fige — ce qui est exactement ce qu'on veut dire en
        // ouvrant ce champ.
        steps: [...(circuit.steps ?? [])]
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map(e => ({
                destinationId: e.idDestination ?? "",
                durationDays: e.durationDays ?? 1,
                notes: e.notes ?? "",
            })),
        // Le programme, relu tel que l'ecran va le reposer. Les noms de champs
        // sont ceux de la requete : rien a traduire.
        days: (circuit.days ?? []).map(j => ({
            lieux: (j.lieux ?? []).map(l => ({
                destinationId: l.destinationId ?? "",
                note: l.note ?? "",
            })),
            titre: j.titre ?? "",
            description: j.description ?? "",
            notes: j.notes ?? "",
            transport: j.transport ?? "",
            hebergementId: j.hebergementId ?? "",
            alternativeIds: j.alternativeIds ?? [],
            visites: (j.visites ?? []).map(v => ({
                poiId: v.poiId ?? "",
                inclus: v.inclus !== false,
                note: v.note ?? "",
            })),
            petitDejeuner: Boolean(j.petitDejeuner),
            dejeuner: Boolean(j.dejeuner),
            diner: Boolean(j.diner),
        })),
    };
    return { fields, values };
};

export function useCircuitActionToolbar() {
    const navigate = useNavigate();

    const handleCreate = async () => {
        try {
            navigate("/admin/haodygasikara/circuits/create", {
                state: { fields: await chargerReferentielsCircuit() },
            });
        } catch (error) {
            console.error("Erreur chargement des référentiels du circuit :", error);
        }
    };

    const handleEdit = async (id) => {
        try {
            navigate(`/admin/haodygasikara/circuits/edit/${id}`, {
                state: await chargerFormulaireCircuit(id),
            });
        } catch (error) {
            console.error("Erreur chargement du circuit :", error);
        }
    };

    const actions = {
        create: handleCreate,
        edit: handleEdit,
    };

    return { actions };
}
