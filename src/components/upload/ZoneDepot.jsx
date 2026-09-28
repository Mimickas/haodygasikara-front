import { useRef, useState } from "react";

// La zone de dépôt des fichiers de l'administration (images, vidéo) : un
// filet pointillé d'un pixel, sans rayon ni ombre. C'est un vrai bouton — elle
// se clique, reçoit un glisser-déposer et se commande au clavier.
export default function ZoneDepot({ accept, multiple = false, onFichiers, icone, invite, depot, aide }) {
    const [survol, setSurvol] = useState(false);
    const inputRef = useRef(null);

    return (
        <>
            <button
                type="button"
                className={`ad-depot${survol ? " ad-depot--survol" : ""}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={e => { e.preventDefault(); setSurvol(true); }}
                onDragLeave={() => setSurvol(false)}
                onDrop={e => { e.preventDefault(); setSurvol(false); onFichiers(e.dataTransfer.files); }}
            >
                {icone}
                <span className="ad-depot__invite font-body">{survol ? depot : invite}</span>
                <span className="ad-depot__aide font-body">{aide}</span>
            </button>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={multiple}
                className="hidden"
                onChange={e => { onFichiers(e.target.files); e.target.value = ""; }}
            />
        </>
    );
}
