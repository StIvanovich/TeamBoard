import React, { useState, useRef, useEffect } from "react";

const StickyNote = ({ id, x, y, text, onUpdateText, onUpdatePosition, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [localText, setLocalText] = useState(text);
    const noteRef = useRef(null);

    useEffect(() => {
        if (!isEditing) {
            setLocalText(text);
        }
    }, [text, isEditing]);

    const handleMouseEnter = () => {
        if (noteRef.current) {
            noteRef.current.style.opacity = "0.7";
        }
    };

    const handleMouseLeave = () => {
        if (noteRef.current) {
            noteRef.current.style.opacity = "1";
        }
    };

    const handleTextMouseDown = (e) => {
        if (isEditing) return;
        e.stopPropagation();
        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = x;
        const startTop = y;

        const handleMouseMove = (moveEvent) => {
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;
            let newX = startLeft + dx;
            let newY = startTop + dy;

            newX = Math.max(0, Math.min(window.innerWidth - 180, newX));
            newY = Math.max(60, Math.min(window.innerHeight - 120, newY));

            noteRef.current.style.transform = `translate(${newX - startLeft}px, ${newY - startTop}px)`;
        };

        const handleMouseUp = () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);

            const finalX = parseFloat(noteRef.current.style.transform.split("translate(")[1]?.split("px")[0] || "0") + startLeft;
            const finalY = parseFloat(noteRef.current.style.transform.split(",")[1]?.trim().split("px")[0] || "0") + startTop;

            const boundedX = Math.max(0, Math.min(window.innerWidth - 180, finalX));
            const boundedY = Math.max(60, Math.min(window.innerHeight - 120, finalY));

            onUpdatePosition(id, boundedX, boundedY);
            noteRef.current.style.transform = "";
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);
    };

    const handleBlur = () => {
        onUpdateText(id, localText);
        setIsEditing(false);
    };

    return (
        <div
            ref={noteRef}
            className="sticky-note"
            style={{
                position: "absolute",
                left: `${x}px`,
                top: `${y}px`,
                cursor: isEditing ? "text" : "grab",
                userSelect: isEditing ? "text" : "none",
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
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
                <div className="sticky-content" onMouseDown={handleTextMouseDown} onDoubleClick={() => setIsEditing(true)}>
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
