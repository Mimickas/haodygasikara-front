import { useEffect, useState } from "react";
import ImageUploadField from "../../../upload/ImageUploadField";
import VideoUploadField from "../../../upload/VideoUploadField";
import { uploadToCloudinary } from "../../../../api/admin/uploadApi";
import MultiSelectField from "../createModal/MultiSelectField";

export default function FormModal({ open, onClose, onSubmit, fields,value, title }) {

    const buildFormData = (val) =>
        fields.flat().reduce((acc, field) => {
            acc[field.name] = val?.[field.name] ?? field.defaultValue ?? "";
            return acc;
        }, {});

    const [formData, setFormData] = useState(() => buildFormData(value));

    useEffect(() => {
        setFormData(buildFormData(value));
    }, [value]);

    console.log(formData);

    const [submitting, setSubmitting] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("");

    if (!open) return null;

    function handleChange(name, value) {
        setFormData(prev => {
            const next = { ...prev, [name]: value };
            // ← changer un champ vide ceux qui en dépendent, et leurs propres dépendants :
            //   un POI d'une autre destination ne doit pas rester sélectionné
            let parents = [name];
            while (parents.length) {
                const enfants = fields.flat().filter(f => parents.includes(f.dependsOn));
                enfants.forEach(f => { next[f.name] = f.defaultValue ?? ""; });
                parents = enfants.map(f => f.name);
            }
            return next;
        });
    }

    // ← un champ `dependsOn` ne propose que les options dont le parent est la valeur choisie
    //   dans ce champ-là (ex : les hébergements de la destination de l'étape sélectionnée)
    const optionsOf = (field) => field.dependsOn
        ? (field.options ?? []).filter(opt => String(opt.parent) === String(formData[field.dependsOn]))
        : (field.options ?? []);

    async function handleSubmit() {
        setSubmitting(true);
        try {
            const payload = { ...formData };

            // ✅ Fix : fields.flat() car tableau 2D
            for (const field of fields.flat()) {
                if (field.type === "image" && Array.isArray(payload[field.name])) {
                    setUploadStatus("Envoi des images…");
                    const urls = await Promise.all(
                        payload[field.name].map(file => typeof file === "string"
                            ? file                                        // ← déjà en ligne : on ne ré-uploade pas une image existante
                            : uploadToCloudinary(file, field.folder))
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
    const sharedClass = "w-full px-4 py-3 font-body text-sm outline-none transition-colors";
    // ← angle vif et filet d'un pixel : le focus passe le filet en terre, sans halo
    const inputStyle = {
        backgroundColor: "var(--bg)",
        border: "1px solid var(--border-strong)",
        color: "var(--text-primary)",
    };
    const focusOn = e => {
        e.currentTarget.style.borderColor = "var(--brand-terre)";
        e.currentTarget.style.backgroundColor = "var(--bg-card)";
    };
    const blurOff = e => {
        e.currentTarget.style.borderColor = "var(--border-strong)";
        e.currentTarget.style.backgroundColor = "var(--bg)";
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(37, 26, 18, 0.45)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg max-h-[90vh] overflow-y-auto scroll-fine"
                style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border)" }}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-6 px-8 pt-7 pb-5" style={{ borderBottom: "1px solid var(--border)" }}>
                    <div>
                        <p className="font-body-strong text-[11px] uppercase leading-none mb-3" style={{ color: "var(--brand-terre)", letterSpacing: "0.1em" }}>
                            Haodygasikara
                        </p>
                        <h2 className="font-title text-3xl leading-none" style={{ color: "var(--text-primary)" }}>
                            {title}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 -mr-2 flex items-center justify-center text-base leading-none cursor-pointer transition-colors"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "var(--text-primary)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}
                    >✕</button>
                </div>

                <div className="flex flex-col gap-5 px-8 py-6">
                    {fields.map((group, i) => (
                        <div key={i} className="flex gap-4">
                            {group.map(field => (
                                <div key={field.name} className="flex flex-col gap-2 w-full">
                                    <label className="font-body-strong text-[11px] uppercase leading-none" style={{ color: "var(--text-muted)", letterSpacing: "0.1em" }}>
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
                                            {optionsOf(field).map(opt => (
                                                <option key={opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    ) : field.type === "multiselect" ? (
                                        <MultiSelectField
                                            value={formData[field.name]}
                                            onChange={val => handleChange(field.name, val)}
                                            options={optionsOf(field)}
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
                    <p className="font-body text-sm px-8 pb-2" style={{ color: "var(--text-muted)" }}>{uploadStatus}</p>
                )}

                <div className="flex justify-end gap-2 px-8 py-5" style={{ borderTop: "1px solid var(--border)" }}>
                    <button
                        onClick={onClose}
                        className="h-10 px-6 font-body-strong text-[11px] uppercase cursor-pointer transition-colors"
                        style={{
                            letterSpacing: "0.1em",
                            backgroundColor: "transparent",
                            color: "var(--cta-outline-text)",
                            border: "1px solid var(--cta-outline-border)",
                        }}
                    >Annuler</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="h-10 px-7 font-body-strong text-[11px] uppercase cursor-pointer transition-colors"
                        style={{
                            letterSpacing: "0.1em",
                            backgroundColor: "var(--cta-bg)",
                            color: "var(--cta-text)",
                            border: "1px solid var(--cta-bg)",
                            opacity: submitting ? 0.6 : 1,
                        }}
                    >{submitting ? "Traitement…" : "Enregistrer"}</button>
                </div>
            </div>
        </div>
    );
}