import React from "react";
import "./ConfirmModal.css";

const ConfirmModal = ({ message, onConfirm, onCancel }) => {
    if (!message) return null;

    return (
        <div className="confirm-modal-overlay" onClick={onCancel}>
            <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-modal-header">
                    <button className="confirm-modal-close" onClick={onCancel}>
                        ✕
                    </button>
                </div>
                <div className="confirm-modal-body">{message}</div>
                <div className="confirm-modal-actions">
                    <button className="btn btn-cancel" onClick={onCancel}>
                        Отмена
                    </button>
                    <button className="btn btn-confirm" onClick={onConfirm}>
                        Принять
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
