import { useParams, useNavigate } from "react-router-dom";
import { updateCircuitApi } from "../../../api/admin/circuit";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { useCloudinaryUpload } from "../../../hooks/admin/useCloudinaryUpload";

export default function CircuitEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { upload, uploading, setUploading } = useCloudinaryUpload();

    const handleSubmit = async (formData) => {
        setUploading(true);
        try {

            const raw = Array.isArray(formData.imageUrl) ? formData.imageUrl[0] : formData.imageUrl;
            let imageUrl = raw ?? null;
            if (imageUrl && typeof imageUrl !== "string") {
                imageUrl = await upload(imageUrl, "circuits");
            }

            const payload = {
                ...formData,
                imageUrl,
                isTemplate: formData.isTemplate === "true" || formData.isTemplate === true,
            };

            await updateCircuitApi(id, payload);
            navigate("/admin/haodygasikara/circuits");
        } catch (error) {
            console.error("Erreur mise à jour circuit :", error);
        } finally {
            setUploading(false);
        }
    };

    return <CreateModal onSubmit={handleSubmit} uploading={uploading} />;
}