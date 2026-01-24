import React, { useState, useRef, useEffect, useContext } from "react";
import DrawingCanvas from "./DrawingCanvas";
import StickyNote from "./StickyNote";
import { ServerContext, MediatorContext } from "../../App";
import "./Whiteboard.css";

const Whiteboard = ({ onBack, initialBoardId = null, initialCanvasData = null, initialStickers = [] }) => {
    const server = useContext(ServerContext);
    const mediator = useContext(MediatorContext);

    const canvasRef = useRef(null);
    const [stickers, setStickers] = useState(Array.isArray(initialStickers) ? initialStickers : []);
    const [brushColor, setBrushColor] = useState("#000000");
    const [boardId, setBoardId] = useState(initialBoardId);
    const [isCreating, setIsCreating] = useState(!initialBoardId);

    const saveBoard = () => {
        if (!canvasRef.current || !boardId) return;
        const canvasData = canvasRef.current.toDataURL("image/png");
        server.saveBoard(boardId, canvasData, stickers);
    };

    // Загрузка начального холста
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

    // Создание новой доски
    useEffect(() => {
        const handleCreateBoard = (data) => {
            setBoardId(data.id);
            setIsCreating(false);
        };

        const { CREATE_BOARD } = mediator.getEventTypes();
        mediator.subscribe(CREATE_BOARD, handleCreateBoard);

        if (isCreating) {
            server.createBoard("Новая доска");
        }

        return () => mediator.unsubscribe(CREATE_BOARD, handleCreateBoard);
    }, [mediator, server, isCreating]);

    // Real-time обновления
    useEffect(() => {
        const { BOARD_UPDATE } = mediator.getEventTypes();

        const boardUpdateHandler = (data) => {
            if (data.boardId === boardId) {
                const newStickers = Array.isArray(data.stickers) ? data.stickers : [];
                setStickers(newStickers);

                if (canvasRef.current && data.canvasData) {
                    const img = new Image();
                    img.onload = () => {
                        const ctx = canvasRef.current.getContext("2d");
                        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                        ctx.drawImage(img, 0, 0);
                    };
                    img.src = data.canvasData;
                }
            }
        };

        mediator.subscribe(BOARD_UPDATE, boardUpdateHandler);

        if (boardId) {
            server.joinBoardChannel(boardId);
        }

        return () => {
            mediator.unsubscribe(BOARD_UPDATE, boardUpdateHandler);
            if (boardId) {
                server.leaveBoardChannel(boardId);
            }
        };
    }, [mediator, server, boardId]);

    const addSticker = () => {
        const id = Date.now();
        setStickers((prev) => [...prev, { id, x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, text: "" }]);
        setTimeout(saveBoard, 0);
    };

    const updateStickerText = (id, text) => {
        setStickers((prev) => prev.map((sticker) => (sticker.id === id ? { ...sticker, text } : sticker)));
        saveBoard();
    };

    const updateStickerPosition = (id, x, y) => {
        setStickers((prev) => prev.map((sticker) => (sticker.id === id ? { ...sticker, x, y } : sticker)));
        saveBoard();
    };

    const deleteSticker = (id) => {
        setStickers((prev) => prev.filter((s) => s.id !== id));
        saveBoard();
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
                {isCreating && <span className="creating-indicator">Создание доски...</span>}
            </div>
            <div className="whiteboard-content">
                <DrawingCanvas brushColor={brushColor} ref={canvasRef} onDrawEnd={saveBoard} />
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
