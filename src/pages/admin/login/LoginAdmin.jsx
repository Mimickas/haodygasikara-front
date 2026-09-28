import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../../hooks/useAuth"
import CadreAccesAdmin, { ChampAcces } from "../../../components/admin/ui/acces/CadreAccesAdmin"
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur"

export default function LoginAdmin() {
    const { login } = useAuth()
    const navigate = useNavigate()
    // « Votre email est vérifié », au retour de la page de vérification
    const { state } = useLocation()
    const [info] = useState(state?.message ?? "")
    const [form, setForm] = useState({ email: "", password: "" })
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")

        if (!form.email || !form.password) {
            setError("Tous les champs sont requis.")
            return
        }

        setLoading(true)
        try {
            await login(form, { adminOnly: true })
        } catch (err) {
            const data = err.response?.data
            // Un administrateur tout juste créé n'a pas encore saisi son code :
            // il le fait sur la page de vérification, puis se reconnecte.
            if (data?.code === "EMAIL_NOT_VERIFIED") {
                navigate("/verification", {
                    state: {
                        email: form.email,
                        message: "Saisissez le code reçu par e-mail pour activer votre compte administrateur.",
                        retour: "/admin/haodygasikara/login",
                    },
                })
                return
            }
            if (data?.errors) {
                setError(Object.values(data.errors)[0])
            } else {
                setError(data?.message || "Email ou mot de passe incorrect.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <CadreAccesAdmin surtitre="Administration" titre="Connexion" texte="Accès réservé à l'équipe de l'agence.">
            <form onSubmit={handleSubmit} className="ad-acces__formulaire" noValidate>
                {info && !error && <p className="ad-note font-body">{info}</p>}
                <BandeauErreur message={error} />

                <ChampAcces
                    id="admin-email"
                    libelle="E-mail"
                    type="email"
                    autoComplete="username"
                    value={form.email}
                    setValue={val => setForm({ ...form, email: val })}
                    placeholder="prenom@haodygasikara.com"
                />
                <ChampAcces
                    id="admin-mot-de-passe"
                    libelle="Mot de passe"
                    type="password"
                    autoComplete="current-password"
                    value={form.password}
                    setValue={val => setForm({ ...form, password: val })}
                    placeholder="••••••••"
                />

                <button type="submit" disabled={loading} className="ad-bouton ad-bouton--plein ad-acces__envoi font-body-strong">
                    {loading ? "Connexion…" : "Se connecter"}
                </button>
            </form>
        </CadreAccesAdmin>
    )
}
