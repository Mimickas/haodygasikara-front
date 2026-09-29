import axios from "axios";

// ── Renouveler la session, et lire correctement son échec ──────────────────
//
// Un renouvellement qui rate ne veut PAS dire la même chose selon la raison,
// et c'est toute l'affaire :
//
//   401, 403          la session est morte — cookie absent, expiré, révoqué.
//                     Il faut se reconnecter.
//   200 sans jeton    le serveur répond « Aucune session » : même verdict.
//   502, 504, réseau  le serveur n'a pas répondu — il dort, il redémarre, la
//                     connexion a sauté. La session est peut-être intacte.
//
// Le site confondait les deux et déconnectait dans tous les cas. Sur un
// hébergement gratuit, le serveur s'endort après quinze minutes sans trafic et
// met près d'une minute à se réveiller — c'est-à-dire très exactement au
// moment où le jeton d'accès expire. On se retrouvait donc sur la page de
// connexion alors que la session avait trente jours devant elle.
//
// Un serveur qui dort, on l'attend : les reprises ci-dessous laissent le temps
// au réveil. Une session morte, on ne l'attend pas — elle est signalée du
// premier coup, sans faire patienter pour rien.

/** Les attentes entre deux tentatives, en millisecondes. Environ 35 s en tout. */
const REPRISES_MS = [1500, 4000, 10000, 20000];

const pause = (ms) => new Promise((r) => setTimeout(r, ms));

/** Le serveur n'a pas répondu, ou a répondu qu'il allait mal. */
const injoignable = (erreur) => !erreur?.response || erreur.response.status >= 500;

/** Marque une erreur comme « il faut se reconnecter ». */
const finDeSession = (erreur) => Object.assign(erreur, { sessionFinie: true });

/**
 * Demande un nouveau jeton d'accès au serveur.
 *
 * @returns {Promise<{ jeton: string, utilisateur: object }>}
 * @throws  une erreur portant `sessionFinie: true` s'il faut se reconnecter ;
 *          l'erreur réseau d'origine si le serveur est resté injoignable.
 */
export async function renouvelerSession({ reprises = REPRISES_MS } = {}) {
    for (let essai = 0; ; essai++) {
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/refresh`,
                {},
                { withCredentials: true },      // ← le cookie de renouvellement voyage avec
            );

            // 200 sans jeton : plus de cookie de session (déconnexion dans un
            // autre onglet, cookie expiré). Ce n'est pas une panne.
            const jeton = data?.data?.token;
            if (!jeton) throw finDeSession(new Error("Aucune session"));

            return { jeton, utilisateur: data.data };

        } catch (erreur) {
            if (erreur.sessionFinie) throw erreur;
            // 401, 403, 400… : le serveur a répondu, et il dit non.
            if (!injoignable(erreur)) throw finDeSession(erreur);
            // Injoignable, et on a assez insisté : on rend la main SANS
            // déconnecter. L'appel d'origine échouera, la page dira quoi faire.
            if (essai >= reprises.length) throw erreur;
            await pause(reprises[essai]);
        }
    }
}
