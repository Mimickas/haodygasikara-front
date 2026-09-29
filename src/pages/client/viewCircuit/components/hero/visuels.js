// Les photographies du héros de /circuit.
//
// Dans leur propre module, et pas dans le composant : la PAGE les précharge
// avant de lever son voile (cf. ViewCircuit) et le HÉROS les affiche. Une
// constante exportée depuis un fichier de composant casse le rechargement à
// chaud, et surtout : deux listes à tenir d'accord finiraient par diverger,
// avec pour seul symptôme une page qui s'ouvre sur un cadre vide.
//
// Ce sont les mêmes photographies qu'avant, au même cadrage — seulement
// servies à une taille d'écran. Les fichiers d'origine sortaient de
// l'appareil : 5472 × 3648, soit 76 Mo de bitmap une fois décodés, ×3 pour le
// carrousel. En 1920 (et 2880 pour les écrans denses), c'est 9 Mo par visuel.
export const VISUELS_HERO = ["1", "2", "3"].map((n) => ({
    src: `/img/viewcircuit/hero/${n}-1920.webp`,
    srcSet: `/img/viewcircuit/hero/${n}-1920.webp 1920w, /img/viewcircuit/hero/${n}-2880.webp 2880w`,
}));
