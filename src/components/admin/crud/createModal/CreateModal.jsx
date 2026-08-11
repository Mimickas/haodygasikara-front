import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Button from "../../../ui/button/Button";
import InputComponent from "../../../ui/input/InputComponent";
import TextareaComponent from "../../../ui/input/TextareaComponent";
import VideoUploadField from "../../../upload/VideoUploadField";
import MultiSelectField from "../../../upload/MultiSelectField";
import ImageUploadField from "../../../upload/ImageUploadField";

export default function CreateModal({ onSubmit }) {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { fields } = state;

    const [formData, setFormData] = useState(
        fields.flat().reduce((acc, field) => {
            acc[field.name] = field.defaultValue ?? "";
            return acc;
        }, {})
    );

    function handleChange(name, value) {
        setFormData(prev => ({ ...prev, [name]: value }));
    }

    function renderField(field) {
        switch (field.type) {
            case "textarea":
                return (
                    <TextareaComponent
                        value={formData[field.name]}
                        setValue={val => handleChange(field.name, val)}
                        placeholder={field.placeholder}
                    />
                );
            case "image":
                return (
                    <ImageUploadField
                        value={formData[field.name]}
                        onChange={val => handleChange(field.name, val)}
                    />
                );
            case "video":
                return (
                    <VideoUploadField
                        value={formData[field.name] || null}
                        onChange={val => handleChange(field.name, val)}
                    />
                );
                case "dropdown":                                      // ← ajouter
            return (
                <select
                    value={formData[field.name]}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    className="w-full px-3 py-2 text-sm outline-none rounded-md"
                    style={{
                        backgroundColor: "var(--bg)",
                        border: "1px solid var(--border)",
                        color: "var(--text-primary)",
                        borderRadius: "var(--radius-md)",
                    }}
                >
                    <option value="">{field.placeholder}</option>
                    {(field.options ?? []).map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            );
            case "multiselect":
                return (
                    <MultiSelectField
                        value={formData[field.name]}
                        onChange={val => handleChange(field.name, val)}
                        options={field.options ?? []}
                    />
                );
            default:
                return (
                    <InputComponent
                        type={field.type}
                        value={formData[field.name]}
                        setValue={val => handleChange(field.name, val)}
                        placeholder={field.placeholder}
                    />
                );
        }
    }

    return (
        <div className="my-5 w-full">

        <div className="pr-74"> 
            <div className="p-6" style={{ backgroundColor: "var(--bg-card)", borderRadius: "var(--radius-lg)", boxShadow: "var(--shadow-soft)" }}>
                {fields.map((group, index) => (
                    <div key={index} className="flex gap-4 w-full">
                        {group.map((field, fieldIndex) => (
                            <div key={fieldIndex} className="mb-4 w-full">
                                <label className="block text-sm font-medium mb-1" style={{ color: "var(--text-secondary)" }}>
                                    {field.label}
                                </label>
                                {renderField(field)}
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        </div>

        <div className="fixed top-24 right-6 w-70 flex flex-col gap-4" style={{ zIndex: 50 }}>
            <Button className="w-full" value="Valider" onClick={() => onSubmit?.(formData)} />
            <Button className="w-full" value="Annuler" variant="outline" onClick={() => navigate(-1)} />
        </div>

    </div>
    );
}