import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { findUtilisateursApi } from "../../../api/admin/utilisateursApi";
import { registerAdminApi } from "../../../api/authApi";
import KpiCard from "../../../components/admin/shared/kpiCard/KpiCard";
import DataTable from "../../../components/admin/ui/tableau/DataTable";
import Toolbar from "../../../components/admin/ui/toolbar/Toolbar";
import BandeauErreur from "../../../components/admin/ui/erreur/BandeauErreur";
import { parDate, parTexte, useListeAdmin } from "../../../hooks/admin/useListeAdmin";
import { formatDate } from "../../../utils/format";
import { apiErrorMessage } from "../../../utils/apiError";

// ── Les comptes — /admin/haodygasikara/utilisateurs ───────────────────────
//
// Qui s'est inscrit, comment (adresse ou Google), si l'adresse est vérifiée,
// et ce que chacun a composé ou demandé. En lecture seule : un compte
// appartient à son titulaire. Seule écriture : créer un administrateur
// (?nouveau=1 ouvre le formulaire, c'est le bouton « Créer un admin » du menu).

const B = "/admin/haodygasikara";
const estAdmin = (u) => u.role === "ADMIN" || u.role === "SUPER_ADMIN";

const FILTRES = [
    { cle: "TOUS",       libelle: "Tous",              garde: () => true },
    { cle: "VOYAGEURS",  libelle: "Voyageurs",         garde: (u) => !estAdmin(u) },
    { cle: "ADMINS",     libelle: "Administrateurs",   garde: estAdmin },
    { cle: "NONVERIFIE", libelle: "Adresse à vérifier", garde: (u) => !u.verifie },
];

const nomComplet = (u) => [u.prenom, u.nom].filter(Boolean).join(" ") || u.email;

const connexion = (u) => (u.google && u.motDePasse ? "Adresse et Google" : u.google ? "Google" : "Adresse e-mail");

const colonnes = [
    { key: "nom", label: "Compte", texte: (_, u) => `${nomComplet(u)} <${u.email}>`, render: (_, u) => (
        <span className="ad-cv-voyage">
            <span className="font-body-strong">{nomComplet(u)}</span>
            <span className="ad-tb-muet">{u.email}</span>
        </span>
    ) },
    { key: "role", label: "Rôle", texte: (_, u) => estAdmin(u) ? "Administrateur" : "Voyageur", render: (val, u) => (
        <span className={`ad-dv-pastille ${estAdmin(u) ? "ad-ut-pastille--admin" : "ad-ut-pastille--voyageur"}`}>
            {estAdmin(u) ? "Administrateur" : "Voyageur"}
        </span>
    ) },
    { key: "google", label: "Connexion", render: (_, u) => connexion(u), texte: (_, u) => connexion(u) },
    { key: "verifie", label: "Adresse", render: (val) => val ? "Vérifiée" : <span className="ad-ut-attention">À vérifier</span>, texte: (val) => val ? "Vérifiée" : "À vérifier" },
    { key: "circuits", label: "Voyages", render: (val, u) => val > 0
        ? <Link to={`${B}/circuits-voyageurs?voyageur=${u.id}`} className="ad-ut-lien" onClick={(e) => e.stopPropagation()}>{val} voyage{val > 1 ? "s" : ""} →</Link>
        : "—", texte: (val) => val },
    { key: "devis", label: "Devis", render: (val) => val > 0 ? `${val} demande${val > 1 ? "s" : ""}` : "—" },
    { key: "createdAt", label: "Inscrit le", render: (val) => formatDate(val) },
];

export default function Utilisateurs() {
    const [params, setParams] = useSearchParams();
    const [comptes, setComptes] = useState([]);
    const [chargement, setChargement] = useState(true);
    const [erreur, setErreur] = useState("");
    const nouveau = params.get("nouveau") === "1";

    const charger = () => findUtilisateursApi()
        .then((r) => setComptes(r?.data ?? []))
        .catch((error) => setErreur(apiErrorMessage(error, "Les comptes n'ont pas pu être chargés.")))
        .finally(() => setChargement(false));

    useEffect(() => { charger(); }, []);

    const ouvrirFormulaire = (ouvert) => setParams((p) => {
        const suite = new URLSearchParams(p);
        if (ouvert) suite.set("nouveau", "1"); else suite.delete("nouveau");
        return suite;
    }, { replace: true });

    const kpiItems = useMemo(() => {
        const voyageurs = comptes.filter((u) => !estAdmin(u));
        const verifies = voyageurs.filter((u) => u.verifie).length;
        const google = voyageurs.filter((u) => u.google).length;
        const actifs = voyageurs.filter((u) => u.circuits > 0 || u.devis > 0).length;
        return [
            { label: "Voyageurs inscrits", value: voyageurs.length,
                hint: `${verifies} adresse${verifies > 1 ? "s" : ""} vérifiée${verifies > 1 ? "s" : ""}`, accent: "var(--brand-terre)" },
            { label: "Actifs", value: actifs,
                hint: "ont composé un voyage ou demandé un devis", accent: "var(--brand-nature)" },
            { label: "Via Google", value: google,
                hint: voyageurs.length ? `${Math.round(google * 100 / voyageurs.length)} % des voyageurs` : "aucun voyageur", accent: "var(--brand-lagune)" },
            { label: "Administrateurs", value: comptes.length - voyageurs.length,
                hint: "ont accès à cette administration", accent: "var(--brand-ocre)" },
        ];
    }, [comptes]);

    const liste = useListeAdmin(comptes, {
        recherche: (u) => [u.prenom, u.nom, u.email, u.telephone],
        filtres: FILTRES,
        tris: [
            { cle: "RECENTS", libelle: "Inscrits récemment", comparer: parDate("createdAt") },
            { cle: "NOM", libelle: "Nom, de A à Z", comparer: parTexte("nom") },
        ],
        export: { nom: "comptes", colonnes },
    });

    return <>
        <Toolbar liste={liste} placeholder="Nom, adresse, téléphone…" actions={[
            { libelle: "Exporter", onClick: liste.exporter },
            { libelle: "Créer un administrateur", onClick: () => ouvrirFormulaire(true), primaire: true },
        ]} />

        <BandeauErreur message={erreur} onFermer={() => setErreur("")} />
        <KpiCard items={kpiItems} loading={chargement} />

        <DataTable columns={colonnes} data={liste.lignes} loading={chargement} aucunResultat={liste.aucunResultat} />

        {nouveau && <NouvelAdmin onFermer={() => ouvrirFormulaire(false)} onCree={charger} />}
    </>;
}

// ── Créer un administrateur ───────────────────────────────────────────────
//
// Le compte naît NON VÉRIFIÉ : un code part à son adresse, et le nouvel
// administrateur le saisit à sa première connexion. Le mot de passe choisi
// ici est provisoire : il le remplace ensuite (« Mot de passe oublié »).

const VIDE = { prenom: "", nom: "", email: "", password: "", confirmation: "" };

function NouvelAdmin({ onFermer, onCree }) {
    const [form, setForm] = useState(VIDE);
    const [envoi, setEnvoi] = useState({ enCours: false, erreur: "", succes: "" });

    useEffect(() => {
        const echap = (e) => { if (e.key === "Escape") onFermer(); };
        window.addEventListener("keydown", echap);
        return () => window.removeEventListener("keydown", echap);
    }, [onFermer]);

    const maj = (cle) => (e) => setForm((f) => ({ ...f, [cle]: e.target.value }));

    const valider = async (e) => {
        e.preventDefault();
        if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim() || !form.password) {
            setEnvoi({ enCours: false, erreur: "Tous les champs sont requis.", succes: "" });
            return;
        }
        if (form.password.length < 8) {
            setEnvoi({ enCours: false, erreur: "Le mot de passe doit contenir au moins 8 caractères.", succes: "" });
            return;
        }
        if (form.password !== form.confirmation) {
            setEnvoi({ enCours: false, erreur: "Les deux mots de passe ne correspondent pas.", succes: "" });
            return;
        }
        setEnvoi({ enCours: true, erreur: "", succes: "" });
        try {
            await registerAdminApi({ prenom: form.prenom.trim(), nom: form.nom.trim(), email: form.email.trim(), password: form.password });
            setEnvoi({ enCours: false, erreur: "",
                succes: `Compte créé. Un code de vérification est parti à ${form.email.trim()} : il sera demandé à la première connexion.` });
            setForm(VIDE);
            onCree();
        } catch (error) {
            setEnvoi({ enCours: false, erreur: apiErrorMessage(error, "Le compte n'a pas pu être créé."), succes: "" });
        }
    };

    return (
        <div className="ad-dv-voile" onClick={onFermer}>
            <aside className="ad-dv-dossier" onClick={(e) => e.stopPropagation()} aria-label="Créer un administrateur">
                <header className="ad-dv-dossier__entete">
                    <div>
                        <p className="ad-dv-surtitre font-body-strong">Administration</p>
                        <h2 className="font-title ad-dv-dossier__titre">Créer un administrateur</h2>
                    </div>
                    <button type="button" className="ad-dv-fermer" onClick={onFermer} aria-label="Fermer">✕</button>
                </header>

                <form className="ad-dv-dossier__corps" onSubmit={valider} noValidate>
                    <section className="ad-dv-bloc">
                        <p className="ad-dv-texte font-body">
                            Le nouveau compte aura accès à toute l'administration. Un code de vérification est envoyé
                            à son adresse ; il le saisit à sa première connexion.
                        </p>
                        <div className="ad-dv-grille">
                            <Champ libelle="Prénom" valeur={form.prenom} onChange={maj("prenom")} auto="given-name" />
                            <Champ libelle="Nom" valeur={form.nom} onChange={maj("nom")} auto="family-name" />
                        </div>
                        <Champ libelle="Adresse e-mail" type="email" valeur={form.email} onChange={maj("email")} auto="off" />
                        <div className="ad-dv-grille">
                            <Champ libelle="Mot de passe" type="password" valeur={form.password} onChange={maj("password")} auto="new-password" />
                            <Champ libelle="Confirmation" type="password" valeur={form.confirmation} onChange={maj("confirmation")} auto="new-password" />
                        </div>
                        {envoi.erreur && <p className="ad-erreur" role="alert">{envoi.erreur}</p>}
                        {envoi.succes && <p className="ad-tb-succes font-body" role="status">{envoi.succes}</p>}
                        <div className="ad-dv-actions">
                            <button type="submit" className="ad-bouton ad-bouton--plein font-body-strong" disabled={envoi.enCours}>
                                {envoi.enCours ? "Création…" : "Créer le compte"}
                            </button>
                            <button type="button" className="ad-bouton font-body-strong" onClick={onFermer}>Fermer</button>
                        </div>
                    </section>
                </form>
            </aside>
        </div>
    );
}

function Champ({ libelle, valeur, onChange, type = "text", auto }) {
    return (
        <label className="ad-dv-champ">
            <span className="ad-dv-surtitre font-body-strong">{libelle}</span>
            <input type={type} value={valeur} onChange={onChange} autoComplete={auto} className="ad-dv-saisie font-body" />
        </label>
    );
}
