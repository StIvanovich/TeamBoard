// src/components/Whiteboard/Whiteboard.jsx
import React, { useState, useRef } from "react";
import DrawingCanvas from "./DrawingCanvas";
import StickyNote from "./StickyNote";
import "./Whiteboard.css";

const Whiteboard = ({ onBack }) => {
    const [stickers, setStickers] = useState([]);
    const canvasRef = useRef(null);

    const addSticker = () => {
        const id = Date.now();
        setStickers((prev) => [...prev, { id, x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, text: "" }]);
    };

    const updateStickerText = (id, text) => {
        setStickers((prev) => prev.map((sticker) => (sticker.id === id ? { ...sticker, text } : sticker)));
    };

    const deleteSticker = (id) => {
        setStickers((prev) => prev.filter((s) => s.id !== id));
    };

    return (
        <div className="whiteboard-container">
            <div className="whiteboard-header">
                <button className="back-button" onClick={onBack}>
                    ← Назад
                </button>
                <button className="add-sticker-btn" onClick={addSticker}>
                    + Стикер
                </button>
            </div>

            <div className="whiteboard-content">
                <DrawingCanvas ref={canvasRef} />

                {stickers.map((sticker) => (
                    <StickyNote key={sticker.id} id={sticker.id} x={sticker.x} y={sticker.y} text={sticker.text} onUpdateText={updateStickerText} onDelete={deleteSticker} />
                ))}
            </div>
        </div>
    );
};

export default Whiteboard;
