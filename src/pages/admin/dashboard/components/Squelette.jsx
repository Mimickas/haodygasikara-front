// Des lignes grises le temps que les chiffres arrivent, partagées par tous les
// blocs du tableau de bord.
export default function Squelette({ lignes }) {
    return (
        <div className="ad-tb-squelette" aria-hidden="true">
            {Array.from({ length: lignes }, (_, i) => (
                <div key={i} className="skeleton-box h-4" style={{ borderRadius: 0, width: `${90 - i * 9}%` }} />
            ))}
        </div>
    );
}
