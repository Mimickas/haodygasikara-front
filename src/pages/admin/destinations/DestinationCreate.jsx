import { useNavigate } from "react-router-dom";
import { createDestinationApi } from "../../../api/admin/destinations";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { useCloudinaryUpload } from "../../../hooks/admin/useCloudinaryUpload";
import { useFormulaireAdmin } from "../../../hooks/admin/useFormulaireAdmin";
import { chargerChampsDestination } from "../../../hooks/admin/useDestinationActionToolbar";


export default function DestinationCreate() {
    const navigate = useNavigate();
    const { formulaire, erreur } = useFormulaireAdmin(async () => ({ fields: await chargerChampsDestination() }));
    const { upload, uploadMany, uploading, setUploading } = useCloudinaryUpload();

    const handleSubmit = async (formData) => {
        setUploading(true);
        try {
            // 1. Upload images → Cloudinary
            const imageUrls = formData.imageUrls?.length          // ← était formData.images
                ? await uploadMany(formData.imageUrls, 'places/photos')
                : [];

            // 2. Upload vidéo → Cloudinary
            const videoUrl = formData.videoUrl
                ? await upload(formData.videoUrl, 'places/videos')
                : null;

            await createDestinationApi({
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
            throw error;
        } finally {
            setUploading(false);
        }
    };

    if (!formulaire) {
        return <p className="my-8 font-body text-sm" style={{ color: erreur ? "var(--brand-terre)" : "var(--text-muted)" }}>
            {erreur ?? "Chargement du formulaire…"}
        </p>;
    }
    return <CreateModal fields={formulaire.fields} values={formulaire.values} onSubmit={handleSubmit} uploading={uploading} />;
}