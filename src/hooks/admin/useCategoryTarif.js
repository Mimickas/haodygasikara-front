import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";

export function useCategoryTarif() {
    const [open, setOpen] = useState(false);

    // Pas de dropdown à enrichir : les champs sont statiques,
    // mais on les renvoie quand même pour garder la même signature que les autres hooks tarifs.
    const fields = createConstant.categoryTarifs;

    const actions = {
        create: () => setOpen(true),
        edit:   () => setOpen(true),
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
