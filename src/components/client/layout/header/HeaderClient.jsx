import { useState } from "react";
import InputComponent from "../../../ui/input/InputComponent";
import Button from "../../../ui/button/Button";
import { FaBell, FaUser } from "react-icons/fa6";

export default function HeaderClient() {
    const [recherche, setRecherche] = useState("");

    return (
        <header className="w-full grid grid-cols-3 items-center py-5 px-6">

            <nav className="flex items-center gap-10 font-body">
                <img src="/img/logo/logo-2-horizontal.png" className="w-36" alt="Logo" />
                <ul className="flex gap-6 text-[var(--text-muted)]">
                    <li className="cursor-pointer hover:text-terre transition-colors">Découvrir</li>
                    <li className="cursor-pointer hover:text-terre transition-colors">Circuit</li>
                    <li className="cursor-pointer hover:text-terre transition-colors">Carte</li>
                </ul>
            </nav>

            <div className="flex justify-center">
                <InputComponent value={recherche} setValue={setRecherche} placeholder="Rechercher..." />
            </div>

            <div className="flex justify-end items-center gap-3 text-[var(--text-secondary)] font-body">
                <button
                    className="flex items-center rounded-md shadow-normal py-2 px-2.5 hover:bg-[var(--bg-hover)] transition-colors"
                    aria-label="Notifications"
                >
                    <FaBell />
                </button>
                <button className="flex items-center gap-2 rounded-md shadow-normal py-2 px-3 hover:bg-[var(--bg-hover)] transition-colors">
                    <FaUser />
                    <span className="text-sm">Démarrer</span>
                </button>
            </div>

        </header>
    );
}