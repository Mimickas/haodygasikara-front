// Lectures partagées d'un circuit — le back renvoie des steps, l'affichage
// veut un trajet, une durée et un décompte d'étapes.

// L'ordre des étapes est réglé au glisser-déposer côté administration et rangé
// dans `position` ; rien ne garantit que la collection arrive déjà triée du
// back. On s'appuie donc sur `position`, jamais sur l'ordre du tableau.
//
// La liste n'est recopiée que si elle est réellement dans le désordre : dans le
// cas courant la référence reste la même d'un rendu à l'autre, ce qui laisse
// les useMemo et les composants mémoïsés tranquilles.
export const circuitSteps = (circuit) => {
    const steps = circuit?.steps ?? [];
    for (let i = 1; i < steps.length; i++) {
        if ((steps[i - 1]?.position ?? i - 1) > (steps[i]?.position ?? i)) {
            return [...steps].sort((a, b) => (a?.position ?? 0) - (b?.position ?? 0));
        }
    }
    return steps;
};

export const circuitDays = (circuit) =>
    circuitSteps(circuit).reduce((total, step) => total + (step.durationDays ?? 0), 0);

// Le report des jours le long du parcours : la troisieme halte ne commence pas
// au jour 3, mais apres la duree des deux precedentes. C'est ce report qui rend
// l'ordre lisible autrement que par le numero.
//
// La fonction accepte un circuit ou une liste d'etapes deja ordonnee — le
// panneau travaille sur une copie reordonnable en local, la page detail part du
// circuit. Deux appelants, un seul calcul : sans quoi les deux vues finissent
// par numeroter differemment le meme voyage.
export const circuitLegs = (source) => {
    const steps = Array.isArray(source) ? source : circuitSteps(source);
    let curseur = 1;
    return steps.map((step, index) => {
        const duree = Math.max(step.durationDays ?? 0, 0);
        const debut = duree > 0 ? curseur : null;
        const fin = duree > 0 ? curseur + duree - 1 : null;
        if (duree > 0) curseur += duree;
        return { step, index, duree, debut, fin };
    });
};

export const circuitRoute = (circuit) => {
    const steps = circuitSteps(circuit);
    const depart = steps[0]?.destination?.nom;
    const arrivee = steps[steps.length - 1]?.destination?.nom;
    return depart && arrivee ? { depart, arrivee } : null;
};

// Les visuels d'un lieu : la couverture d'abord, puis l'ordre `position` réglé
// côté administration.
//
// La fonction ne connaît rien aux destinations : elle lit un `images` de la
// forme `ImageDetaille { url, isCover, position }`, et c'est exactement la
// forme que portent AUSSI les POI — un hébergement, une visite. Elle s'appelait
// `destinationImages` et laissait croire le contraire, ce qui a fait écrire
// deux fois la même lecture de tableau ailleurs dans le code.
export const imagesTriees = (entite) =>
    [...(entite?.images ?? [])]
        .filter((image) => image?.url)
        .sort((a, b) =>
            Number(Boolean(b.isCover)) - Number(Boolean(a.isCover)) ||
            (a.position ?? 0) - (b.position ?? 0)
        )
        .map((image) => image.url);

// La planche photo d'un POI : la couverture ouvre, le film vient juste après
// s'il existe, le reste des visuels suit. Le film ne remplace jamais la
// couverture — on ne troque pas une image qui se voit contre une image à
// charger. Chaque entrée porte sa propre clé : les URL sont uniques dans un
// même POI, et c'est elle que React suit d'un rendu à l'autre.
export const mediasPoi = (poi) => {
    const photos = imagesTriees(poi);
    const film = poi?.videoUrl ?? null;
    const medias = [];

    if (photos[0]) medias.push({ cle: photos[0], type: "image", src: photos[0] });
    if (film) medias.push({ cle: film, type: "video", src: film, poster: photos[0] ?? null });
    photos.slice(1).forEach((src) => medias.push({ cle: src, type: "image", src }));

    return medias;
};

// Ce que le héro de la page détail fait défiler. Le back ne porte qu'une image
// par circuit : la matière vient donc aussi des étapes — leurs photos, et la
// première vidéo trouvée le long du parcours. Chaque URL n'apparaît qu'une
// fois, un même lieu pouvant revenir dans deux étapes.
export const circuitMedias = (circuit, maxImages = 6) => {
    const steps = circuitSteps(circuit);
    const vues = new Set();
    const images = [];

    const ajouter = (src, titre, legende) => {
        if (!src || vues.has(src) || images.length >= maxImages) return;
        vues.add(src);
        images.push({ type: "image", src, titre, legende });
    };

    ajouter(circuit?.imageUrl, circuit?.nom, "Le circuit");
    steps.forEach((step, i) =>
        imagesTriees(step.destination).forEach((src) =>
            ajouter(src, step.destination?.nom, `Étape ${String(i + 1).padStart(2, "0")}`)
        )
    );

    const etapeFilmee = steps.find((step) => step.destination?.videoUrl);
    if (!etapeFilmee) return images;

    const film = {
        type: "video",
        src: etapeFilmee.destination.videoUrl,
        poster: imagesTriees(etapeFilmee.destination)[0] ?? circuit?.imageUrl ?? null,
        titre: etapeFilmee.destination.nom,
        legende: "Film",
    };

    // Le film passe en deuxième : assez tôt pour être vu sans attendre tout le
    // défilement, jamais avant la couverture du circuit.
    return [...images.slice(0, 1), film, ...images.slice(1)];
};

// Appréciation d'un circuit : la moyenne des étoiles de ses étapes, à une
// décimale. Le back ne note pas les circuits eux-mêmes — sans étape notée, on
// renvoie null plutôt qu'une note inventée.
export const circuitStars = (circuit) => {
    const notes = circuitSteps(circuit)
        .map((step) => step.destination?.stars)
        .filter((stars) => stars != null && stars > 0);
    if (!notes.length) return null;
    return Math.round((notes.reduce((total, n) => total + n, 0) / notes.length) * 10) / 10;
};

// Nombre de lieux distincts traversés par une collection de circuits
export const countDestinations = (circuits = []) => {
    const seen = new Set();
    circuits.forEach((c) =>
        circuitSteps(c).forEach((s) => {
            const key = s.destination?.id ?? s.destination?.nom;
            if (key) seen.add(key);
        })
    );
    return seen.size;
};
