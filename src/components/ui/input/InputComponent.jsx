// Le champ de saisie de l'administration : angle vif, filet d'un pixel qui
// passe en terre au focus (ad-champ) — le même que dans les fenêtres.
export default function InputComponent({ value, setValue, placeholder, className = "", type = "text", id, autoComplete }) {
    return (
        <input
            id={id}
            type={type}
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder={placeholder}
            autoComplete={autoComplete}
            className={`ad-champ font-body ${className}`}
        />
    );
}
