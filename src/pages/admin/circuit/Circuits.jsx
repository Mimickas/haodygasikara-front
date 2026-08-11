import { useMemo, useState } from "react";
import {
    FaPlus,
    FaMagnifyingGlass,
    FaPen,
    FaTrash,
    FaXmark,
    FaRoute,
    FaLocationDot,
} from "react-icons/fa6";

/* --------------------------------- Données de départ -------------------------------- */

const SEED = [
    {
        id: 1,
        nom: "Nord sauvage & Nosy Be",
        client: "Marc Leroy",
        email: "marc.leroy@mail.com",
        arrivee: "2026-08-10",
        depart: "2026-08-19",
        statut: "Nouveau",
        prix: 4200,
        etapes: ["Diego Suarez", "Montagne d'Ambre", "Nosy Be", "Nosy Iranja"],
    },
    {
        id: 2,
        nom: "Route du Sud & Isalo",
        client: "Sofia Rakoto",
        email: "sofia.rakoto@mail.com",
        arrivee: "2026-09-02",
        depart: "2026-09-14",
        statut: "En cours",
        prix: 5100,
        etapes: ["Antananarivo", "Antsirabe", "Ranomafana", "Isalo", "Tuléar"],
    },
    {
        id: 3,
        nom: "Andasibe & côte Est",
        client: "Lena Fischer",
        email: "lena.f@mail.com",
        arrivee: "2026-08-05",
        depart: "2026-08-11",
        statut: "Confirmé",
        prix: 2800,
        etapes: ["Andasibe", "Mantadia", "Tamatave"],
    },
];

const STATUTS = ["Nouveau", "En cours", "Confirmé", "Annulé"];

const STATUT_STYLE = {
    Nouveau: { bg: "var(--warning-bg)", text: "var(--warning-text)" },
    "En cours": { bg: "var(--info-bg)", text: "var(--info-text)" },
    Confirmé: { bg: "var(--success-bg)", text: "var(--success-text)" },
    Annulé: { bg: "var(--error-bg)", text: "var(--error-text)" },
};

const EMPTY = {
    nom: "",
    client: "",
    email: "",
    arrivee: "",
    depart: "",
    statut: "Nouveau",
    prix: "",
    etapes: [""],
};

/* ------------------------------------- Helpers -------------------------------------- */

function nbJours(arrivee, depart) {
    if (!arrivee || !depart) return 0;
    const d = (new Date(depart) - new Date(arrivee)) / 86400000;
    return d > 0 ? Math.round(d) : 0;
}

function formatDate(d) {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

/* --------------------------------------- Vue ---------------------------------------- */

export default function Circuits() {
    const [circuits, setCircuits] = useState(SEED);
    const [search, setSearch] = useState("");
    const [filtre, setFiltre] = useState("Tous");

    const [modalOpen, setModalOpen] = useState(false);
    const [editId, setEditId] = useState(null); // null = création
    const [form, setForm] = useState(EMPTY);
    const [erreur, setErreur] = useState("");

    const [toDelete, setToDelete] = useState(null);

    /* --------- Filtrage --------- */
    const liste = useMemo(() => {
        return circuits.filter((c) => {
            const matchSearch =
                c.nom.toLowerCase().includes(search.toLowerCase()) ||
                c.client.toLowerCase().includes(search.toLowerCase());
            const matchFiltre = filtre === "Tous" || c.statut === filtre;
            return matchSearch && matchFiltre;
        });
    }, [circuits, search, filtre]);

    /* --------- Ouverture modale --------- */
    function ouvrirCreation() {
        setEditId(null);
        setForm(EMPTY);
        setErreur("");
        setModalOpen(true);
    }

    function ouvrirEdition(c) {
        setEditId(c.id);
        setForm({
            nom: c.nom,
            client: c.client,
            email: c.email,
            arrivee: c.arrivee,
            depart: c.depart,
            statut: c.statut,
            prix: String(c.prix),
            etapes: c.etapes.length ? [...c.etapes] : [""],
        });
        setErreur("");
        setModalOpen(true);
    }

    /* --------- Étapes dynamiques --------- */
    function setEtape(i, val) {
        setForm((f) => {
            const etapes = [...f.etapes];
            etapes[i] = val;
            return { ...f, etapes };
        });
    }
    function ajouterEtape() {
        setForm((f) => ({ ...f, etapes: [...f.etapes, ""] }));
    }
    function retirerEtape(i) {
        setForm((f) => ({ ...f, etapes: f.etapes.filter((_, idx) => idx !== i) }));
    }

    /* --------- Enregistrement --------- */
    function enregistrer() {
        setErreur("");
        if (!form.nom.trim() || !form.client.trim()) {
            setErreur("Le nom du circuit et le client sont obligatoires.");
            return;
        }
        if (!form.arrivee || !form.depart) {
            setErreur("Les dates d'arrivée et de départ sont obligatoires.");
            return;
        }
        if (nbJours(form.arrivee, form.depart) <= 0) {
            setErreur("La date de départ doit être après l'arrivée.");
            return;
        }

        const etapes = form.etapes.map((e) => e.trim()).filter(Boolean);
        const payload = {
            nom: form.nom.trim(),
            client: form.client.trim(),
            email: form.email.trim(),
            arrivee: form.arrivee,
            depart: form.depart,
            statut: form.statut,
            prix: Number(form.prix) || 0,
            etapes,
        };

        if (editId === null) {
            const id = Math.max(0, ...circuits.map((c) => c.id)) + 1;
            setCircuits((prev) => [{ id, ...payload }, ...prev]);
        } else {
            setCircuits((prev) => prev.map((c) => (c.id === editId ? { id: editId, ...payload } : c)));
        }
        setModalOpen(false);
    }

    /* --------- Suppression --------- */
    function confirmerSuppression() {
        setCircuits((prev) => prev.filter((c) => c.id !== toDelete.id));
        setToDelete(null);
    }

    const jours = nbJours(form.arrivee, form.depart);

    return (
        <div className="pt-2">
            {/* Barre d'actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    {liste.length} circuit{liste.length > 1 ? "s" : ""}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                    {/* Recherche */}
                    <div
                        className="flex items-center gap-2 h-11 px-4 rounded-xl"
                        style={{ backgroundColor: "var(--bg-card)" }}
                    >
                        <FaMagnifyingGlass className="text-sm" style={{ color: "var(--text-muted)" }} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher…"
                            className="bg-transparent outline-none text-sm w-40"
                            style={{ color: "var(--text-primary)" }}
                        />
                    </div>

                    {/* Filtre statut */}
                    <select
                        value={filtre}
                        onChange={(e) => setFiltre(e.target.value)}
                        className="h-11 px-4 rounded-xl text-sm outline-none cursor-pointer"
                        style={{ backgroundColor: "var(--bg-card)", color: "var(--text-secondary)" }}
                    >
                        <option value="Tous">Tous les statuts</option>
                        {STATUTS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>

                    {/* Nouveau */}
                    <button
                        onClick={ouvrirCreation}
                        className="h-11 px-5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors"
                        style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                    >
                        <FaPlus className="text-xs" />
                        Nouveau circuit
                    </button>
                </div>
            </div>

            {/* Tableau */}
            <div
                className="rounded-2xl overflow-hidden"
                style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-soft)" }}
            >
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr style={{ color: "var(--text-muted)", backgroundColor: "var(--bg-sunken)" }} className="text-left">
                                <th className="font-medium px-6 py-4">Circuit</th>
                                <th className="font-medium px-6 py-4">Client</th>
                                <th className="font-medium px-6 py-4">Séjour</th>
                                <th className="font-medium px-6 py-4">Étapes</th>
                                <th className="font-medium px-6 py-4">Statut</th>
                                <th className="font-medium px-6 py-4">Prix est.</th>
                                <th className="font-medium px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {liste.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-16 text-center">
                                        <FaRoute className="mx-auto text-2xl mb-3" style={{ color: "var(--text-muted)" }} />
                                        <p style={{ color: "var(--text-secondary)" }}>Aucun circuit ne correspond.</p>
                                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                                            Créez-en un avec « Nouveau circuit ».
                                        </p>
                                    </td>
                                </tr>
                            )}
                            {liste.map((c) => {
                                const st = STATUT_STYLE[c.statut];
                                return (
                                    <tr key={c.id} style={{ borderTop: "1px solid var(--border-muted)" }}>
                                        <td className="px-6 py-4">
                                            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>{c.nom}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p style={{ color: "var(--text-secondary)" }}>{c.client}</p>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{c.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p style={{ color: "var(--text-secondary)" }}>
                                                {formatDate(c.arrivee)} → {formatDate(c.depart)}
                                            </p>
                                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                                                {nbJours(c.arrivee, c.depart)} jours
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg"
                                                style={{ backgroundColor: "var(--bg-sunken)", color: "var(--text-secondary)" }}
                                            >
                                                <FaLocationDot style={{ color: "var(--brand-terre)" }} />
                                                {c.etapes.length}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                                                style={{ backgroundColor: st.bg, color: st.text }}
                                            >
                                                {c.statut}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-semibold" style={{ color: "var(--text-primary)" }}>
                                            {c.prix.toLocaleString("fr-FR")} €
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => ouvrirEdition(c)}
                                                    aria-label="Modifier"
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                                                    style={{ color: "var(--text-secondary)" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                                >
                                                    <FaPen className="text-sm" />
                                                </button>
                                                <button
                                                    onClick={() => setToDelete(c)}
                                                    aria-label="Supprimer"
                                                    className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                                                    style={{ color: "var(--error-text)" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--error-bg)")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                                                >
                                                    <FaTrash className="text-sm" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* -------------------------- Modale création / édition -------------------------- */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(17, 17, 17, 0.45)" }}
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto"
                        style={{ backgroundColor: "var(--bg-card)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* En-tête modale */}
                        <div className="flex items-center justify-between px-6 py-5">
                            <h3 className="font-abhaya-bold text-2xl" style={{ color: "var(--text-primary)" }}>
                                {editId === null ? "Nouveau circuit" : "Modifier le circuit"}
                            </h3>
                            <button
                                onClick={() => setModalOpen(false)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                            >
                                <FaXmark />
                            </button>
                        </div>

                        <div className="px-6 pb-6 flex flex-col gap-4">
                            {erreur && (
                                <p
                                    className="text-sm px-3 py-2 rounded-lg"
                                    style={{ color: "var(--error-text)", backgroundColor: "var(--error-bg)" }}
                                >
                                    {erreur}
                                </p>
                            )}

                            <Field label="Nom du circuit">
                                <Input value={form.nom} onChange={(v) => setForm({ ...form, nom: v })} placeholder="Ex : Route du Sud & Isalo" />
                            </Field>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Client">
                                    <Input value={form.client} onChange={(v) => setForm({ ...form, client: v })} placeholder="Nom complet" />
                                </Field>
                                <Field label="Email">
                                    <Input type="email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="client@mail.com" />
                                </Field>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Arrivée">
                                    <Input type="date" value={form.arrivee} onChange={(v) => setForm({ ...form, arrivee: v })} />
                                </Field>
                                <Field label="Départ">
                                    <Input type="date" value={form.depart} onChange={(v) => setForm({ ...form, depart: v })} />
                                </Field>
                            </div>

                            {jours > 0 && (
                                <p className="text-sm -mt-1" style={{ color: "var(--text-muted)" }}>
                                    Durée du séjour : <span style={{ color: "var(--brand-terre)", fontWeight: 600 }}>{jours} jours</span>
                                </p>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Statut">
                                    <select
                                        value={form.statut}
                                        onChange={(e) => setForm({ ...form, statut: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none cursor-pointer"
                                        style={{ backgroundColor: "var(--bg-sunken)", color: "var(--text-primary)" }}
                                    >
                                        {STATUTS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </Field>
                                <Field label="Prix estimé (€)">
                                    <Input type="number" value={form.prix} onChange={(v) => setForm({ ...form, prix: v })} placeholder="0" />
                                </Field>
                            </div>

                            {/* Étapes */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                                        Étapes du circuit
                                    </label>
                                    <button
                                        onClick={ajouterEtape}
                                        className="text-sm font-semibold flex items-center gap-1"
                                        style={{ color: "var(--brand-terre)" }}
                                    >
                                        <FaPlus className="text-xs" /> Ajouter
                                    </button>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {form.etapes.map((e, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <span
                                                className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold"
                                                style={{ backgroundColor: "var(--bg-sunken)", color: "var(--text-muted)" }}
                                            >
                                                {i + 1}
                                            </span>
                                            <Input value={e} onChange={(v) => setEtape(i, v)} placeholder="Destination / étape" />
                                            {form.etapes.length > 1 && (
                                                <button
                                                    onClick={() => retirerEtape(i)}
                                                    aria-label="Retirer l'étape"
                                                    className="w-9 h-9 shrink-0 rounded-lg flex items-center justify-center transition-colors"
                                                    style={{ color: "var(--error-text)" }}
                                                    onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = "var(--error-bg)")}
                                                    onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = "transparent")}
                                                >
                                                    <FaXmark className="text-sm" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions modale */}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    onClick={() => setModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                                    style={{ backgroundColor: "var(--cta-secondary-bg)", color: "var(--cta-secondary-text)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-secondary-bg-hover)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-secondary-bg)")}
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={enregistrer}
                                    className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                    style={{ backgroundColor: "var(--cta-bg)", color: "var(--cta-text)" }}
                                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)")}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--cta-bg)")}
                                >
                                    {editId === null ? "Créer le circuit" : "Enregistrer"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ----------------------------- Confirmation suppression ----------------------------- */}
            {toDelete && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ backgroundColor: "rgba(17, 17, 17, 0.45)" }}
                    onClick={() => setToDelete(null)}
                >
                    <div
                        className="w-full max-w-sm rounded-2xl p-6"
                        style={{ backgroundColor: "var(--bg-card)" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                            style={{ backgroundColor: "var(--error-bg)", color: "var(--error-text)" }}
                        >
                            <FaTrash />
                        </div>
                        <h3 className="font-abhaya-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>
                            Supprimer ce circuit ?
                        </h3>
                        <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                            « {toDelete.nom} » sera définitivement retiré. Cette action est irréversible.
                        </p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setToDelete(null)}
                                className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                                style={{ backgroundColor: "var(--cta-secondary-bg)", color: "var(--cta-secondary-text)" }}
                            >
                                Annuler
                            </button>
                            <button
                                onClick={confirmerSuppression}
                                className="flex-1 py-2.5 rounded-lg text-sm font-bold transition-colors"
                                style={{ backgroundColor: "var(--brand-terre)", color: "#FFFFFF" }}
                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-terre-600)")}
                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "var(--brand-terre)")}
                            >
                                Supprimer
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ----------------------------- Petits composants internes ---------------------------- */

function Field({ label, children }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
                {label}
            </label>
            {children}
        </div>
    );
}

function Input({ value, onChange, placeholder, type = "text" }) {
    return (
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-lg text-sm outline-none transition-colors"
            style={{ backgroundColor: "var(--bg-sunken)", color: "var(--text-primary)", border: "2px solid transparent" }}
            onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--brand-terre)";
                e.currentTarget.style.backgroundColor = "var(--bg-card)";
            }}
            onBlur={(e) => {
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.backgroundColor = "var(--bg-sunken)";
            }}
        />
    );
}