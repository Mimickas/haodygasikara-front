import { FaInstagram, FaFacebookF, FaXTwitter } from "react-icons/fa6";
import MenuRevealLink from "../../../../hooks/design/MenuRevealLink";

// `img` est l'image qui suit le curseur au survol du lien. Attention :
// /img/menu/carte.jpg n'a jamais existe dans public/, le survol de « Carte »
// ne revelait donc rien du tout.
const navLinks = [
    { label: "Découvrir", href: "/",        img: "/img/beautiful-waterfall-streaming-into-river-surrounded-by-greens.jpg",
      note: "Notre façon de composer un voyage, geste après geste." },
    { label: "Circuit",   href: "/circuit", img: "/img/lemur.webp",
      note: "Les itinéraires déjà tracés, à reprendre ou à modifier." },
    { label: "Carte",     href: "/carte",   img: "/img/home/firstHero/baoba.jpg",
      note: "Épinglez vos étapes sur la carte de Madagascar." },
];

// TODO : remplacer par les vrais profils Haodygasikara
const socials = [
    { label: "Instagram", href: "https://www.instagram.com/haodygasikara", Icon: FaInstagram },
    { label: "Facebook",  href: "https://www.facebook.com/haodygasikara",  Icon: FaFacebookF },
    { label: "X",         href: "https://x.com/haodygasikara",             Icon: FaXTwitter },
];

const CONTACT = {
    email: "contact@haodygasikara.com",
    tel: "+261 34 27 013 74",
    telHref: "+261342701374",
    adresse: ["Villa Saphir, Toamasina 501", "Madagascar"],
};

export default function MenuPanel({ onNavigate }) {
    return (
        <div className="flex flex-col h-full px-16 pt-10 pb-9">
            {/* Les liens occupent toute la largeur du panneau */}
            <nav className="flex-1 flex flex-col justify-center min-h-0">
                {navLinks.map(({ label, href, img, note }) => (
                    <div key={href} data-panel-item>
                        <MenuRevealLink label={label} href={href} img={img} note={note} onClick={onNavigate} />
                    </div>
                ))}
            </nav>

            {/* Les infos passent en pied, sur trois colonnes */}
            <div className="grid grid-cols-12 gap-10 pt-7" style={{ borderTop: "1px solid var(--border)" }}>
                <div data-panel-item className="col-span-4">
                    <p className="font-body-strong text-[10px] uppercase tracking-[0.45em] mb-4" style={{ color: "var(--brand-terre)" }}>
                        Nous écrire
                    </p>
                    <a
                        href={`mailto:${CONTACT.email}`}
                        className="block font-body text-sm mb-1.5 transition-colors duration-300"
                        style={{ color: "var(--text-primary)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                    >
                        {CONTACT.email}
                    </a>
                    <a
                        href={`tel:${CONTACT.telHref}`}
                        className="block font-body text-sm transition-colors duration-300"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                    >
                        {CONTACT.tel}
                    </a>
                </div>

                <div data-panel-item className="col-span-4">
                    <p className="font-body-strong text-[10px] uppercase tracking-[0.45em] mb-4" style={{ color: "var(--brand-terre)" }}>
                        Nous trouver
                    </p>
                    {CONTACT.adresse.map((ligne) => (
                        <p key={ligne} className="font-body text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
                            {ligne}
                        </p>
                    ))}
                </div>

                <div data-panel-item className="col-span-4 flex flex-col items-end justify-between gap-5">
                    <div className="flex items-center gap-7">
                        {socials.map(({ label, href, Icon }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noreferrer noopener"
                                aria-label={label}
                                className="flex items-center gap-2.5 transition-colors duration-300"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--brand-terre)")}
                                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                            >
                                <Icon className="text-base" />
                                <span className="font-body text-[10px] uppercase tracking-[0.3em]">{label}</span>
                            </a>
                        ))}
                    </div>

                    <span className="font-body text-[10px] uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>
                        Devis sur mesure sous 48 h
                    </span>
                </div>
            </div>
        </div>
    );
}
