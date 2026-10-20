// Un chiffre écrit dans son segment seulement s'il y tient. Sinon il reste dans
// la bulle et dans le tableau : jamais un chiffre rogné.
export default function ChiffreDansSegment({ x, y, width, height, value }) {
    if (!value || width < 24) return null;
    return (
        <text x={x + width / 2} y={y + height / 2} dy={4} textAnchor="middle" fill="#FFFFFF" fontSize={12} fontWeight={600}>
            {value}
        </text>
    );
}
