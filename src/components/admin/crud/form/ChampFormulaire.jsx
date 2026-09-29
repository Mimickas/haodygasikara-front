import ImageUploadField from "../../../upload/ImageUploadField";
import VideoUploadField from "../../../upload/VideoUploadField";
import MultiSelectField from "../createModal/MultiSelectField";
import ChampProgramme from "../createModal/ChampProgramme";
import ChampEtapes from "../createModal/ChampEtapes";
import InclusionsField from "../createModal/InclusionsField";
import ChampRecherche from "./ChampRecherche";

// ── Un champ de l'administration, quel que soit l'écran ────────────────────
//
// Le même rendu dans la page de création et dans la fenêtre des listes : un
// libellé, le contrôle qui va avec le type déclaré, puis SOUS le champ son
// message d'erreur — ou son aide s'il n'y a pas d'erreur. Un refus posé au
// pied de l'écran ne dit pas lequel des quinze champs corriger.
//
// Au-delà de ce nombre d'options, un menu déroulant devient une recherche : on
// ne fait pas défiler mille circuits à l'aveugle. En dessous (« Inclus / Non
// inclus »), la liste se lit d'un trait et une recherche serait un geste de
// plus pour rien.
const SEUIL_RECHERCHE = 8;

export default function ChampFormulaire({
    field, valeur, onChange, erreur = null, options = [], attente = null,
}) {
    const id = `champ-${field.name}`;
    const faux = Boolean(erreur);
    const classe = `ad-champ font-body${faux ? " ad-champ--faux" : ""}`;
    const commun = {
        id,
        "aria-invalid": faux || undefined,
        "aria-describedby": faux ? `erreur-${field.name}` : undefined,
    };
    // Le placeholder dit ce qui bloque quand le champ dépend d'un autre
    const invite = attente ? `Choisissez d'abord « ${attente} »` : field.placeholder;

    const controle = () => {
        switch (field.type) {
            case "textarea":
                return (
                    <textarea {...commun}
                        value={valeur}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        rows={field.rows ?? 4}
                        className={`${classe} resize-none`} />
                );

            case "dropdown":
                return options.length >= SEUIL_RECHERCHE || field.recherche ? (
                    <ChampRecherche id={id}
                        value={valeur}
                        onChange={onChange}
                        options={options}
                        placeholder={invite}
                        placeholderRecherche={field.placeholderRecherche ?? "Rechercher…"}
                        invalide={faux}
                        desactive={Boolean(attente)} />
                ) : (
                    <select {...commun}
                        value={valeur}
                        onChange={e => onChange(e.target.value)}
                        disabled={Boolean(attente)}
                        className={classe}>
                        <option value="">{invite}</option>
                        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                );

            case "multiselect":
                return <MultiSelectField value={valeur} onChange={onChange} options={options} />;

            case "radio": {
                const choix = field.options ?? [
                    { label: "Oui", value: "true" },
                    { label: "Non", value: "false" },
                ];
                return (
                    <div className="ad-formulaire__choix" role="radiogroup" aria-labelledby={`libelle-${field.name}`}>
                        {choix.map(o => (
                            <label key={o.value} className="ad-formulaire__option font-body">
                                <input type="radio" name={field.name} value={o.value}
                                    checked={String(valeur) === String(o.value)}
                                    onChange={() => onChange(o.value)} />
                                {o.label}
                            </label>
                        ))}
                    </div>
                );
            }

            case "image":
                return <ImageUploadField value={valeur} onChange={onChange} />;

            case "video":
                return <VideoUploadField value={valeur || null} onChange={onChange} />;

            case "etapes":
                // Les étapes ne prennent pas une liste d'options mais les lieux.
                return (
                    <ChampEtapes
                        value={valeur}
                        onChange={onChange}
                        destinations={field.destinations ?? []}
                    />
                );

            case "programme":
                // Le programme jour par jour. Il ne recoit pas une liste
                // d'options mais trois referentiels : les lieux, les points
                // d'interet et les moyens de transport.
                return (
                    <ChampProgramme
                        value={valeur}
                        onChange={onChange}
                        destinations={field.destinations ?? []}
                        pois={field.pois ?? []}
                        transports={field.transports ?? []}
                    />
                );

            case "inclusions":
                return <InclusionsField value={valeur} onChange={onChange} options={options} />;

            default:
                return (
                    <input {...commun}
                        type={field.type ?? "text"}
                        value={valeur}
                        onChange={e => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        // Les bornes aussi sur l'input : les flèches d'un champ
                        // numérique s'arrêtent là où la règle s'arrête.
                        min={field.min}
                        max={field.max}
                        step={field.step}
                        maxLength={field.maxLength}
                        className={classe} />
                );
        }
    };

    // Un <label> qui engloberait un champ d'envoi de fichier relaierait les
    // clics vers son input caché : htmlFor, et seulement pour les champs
    // simples. Les groupes de boutons radio se rattachent par aria-labelledby.
    const pourLibelle = !["image", "video", "programme", "etapes", "inclusions", "multiselect", "radio"].includes(field.type);

    return (
        <>
            <label id={`libelle-${field.name}`} htmlFor={pourLibelle ? id : undefined}
                className="ad-modale__libelle font-body-strong">
                {field.label}
                {field.obligatoire && <span className="ad-champ__requis" aria-hidden="true"> *</span>}
            </label>

            {controle()}

            {erreur ? (
                <p id={`erreur-${field.name}`} className="ad-champ__erreur font-body" role="alert">{erreur}</p>
            ) : field.aide ? (
                <p className="ad-champ__aide font-body">{field.aide}</p>
            ) : null}
        </>
    );
}
