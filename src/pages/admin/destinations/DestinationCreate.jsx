import { useNavigate } from "react-router-dom";
import { createPlaceApi } from "../../../api/admin/places";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { useCloudinaryUpload } from "../../../hooks/admin/useCloudinaryUpload";


export default function DestinationCreate() {
    const navigate = useNavigate();
    const { upload, uploadMany, uploading, setUploading } = useCloudinaryUpload();

    const handleSubmit = async (formData) => {
        setUploading(true);
        try {
            // 1. Upload images → Cloudinary
            const imageUrls = formData.images?.length
                ? await uploadMany(formData.images, 'places/photos')
                : [];

            // 2. Upload vidéo → Cloudinary
            const videoUrl = formData.videoUrl
                ? await upload(formData.videoUrl, 'places/videos')
                : null;

            await createPlaceApi({
                nom: formData.nom,
                description: formData.description,
                lat: formData.lat,
                lng: formData.lng,
                stars: formData.stars ?? null,
                tagIds: formData.tagIds ?? [],
                imageUrls,   // String[]
                videoUrl,    // String
            });

            navigate("/admin/haodygasikara/destinations");
        } catch (error) {
            console.error("Erreur création destination :", error);
        } finally {
            setUploading(false);
        }
    };

    return <CreateModal onSubmit={handleSubmit} uploading={uploading} />;
}