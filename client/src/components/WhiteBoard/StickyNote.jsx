// src/components/Whiteboard/StickyNote.jsx
import React, { useState } from "react";

const StickyNote = ({ id, x, y, text, onUpdateText, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(text);

    const handleBlur = () => {
        onUpdateText(id, localText);
        setIsEditing(false);
    };

    return (
        <div className="sticky-note" style={{ left: x + "px", top: y + "px" }} onClick={(e) => e.stopPropagation()}>
            {isEditing ? (
                <textarea className="sticky-textarea" value={localText} onChange={(e) => setLocalText(e.target.value)} onBlur={handleBlur} autoFocus />
            ) : (
                <div className="sticky-content" onDoubleClick={() => setIsEditing(true)}>
                    {localText || "Двойной клик для редактирования"}
                </div>
            )}
            <button className="delete-sticker" onClick={() => onDelete(id)}>
                ✕
            </button>
        </div>
    );
};

export default StickyNote;
