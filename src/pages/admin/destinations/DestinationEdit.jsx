import { useParams, useNavigate } from "react-router-dom";
import { updatePlaceApi } from "../../../api/admin/places";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { useCloudinaryUpload } from "../../../hooks/admin/useCloudinaryUpload";

export default function DestinationEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { upload, uploadMany, uploading, setUploading } = useCloudinaryUpload();

    const handleSubmit = async (formData) => {
        setUploading(true);
        try {
            // 1. Images : garde les URLs existantes, upload seulement les nouveaux File
            const existingUrls = (formData.imageUrls ?? []).filter(img => typeof img === "string");
            const newFiles     = (formData.imageUrls ?? []).filter(img => typeof img !== "string");
            const uploadedUrls = newFiles.length
                ? await uploadMany(newFiles, 'places/photos')
                : [];
            const imageUrls = [...existingUrls, ...uploadedUrls];

            // 2. Vidéo : string = déjà en ligne, File = à uploader
            let videoUrl = formData.videoUrl;
            if (videoUrl && typeof videoUrl !== "string") {
                videoUrl = await upload(videoUrl, 'places/videos');
            }

            await updatePlaceApi(id, {
                nom: formData.nom,
                description: formData.description,
                lat: formData.lat,
                lng: formData.lng,
                stars: formData.stars ?? null,
                tagIds: formData.tagIds ?? [],
                imageUrls,   // String[]
                videoUrl,    // String | null
            });

            navigate("/admin/haodygasikara/destinations");
        } catch (error) {
            console.error("Erreur mise à jour destination :", error);
        } finally {
            setUploading(false);
        }
    };

    return <CreateModal onSubmit={handleSubmit} uploading={uploading} />;
}