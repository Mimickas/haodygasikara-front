// Les nuits du voyage : un filet et une ligne en capitales, comme la barre
// du bas du héro de l'accueil. Chaque étape est un segment du filet, à la
// largeur de ses nuits ; le vide à droite, ce sont les nuits qui restent.

const deux = (n) => String(n).padStart(2, "0");

export default function JaugeNuits({ etapes, prevues, planifiees, onRepartir }) {
    const reference = Math.max(prevues ?? 0, planifiees, 1);
    const reste = prevues == null ? null : prevues - planifiees;
    const peutRepartir = Boolean(onRepartir) && reste != null && reste !== 0 && etapes.length > 0 && prevues >= etapes.length;

    return (
        <div className={`cx-cp-jauge${reste === 0 ? " cx-cp-jauge--complete" : ""}${reste < 0 ? " cx-cp-jauge--depasse" : ""}`}>
            {prevues != null && (
                <div className="cx-cp-jauge__filet" role="img"
                    aria-label={`${planifiees} nuits placées sur ${prevues}`}>
                    {etapes.map((e) => (
                        <span key={e.cle} className="cx-cp-jauge__segment"
                            style={{ width: `${(e.nuits / reference) * 100}%` }} />
                    ))}
                    {reste < 0 && <span className="cx-cp-jauge__repere" style={{ left: `${(prevues / reference) * 100}%` }} />}
                </div>
            )}

            <div className="cx-cp-jauge__ligne">
                <span className="cx-cp-jauge__compte">
                    <span className="cx-cp-roule-cadre"><strong key={planifiees} className="cx-cp-roule">{deux(planifiees)}</strong></span>
                    {prevues != null && <> / {deux(prevues)}</>}
                    {" "}nuit{Math.max(planifiees, prevues ?? 0) > 1 ? "s" : ""}
                    {reste < 0 && <em> · {-reste} de trop</em>}
                </span>
                {peutRepartir && (
                    <button type="button" className="cx-cp-lien-espace" onClick={onRepartir}>Répartir</button>
                )}
            </div>
        </div>
    );
}
