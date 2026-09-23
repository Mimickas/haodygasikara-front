/**
 * Un champ de la page de paramètres.
 *
 * Même grammaire qu'à la connexion :
 * étiquette en petites capitales, champ souligné d'un filet qui passe en Terre
 * à la saisie (`.field-line`). Aucun champ encadré nulle part sur le site — un
 * rectangle gris autour d'une saisie, c'est le vocabulaire d'un formulaire
 * administratif.
 */
export default function Champ({
    id,
    label,
    type = "text",
    value,
    onChange,
    autoComplete,
    required = false,
    large = false,
    aide,
    inputMode,
    maxLength,
    placeholder,
}) {
    return (
        <div className={large ? "cx-param__champ--large" : undefined}>
            <label htmlFor={id} className="cx-label cx-label--legende font-body-strong">
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                autoComplete={autoComplete}
                required={required}
                inputMode={inputMode}
                maxLength={maxLength}
                placeholder={placeholder}
                className="field-line w-full bg-transparent outline-none pb-3 font-body text-base"
                style={{ color: "var(--text-primary)", marginTop: "12px" }}
            />
            {aide && <span className="cx-param__aide font-body">{aide}</span>}
        </div>
    );
}
