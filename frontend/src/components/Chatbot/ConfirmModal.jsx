import React from 'react';

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, confirmLabel = 'OK', cancelLabel = 'Cancel' }) {
  if (!open) return null;

  return (
    <div className="cs-modal-overlay" role="dialog" aria-modal="true">
      <div className="cs-modal">
        <div className="cs-modal-header">
          <h3>{title}</h3>
        </div>
        <div className="cs-modal-body">
          <p>{message}</p>
        </div>
        <div className="cs-modal-actions">
          <button className="cs-btn cs-btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className="cs-btn cs-btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
