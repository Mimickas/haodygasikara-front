import { useState } from "react"
import { registerAdminApi } from "../../../api/authApi"
import InputComponent from "../../../components/ui/input/InputComponent"

export default function RegisterAdmin() {
    const [form, setForm] = useState({
        nom: "",
        prenom: "",
        email: "",
        password: "",
        confirmPassword: "",
    })
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")
    const [loading, setLoading] = useState(false)

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

            setSuccess(response.message || "Inscription réussie. Vérifiez votre email.")
            setForm({ nom: "", prenom: "", email: "", password: "", confirmPassword: "" })

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
        <div className="min-h-screen w-full flex justify-center items-center px-4 py-10"
             style={{ backgroundColor: "var(--bg)" }}>

            <div className="w-full max-w-sm">

                <div className="mb-8 flex justify-center">
                    <img src="/logo/logo-1-vertical.png" alt="Haodygasikara" className="w-40" />
                </div>

                <form onSubmit={handleSubmit}
                    className="rounded-2xl p-8"
                    style={{
                        backgroundColor: "var(--bg-card)",
                        boxShadow: "var(--shadow-card)",
                    }}>

                    <h1 className="font-abhaya-bold text-3xl mb-1"
                        style={{ color: "var(--text-primary)" }}>
                        Créer un admin
                    </h1>
                    <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                        Enregistrement d’un nouvel administrateur.
                    </p>

                    {error && (
                        <p className="text-sm mb-4 px-3 py-2 rounded-lg"
                           style={{ color: "var(--error-text)", backgroundColor: "var(--error-bg)" }}>
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-sm mb-4 px-3 py-2 rounded-lg"
                           style={{ color: "var(--success-text)", backgroundColor: "var(--success-bg)" }}>
                            {success}
                        </p>
                    )}

                    <div className="flex flex-col gap-4">

                        <div className="flex gap-3">
                            <div className="flex flex-col gap-1.5 w-1/2">
                                <label className="text-sm font-medium"
                                       style={{ color: "var(--text-secondary)" }}>
                                    Nom
                                </label>
                                <InputComponent
                                    value={form.nom}
                                    setValue={val => setForm({ ...form, nom: val })}
                                    placeholder="Rakoto"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 w-1/2">
                                <label className="text-sm font-medium"
                                       style={{ color: "var(--text-secondary)" }}>
                                    Prénom
                                </label>
                                <InputComponent
                                    value={form.prenom}
                                    setValue={val => setForm({ ...form, prenom: val })}
                                    placeholder="Jean"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium"
                                   style={{ color: "var(--text-secondary)" }}>
                                Email
                            </label>
                            <InputComponent
                                type="email"
                                value={form.email}
                                setValue={val => setForm({ ...form, email: val })}
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium"
                                   style={{ color: "var(--text-secondary)" }}>
                                Mot de passe
                            </label>
                            <InputComponent
                                type="password"
                                value={form.password}
                                setValue={val => setForm({ ...form, password: val })}
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium"
                                   style={{ color: "var(--text-secondary)" }}>
                                Confirmer le mot de passe
                            </label>
                            <InputComponent
                                type="password"
                                value={form.confirmPassword}
                                setValue={val => setForm({ ...form, confirmPassword: val })}
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg text-sm font-bold mt-2 cursor-pointer transition-colors"
                            style={{
                                backgroundColor: loading ? "var(--cta-disabled-bg)" : "var(--cta-bg)",
                                color: loading ? "var(--cta-disabled-text)" : "var(--cta-text)",
                                boxShadow: loading ? "none" : "var(--cta-shadow)",
                                cursor: loading ? "not-allowed" : "pointer",
                            }}
                            onMouseEnter={e => {
                                if (!loading) e.currentTarget.style.backgroundColor = "var(--cta-bg-hover)"
                            }}
                            onMouseLeave={e => {
                                if (!loading) e.currentTarget.style.backgroundColor = "var(--cta-bg)"
                            }}>
                            {loading ? "Création..." : "Créer le compte"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    )
}