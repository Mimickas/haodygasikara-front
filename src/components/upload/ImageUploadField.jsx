import { useEffect, useState } from "react";
import ZoneDepot from "./ZoneDepot";

export default function ImageUploadField({ value = [], onChange }) {
    const [previews, setPreviews] = useState([]);

    useEffect(() => {
        const created = [];
        const urls = value.map(item => {
            if (typeof item === "string") return item;
            const url = URL.createObjectURL(item);
            created.push(url);
            return url;
        });
        setPreviews(urls);
        return () => created.forEach(u => URL.revokeObjectURL(u));  // revoke QUE les blobs
    }, [value]);

    function addFiles(fileList) {
        const files = Array.from(fileList).filter(f => f.type.startsWith("image/"));
        if (files.length === 0) return;
        onChange([...value, ...files]);
    }

    function removeImage(index) {
        onChange(value.filter((_, i) => i !== index));
    }

    function setAsCover(index) {
        if (index === 0) return;
        const next = [...value];
        const [picked] = next.splice(index, 1);
        next.unshift(picked);
        onChange(next);
    }

    return (
        <div className="ad-televersement">
            <ZoneDepot
                accept="image/*"
                multiple
                onFichiers={addFiles}
                invite="Cliquez ou glissez des images"
                depot="Déposez les images ici"
                aide="JPG, PNG, WebP — la première image sera la couverture"
                icone={
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                         strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                }
            />

            {previews.length > 0 && (
                <ul className="ad-vignettes">
                    {previews.map((src, i) => {
                        const isCover = i === 0;
                        return (
                            <li key={i} className={`ad-vignette${isCover ? " ad-vignette--couverture" : ""}`}>
                                <button
                                    type="button"
                                    className="ad-vignette__choisir"
                                    onClick={() => setAsCover(i)}
                                    title={isCover ? "Image de couverture" : "Choisir comme couverture"}
                                    aria-label={isCover ? `Image ${i + 1}, couverture` : `Choisir l'image ${i + 1} comme couverture`}
                                >
                                    <img src={src} alt="" />
                                </button>

                                {isCover && <span className="ad-vignette__mention font-body-strong">Couverture</span>}

                                <button
                                    type="button"
                                    className="ad-vignette__retirer"
                                    onClick={() => removeImage(i)}
                                    aria-label={`Retirer l'image ${i + 1}`}
                                >
                                    ×
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
