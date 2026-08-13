import { useEffect, useRef, useState } from "react";

export default function ImageUploadField({ value = [], onChange }) {
    const [previews, setPreviews] = useState([]);
    const [isDragging, setIsDragging] = useState(false);
    const inputRef = useRef(null);

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

    function handleInput(e) {
        addFiles(e.target.files);
        e.target.value = "";
    }

    function handleDrop(e) {
        e.preventDefault();
        setIsDragging(false);
        addFiles(e.dataTransfer.files);
    }

    function removeImage(index, e) {
        e.stopPropagation();
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
        <div className="flex flex-col gap-3">
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
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                </svg>
                <div className="text-sm" style={{ color: "var(--text-secondary)" }}>
                    {isDragging ? "Déposez les images ici" : "Cliquez ou glissez des images"}
                </div>
                <div className="text-xs" style={{ color: "var(--text-muted)" }}>
                    JPG, PNG, WebP — la première image sera la couverture
                </div>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleInput}
                className="hidden"
            />

            {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-3">
                    {previews.map((src, i) => {
                        const isCover = i === 0;
                        return (
                            <div
                                key={i}
                                onClick={() => setAsCover(i)}
                                className="relative group cursor-pointer transition-all duration-200"
                                style={{
                                    aspectRatio: "1 / 1",
                                    borderRadius: "var(--radius-md)",
                                    overflow: "hidden",
                                    border: `2px solid ${isCover ? "var(--brand-terre)" : "var(--border-strong)"}`,
                                    boxShadow: isCover ? "var(--cta-shadow)" : "var(--shadow-normal)",
                                }}
                            >
                                <img
                                    src={src}
                                    alt=""
                                    className="w-full h-full object-cover"
                                />

                                {isCover && (
                                    <div
                                        className="absolute top-1.5 left-1.5 px-2 py-0.5 text-xs font-medium"
                                        style={{
                                            backgroundColor: "var(--brand-terre)",
                                            color: "#fff",
                                            borderRadius: "var(--radius-pill)",
                                        }}
                                    >
                                        Couverture
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={e => removeImage(i, e)}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center cursor-pointer transition-all duration-200 opacity-0 group-hover:opacity-100"
                                    style={{
                                        backgroundColor: "rgba(17, 17, 17, 0.75)",
                                        color: "#fff",
                                        borderRadius: "var(--radius-pill)",
                                        fontSize: "14px",
                                        lineHeight: 1,
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--brand-terre)"}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = "rgba(17, 17, 17, 0.75)"}
                                >
                                    ×
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}