import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/button/Button";

export default function PageAdminNotFound() {
    const navigate = useNavigate();

    return (
        <div
            className="min-h-screen flex items-center justify-center px-6"
            style={{ backgroundColor: "var(--bg)" }}
        >
            <div className="flex flex-col items-center text-center max-w-md">
                <div
                    className="font-abhaya-bold leading-none"
                    style={{
                        fontSize: "clamp(8rem, 20vw, 12rem)",
                        color: "var(--brand-terre)",
                        letterSpacing: "-0.05em",
                    }}
                >
                    404
                </div>

                <div
                    className="h-1 w-16 my-6"
                    style={{
                        backgroundColor: "var(--brand-ocre)",
                        borderRadius: "var(--radius-pill)",
                    }}
                />

                <h1
                    className="text-2xl font-semibold mb-3"
                    style={{ color: "var(--text-primary)" }}
                >
                    Page introuvable
                </h1>

                <p
                    className="text-sm mb-8 leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                >
                    La page que vous cherchez n'existe pas ou a été déplacée.
                    Vérifiez l'URL ou retournez au tableau de bord.
                </p>

                <div className="flex gap-3">
                    <Button
                        value="Retour"
                        variant="outline"
                        onClick={() => navigate(-1)}
                    />
                    <Button
                        value="Tableau de bord"
                        onClick={() => navigate("/admin")}
                    />
                </div>
            </div>
        </div>
    );
}