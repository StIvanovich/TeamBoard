import React, { useState, useRef, useEffect, useContext } from "react";
import DrawingCanvas from "./DrawingCanvas";
import StickyNote from "./StickyNote";
import { ServerContext, MediatorContext } from "../../App"; // ← путь может отличаться
import "./Whiteboard.css";

const Whiteboard = ({ onBack, initialBoardId = null, initialCanvasData = null, initialStickers = [] }) => {
    const server = useContext(ServerContext);
    const mediator = useContext(MediatorContext);

    const canvasRef = useRef(null);
    const [stickers, setStickers] = useState(initialStickers);
    const [brushColor, setBrushColor] = useState("#000000");
    const [boardId, setBoardId] = useState(initialBoardId);

    // Загрузка данных на холст при монтировании
    useEffect(() => {
        if (initialCanvasData && canvasRef.current) {
            const img = new Image();
            img.onload = () => {
                const ctx = canvasRef.current.getContext("2d");
                ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                ctx.drawImage(img, 0, 0);
            };
            img.src = initialCanvasData;
        }
    }, [initialCanvasData]);

    // Обработка создания новой доски
    useEffect(() => {
        const handleCreateBoard = (data) => {
            setBoardId(data.id);
        };

        const { CREATE_BOARD } = mediator.getEventTypes();
        mediator.subscribe(CREATE_BOARD, handleCreateBoard);

        return () => {
            mediator.unsubscribe(CREATE_BOARD, handleCreateBoard);
        };
    }, [mediator]);

    // Функции стикеров
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

    // Сохранение доски
    const saveBoard = () => {
        if (!canvasRef.current) return;

        const canvasData = canvasRef.current.toDataURL("image/png");
        server.saveBoard(boardId, canvasData, stickers);
    };

    // Авто-сохранение каждые 30 секунд (если есть boardId)
    useEffect(() => {
        if (!boardId) return;

        const interval = setInterval(saveBoard, 30000);
        return () => clearInterval(interval);
    }, [boardId, stickers, brushColor]);

    // Кнопка сохранения (временно для теста)
    const handleSaveClick = () => {
        if (!boardId) {
            // Если доска новая — сначала создать запись
            server.createBoard("Новая доска");
        } else {
            saveBoard();
        }
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
                <button onClick={handleSaveClick} style={{ marginLeft: "10px" }} disabled={!boardId && !initialBoardId}>
                    💾 {boardId ? "Сохранить" : "Создать и сохранить"}
                </button>
            </div>
            <div className="whiteboard-content">
                <DrawingCanvas brushColor={brushColor} ref={canvasRef} />
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
