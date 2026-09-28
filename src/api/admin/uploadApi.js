import api from "../axiosInstance";

// Demande une signature à ton backend (protégé admin)
async function getSignature(folder = "places") {
    const { data } = await api.get("/admin/upload-signature", { params: { folder } });
    return data.data; // { signature, timestamp, apiKey, cloudName, folder }
}

// Upload un fichier vers Cloudinary avec la signature
export async function uploadToCloudinary(file, folder = "places") {
    const sig = await getSignature(folder);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", sig.apiKey);
    formData.append("timestamp", sig.timestamp);
    formData.append("signature", sig.signature);
    formData.append("folder", sig.folder);

    // fetch direct, PAS axiosInstance : sinon l'interceptor collerait ton JWT sur Cloudinary
    const res = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,
        { method: "POST", body: formData }
    );

    if (!res.ok) throw new Error("Échec de l'upload Cloudinary");
    const result = await res.json();
    return result.secure_url;
}