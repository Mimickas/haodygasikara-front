// hooks/design/useAssetsLoader.js
import { useEffect, useState } from "react";

export function useAssetsLoader(imageSources) {
    const [progress, setProgress] = useState(0);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        let loaded = 0;
        let cancelled = false;

        const total = imageSources.length + 1; // +1 pour les fonts

        const bump = () => {
            loaded += 1;
            if (!cancelled) {
                setProgress(Math.round((loaded / total) * 100));
                if (loaded >= total) setReady(true);
            }
        };

        // 1. précharger chaque image
        imageSources.forEach((src) => {
            const img = new Image();
            img.onload = bump;
            img.onerror = bump; // on avance même si une image échoue
            img.src = src;
        });

        // 2. attendre les fonts
        if (document.fonts?.ready) {
            document.fonts.ready.then(bump);
        } else {
            bump();
        }

        return () => { cancelled = true; };
    }, [imageSources]);

    return { progress, ready };
}