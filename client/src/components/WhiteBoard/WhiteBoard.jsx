import React, { useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import StickyNote from "./StickyNote";
import "./Whiteboard.css";

const Whiteboard = ({ onBack }) => {
    const [stickers, setStickers] = useState([]);
    const [brushColor, setBrushColor] = useState("#000000");

    const addSticker = () => {
        const id = Date.now();
        setStickers((prev) => [...prev, { id, x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, text: "" }]);
    };

    const updateStickerText = (id, text) => {
        setStickers((prev) => prev.map((sticker) => (sticker.id === id ? { ...sticker, text } : sticker)));
    };

    const updateStickerPosition = (id, x, y) => {
        setStickers((prev) => prev.map((sticker) => (sticker.id === id ? { ...sticker, x, y } : sticker)));
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
                <input type="color" value={brushColor} onChange={(e) => setBrushColor(e.target.value)} className="color-picker-input" />
            </div>
            <div className="whiteboard-content">
                <DrawingCanvas brushColor={brushColor} />
                {stickers.map((sticker) => (
                    <StickyNote
                        key={sticker.id}
                        id={sticker.id}
                        x={sticker.x}
                        y={sticker.y}
                        text={sticker.text}
                        onUpdateText={updateStickerText}
                        onUpdatePosition={updateStickerPosition}
                        onDelete={deleteSticker}
                    />
                ))}
            </div>
        </div>
    );
};

export default Whiteboard;
