import { useState } from "react"
import { Link } from "react-router-dom"
import { registerAdminApi } from "../../../api/authApi"
import CadreAccesAdmin, { ChampAcces } from "../../../components/admin/ui/acces/CadreAccesAdmin"
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur"

const VIDE = { nom: "", prenom: "", email: "", password: "", confirmPassword: "" }

// Première installation : le tout premier administrateur. Le serveur refuse
// cette route dès qu'un administrateur existe ; les suivants se créent depuis
// Administration → Utilisateurs.
export default function RegisterAdmin() {
    const [form, setForm] = useState(VIDE)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

    const champ = (cle) => (val) => setForm({ ...form, [cle]: val })

    async function handleSubmit(e) {
        e.preventDefault()
        setError("")
        setSuccess("")

        if (!form.nom || !form.prenom || !form.email || !form.password || !form.confirmPassword) {
            setError("Tous les champs sont requis.")
            return
        }

        if (form.password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.")
            return
        }

        if (form.password !== form.confirmPassword) {
            setError("Les mots de passe ne correspondent pas.")
            return
        }

        setLoading(true)
        try {
            // confirmPassword ne part pas au back
            const response = await registerAdminApi({
                nom: form.nom,
                prenom: form.prenom,
                email: form.email,
                password: form.password,
            })

            setSuccess(response.message || "Administrateur créé : vérifiez votre adresse e-mail.")
            setForm(VIDE)

        } catch (err) {
            // ApiResponse d'erreur → { message, errors, ... }
            const data = err.response?.data
            if (data?.errors) {
                // Erreurs de validation @Valid → prend le premier message
                setError(Object.values(data.errors)[0])
            } else {
                setError(data?.message || "Une erreur est survenue.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <CadreAccesAdmin
            surtitre="Installation"
            titre="Premier administrateur"
            texte="Le compte principal de l'agence. Les suivants se créent ensuite depuis Administration → Utilisateurs."
        >
            <form onSubmit={handleSubmit} className="ad-acces__formulaire" noValidate>
                <BandeauErreur message={error} />
                {success && (
                    <p className="ad-note ad-note--succes font-body">
                        {success}{" "}
                        <Link to="/admin/haodygasikara/login" className="ad-acces__lien font-body-strong">Se connecter</Link>
                    </p>
                )}

                <div className="ad-acces__rangee">
                    <ChampAcces id="admin-nom" libelle="Nom" autoComplete="family-name" value={form.nom} setValue={champ("nom")} placeholder="Rakoto" />
                    <ChampAcces id="admin-prenom" libelle="Prénom" autoComplete="given-name" value={form.prenom} setValue={champ("prenom")} placeholder="Jean" />
                </div>
                <ChampAcces id="admin-email" libelle="E-mail" type="email" autoComplete="email" value={form.email} setValue={champ("email")} placeholder="prenom@haodygasikara.com" />
                <ChampAcces id="admin-mot-de-passe" libelle="Mot de passe" type="password" autoComplete="new-password" value={form.password} setValue={champ("password")} placeholder="8 caractères au moins" />
                <ChampAcces id="admin-confirmation" libelle="Confirmer le mot de passe" type="password" autoComplete="new-password" value={form.confirmPassword} setValue={champ("confirmPassword")} placeholder="••••••••" />

                <button type="submit" disabled={loading} className="ad-bouton ad-bouton--plein ad-acces__envoi font-body-strong">
                    {loading ? "Création…" : "Créer le compte"}
                </button>
            </form>
        </CadreAccesAdmin>
    )
}
