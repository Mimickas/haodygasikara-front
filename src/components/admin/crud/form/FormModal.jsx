import { useEffect, useState } from "react";
import { uploadToCloudinary } from "../../../../api/admin/uploadApi";
import ChampFormulaire from "./ChampFormulaire";
import { useChampsFormulaire } from "../../../../hooks/admin/useChampsFormulaire";
import { apiErrorMessage } from "../../../../utils/apiError";

// ── Le formulaire en fenêtre de l'administration ──────────────────────────
//
// Même fenêtre que la confirmation (ad-modale), mêmes champs que la page de
// création (ChampFormulaire), même validation (useChampsFormulaire) : ce qui
// vaut ici vaut là-bas.
//
// Rien ne part au serveur avant que les bornes déclarées avec les champs
// soient tenues, et chaque message se pose sous SON champ. Un refus du serveur
// s'affiche ensuite avec sa propre phrase, et la fenêtre reste ouverte : ce qui
// a été saisi n'est jamais perdu.
//
// `coherence` : la vérification qu'un champ seul ne peut pas faire — un âge
// maximum plus petit que le minimum, par exemple.

export default function FormModal({ open, onClose, onSubmit, fields, value, title, coherence }) {
    const { formData, setChamp, erreurs, valider, optionsDe, attenteDe } =
        useChampsFormulaire(fields, value, coherence);

    const [submitting, setSubmitting] = useState(false);
    const [etat, setEtat] = useState({ texte: "", erreur: false });

    useEffect(() => { setEtat({ texte: "", erreur: false }); }, [value, open]);

    useEffect(() => {
        if (!open) return undefined;
        const touche = (e) => { if (e.key === "Escape" && !submitting) onClose(); };
        window.addEventListener("keydown", touche);
        return () => window.removeEventListener("keydown", touche);
    }, [open, submitting, onClose]);

    if (!open) return null;

    async function handleSubmit(e) {
        e?.preventDefault();

        if (!valider()) {
            setEtat({ texte: "Quelques champs demandent une correction.", erreur: true });
            return;
        }

        setSubmitting(true);
        try {
            const payload = { ...formData };
            for (const field of fields.flat()) {
                if (field.type === "image" && Array.isArray(payload[field.name])) {
                    setEtat({ texte: "Envoi des images…", erreur: false });
                    payload[field.name] = await Promise.all(
                        payload[field.name].map(file => typeof file === "string"
                            ? file                                        // ← déjà en ligne : pas de nouvel envoi
                            : uploadToCloudinary(file, field.folder))
                    );
                }
                if (field.type === "video" && payload[field.name] instanceof File) {
                    setEtat({ texte: "Envoi de la vidéo…", erreur: false });
                    payload[field.name] = await uploadToCloudinary(payload[field.name], field.folder);
                }
            }
            setEtat({ texte: "Enregistrement…", erreur: false });
            await onSubmit(payload);
            onClose();
        } catch (err) {
            setEtat({ texte: apiErrorMessage(err, "L'enregistrement n'a pas abouti. Vérifiez les champs puis réessayez."), erreur: true });
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="ad-modale" onClick={() => !submitting && onClose()}>
            <form className="ad-modale__cadre ad-modale__cadre--large" onClick={e => e.stopPropagation()} onSubmit={handleSubmit} noValidate
                aria-labelledby="ad-formulaire-titre">
                <header className="ad-modale__entete ad-modale__entete--filet">
                    <div>
                        <p className="ad-modale__surtitre font-body-strong">Haodygasikara</p>
                        <h2 id="ad-formulaire-titre" className="ad-modale__titre font-title">{title}</h2>
                    </div>
                    <button type="button" onClick={onClose} className="ad-modale__fermer" aria-label="Fermer" disabled={submitting}>✕</button>
                </header>

                <div className="ad-modale__corps">
                    {fields.map((group, i) => (
                        <div key={i} className="ad-modale__rangee">
                            {group.map(field => (
                                <div key={field.name} className="ad-modale__champ">
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

                {etat.texte && (
                    <p className={etat.erreur ? "ad-erreur ad-modale__message" : "ad-modale__etat font-body"} role={etat.erreur ? "alert" : "status"}>
                        {etat.texte}
                    </p>
                )}

                <footer className="ad-modale__pied ad-modale__pied--filet">
                    <button type="button" onClick={onClose} disabled={submitting} className="ad-bouton font-body-strong">Annuler</button>
                    <button type="submit" disabled={submitting} className="ad-bouton ad-bouton--plein font-body-strong">
                        {submitting ? "Enregistrement…" : "Enregistrer"}
                    </button>
                </footer>
            </form>
        </div>
    );
}
