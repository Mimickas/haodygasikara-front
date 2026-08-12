import { useNavigate } from "react-router-dom";
import { createCircuit } from "../../../api/admin/circuit";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";

export default function CircuitsCreate(params) {
    const navigate = useNavigate();
    const handleSubmit = async (formData) => {
        const payload = {
            ...formData,
            isTemplate: formData.isTemplate === "true" || formData.isTemplate === true,
        };
        await createCircuit(payload);
        navigate("/admin/haodygasikara/circuits");
    };

    return <CreateModal onSubmit={handleSubmit} uploading={false} />;
}