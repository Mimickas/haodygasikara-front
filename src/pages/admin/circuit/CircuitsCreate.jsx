import { useNavigate } from "react-router-dom";
import { createCircuit } from "../../../api/admin/circuit";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { useCloudinaryUpload } from "../../../hooks/admin/useCloudinaryUpload";
import { toCircuitPayload } from "../../../utils/circuitForm";

export default function CircuitsCreate() {
    const navigate = useNavigate();
    const { upload, uploadMany, uploading, setUploading } = useCloudinaryUpload();

    const handleSubmit = async (formData) => {
        setUploading(true);
        try {
            // 1. Upload images → Cloudinary (la première est la couverture)
            const imageUrls = formData.imageUrls?.length
                ? await uploadMany(formData.imageUrls, "circuits")
                : [];

            // 2. Upload vidéo → Cloudinary
            const videoUrl = formData.videoUrl
                ? await upload(formData.videoUrl, "circuits/videos")
                : null;

            await createCircuit(toCircuitPayload(formData, { imageUrls, videoUrl }));
            navigate("/admin/haodygasikara/circuits");
        } catch (error) {
            console.error("Erreur création circuit :", error);
        } finally {
            setUploading(false);
        }
    };

    return <CreateModal onSubmit={handleSubmit} uploading={uploading} />;
}