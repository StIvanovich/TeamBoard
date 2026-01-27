import React, { useState, useRef, useEffect, useContext } from "react";
import DrawingCanvas from "./DrawingCanvas";
import StickyNote from "./StickyNote";
import { ServerContext, MediatorContext } from "../../App";
import ConfirmModal from "../Menu/confirmModal/ConfirmModal";
import "./Whiteboard.css";

const Whiteboard = ({ onBack, initialBoardId = null, initialCanvasData = null, initialStickers = [] }) => {
    const server = useContext(ServerContext);
    const mediator = useContext(MediatorContext);

    const canvasRef = useRef(null);
    const [stickers, setStickers] = useState(Array.isArray(initialStickers) ? initialStickers : []);
    const [brushColor, setBrushColor] = useState("#000000");
    const [boardId, setBoardId] = useState(initialBoardId);
    const [isCreating, setIsCreating] = useState(!initialBoardId);
    const [confirmMessage, setConfirmMessage] = useState(null);
    const [pendingInvite, setPendingInvite] = useState(null);

    const saveBoardWithStickers = (stickersToSave) => {
        if (!canvasRef.current || !boardId) return;
        const canvasData = canvasRef.current.toDataURL("image/png");
        server.saveBoard(boardId, canvasData, stickersToSave);
    };

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

        return () => {
            mediator.unsubscribe(CREATE_BOARD, handleCreateBoard);
        };
    }, [mediator, server, isCreating]);

    useEffect(() => {
        const { BOARD_UPDATE, BOARD_INVITE } = mediator.getEventTypes();

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

        const boardInviteHandler = (data) => {
            setConfirmMessage(`${data.fromUserName} приглашает вас на доску "${data.boardName}". Принять?`);
            setPendingInvite(data);
        };

        mediator.subscribe(BOARD_UPDATE, boardUpdateHandler);
        mediator.subscribe(BOARD_INVITE, boardInviteHandler);

        if (boardId) {
            server.joinBoardChannel(boardId);
        }

        return () => {
            mediator.unsubscribe(BOARD_UPDATE, boardUpdateHandler);
            mediator.unsubscribe(BOARD_INVITE, boardInviteHandler);
            if (boardId) {
                server.leaveBoardChannel(boardId);
            }
        };
    }, [mediator, server, boardId]);

    const handleAcceptInvite = () => {
        if (pendingInvite) {
            server.acceptBoardInvite(pendingInvite.inviteId);
        }
        setConfirmMessage(null);
        setPendingInvite(null);
    };

    const handleCancelInvite = () => {
        setConfirmMessage(null);
        setPendingInvite(null);
    };

    const addSticker = () => {
        const id = Date.now();
        const newSticker = { id, x: 100 + Math.random() * 200, y: 100 + Math.random() * 200, text: "" };
        setStickers((prev) => {
            const updated = [...prev, newSticker];
            saveBoardWithStickers(updated);
            return updated;
        });
    };

    const updateStickerText = (id, text) => {
        setStickers((prev) => {
            const updated = prev.map((sticker) => (sticker.id === id ? { ...sticker, text } : sticker));
            saveBoardWithStickers(updated);
            return updated;
        });
    };

    const updateStickerPosition = (id, x, y) => {
        setStickers((prev) => {
            const updated = prev.map((sticker) => (sticker.id === id ? { ...sticker, x, y } : sticker));
            saveBoardWithStickers(updated);
            return updated;
        });
    };

    const deleteSticker = (id) => {
        setStickers((prev) => {
            const updated = prev.filter((s) => s.id !== id);
            saveBoardWithStickers(updated);
            return updated;
        });
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
                <DrawingCanvas brushColor={brushColor} ref={canvasRef} onDrawEnd={() => saveBoardWithStickers(stickers)} />
            </div>

            {confirmMessage && <ConfirmModal message={confirmMessage} onConfirm={handleAcceptInvite} onCancel={handleCancelInvite} />}
        </div>
    );
};

export default Whiteboard;
