import React, { useState, useRef } from "react";

const StickyNote = ({ id, x, y, text, onUpdateText, onUpdatePosition, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(text);
    const [dragging, setDragging] = useState(false);
    const noteRef = useRef(null);

    const offsetRef = useRef({ x: 0, y: 0 });

    const handleMouseDown = (e) => {
        if (isEditing) return;

        const rect = noteRef.current.getBoundingClientRect();
        offsetRef.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        };
        setDragging(true);
        e.stopPropagation();
    };

    const handleMouseMove = (e) => {
        if (!dragging) return;

        const newX = e.clientX - offsetRef.current.x;
        const newY = e.clientY - offsetRef.current.y;

        const boundedX = Math.max(0, Math.min(window.innerWidth - 180, newX));
        const boundedY = Math.max(60, Math.min(window.innerHeight - 120, newY));

        onUpdatePosition(id, boundedX, boundedY);
    };

    const handleMouseUp = () => {
        if (dragging) {
            setDragging(false);
        }
    };

    React.useEffect(() => {
        if (dragging) {
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [dragging]);

    const handleBlur = () => {
        onUpdateText(id, localText);
        setIsEditing(false);
    };

    return (
        <div
            ref={noteRef}
            className="sticky-note"
            style={{
                left: x + "px",
                top: y + "px",
                cursor: dragging ? "grabbing" : isEditing ? "text" : "grab",
                zIndex: dragging ? 100 : 3,
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => e.stopPropagation()}
        >
            {isEditing ? (
                <textarea
                    className="sticky-textarea"
                    value={localText}
                    onChange={(e) => setLocalText(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleBlur();
                        }
                    }}
                    autoFocus
                />
            ) : (
                <div className="sticky-content" onDoubleClick={() => setIsEditing(true)}>
                    {localText || "Двойной клик для редактирования"}
                </div>
            )}
            <button
                className="delete-sticker"
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(id);
                }}
            >
                ✕
            </button>
        </div>
    );
};

export default StickyNote;
