// Le pied d'un tableau paginé : où l'on en est, et les deux seuls gestes utiles.
export default function Pagination({ page, pages, total, parPage, onPage }) {
    const debut = page * parPage + 1;
    const fin = Math.min(total, (page + 1) * parPage);

    return (
        <nav className="ad-pagination" aria-label="Pagination">
            <span className="ad-pagination__etat font-body">{debut}–{fin} sur {total}</span>
            <div className="ad-pagination__gestes">
                <button type="button" className="ad-pagination__bouton font-body-strong"
                    disabled={page === 0} onClick={() => onPage(page - 1)}>
                    ← Précédent
                </button>
                <span className="ad-pagination__page font-body">Page {page + 1} / {pages}</span>
                <button type="button" className="ad-pagination__bouton font-body-strong"
                    disabled={page >= pages - 1} onClick={() => onPage(page + 1)}>
                    Suivant →
                </button>
            </div>
        </nav>
    );
}
