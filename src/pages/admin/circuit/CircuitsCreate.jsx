import { useNavigate } from "react-router-dom";
import { createCircuit } from "../../../api/admin/circuit";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { useCloudinaryUpload } from "../../../hooks/admin/useCloudinaryUpload";

export default function CircuitsCreate() {
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

            await createCircuit(payload);
            navigate("/admin/haodygasikara/circuits");
        } catch (error) {
            console.error("Erreur création circuit :", error);
        } finally {
            setUploading(false);
        }
    };

    return <CreateModal onSubmit={handleSubmit} uploading={uploading} />;
}