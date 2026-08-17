import { useNavigate } from "react-router-dom";
import createConstant from "../../constants/admin/createConstant";
import { getPlacesApi } from "../../api/admin/places";
import { findByIdCircuitApi } from "../../api/admin/circuit";

export function useCircuitActionToolbar() {
    const navigate = useNavigate();

    const buildFields = (placeOptions) => 
        createConstant.circuits.map(group =>
            group.map(field =>
                field.name === "steps"
                    ? { ...field, options: placeOptions }
                    : field
            )
        );

    const toPlaceOptions = (places) => 
        places.map(p => ({label: p.name || p.nom, value: p.id,}));

    const handleCreate = async () => {
        try {
            const response = await getPlacesApi();
            
            const enrichedFields = buildFields(toPlaceOptions(response.data));
            
            navigate("/admin/haodygasikara/circuits/create", {
                state: { fields: enrichedFields }, 
            });
        } catch (error) {
            console.error("Erreur chargement places :", error);
        }
    };

    const handleEdit = async (id) => {
        const[placeRes, circuitRes] = await Promise.all([
            getPlacesApi(),
            findByIdCircuitApi(id)
        ]);
        const fields = buildFields(toPlaceOptions(placeRes.data));
        const circuit = circuitRes.data.data;
        console.log(circuit);
        const values = {
            ...circuit,
            steps: circuit.steps?.map(t => ({
                id: t.idPlace,
                duration: t.durationDays,
            })) ?? [],
        };
        navigate(`/admin/haodygasikara/circuits/edit/${id}`, {
            state: { fields, values },
        });
    }

    const actions = {
        create: handleCreate,
        edit: handleEdit,
        export: () => console.log("export destinations"),
        sort:   () => console.log("sort"),
    };

    return { actions };
}