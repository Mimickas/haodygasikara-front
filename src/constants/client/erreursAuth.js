// Codes machine renvoyes par le back (enum ErrorCode cote Java).
// Ils ne changent jamais : c'est sur eux qu'on route, jamais sur le message.
export const CODES_ERREUR = {
    EMAIL_ALREADY_USED: "EMAIL_ALREADY_USED",
    EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",
    EMAIL_ALREADY_VERIFIED: "EMAIL_ALREADY_VERIFIED",
    BAD_CREDENTIALS: "BAD_CREDENTIALS",
    VERIFICATION_TOKEN_INVALID: "VERIFICATION_TOKEN_INVALID",
    VERIFICATION_TOKEN_EXPIRED: "VERIFICATION_TOKEN_EXPIRED",
    REFRESH_TOKEN_MISSING: "REFRESH_TOKEN_MISSING",
    REFRESH_TOKEN_INVALID: "REFRESH_TOKEN_INVALID",
    // Trop de codes faux sur ce compte : bloque temporairement
    TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
    // Cadence trop elevee : delai entre deux envois, ou plafond par IP
    TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
};

// C'est le front qui decide ou va l'utilisateur — le back dit seulement ce
// qui s'est passe. Une API qui renverrait une URL serait inutilisable depuis
// une application mobile.
//
// `purgeSession` : cas ou la session locale ne vaut plus rien.
// Tout code absent de cette table = on reste sur place et on affiche le
// message. C'est le comportement sur : ajouter une exception cote back ne
// casse jamais le front.
// TOO_MANY_ATTEMPTS et TOO_MANY_REQUESTS n'y figurent pas volontairement :
// deplacer l'utilisateur quand il vient d'etre freine lui ferait perdre le
// decompte qui lui dit quand revenir. On reste sur place, bouton verrouille.
export const REDIRECTIONS_AUTH = {
    [CODES_ERREUR.EMAIL_NOT_VERIFIED]: { vers: "/verification" },
    [CODES_ERREUR.VERIFICATION_TOKEN_EXPIRED]: { vers: "/verification" },
    [CODES_ERREUR.EMAIL_ALREADY_VERIFIED]: { vers: "/login" },
    [CODES_ERREUR.REFRESH_TOKEN_MISSING]: { vers: "/login", purgeSession: true },
    [CODES_ERREUR.REFRESH_TOKEN_INVALID]: { vers: "/login", purgeSession: true },
};
