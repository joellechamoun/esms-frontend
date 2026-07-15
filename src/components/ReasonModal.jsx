import { useState } from "react";

function ReasonModal({
  title,
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Submit",
}) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) return;
    onConfirm(reason.trim());
  };

  return (
    <div className="modal-overlay">
      <div className="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>

        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter a reason..."
          rows={4}
          required
          style={{ width: "100%", resize: "vertical" }}
        />

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onCancel}>
            Cancel
          </button>

          <button
            className="danger-btn"
            onClick={handleConfirm}
            disabled={!reason.trim()}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReasonModal;
