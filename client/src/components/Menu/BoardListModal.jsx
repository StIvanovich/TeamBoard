import React, { useState, useContext, useEffect } from "react";
import { MediatorContext, ServerContext } from "../../App";
import "./Modal.css";

const BoardListModal = ({ isOpen, onClose, onOpenBoard }) => {
    const server = useContext(ServerContext);
    const mediator = useContext(MediatorContext);
    const [boards, setBoards] = useState([]);

    useEffect(() => {
        if (!isOpen) return;

        const { LOAD_BOARDS } = mediator.getEventTypes();
        const loadBoardsHandler = (data) => {
            setBoards(data || []);
        };

        mediator.subscribe(LOAD_BOARDS, loadBoardsHandler);
        server.loadBoards();

        return () => {
            mediator.unsubscribe(LOAD_BOARDS, loadBoardsHandler);
        };
    }, [isOpen, mediator, server]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h3>Мои доски</h3>
                    <button className="close-btn" onClick={onClose}>
                        ✕
                    </button>
                </div>
                <div className="modal-body">
                    {boards.length > 0 ? (
                        boards.map((board) => (
                            <div
                                key={board.id}
                                className="board-item"
                                onClick={() => {
                                    onOpenBoard(board.id);
                                    onClose();
                                }}
                            >
                                {board.name || `Доска #${board.id}`}
                            </div>
                        ))
                    ) : (
                        <p style={{ color: "#888", textAlign: "center" }}>Нет сохранённых досок</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BoardListModal;
