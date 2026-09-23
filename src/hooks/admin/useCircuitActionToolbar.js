import { useNavigate } from "react-router-dom";
import createConstant from "../../constants/admin/createConstant";
import { getDestinationsApi } from "../../api/admin/destinations";
import { findByIdCircuitApi, findCircuitEnumsApi } from "../../api/admin/circuit";
import { findAllTags } from "../../api/admin/tag";

export function useCircuitActionToolbar() {
    const navigate = useNavigate();

    // Chaque champ à options va chercher les siennes ici, par son nom. Les
    // référentiels de la fiche technique viennent des enums du back : le
    // formulaire n'en recopie aucun, et ajouter une langue ou un moyen de
    // transport ne se fait donc qu'à un seul endroit.
    const buildFields = (destinationOptions, enums, tagOptions) => {
        const optionsParChamp = {
            steps:          destinationOptions,
            styleVoyage:    enums?.styles ?? [],
            niveauPhysique: enums?.niveaux ?? [],
            langues:        enums?.langues ?? [],
            transports:     enums?.transports ?? [],
            tagIds:         tagOptions,
            inclusions:     enums?.categoriesInclusion ?? [],
        };

        return createConstant.circuits.map(group =>
            group.map(field =>
                optionsParChamp[field.name]
                    ? { ...field, options: optionsParChamp[field.name] }
                    : field
            )
        );
    };

    const toDestinationOptions = (destinations) =>
        (destinations ?? []).map(p => ({ label: p.name || p.nom, value: p.id }));

    const toTagOptions = (tags) =>
        (tags ?? []).map(t => ({ label: t.name || t.nom, value: t.id }));

    // Les trois référentiels arrivent ensemble : en série, le bouton « créer »
    // resterait sans réponse le temps de trois allers-retours.
    const chargerReferentiels = async () => {
        const [destinationRes, enumsRes, tagsRes] = await Promise.all([
            getDestinationsApi(),
            findCircuitEnumsApi(),
            findAllTags(),
        ]);
        return buildFields(
            toDestinationOptions(destinationRes?.data),
            enumsRes?.data,
            toTagOptions(tagsRes?.data),
        );
    };

    const handleCreate = async () => {
        try {
            navigate("/admin/haodygasikara/circuits/create", {
                state: { fields: await chargerReferentiels() },
            });
        } catch (error) {
            console.error("Erreur chargement des référentiels du circuit :", error);
        }
    };

    const handleEdit = async (id) => {
        try {
            const [fields, circuitRes] = await Promise.all([
                chargerReferentiels(),
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
                steps: circuit.steps?.map(t => ({
                    id: t.idDestination,
                    duration: t.durationDays,
                })) ?? [],
            };

            navigate(`/admin/haodygasikara/circuits/edit/${id}`, {
                state: { fields, values },
            });
        } catch (error) {
            console.error("Erreur chargement du circuit :", error);
        }
    };

    const actions = {
        create: handleCreate,
        edit: handleEdit,
        export: () => console.log("export destinations"),
        sort:   () => console.log("sort"),
    };

    return { actions };
}
