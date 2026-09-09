import { useRef, useState } from "react";
import SelectComponent from "../../../ui/input/SelectComponent";
import { FaXmark, FaGripVertical } from "react-icons/fa6";

const template = {
    id: "",
    duration: "",
};

// Zone (en px) au bord de la liste qui declenche le defilement auto pendant le drag
const AUTO_SCROLL_ZONE = 56;

export default function MultiDropDownCircuitStep({
    value = [],
    onChange,
    options = []
}) {
    const [values, setValues] = useState(
        value.length > 0 ? value : [{ ...template }]
    );

    // index de la ligne en cours de deplacement
    const [dragIndex, setDragIndex] = useState(null);
    // position d'insertion visee (0..values.length)
    const [dropIndex, setDropIndex] = useState(null);
    // ligne dont le badge est passe en saisie de position
    const [editingPos, setEditingPos] = useState(null);
    const [posDraft, setPosDraft] = useState("");

    const listRef = useRef(null);
    const pointerYRef = useRef(0);
    const rafRef = useRef(null);

    const updateValues = (updated) => {
        setValues(updated);
        onChange?.(updated);
    };

    const addRow = () => {
        updateValues([...values, { ...template }]);
        // la liste scrolle toute seule sur la nouvelle etape
        requestAnimationFrame(() => {
            const el = listRef.current;
            if (el) el.scrollTop = el.scrollHeight;
        });
    };

    const removeRow = (index) => {
        updateValues(values.filter((_, i) => i !== index));
    };

    const patchRow = (index, patch) => {
        updateValues(
            values.map((v, i) => (i === index ? { ...v, ...patch } : v))
        );
    };

    // Deplace la ligne "from" vers la position d'insertion "insertAt" (0..length)
    const moveRow = (from, insertAt) => {
        if (from === null || insertAt === null) return;

        const target = insertAt > from ? insertAt - 1 : insertAt;
        if (target === from || target < 0 || target >= values.length) return;

        const next = [...values];
        const [item] = next.splice(from, 1);
        next.splice(target, 0, item);
        updateValues(next);
    };

    /* ---------- defilement automatique pendant le drag ---------- */

    const startAutoScroll = () => {
        if (rafRef.current) return;

        const tick = () => {
            const el = listRef.current;
            if (el) {
                const { top, bottom } = el.getBoundingClientRect();
                const y = pointerYRef.current;
                const distTop = y - top;
                const distBottom = bottom - y;

                if (distTop < AUTO_SCROLL_ZONE) {
                    el.scrollTop -= Math.max(6, (AUTO_SCROLL_ZONE - distTop) / 3);
                } else if (distBottom < AUTO_SCROLL_ZONE) {
                    el.scrollTop += Math.max(6, (AUTO_SCROLL_ZONE - distBottom) / 3);
                }
            }
            rafRef.current = requestAnimationFrame(tick);
        };

        rafRef.current = requestAnimationFrame(tick);
    };

    const stopAutoScroll = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
    };

    const endDrag = () => {
        stopAutoScroll();
        setDragIndex(null);
        setDropIndex(null);
    };

    /* ---------- saisie directe d'une position ---------- */

    const openPosEditor = (index) => {
        setEditingPos(index);
        setPosDraft(String(index + 1));
    };

    const commitPos = (index) => {
        const wanted = parseInt(posDraft, 10);
        setEditingPos(null);

        if (Number.isNaN(wanted)) return;

        const clamped = Math.min(Math.max(wanted, 1), values.length);
        // insertAt s'exprime avant le retrait de la ligne deplacee
        moveRow(index, clamped - 1 > index ? clamped : clamped - 1);
    };

    return (
        <>
            <div className="flex items-center justify-between gap-4 mb-2">
                <button
                    className="bg-blue-500 px-3 py-1.5 text-xs hover:bg-blue-700 text-white font-bold rounded"
                    type="button"
                    onClick={addRow}
                >
                    Ajouter une etape
                </button>

                <span className="text-[11px]" style={{ color: "var(--text-secondary)" }}>
                    Glisser la poignee pour reordonner - cliquer sur le numero pour saisir une position
                </span>
            </div>

            <div
                ref={listRef}
                className="flex w-full flex-col max-h-[46vh] overflow-y-auto overscroll-contain pr-1"
                onDragOver={(e) => {
                    // indispensable pour autoriser le drop dans la liste
                    e.preventDefault();
                    pointerYRef.current = e.clientY;
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    moveRow(dragIndex, dropIndex);
                    endDrag();
                }}
            >
                {values.map((val, index) => {
                    const isDragged = dragIndex === index;
                    const showLineBefore = dragIndex !== null && dropIndex === index;
                    const showLineAfter =
                        dragIndex !== null &&
                        dropIndex === values.length &&
                        index === values.length - 1;

                    return (
                        <div
                            key={index}
                            draggable={dragIndex === index}
                            onDragStart={(e) => {
                                e.dataTransfer.effectAllowed = "move";
                                // Firefox exige une donnee pour demarrer le drag
                                e.dataTransfer.setData("text/plain", String(index));
                                pointerYRef.current = e.clientY;
                                startAutoScroll();
                            }}
                            onDragEnd={endDrag}
                            onDragOver={(e) => {
                                e.preventDefault();
                                if (dragIndex === null) return;

                                pointerYRef.current = e.clientY;

                                const rect = e.currentTarget.getBoundingClientRect();
                                const after = e.clientY > rect.top + rect.height / 2;
                                setDropIndex(after ? index + 1 : index);
                            }}
                            className="flex gap-2 items-center py-0.5"
                            style={{
                                opacity: isDragged ? 0.4 : 1,
                                borderTop: showLineBefore
                                    ? "2px solid var(--text-secondary)"
                                    : "2px solid transparent",
                                borderBottom: showLineAfter
                                    ? "2px solid var(--text-secondary)"
                                    : "2px solid transparent",
                            }}
                        >
                            <button
                                type="button"
                                title="Glisser pour deplacer (fleches haut / bas au clavier)"
                                onMouseDown={() => setDragIndex(index)}
                                onMouseUp={() => {
                                    if (dropIndex === null) setDragIndex(null);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "ArrowUp") {
                                        e.preventDefault();
                                        moveRow(index, index - 1);
                                    } else if (e.key === "ArrowDown") {
                                        e.preventDefault();
                                        moveRow(index, index + 2);
                                    }
                                }}
                                className="shrink-0 cursor-grab active:cursor-grabbing px-1 opacity-40 hover:opacity-100 transition-opacity"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                <FaGripVertical className="text-xs" />
                            </button>

                            {editingPos === index ? (
                                <input
                                    autoFocus
                                    type="number"
                                    min={1}
                                    max={values.length}
                                    value={posDraft}
                                    onChange={(e) => setPosDraft(e.target.value)}
                                    onBlur={() => commitPos(index)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") commitPos(index);
                                        if (e.key === "Escape") setEditingPos(null);
                                    }}
                                    className="w-7 h-7 shrink-0 rounded-full text-center text-xs outline-none"
                                    style={{
                                        backgroundColor: "var(--bg-secondary)",
                                        color: "var(--text-secondary)",
                                    }}
                                />
                            ) : (
                                <button
                                    type="button"
                                    title="Cliquer pour saisir une position"
                                    onClick={() => openPosEditor(index)}
                                    className="w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs bg-[var(--bg-secondary)] hover:ring-1 hover:ring-[var(--text-secondary)]"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    {index + 1}
                                </button>
                            )}

                            <SelectComponent
                                className="py-1.5!"
                                value={val.id}
                                onChange={(e) => patchRow(index, { id: e.target.value })}
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
                                onChange={(e) => patchRow(index, { duration: e.target.value })}
                                className="w-28 shrink-0 px-2 py-1.5 rounded-md text-sm outline-none transition-all"
                                style={{
                                    boxShadow: "var(--shadow-normal)",
                                    color: "var(--text-secondary)",
                                }}
                                placeholder="Jours"
                            />

                            <button
                                type="button"
                                onClick={() => removeRow(index)}
                                disabled={values.length === 1}
                                title="Supprimer"
                                className="
                                    shrink-0
                                    flex items-center justify-center
                                    w-7 h-7
                                    rounded-full
                                    text-red-500
                                    hover:bg-red-100
                                    hover:text-red-700
                                    transition-all duration-200
                                    disabled:opacity-30
                                    disabled:cursor-not-allowed
                                "
                            >
                                <FaXmark className="text-xs" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
