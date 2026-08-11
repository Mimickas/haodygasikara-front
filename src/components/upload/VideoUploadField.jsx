import { useEffect, useRef, useState } from "react";

export default function VideoUploadField({ value, onChange }) {
    const [preview, setPreview] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

    useEffect(() => {
        if (!value) { setPreview(null); return; }
        const url = URL.createObjectURL(value);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [value]);

    function handleFile(file) {
        if (!file || !file.type.startsWith("video/")) return;
        onChange(file);
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);
        handleFile(e.dataTransfer.files[0]);
    }

    function handleRemove(e) {
        e.stopPropagation();
        onChange(null);
        if (inputRef.current) inputRef.current.value = "";
    }

    return (
        <div className="flex flex-col gap-3">
            {!preview && (
                <div
                    onClick={() => inputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className="flex flex-col items-center justify-center gap-2 py-8 px-4 cursor-pointer transition-all duration-200"
                    style={{
                        border: `1.5px dashed ${isDragging ? "var(--brand-terre)" : "var(--border-strong)"}`,
                        borderRadius: "var(--radius-md)",
                        backgroundColor: isDragging ? "rgba(217, 78, 43, 0.04)" : "var(--bg-card)",
                        boxShadow: "var(--shadow-normal)",
                    }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
                         stroke={isDragging ? "var(--brand-terre)" : "var(--text-muted)"}
                         strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                    </svg>
                    <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        {isDragging ? "Déposez la vidéo ici" : "Cliquez ou glissez une vidéo"}
                    </div>
                    <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                        MP4, WebM, MOV
                    </div>
                </div>
            )}

            <input
                ref={inputRef}
                type="file"
                accept="video/*"
                onChange={e => handleFile(e.target.files[0])}
                className="hidden"
            />

            {preview && (
                <div className="relative">
                    <video
                        src={preview}
                        controls
                        className="w-full max-h-64"
                        style={{
                            border: "1px solid var(--border-strong)",
                            borderRadius: "var(--radius-md)",
                            boxShadow: "var(--shadow-soft)",
                        }}
                    />
                    <button
                        type="button"
                        onClick={handleRemove}
                        className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center cursor-pointer transition-all duration-200"
                        style={{
                            backgroundColor: "rgba(17, 17, 17, 0.7)",
                            color: "#fff",
                            borderRadius: "var(--radius-pill)",
                            fontSize: "18px",
                            lineHeight: 1,
                        }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-terre)"}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(17, 17, 17, 0.7)"}
                    >
                        ×
                    </button>
                </div>
            )}
        </div>
    );
}