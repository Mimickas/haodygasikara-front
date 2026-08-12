import { useState } from "react";
import SelectComponent from "../../../ui/input/SelectComponent";
import InputComponent from "../../../ui/input/InputComponent";
import { FaXmark } from "react-icons/fa6";

const template = {
    id: "",
    duration: "",
};

export default function MultiDropDownCircuitStep({
    value = [],
    onChange,
    options = []
}) {
    const [values, setValues] = useState(
        value.length > 0 ? value : [{ ...template }]
    );

    const updateValues = (updated) => {
        setValues(updated);
        onChange?.(updated);
    };

    const addRow = () => {
        updateValues([
            ...values,
            { ...template }
        ]);
    };

    const removeRow = (index) => {
        updateValues(
            values.filter((_, i) => i !== index)
        );
    };

    console.log("steps:", values);

    return (
        <>
            <div>
                <button
                    className="bg-blue-500 w-[100px] hover:bg-blue-700 text-white font-bold rounded mb-4"
                    type="button"
                    onClick={addRow}
                >
                    Add Row
                </button>
            </div>

            <div className="flex w-full flex-col gap-2">
                {values.map((val, index) => (
                    <div
                        key={index}
                        className="flex gap-4 items-center"
                    >
                        <div
                            className="
                                w-8 h-8 
                                shrink-0 
                                rounded-full
                                flex items-center justify-center
                                bg-[var(--bg-secondary)]
                            "
                            style={{
                                color: "var(--text-secondary)"
                            }}
                        >
                            {index + 1}
                        </div>

                        <SelectComponent
                            value={val.id}
                            onChange={(e) => {
                                const updated = values.map((v, i) =>
                                    i === index
                                        ? {
                                            ...v,
                                            id: e.target.value
                                        }
                                        : v
                                );

                                updateValues(updated);
                            }}
                            options={options.filter(opt =>
                                !values.some((v, i) =>
                                    String(v.id) === String(opt.value) &&
                                    i !== index
                                )
                            )}
                        />

                        <input
                            type="number"
                            value={val.duration}
                            onChange={(e) => {
                                const updated = values.map((v, i) =>
                                    i === index
                                        ? {
                                            ...v,
                                            duration: e.target.value
                                        }
                                        : v
                                );

                                updateValues(updated);
                            }}
                            className="w-full px-4 py-2.5 rounded-md text-sm outline-none transition-all"
                            style={{
                                boxShadow: "var(--shadow-normal)",
                                color: "var(--text-secondary)",
                            }}
                            placeholder="Nombre de jours"
                        />

                        <div>
                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                disabled={index === 0}
                                title="Supprimer"
                                className="
                                    flex items-center justify-center
                                    w-8 h-8
                                    rounded-full
                                    text-red-500
                                    hover:bg-red-100
                                    hover:text-red-700
                                    transition-all duration-200
                                    disabled:opacity-30
                                    disabled:cursor-not-allowed
                                "
                            >
                                <FaXmark className="text-sm" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}