import { useEffect, useMemo, useState } from "react";
import { findAllTagsApiClient } from "../../../../api/client/tagsApi";
import { enregistrerPreferencesApi } from "../../../../api/client/composerApi";
import { apiErrorMessage } from "../../../../utils/apiError";
import Avis from "./Avis";

/**
 * Vos envies de voyage : les étiquettes de l'agence (thématique, région, type
 * d'activité…), rangées par groupe, à cocher.
 *
 * Elles servent au créateur de circuit : un voyage qui démarre à vide propose
 * d'abord les destinations qui leur ressemblent (« Selon vos envies »), et le
 * catalogue les fait remonter. L'ensemble s'enregistre d'un bloc : ce qui est
 * décoché est retiré.
 */
export default function BlocPreferences({ envies, onMaj }) {
    const [tags, setTags] = useState(null);
    const [erreurChargement, setErreurChargement] = useState(false);
    const [choisis, setChoisis] = useState(() => new Set((envies ?? []).map((t) => t.id)));
    const [envoi, setEnvoi] = useState(false);
    const [avis, setAvis] = useState(null);

    useEffect(() => {
        let actif = true;
        findAllTagsApiClient()
            .then((r) => actif && setTags(r?.data ?? []))
            .catch(() => actif && setErreurChargement(true));
        return () => { actif = false; };
    }, []);

    // Par groupe, dans l'ordre où l'agence les a créés
    const groupes = useMemo(() => {
        const parGroupe = new Map();
        (tags ?? []).forEach((t) => {
            const nom = t.tagGroup?.name ?? "Autres";
            if (!parGroupe.has(nom)) parGroupe.set(nom, []);
            parGroupe.get(nom).push(t);
        });
        return [...parGroupe.entries()];
    }, [tags]);

    const initiaux = useMemo(() => new Set((envies ?? []).map((t) => t.id)), [envies]);
    const modifie = choisis.size !== initiaux.size || [...choisis].some((id) => !initiaux.has(id));

    const basculer = (id) => {
        setAvis(null);
        setChoisis((actuels) => {
            const suite = new Set(actuels);
            if (suite.has(id)) suite.delete(id); else suite.add(id);
            return suite;
        });
    };

    const enregistrer = async (e) => {
        e.preventDefault();
        setEnvoi(true);
        setAvis(null);
        try {
            const r = await enregistrerPreferencesApi([...choisis]);
            onMaj(r?.data ?? []);
            setAvis({
                ton: "succes",
                texte: choisis.size
                    ? "Vos envies sont enregistrées : le créateur de circuit vous proposera d'abord les destinations qui leur ressemblent."
                    : "Vos envies sont effacées : le créateur de circuit vous proposera les coups de cœur de l'agence.",
            });
        } catch (error) {
            setAvis({ ton: "erreur", texte: apiErrorMessage(error, "L'enregistrement n'a pas abouti.") });
        } finally {
            setEnvoi(false);
        }
    };

    if (erreurChargement) {
        return <p className="cx-param__texte font-body">Les thèmes n'ont pas pu être chargés. Réessayez dans un instant.</p>;
    }
    if (!tags) {
        return <p className="cx-param__texte font-body">Chargement des thèmes…</p>;
    }
    if (tags.length === 0) {
        return <p className="cx-param__texte font-body">L'agence n'a pas encore défini de thèmes de voyage.</p>;
    }

    return (
        <form onSubmit={enregistrer}>
            <p className="cx-param__texte font-body">
                Cochez ce qui vous attire. Le créateur de circuit vous proposera d'abord les destinations
                qui vous ressemblent ; vous pouvez changer d'avis à tout moment.
            </p>

            <div className="cx-envies">
                {groupes.map(([groupe, liste]) => (
                    <fieldset key={groupe} className="cx-envies__groupe">
                        <legend className="cx-envies__titre font-body-strong">{groupe}</legend>
                        <div className="cx-envies__liste">
                            {liste.map((t) => {
                                const actif = choisis.has(t.id);
                                return (
                                    <button key={t.id} type="button" aria-pressed={actif}
                                        className={`cx-envie font-body-strong${actif ? " cx-envie--actif" : ""}`}
                                        onClick={() => basculer(t.id)}>
                                        {actif && <span aria-hidden="true" className="cx-envie__coche">✓</span>}
                                        {t.name}
                                    </button>
                                );
                            })}
                        </div>
                    </fieldset>
                ))}
            </div>

            <Avis ton={avis?.ton}>{avis?.texte}</Avis>

            <div className="cx-param__actions">
                <button type="submit" disabled={envoi || !modifie} className="cx-devis__bouton font-body-strong">
                    {envoi ? "Enregistrement…" : "Enregistrer mes envies"}
                </button>
                <span className="cx-param__note font-body">
                    {choisis.size
                        ? `${choisis.size} thème${choisis.size > 1 ? "s" : ""} choisi${choisis.size > 1 ? "s" : ""}.`
                        : "Aucun thème choisi."}
                </span>
            </div>
        </form>
    );
}
