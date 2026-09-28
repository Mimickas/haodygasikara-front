import { Link } from "react-router-dom";

// ── Un lien de panneau ────────────────────────────────────────────────────
//
// Il referme le panneau AVANT de changer de page, au lieu des deux à la fois.
//
// Un `<Link>` ordinaire navigue à l'instant du clic : la page basculait donc
// pendant que le menu se repliait encore, et depuis que chaque page arrive
// dans son propre module, l'attente du téléchargement tombait par-dessus,
// sans rien à l'écran. Trois gestes se marchaient dessus. Ici l'ordre est
// écrit : le menu finit de se fermer, l'attente s'annonce, la page arrive.
//
// Reste un vrai `<a href>` : clic milieu, Ctrl/⌘ + clic, « ouvrir dans un
// nouvel onglet » continuent de fonctionner — on n'intercepte que le clic
// gauche simple, celui qu'on a le droit de séquencer.
export default function LienPanneau({ to, onNaviguer, children, ...reste }) {
    const auClic = (e) => {
        if (e.defaultPrevented) return;
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        onNaviguer(to);
    };

    return (
        <Link to={to} onClick={auClic} {...reste}>
            {children}
        </Link>
    );
}
