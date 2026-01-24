import React, { useContext, useEffect, useState } from "react";
import { ServerContext, MediatorContext } from "../../App";
import "./Modal.css";

const BoardListModal = ({ isOpen, onClose, onOpenBoard, friends = [] }) => {
    const server = useContext(ServerContext);
    const mediator = useContext(MediatorContext);
    const [boards, setBoards] = useState([]);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedBoard, setSelectedBoard] = useState(null);
    const [selectedFriendIds, setSelectedFriendIds] = useState(new Set());

    useEffect(() => {
        if (!isOpen) return;

        const { LOAD_BOARDS } = mediator.getEventTypes();
        const loadBoardsHandler = (data) => {
            setBoards(Array.isArray(data) ? data : []);
        };

        mediator.subscribe(LOAD_BOARDS, loadBoardsHandler);
        server.loadBoards();

        return () => {
            mediator.unsubscribe(LOAD_BOARDS, loadBoardsHandler);
        };
    }, [isOpen, mediator, server]);

    const handleDelete = (boardId) => {
        setBoards((prev) => prev.filter((board) => board.id !== boardId));
    };

    const openInviteModal = (board) => {
        setSelectedBoard(board);
        setSelectedFriendIds(new Set());
        setShowInviteModal(true);
    };

    const toggleFriendSelection = (friendId) => {
        const newSet = new Set(selectedFriendIds);
        if (newSet.has(friendId)) {
            newSet.delete(friendId);
        } else {
            newSet.add(friendId);
        }
        setSelectedFriendIds(newSet);
    };

    const sendInvites = () => {
        if (!selectedBoard || selectedFriendIds.size === 0) return;

        selectedFriendIds.forEach((friendId) => {
            server.inviteToBoard(selectedBoard.id, friendId);
        });

        alert(`Приглашение отправлено ${selectedFriendIds.size} ${getPlural(selectedFriendIds.size)}!`);
        setShowInviteModal(false);
    };

    const getPlural = (n) => {
        if (n % 10 === 1 && n % 100 !== 11) return "другу";
        if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "друзьям";
        return "друзьям";
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Основное окно: список досок */}
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
                            [...boards]
                                .sort((a, b) => b.id - a.id)
                                .map((board) => (
                                    <div key={board.id} className="board-item">
                                        <span
                                            onClick={() => {
                                                onOpenBoard(board.id);
                                                onClose();
                                            }}
                                            style={{ flex: 1, cursor: "pointer" }}
                                        >
                                            {board.name || `Доска #${board.id}`}
                                            {board.owner_name && <span style={{ fontSize: "0.8em", color: "#666" }}> (от {board.owner_name})</span>}
                                        </span>
                                        <button
                                            className="invite-friend-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openInviteModal(board);
                                            }}
                                            title="Пригласить друзей"
                                        >
                                            👥
                                        </button>
                                        <button
                                            className="delete-board-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(board.id);
                                            }}
                                            title="Скрыть доску"
                                        >
                                            Х
                                        </button>
                                    </div>
                                ))
                        ) : (
                            <p style={{ color: "#888", textAlign: "center" }}>Нет сохранённых досок</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Модалка приглашения */}
            {showInviteModal && (
                <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Пригласить на доску: {selectedBoard?.name}</h3>
                            <button className="close-btn" onClick={() => setShowInviteModal(false)}>
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            {Array.isArray(friends) && friends.length > 0 ? (
                                <div>
                                    {friends.map((friend) => (
                                        <label key={friend.id} style={{ display: "flex", alignItems: "center", margin: "8px 0" }}>
                                            <input type="checkbox" checked={selectedFriendIds.has(friend.id)} onChange={() => toggleFriendSelection(friend.id)} />
                                            &nbsp;{friend.name} (ID: {friend.id})
                                        </label>
                                    ))}
                                </div>
                            ) : (
                                <p>Нет друзей для приглашения</p>
                            )}
                            <div className="modal-actions" style={{ marginTop: "16px" }}>
                                <button onClick={() => setShowInviteModal(false)} className="btn-cancel">
                                    Отмена
                                </button>
                                <button onClick={sendInvites} className="btn-create" disabled={selectedFriendIds.size === 0}>
                                    Отправить ({selectedFriendIds.size})
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BoardListModal;
