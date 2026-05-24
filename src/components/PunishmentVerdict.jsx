import { getPunishmentTier } from '../data/punishments.js'

export default function PunishmentVerdict({ done, total }) {
  const tier = getPunishmentTier(done, total)
  if (!tier) return null

  return (
    <div
      className="punishment-block"
      style={{ '--p-color': tier.color, '--p-glow': tier.glow, '--p-border': tier.border }}
    >
      <div className="punishment-header">
        <span className="punishment-label">⚖ THE VERDICT</span>
        <span className="punishment-tier">{tier.label}</span>
      </div>
      <p className="punishment-verdict">{tier.verdict}</p>
      {tier.items && (
        <ul className="punishment-list">
          {tier.items.map((item, i) => (
            <li key={i} className="punishment-item">
              <span className="punishment-bullet">›</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
