import { useParams, useNavigate } from "react-router-dom";
import { updateCircuitApi } from "../../../api/admin/circuit";
import CreateModal from "../../../components/admin/crud/createModal/CreateModal";
import { useCloudinaryUpload } from "../../../hooks/admin/useCloudinaryUpload";
import { useFormulaireAdmin } from "../../../hooks/admin/useFormulaireAdmin";
import { chargerFormulaireCircuit } from "../../../hooks/admin/useCircuitActionToolbar";
import { coherenceCircuit, toCircuitPayload } from "../../../utils/circuitForm";

export default function CircuitEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { formulaire, erreur } = useFormulaireAdmin(() => chargerFormulaireCircuit(id));
    const { upload, uploading, setUploading } = useCloudinaryUpload();

    const handleSubmit = async (formData) => {
        setUploading(true);
        try {
            // 1. Images : string = déjà en ligne, File = à uploader.
            //    On garde l'ordre du formulaire : la couverture choisie reste la première
            const imageUrls = await Promise.all(
                (formData.imageUrls ?? []).map(img => typeof img === "string" ? img : upload(img, "circuits"))
            );

            // 2. Vidéo : string = déjà en ligne, File = à uploader
            let videoUrl = formData.videoUrl || null;
            if (videoUrl && typeof videoUrl !== "string") {
                videoUrl = await upload(videoUrl, "circuits/videos");
            }

            await updateCircuitApi(id, toCircuitPayload(formData, { imageUrls, videoUrl }));
            navigate("/admin/haodygasikara/circuits");
        } catch (error) {
            console.error("Erreur mise à jour circuit :", error);
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
    return <CreateModal fields={formulaire.fields} values={formulaire.values} onSubmit={handleSubmit} uploading={uploading} coherence={coherenceCircuit} />;
}