import api from "../axiosInstance";

// L'état de l'envoi des e-mails (serveur SMTP) : { statut, raison, depuis, verifieLe }.
// statut : INCONNU | OPERATIONNEL | EN_ECHEC
export const findEtatMailApi = async () => {
    const { data } = await api.get("/admin/mail");
    return data;
};

// Reprend contact avec le serveur SMTP (connexion et authentification, aucun e-mail envoyé).
export const verifierMailApi = async () => {
    const { data } = await api.post("/admin/mail/verifier");
    return data;
};
