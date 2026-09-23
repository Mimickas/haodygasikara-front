// Message lisible à partir d'une erreur axios renvoyée par le backend.
// ApiResponse porte le message général, et pour un 400 VALIDATION_ERROR
// le détail par champ dans errors = { champ: message }.
export const apiErrorMessage = (error, fallback) => {
    const message = error.response?.data?.message || fallback;
    const details = Object.values(error.response?.data?.errors ?? {});
    return [message, ...details].join("\n");
};
