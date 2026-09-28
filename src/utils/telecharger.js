// Enregistre un fichier reçu de l'API (réponse axios en `responseType: "blob"`).
//
// Le lien <a download> plutôt qu'un nouvel onglet : ouvert après un appel
// réseau, un onglet serait bloqué par le navigateur comme une fenêtre
// surgissante. Le nom vient de l'en-tête Content-Disposition du serveur.
export const enregistrerFichier = (reponse, nomParDefaut = "document.pdf") => {
    const disposition = reponse.headers?.["content-disposition"] ?? "";
    const nom = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)?.[1] ?? nomParDefaut;
    const url = URL.createObjectURL(reponse.data);
    const lien = document.createElement("a");
    lien.href = url;
    lien.download = decodeURIComponent(nom);
    document.body.appendChild(lien);
    lien.click();
    lien.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
};

// Une erreur d'API arrive, elle aussi, en Blob : on la relit en JSON pour que
// `apiErrorMessage` retrouve le message du serveur.
export const relireErreurBlob = async (error) => {
    const donnees = error.response?.data;
    if (donnees instanceof Blob) {
        try {
            error.response.data = JSON.parse(await donnees.text());
        } catch { /* ce n'était pas du JSON : on garde l'erreur telle quelle */ }
    }
    return error;
};
