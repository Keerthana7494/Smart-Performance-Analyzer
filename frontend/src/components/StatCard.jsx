export default function StatCard({ label, value, hint, icon, tone='' }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-top">
        <span>{label}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  )
}
