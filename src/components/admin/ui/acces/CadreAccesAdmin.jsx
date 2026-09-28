import InputComponent from "../../../ui/input/InputComponent";

// Le cadre des pages d'accès à l'administration — connexion et première
// installation. La grammaire de l'admin sur une colonne étroite : le logo,
// un micro-titre, le titre en Abhaya, puis le formulaire sous un filet d'un
// pixel. Ni carte, ni rayon, ni ombre.
export default function CadreAccesAdmin({ surtitre, titre, texte, children }) {
    return (
        <main className="ad-acces">
            <div className="ad-acces__cadre">
                <img src="/img/logo/logo-1-vertical.png" alt="Haodygasikara" className="ad-acces__logo" />
                <p className="cx-label cx-label--accent font-body-strong">{surtitre}</p>
                <h1 className="ad-acces__titre font-title">{titre}</h1>
                {texte && <p className="ad-acces__texte font-body">{texte}</p>}
                {children}
            </div>
        </main>
    );
}

// Un champ de ces pages : le libellé en petites capitales au-dessus du champ.
export function ChampAcces({ id, libelle, ...champ }) {
    return (
        <div className="ad-acces__champ">
            <label htmlFor={id} className="ad-libelle font-body-strong">{libelle}</label>
            <InputComponent id={id} {...champ} />
        </div>
    );
}
