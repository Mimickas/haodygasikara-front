import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import ChampFormulaire from "../form/ChampFormulaire";
import { useChampsFormulaire } from "../../../../hooks/admin/useChampsFormulaire";
import { apiErrorMessage } from "../../../../utils/apiError";

// La page de création ou de modification. Champs et valeurs arrivent en props
// (pages qui se chargent elles-mêmes, cf. useFormulaireAdmin) ou, à défaut,
// dans l'état de navigation. Sans l'un ni l'autre, on n'affiche rien plutôt que
// de planter.
//
// Le rendu des champs et la validation sont ceux de la fenêtre des listes
// (ChampFormulaire, useChampsFormulaire) : un champ ajouté à la déclaration
// arrive dans les deux écrans, avec les mêmes bornes et les mêmes messages.
export default function CreateModal(props) {
    const { state } = useLocation();
    const fields = props.fields ?? state?.fields;
    if (!fields) return <p className="my-8 font-body text-sm" style={{ color: "var(--text-muted)" }}>Chargement du formulaire…</p>;
    return <Formulaire {...props} fields={fields} values={props.values ?? state?.values} />;
}

function Formulaire({ onSubmit, fields, values, uploading = false, coherence }) {
    const navigate = useNavigate();
    const { formData, setChamp, erreurs, valider, optionsDe, attenteDe } =
        useChampsFormulaire(fields, values, coherence);

    // Un enregistrement refusé se dit : il ne finit plus seulement dans la console
    const [erreur, setErreur] = useState(null);
    const [envoi, setEnvoi] = useState(false);

    const enregistrer = async () => {
        setErreur(null);
        if (!valider()) {
            setErreur("Quelques champs demandent une correction : ils sont signalés ci-dessus.");
            return;
        }
        setEnvoi(true);
        try {
            await onSubmit?.(formData);
        } catch (e) {
            setErreur(apiErrorMessage(e, "L'enregistrement n'a pas abouti. Vérifiez les champs puis réessayez."));
        } finally {
            setEnvoi(false);
        }
    };
    const occupe = envoi || uploading;

    // Une page, pas une fenêtre : la carte du formulaire, et au pied les deux
    // gestes — collés en bas de l'écran pendant qu'on remplit.
    return (
        <form className="ad-formulaire" onSubmit={(e) => { e.preventDefault(); enregistrer(); }} noValidate>
            <div className="ad-formulaire__carte">
                {fields.map((group, index) => (
                    <div key={index} className="ad-formulaire__rangee">
                        {group.map(field => (
                            <div key={field.name} className="ad-formulaire__champ">
                                <ChampFormulaire
                                    field={field}
                                    valeur={formData[field.name]}
                                    onChange={val => setChamp(field.name, val)}
                                    erreur={erreurs[field.name]}
                                    options={optionsDe(field)}
                                    attente={attenteDe(field)}
                                />
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div className="ad-formulaire__pied">
                {erreur && <p className="ad-erreur ad-formulaire__erreur" role="alert">{erreur}</p>}
                <div className="ad-formulaire__gestes">
                    <button type="button" className="ad-bouton font-body-strong" onClick={() => navigate(-1)} disabled={occupe}>Annuler</button>
                    <button type="submit" className="ad-bouton ad-bouton--plein font-body-strong" disabled={occupe}>
                        {occupe ? "Enregistrement…" : "Enregistrer"}
                    </button>
                </div>
            </div>
        </form>
    );
}
