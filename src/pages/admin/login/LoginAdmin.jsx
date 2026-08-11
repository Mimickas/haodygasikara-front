import { useState } from "react"
import { useAuth } from "../../../hooks/useAuth"
import InputComponent from "../../../components/ui/input/InputComponent"

export default function LoginAdmin() {
    const { login } = useAuth()
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
        <div className="h-screen w-full flex justify-center items-center px-4"
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
                        Admin login
                    </h1>
                    <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                        Accès réservé à l’administration.
                    </p>

                    {error && (
                        <p className="text-sm mb-4 px-3 py-2 rounded-lg"
                           style={{ color: "var(--error-text)", backgroundColor: "var(--error-bg)" }}>
                            {error}
                        </p>
                    )}

                    <div className="flex flex-col gap-4">

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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 rounded-lg text-sm font-bold mt-2 transition-colors"
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
                            {loading ? "Connexion..." : "Se connecter"}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    )
}