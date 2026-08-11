import { useState } from "react";
import ImageUploadField from "../../../upload/ImageUploadField";
import VideoUploadField from "../../../upload/VideoUploadField";
import MultiSelectField from "../../../upload/MultiSelectField";
import { uploadToCloudinary } from "../../../../api/admin/uploadApi";

export default function FormModal({ open, onClose, onSubmit, fields, title }) {

    const [formData, setFormData] = useState(
        fields.flat().reduce((acc, field) => {
            acc[field.name] = field.defaultValue ?? "";
            return acc;
        }, {})
    );

    console.log(formData);

    const [submitting, setSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");

    if (!open) return null;

    function handleChange(name, value) {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const payload = { ...formData };

            // ✅ Fix : fields.flat() car tableau 2D
            for (const field of fields.flat()) {
                if (field.type === "image" && Array.isArray(payload[field.name])) {
                    setUploadStatus("Envoi des images…");
                    const urls = await Promise.all(
                        payload[field.name].map(file => uploadToCloudinary(file, field.folder))
                    );
                    payload[field.name] = urls;
                }
                if (field.type === "video" && payload[field.name] instanceof File) {
                    setUploadStatus("Envoi de la vidéo…");
                    payload[field.name] = await uploadToCloudinary(payload[field.name], field.folder);
                }
            }

            setUploadStatus("Enregistrement…");
            await onSubmit(payload);
            onClose();
        } catch (err) {
            console.error(err);
            setUploadStatus("Erreur lors de l'enregistrement.");
        } finally {
            setSubmitting(false);
        }
    }

    // ✅ Style aligné sur InputComponent
    const sharedClass = "w-full px-4 py-2.5 rounded-md text-sm outline-none transition-all";
    const inputStyle = {
        boxShadow: "var(--shadow-normal)",
        color: "var(--text-secondary)",
    };
    const focusOn = e => {
        e.currentTarget.style.borderColor = "var(--brand-terre)";
        e.currentTarget.style.boxShadow = "0 0 8px rgba(217, 78, 43, 0.35)";
        e.currentTarget.style.backgroundColor = "var(--bg-card)";
    };
    const blurOff = e => {
        e.currentTarget.style.borderColor = "none";
        e.currentTarget.style.boxShadow = "var(--shadow-normal)";
        e.currentTarget.style.backgroundColor = "transparent";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(17, 17, 17, 0.45)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
                style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-card)" }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-abhaya-bold text-2xl" style={{ color: "var(--text-primary)" }}>
                        {title}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-xl leading-none cursor-pointer transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                    >✕</button>
                </div>

                <div className="flex flex-col gap-4">
                    {fields.map((group, i) => (
                        <div key={i} className="flex gap-4">
                            {group.map(field => (
                                <div key={field.name} className="flex flex-col gap-1 w-full">
                                    <label className="text-sm" style={{ color: "var(--text-secondary)" }}>
                                        {field.label}
                                    </label>

                                    {field.type === "textarea" ? (
                                        <textarea
                                            value={formData[field.name]}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            rows={4}
                                            className={`${sharedClass} resize-none`}
                                            style={inputStyle}
                                            onFocus={focusOn}
                                            onBlur={blurOff}
                                        />
                                    ) : field.type === "dropdown" ? (
                                        <select
                                            value={formData[field.name]}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            className={sharedClass}
                                            style={inputStyle}
                                            onFocus={focusOn}
                                            onBlur={blurOff}
                                        >
                                            <option value="">{field.placeholder}</option>
                                            {(field.options ?? []).map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === "multiselect" ? (
                                        <MultiSelectField
                                            value={formData[field.name]}
                                            onChange={val => handleChange(field.name, val)}
                                            options={field.options ?? []}
                                        />
                                    ) : field.type === "image" ? (
                                        <ImageUploadField
                                            value={formData[field.name]}
                                            onChange={files => handleChange(field.name, files)}
                                        />
                                    ) : field.type === "video" ? (
                                        <VideoUploadField
                                            value={formData[field.name] || null}
                                            onChange={file => handleChange(field.name, file)}
                                        />
                                    ) : (
                                        <input
                                            type={field.type ?? "text"}
                                            value={formData[field.name]}
                                            onChange={e => handleChange(field.name, e.target.value)}
                                            placeholder={field.placeholder}
                                            className={sharedClass}
                                            style={inputStyle}
                                            onFocus={focusOn}
                                            onBlur={blurOff}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    ))}
                </div>

                {uploadStatus && (
                    <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>{uploadStatus}</p>
                )}

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        onClick={onClose}
                        className="text-sm font-medium cursor-pointer transition-colors"
                        style={{
                            padding: "8px 16px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--cta-secondary-bg)",
                            color: "var(--cta-secondary-text)",
                            border: "1px solid var(--border-strong)",
                        }}
                    >Annuler</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="text-sm font-medium cursor-pointer transition-all"
                        style={{
                            padding: "8px 18px",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--cta-bg)",
                            color: "var(--cta-text)",
                            boxShadow: "var(--cta-shadow)",
                            border: "none",
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >{submitting ? "Traitement…" : "Enregistrer"}</button>
                </div>
            </div>
        </div>
    );
}