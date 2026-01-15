import React, { useState } from "react";
import "./Modal.css";

const CreateBoardModal = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState("");

    const handleSubmit = () => {
        if (name.trim()) {
            onCreate(name.trim());
            setName("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Создать новую доску</h3>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Введите название доски"
                        autoFocus
                        className="create-board-input"
                        onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                    />
                    <div className="modal-actions">
                        <button onClick={onClose} className="btn-cancel">
                            Отмена
                        </button>
                        <button onClick={handleSubmit} className="btn-create" disabled={!name.trim()}>
                            Создать
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBoardModal;
