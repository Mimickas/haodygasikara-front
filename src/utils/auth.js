// Mise en forme des donnees du formulaire pour le back.

// LocalDate attend YYYY-MM-DD
export const versLocalDate = ({ jour, mois, annee }) =>
    jour && mois && annee ? `${annee}-${mois}-${jour.padStart(2, "0")}` : "";

// Les cles suivent RegisterRequest cote back : `telephone` et `naissance`,
// pas les noms de colonnes de l'entite (`phone`, `date_of_birth`).
// `telephone` concatene indicatif et numero sans separateur :
// +261 34 27 013 74 devient +261342701374 — 13 caracteres sur une colonne de 20.
export const construirePayloadAuth = (mode, form) => {
    if (mode !== "register") {
        return { email: form.email, password: form.password };
    }

    return {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        password: form.password,
        telephone: `${form.indicatif}${form.telephone.replace(/\D/g, "")}`,
        naissance: versLocalDate(form.naissance),
    };
};

// Le message utile est celui du serveur, pas celui d'axios.
// axios expose « Request failed with status code 409 » dans error.message ;
// le texte metier est dans error.response.data.message, au format ApiResponse.
export const messageErreurApi = (error, defaut = "Une erreur est survenue.") => {
    const reponse = error?.response;

    // Le serveur n'a pas repondu : coupure reseau, back arrete, CORS
    if (!reponse) {
        return error?.code === "ECONNABORTED"
            ? "Le serveur met trop de temps à répondre. Réessayez."
            : "Impossible de joindre le serveur. Vérifiez votre connexion.";
    }

    const corps = reponse.data ?? {};

    // Erreurs de validation @Valid — le back les serialise sous `errors` :
    // { message: "Erreur de validation",
    //   errors: { email: "Email invalide", password: "Minimum 8 caractères" } }
    const champs = corps.errors ?? corps.data;
    if (champs && typeof champs === "object" && !Array.isArray(champs)) {
        const details = Object.values(champs).filter((v) => typeof v === "string");
        if (details.length) return details.join(" · ");
    }

    return corps.message || defaut;
};

// Le code machine renvoye par le back (champ `code` de ApiResponse).
// Null quand le serveur n'a pas repondu, ou sur une reponse plus ancienne
// qui ne le porte pas encore.
export const codeErreurApi = (error) => error?.response?.data?.code ?? null;

// Secondes a patienter apres un 429, lues sur l'en-tete standard Retry-After.
// Le back l'expose via CORS (setExposedHeaders) : sans cela le navigateur le
// masquerait au JavaScript, meme s'il est bien present sur la reponse.
// Retour 0 = rien a attendre, l'appelant peut reessayer tout de suite.
export const secondesAvantReessai = (error) => {
    const entete = error?.response?.headers?.["retry-after"];
    const secondes = Number(entete);
    return Number.isFinite(secondes) && secondes > 0 ? Math.ceil(secondes) : 0;
};
