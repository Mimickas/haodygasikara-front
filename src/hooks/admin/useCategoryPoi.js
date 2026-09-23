import { useState } from "react";
import createConstant from "../../constants/admin/createConstant";

export function useCategoryPoi() {
    const [open, setOpen] = useState(false);

    // Pas de dropdown à enrichir : les options Oui / Non sont statiques,
    // mais on renvoie quand même les champs pour garder la même signature que les autres hooks.
    const fields = createConstant.categoryPois;

    const actions = {
        create: () => setOpen(true),
        edit:   () => setOpen(true),
        export: () => console.log("export"),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions, fields };
}
