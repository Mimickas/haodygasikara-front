import api from "../axiosInstance";
import { compressImage } from "../../utils/Compressimage";

// ── Les paramètres du compte ──────────────────────────────────────────────
//
// Toutes ces routes sont sous /api/client/compte et ne prennent AUCUN
// identifiant : le compte est celui du jeton, jamais celui de l'URL. Une route
// en /compte/{id} serait une invitation à essayer les nombres voisins.

export const findMonCompteApi = async () => {
    const { data } = await api.get("/client/compte");
    return data;
};

export const changerIdentiteApi = async (payload) => {
    const { data } = await api.put("/client/compte/identite", payload);
    return data;
};

// ── L'adresse e-mail, en deux temps ───────────────────────────────────────
//
// Le mot de passe accompagne la demande, et ce n'est pas une formalité : un
// jeton de session prouve qu'on s'est connecté, pas qu'on est encore devant
// l'écran. Changer l'adresse de reprise d'un compte est exactement ce qu'on
// ferait en premier si on trouvait un portable resté ouvert.

/** Demande : le code part vers la NOUVELLE adresse. Rien ne change encore. */
export const demanderChangementEmailApi = async ({ email, motDePasse }) => {
    const { data } = await api.post("/client/compte/email", { email, motDePasse });
    return data;
};

/**
 * Confirmation. La réponse porte une paire de jetons NEUFS : l'adresse est le
 * sujet du JWT, donc les anciens ne désignent plus personne à l'instant où
 * elle change. L'appelant doit remplacer ce qu'il garde en mémoire.
 */
export const confirmerChangementEmailApi = async ({ code }) => {
    const { data } = await api.post("/client/compte/email/confirmer", { code });
    return data;
};

export const annulerChangementEmailApi = async () => {
    const { data } = await api.delete("/client/compte/email");
    return data;
};

// ── Le mot de passe ───────────────────────────────────────────────────────

export const changerMotDePasseApi = async ({ actuel, nouveau }) => {
    const { data } = await api.put("/client/compte/mot-de-passe", { actuel, nouveau });
    return data;
};

// ── La photo de profil ────────────────────────────────────────────────────

/**
 * Le fichier va du navigateur DIRECTEMENT à Cloudinary : il ne traverse pas
 * notre serveur, qui n'a donc ni à le stocker ni à le relayer. Le serveur ne
 * délivre qu'une signature à durée limitée, et c'est lui qui impose le
 * dossier — jamais le navigateur, sinon la signature vaudrait droit d'écriture
 * sur tout le compte Cloudinary.
 *
 * `fetch` et non axios, comme pour l'administration : l'intercepteur collerait
 * notre jeton JWT dans un en-tête destiné à Cloudinary.
 */
export const televerserAvatarApi = async (fichier) => {
    const { data: reponse } = await api.get("/client/compte/photo/signature");
    const { signature, timestamp, apiKey, cloudName, folder } = reponse.data;

    // Compressé avant l'envoi : une photo de téléphone fait 4 Mo pour finir
    // affichée dans un cercle de 40 px.
    const image = await compressImage(fichier, { maxWidth: 640, maxHeight: 640, quality: 0.85 });

    const corps = new FormData();
    corps.append("file", image);
    corps.append("signature", signature);
    corps.append("timestamp", String(timestamp));
    corps.append("api_key", apiKey);
    corps.append("folder", folder);

    const retour = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body: corps }
    );
    const resultat = await retour.json();
    if (!retour.ok) throw new Error(resultat.error?.message ?? "Téléversement échoué");

    return resultat.secure_url;
};

export const changerPhotoApi = async (photoUrl) => {
    const { data } = await api.put("/client/compte/photo", { photoUrl });
    return data;
};

export const retirerPhotoApi = async () => {
    const { data } = await api.delete("/client/compte/photo");
    return data;
};
