import { useState } from "react";

export function useTagsGroup() {
    const [open, setOpen] = useState(false);

    const actions = {
        create: () => setOpen(true),
        export: () => exportTags(),
        sort:   () => console.log("sort"),
    };

    return { open, setOpen, actions };
}