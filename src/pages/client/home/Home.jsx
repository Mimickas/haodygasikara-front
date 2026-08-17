import { FaArrowRight } from "react-icons/fa6";
import Button from "../../../components/ui/button/Button";
import { useEffect, useState } from "react";
import { findAllTagsGroupsApiClient } from "../../../api/client/tagGroupApi";

export default function Home() {
    const[tags, setTags] = useState([]);
    const loadTags = async () =>{
        try {
            const res = await findAllTagsGroupsApiClient();
            setTags(res?.data);
            console.log(res);
        } catch (error) {
            alert(error);
        }
    }

    useEffect(() =>{
        loadTags();
    },[])

    return (
        <>
            <section className="h-[65vh]">
                <div className="relative w-full h-[65vh] overflow-hidden rounded-lg bg-black">

                    <img
                
                        src="/img/lemur.webp"
                        className="absolute inset-0 w-full h-full object-cover opacity-75"
                        alt="lemur"
                    />

                    <div className="p-8 absolute bottom-4 left-4 z-10 flex flex-col gap-3 ">
                        <p className="font-body text-sm uppercase tracking-widest text-[var(--brand-ocre)]">
                            Createur de circuit sur mesure
                        </p>
                        <h1 className="text-9xl font-abhaya-bold text-white drop-shadow-lg">
                            Composez votre <br /> Madagascar.
                        </h1>
                        <div className="mt-2 w-full">
                            <Button
                                value="Créer mon circuit"
                                className="w-1/3 h-full py-4 font-body-strong"
                            />
                        </div>
                    </div>

                </div>
            </section>

            <section className="my-10">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-body-strong text-xs uppercase tracking-widest text-[var(--brand-ocre)]">
                            Coups de cœur du moment
                        </p>
                        <h2 className="my-2 text-6xl font-heading">
                            Nos circuits signatures
                        </h2>
                    </div>

                    {/* Bouton pill bg-terre */}
                    <button className="flex items-center gap-4 bg-terre text-white rounded-full pl-7 pr-2 py-1 hover:opacity-90 transition-opacity">
                        <span className="font-body text-sm">Voir plus</span>
                        <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
                            <FaArrowRight className="text-terre text-sm" />
                        </div>
                    </button>

                </div>
                <div className="flex justify-between">
                    {tags.map((t) => (
                        <div key={t.id} className="rounded-md py-3 px-6 bg-[var(--brand-lagune)] font-body-strong text-xs">
                            <span className="text-md">{t?.name || t?.nom}</span>
                        </div>
                    ))}
                </div>
            </section>
        </>
        
    );
}