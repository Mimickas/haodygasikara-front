import { useEffect } from "react";

// La fenêtre de confirmation de l'administration (voir useConfirmation).
export default function ModaleConfirmation({ titre, texte, action = "Confirmer", surtitre = "Confirmation", onAnnuler, onConfirmer }) {
    useEffect(() => {
        const touche = (e) => { if (e.key === "Escape") onAnnuler(); };
        window.addEventListener("keydown", touche);
        return () => window.removeEventListener("keydown", touche);
    }, [onAnnuler]);

    return (
        <div className="ad-modale" onClick={onAnnuler}>
            <div className="ad-modale__cadre" role="alertdialog" aria-modal="true" aria-labelledby="ad-confirmation-titre"
                onClick={(e) => e.stopPropagation()}>
                <header className="ad-modale__entete">
                    <p className="ad-modale__surtitre font-body-strong">{surtitre}</p>
                    <h2 id="ad-confirmation-titre" className="ad-modale__titre font-title">{titre}</h2>
                </header>
                {texte && <p className="ad-modale__texte font-body">{texte}</p>}
                <footer className="ad-modale__pied">
                    <button type="button" className="ad-bouton font-body-strong" onClick={onAnnuler}>Annuler</button>
                    <button type="button" className="ad-bouton ad-bouton--danger font-body-strong" onClick={onConfirmer} autoFocus>
                        {action}
                    </button>
                </footer>
            </div>
        </div>
    );
}
