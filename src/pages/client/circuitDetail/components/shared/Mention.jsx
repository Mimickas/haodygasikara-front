// Une mention : la valeur en grand, la legende en petites capitales dessous.
// Deux lignes valent mieux qu'une enfilade separee par des points — c'est la
// mention du panneau circuit, reprise telle quelle pour que les deux ecrans
// disent la meme chose de la meme facon.
//
// Elle sort un couple <dt>/<dd> : elle se pose donc dans une <dl>, jamais
// seule. C'est ce que decrit une fiche — une etiquette et sa valeur.
export default function Mention({ legende, valeur }) {
    return (
        <div className="cx-mention">
            <dt className="cx-label cx-label--legende font-body-strong">{legende}</dt>
            <dd className="cx-mention__valeur font-body-strong">{valeur}</dd>
        </div>
    );
}
