import { useNavigate, useParams } from "react-router-dom";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { updateCircuitApi } from "../../../api/admin/circuit";

export default function CircuitEdit(params) {
    const { id } = useParams();
    const navigate = useNavigate();
    const handleSubmit = async (formData) => {
        const payload = {
            ...formData,
            isTemplate: formData.isTemplate === "true" || formData.isTemplate === true,
        };
        await updateCircuitApi(id, payload);
        navigate("/admin/haodygasikara/circuits");
    };
    return <CreateModal onSubmit={handleSubmit} />;
}