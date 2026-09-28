import { useEffect, useState } from "react";
import ZoneDepot from "./ZoneDepot";

export default function VideoUploadField({ value, onChange }) {
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        if (!value) { setPreview(null); return; }
        // ← une vidéo déjà en ligne arrive en URL : createObjectURL n'accepte qu'un File
        if (typeof value === "string") { setPreview(value); return; }
        const url = URL.createObjectURL(value);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    function handleFiles(fileList) {
        const file = fileList?.[0];
        if (!file || !file.type.startsWith("video/")) return;
        onChange(file);
    }

    return (
        <div className="ad-televersement">
            {preview ? (
                <div className="ad-video">
                    <video src={preview} controls />
                    <button
                        type="button"
                        className="ad-vignette__retirer"
                        onClick={() => onChange(null)}
                        aria-label="Retirer la vidéo"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <ZoneDepot
                    accept="video/*"
                    onFichiers={handleFiles}
                    invite="Cliquez ou glissez une vidéo"
                    depot="Déposez la vidéo ici"
                    aide="MP4, WebM, MOV"
                    icone={
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                             strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <polygon points="23 7 16 12 23 17 23 7" />
                            <rect x="1" y="5" width="15" height="14" />
                        </svg>
                    }
                />
            )}
        </div>
    );
}
