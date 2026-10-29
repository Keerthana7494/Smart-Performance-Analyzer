export default function Toast({ message, type = 'success', onClose }) {
  if (!message) return null
  return (
    <div className={`toast ${type}`}>
      <span>{type === 'success' ? '✓' : '!'}</span>
      <div>{message}</div>
      <button onClick={onClose}>×</button>
    </div>
  )
}
