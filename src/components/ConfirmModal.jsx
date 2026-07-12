function ConfirmModal({ title, message, onCancel, onConfirm, confirmLabel = "Delete" }) {
    return (
      <div className="modal-overlay">
        <div className="confirm-modal">
          <h3>{title}</h3>
          <p>{message}</p>

          <div className="modal-actions">
            <button className="secondary-btn" onClick={onCancel}>
              Cancel
            </button>

            <button className="danger-btn" onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  export default ConfirmModal;