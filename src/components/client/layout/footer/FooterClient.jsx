import { Link } from "react-router-dom";

export default function FooterClient() {
    const liens = [
        { label: "Accueil", to: "/" },
        { label: "Circuits", to: "/circuits" },
        { label: "Créer mon circuit", to: "/circuits/create" },
    ];

    return (
        <footer style={{ backgroundColor: "var(--bg)" }}>
            <div className="max-w-6xl mx-auto px-8 py-14">
                <div className="flex justify-between gap-8">

                    {/* Marque */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <img src="/img/logo/logo-2-horizontal.png" alt="Haodygasikara" className="w-40 rounded-full object-cover" />
                       
                        </div>
                        <p className="font-body text-sm leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>
                            Tour-opérateur basé à Toamasina, spécialiste d'un Madagascar authentique, éthique et solidaire.
                        </p>
                    </div>

                    {/* Contact */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-body-strong text-base mb-1" style={{ color: "var(--text)" }}>
                            Nous contacter
                        </h3>
                        <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            Villa Saphir, Toamasina 501<br />Madagascar
                        </p>
                        <p className="font-body text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            +261 34 27 013 74<br />contact@haodygasikara.com
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <h3 className="font-body-strong text-base mb-1" style={{ color: "var(--text)" }}>
                            Explorer
                        </h3>
                        {liens.map((lien) => (
                            <Link
                                key={lien.to}
                                to={lien.to}
                                className="font-body text-sm w-fit transition-colors duration-200"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-ocre)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                            >
                                {lien.label}
                            </Link>
                        ))}
                    </div>
                </div>
                
            </div>
            <div>
                <div className="mt-2 p-6 text-center" style={{ borderTop: "1px solid rgba(0,0,0,0.28)" }}>
                    <p className="font-body text-xs" style={{ color: "var(--text-muted)" }}>
                        © 2025 Haodygasikara — Le voyage est un partage
                    </p>
                </div>
            </div>
        </footer>
    );
}