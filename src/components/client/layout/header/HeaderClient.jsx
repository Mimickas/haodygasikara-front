import { useState } from "react";
import InputComponent from "../../../ui/input/InputComponent";
import Button from "../../../ui/button/Button";
import { FaBell, FaUser } from "react-icons/fa6";

export default function HeaderClient() {
    const [recherche, setRecherche] = useState("");

    return (
        <div className="w-full grid grid-cols-3 items-center py-5 px-10">

            <div className="flex items-center gap-10">
                <img src="/img/logo/logo-2-horizontal.png" className="w-36" alt="" />
                <ul className="flex gap-4">
                    <li>Decouvrir</li>
                    <li>Circuit</li>
                    <li>Carte</li>
                </ul>
            </div>

            <div className="flex justify-center">
                <InputComponent
                    value={recherche}
                    setValue={setRecherche}
                    placeholder="Rechercher..."
                />
            </div>

            <div className="flex justify-end">
                <div className="flex gap-3">
                    <div 
                        className=" rounded-md shadow-normal flex items-center py-1.5 px-2.5 gap-2"
                        style={{
                            boxShadow: "var(--shadow-normal)",
                            color: "var(--text-secondary)",
                        }}
                    >
                        <FaBell />
                    </div>
                    <div 
                        className=" rounded-md shadow-normal flex items-center py-1.5 px-2.5 gap-2"
                        style={{
                            boxShadow: "var(--shadow-normal)",
                            color: "var(--text-secondary)",
                        }}
                    >
                        <FaUser />
                        <p className="text-md">Demarer</p>
                    </div>
                </div>
                {/* <div className="flex gap-2">
                    <Button value="Creer un compte" variant="secondary" className="h-full"/>
                    <Button value="Demarrer" className="h-full"/>
                </div> */}
            </div>

        </div>
    );
}