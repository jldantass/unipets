function Paw({ filled }) {
  return (
    <svg className={`paw ${filled ? 'filled' : 'empty'}`} viewBox="0 0 100 100" fill="currentColor">
      <ellipse cx="50" cy="66" rx="27" ry="22" />
      <ellipse cx="21" cy="36" rx="12" ry="15" />
      <ellipse cx="45" cy="19" rx="11.5" ry="15" />
      <ellipse cx="72" cy="20" rx="11" ry="14.5" />
      <ellipse cx="90" cy="41" rx="9.5" ry="13" />
    </svg>
  )
}

export default function PawMeter({ usados, total }) {
  const t = Math.min(total || 0, 12)
  return (
    <div className="paw-meter">
      {Array.from({ length: t }).map((_, i) => <Paw key={i} filled={i < usados} />)}
    </div>
  )
}
