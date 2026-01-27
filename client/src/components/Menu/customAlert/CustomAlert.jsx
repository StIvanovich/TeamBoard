import React from "react";
import "./CustomAlert.css";

const CustomAlert = ({ message, onClose }) => {
    if (!message) return null;

    return (
        <div className="custom-alert-overlay" onClick={onClose}>
            <div className="custom-alert-modal" onClick={(e) => e.stopPropagation()}>
                <div className="custom-alert-header">
                    <button className="custom-alert-close" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="custom-alert-body">{typeof message === "string" ? message : JSON.stringify(message)}</div>
            </div>
        </div>
    );
};

export default CustomAlert;
