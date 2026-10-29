export default function Modal({ open, title, children, onCancel, onConfirm, confirmText='Confirm' }) {
  if (!open) return null
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-icon">?</div>
        <h3>{title}</h3>
        <p>{children}</p>
        <div className="modal-actions">
          <button className="btn secondary" onClick={onCancel}>Cancel</button>
          <button className="btn primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
