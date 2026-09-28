import { useState } from "react";

// Le formulaire d'un groupe d'étiquettes : rien à charger, il s'ouvre.
export function useTagsGroup() {
    const [open, setOpen] = useState(false);
    return { open, setOpen, actions: { create: () => setOpen(true), edit: () => setOpen(true) } };
}
