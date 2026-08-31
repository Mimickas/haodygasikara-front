import { Fragment, useEffect, useMemo, useState } from "react";
import { FaMagnifyingGlass, FaArrowRight } from "react-icons/fa6";
import { findAllCircuitClientApi } from "../../../api/client/cricuitApi";
import BaseMap from "../../../components/ui/map/BaseMap/BaseMap";

export default function ViewCircuit() {
    const [circuits, setCircuits] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [query, setQuery] = useState("");

    const loadCircuits = async () => {
        try {
            const res = await findAllCircuitClientApi();
            const data = res?.data ?? [];
            setCircuits(data);
            if (data.length) setSelectedId(data[0].id);
        } catch (error) { alert(error); }
    };

    useEffect(() => { loadCircuits(); }, []);

    const filtered = useMemo(
        () => circuits.filter((c) => (c.nom ?? "").toLowerCase().includes(query.toLowerCase())),
        [circuits, query]
    );

    const selected = circuits.find((c) => c.id === selectedId);

    if (!circuits.length) {
        return <div className="h-screen flex items-center justify-center" style={{ color: "var(--text-muted)" }}>Chargement…</div>;
    }

    return (
        <section className="h-screen w-full flex pt-20 relative" style={{ backgroundColor: "var(--bg)" }}>

            {/* ===== PANNEAU GAUCHE ===== */}
            <aside className="absolute h-full flex flex-col backdrop-blur-xs z-10" style={{ width: "440px", borderRight: "1px solid var(--border)"}}>

                {/* En-tête */}
                <div className="px-8 pt-10 pb-6" style={{ borderBottom: "1px solid var(--border)" }}>
                    <p className="font-body-strong text-[10px] uppercase tracking-[0.4em] mb-3" style={{ color: "var(--brand-ocre)" }}>
                        Nos itinéraires
                    </p>
                    <h1 className="font-title text-4xl leading-none mb-6" style={{ color: "var(--text-primary)" }}>
                        Explorez Madagascar
                    </h1>

                    {/* Recherche */}
                    <div className="flex items-center gap-3 px-4 py-3 rounded-md" style={{ backgroundColor: "var(--bg-sunken)" }}>
                        <FaMagnifyingGlass className="text-sm" style={{ color: "var(--text-muted)" }} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Rechercher un circuit…"
                            className="w-full bg-transparent outline-none text-sm font-body"
                            style={{ color: "var(--text-primary)" }}
                        />
                    </div>

                    <p className="mt-4 font-body text-xs uppercase tracking-[0.2em]" style={{ color: "var(--text-muted)" }}>
                        {filtered.length} circuit{filtered.length > 1 ? "s" : ""}
                    </p>
                </div>

                {/* Liste scrollable */}
                <div className="flex-1 overflow-auto flex flex-col gap-4">
                    {filtered.map((c) => {
                        const steps = c.steps ?? [];
                        const depart = steps[0]?.place?.nom;
                        const arrivee = steps[steps.length - 1]?.place?.nom;
                        const jours = steps.reduce((s, st) => s + (st.durationDays ?? 0), 0);
                        const isActive = c.id === selectedId;

                        return (
                            <Fragment>

                                <div
                                    key={c.id}
                                    onClick={() => setSelectedId(c.id)}
                                    className="group text-left rounded-lg overflow-hidden transition-all duration-300 px-4 py-4 "
                                >
                                    {/* Image */}
                                    <div className="relative overflow-hidden" style={{ height: "150px" }}>
                                        {c.imageUrl ? (
                                            <img src={c.imageUrl} alt={c.nom} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: "var(--bg-sunken)" }}>
                                                <span className="text-xs" style={{ color: "var(--text-muted)" }}>Pas d'image</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Infos */}
                                    <div className="py-5">
                                        <h3 className="font-title text-2xl leading-tight mb-2" style={{ color: "var(--text-primary)" }}>
                                            {c.nom}
                                        </h3>
                                        {depart && arrivee && (
                                            <p className="font-body text-xs uppercase tracking-[0.15em]" style={{ color: "var(--text-muted)" }}>
                                                {depart} → {arrivee}
                                            </p>
                                        )}
                                    </div>

                                </div>
                                <div style={{borderBottom: "1px solid var(--border)"}}></div>
                            </Fragment>
                        );
                    })}
                </div>
            </aside>

            {/* ===== CARTE À DROITE ===== */}
            <div className="flex-1 h-full">
                <BaseMap circuit={selected} />
            </div>
        </section>
    );
}