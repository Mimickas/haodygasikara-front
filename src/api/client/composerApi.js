import api from "../axiosInstance";

// Le créateur de circuit. Deux familles de routes :
//   * ouvertes à tous (catalogue, suggestions, vérification) : un visiteur
//     compose librement, sans compte ;
//   * réservées au voyageur connecté (mes-circuits, préférences) : le back
//     répond 401 sans compte, et l'intercepteur renouvelle le jeton.

const liste = (ids) => (ids?.length ? ids.join(",") : undefined);

// ── Catalogue ──────────────────────────────────────────────────────────────

/** { destinations, facettes, total } — filtré et trié par le serveur. */
export const findCatalogueApi = async ({ q, tags, choisies, tri }, signal) => {
    const { data } = await api.get("/client/destinations", {
        params: { q: q || undefined, tags: liste(tags), choisies: liste(choisies), tri },
        signal,
    });
    return data;
};

// ── Aides à la composition ─────────────────────────────────────────────────

export const findSuggestionsApi = async ({ choisies, nuitsRestantes, circuit }, signal) => {
    const { data } = await api.get("/client/composer/suggestions", {
        params: { choisies: liste(choisies), nuitsRestantes: nuitsRestantes ?? undefined, circuit: circuit ?? undefined },
        signal,
    });
    return data;
};

/** Le verdict de cohérence du parcours, sans rien enregistrer. */
export const verifierCircuitApi = async (payload, signal) => {
    const { data } = await api.post("/client/composer/verifier", payload, { signal });
    return data;
};

// ── Mes circuits ───────────────────────────────────────────────────────────

export const findMesCircuitsApi = async () => {
    const { data } = await api.get("/client/mes-circuits");
    return data;
};

export const findMonCircuitApi = async (id) => {
    const { data } = await api.get(`/client/mes-circuits/${id}`);
    return data;
};

export const creerMonCircuitApi = async (payload) => {
    const { data } = await api.post("/client/mes-circuits", payload);
    return data;
};

export const enregistrerMonCircuitApi = async (id, payload) => {
    const { data } = await api.put(`/client/mes-circuits/${id}`, payload);
    return data;
};

export const dupliquerMonCircuitApi = async (id) => {
    const { data } = await api.post(`/client/mes-circuits/${id}/dupliquer`);
    return data;
};

export const personnaliserModeleApi = async (modeleId) => {
    const { data } = await api.post(`/client/mes-circuits/depuis/${modeleId}`);
    return data;
};

export const supprimerMonCircuitApi = async (id) => {
    const { data } = await api.delete(`/client/mes-circuits/${id}`);
    return data;
};

// ── Préférences ────────────────────────────────────────────────────────────

export const findPreferencesApi = async () => {
    const { data } = await api.get("/client/preferences");
    return data;
};

export const enregistrerPreferencesApi = async (tagIds) => {
    const { data } = await api.put("/client/preferences", { tagIds });
    return data;
};

// ── L'efficacité des suggestions ───────────────────────────────────────────
// Ce que l'écran a montré (VUE) ou ce que le voyageur a ajouté depuis une
// suggestion (AJOUT). Sans retour attendu : une mesure perdue ne doit jamais
// gêner la composition.
export const signalerSuggestionsApi = (type, session, suggestions) =>
    api.post("/client/composer/suggestions/evenements", { type, session, suggestions }).catch(() => {});
