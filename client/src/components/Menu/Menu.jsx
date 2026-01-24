import React, { useContext, useEffect, useRef, useState } from "react";
import { EPAGES, MediatorContext, ServerContext } from "../../App";
import logo from "./image/logo.png";
import Whiteboard from "../WhiteBoard/Whiteboard";
import "./Menu.css";
import CreateBoardModal from "./CreateBoardModal";
import BoardListModal from "./BoardListModal";

const Menu = ({ epages }) => {
    const server = useContext(ServerContext);
    const mediator = useContext(MediatorContext);

    const idRef = useRef(null);
    const [friends, setFriends] = useState([]);
    const [invites, setInvites] = useState({ friendRequests: [] });
    const [showIdInput, setShowIdInput] = useState(false);
    const [currentBoardData, setCurrentBoardData] = useState(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBoardListOpen, setIsBoardListOpen] = useState(false);
    const [shouldOpenNewBoard, setShouldOpenNewBoard] = useState(false);

    const clickHandler = () => {
        const id = idRef.current?.value?.trim();
        if (id) {
            server.addFriend(id);
            idRef.current.value = "";
        }
    };

    const toggleIdInput = () => {
        setShowIdInput((prev) => !prev);
    };

    const handleCreateBoard = (name) => {
        server.createBoard(name);
        setShouldOpenNewBoard(true);
        setIsCreateModalOpen(false);
    };

    const loginHandler = (data) => {
        server.loadBoards();
        server.loadFriends();
    };

    useEffect(() => {
        const {
            GET_INVITES,
            GET_FRIENDS,
            LOGOUT,
            LOAD_BOARD,
            CREATE_BOARD,
            LOAD_BOARDS,
            ADD_FRIEND_SUCCESS,
            FRIEND_REQUEST,
            FRIEND_ACCEPTED,
            SERVER_ERROR,
            LOGIN,
            BOARD_INVITE,
            BOARD_ACCESS_GRANTED,
            FRIEND_JOINED_BOARD,
            BOARD_UPDATE,
        } = mediator.getEventTypes();

        server.loadFriends();
        server.loadBoards();

        const getInvitesHandler = (data) => setInvites((prev) => ({ ...prev, friendsId: data.friendsId || [] }));

        const getFriendsHandler = (friendsList) => {
            console.log("📥 Список друзей загружен:", friendsList);
            setFriends(Array.isArray(friendsList) ? friendsList : []);
        };

        const logoutHandler = () => {
            setCurrentBoardData(null);
            epages(EPAGES.LOGIN);
        };

        const loadBoardHandler = (data) => {
            let stickers = [];
            if (data.stickers) {
                if (typeof data.stickers === "string") {
                    try {
                        stickers = JSON.parse(data.stickers);
                    } catch (e) {
                        console.warn("Не удалось распарсить стикеры:", data.stickers, e);
                        stickers = [];
                    }
                } else if (Array.isArray(data.stickers)) {
                    stickers = data.stickers;
                }
            }

            setCurrentBoardData({
                id: data.board_id,
                canvasData: data.canvas_data,
                stickers: stickers,
            });
        };
        const createBoardHandler = (data) => {
            server.loadBoards();
            if (shouldOpenNewBoard) {
                setCurrentBoardData({
                    id: data.id,
                    canvasData: null,
                    stickers: [],
                });
                setShouldOpenNewBoard(false);
            }
        };

        const addFriendSuccessHandler = (message) => {
            console.log("✅", message);
            alert(message);
        };

        const friendRequestHandler = (data) => {
            console.log("📩 Получен запрос в друзья:", data);
            setInvites((prev) => ({
                ...prev,
                friendRequests: [...(prev.friendRequests || []), data],
            }));
        };

        const friendAcceptedHandler = (data) => {
            const newFriend = {
                id: data.friendId,
                name: data.friendName,
            };
            setFriends((prev) => [...prev, newFriend]);
            alert(`Пользователь ${data.friendName} теперь ваш друг!`);
        };

        const serverErrorHandler = (error) => {
            console.error("Ошибка:", error);
            alert(`Ошибка: ${error.text || "Не удалось выполнить действие"}`);
        };

        const boardInviteHandler = (data) => {
            const confirmed = window.confirm(`${data.fromUserName} приглашает вас на доску "${data.boardName}". Принять?`);
            if (confirmed) {
                server.acceptBoardInvite(data.inviteId);
            }
        };

        const boardAccessGrantedHandler = (data) => {
            alert(`Доступ к доске "${data.boardName}" получен!`);
            server.loadBoards(); // Обновляем список
        };

        const friendJoinedBoardHandler = (data) => {
            alert(`${data.friendName} присоединился к вашей доске!`);
        };

        const boardUpdateHandler = (data) => {
            if (currentBoardData && currentBoardData.id === data.boardId) {
                // Обновляем холст и стикеры в реальном времени
                setCurrentBoardData((prev) => ({
                    ...prev,
                    canvasData: data.canvasData,
                    stickers: data.stickers,
                }));
            }
        };

        mediator.subscribe(GET_INVITES, getInvitesHandler);
        mediator.subscribe(GET_FRIENDS, getFriendsHandler);
        mediator.subscribe(LOGOUT, logoutHandler);
        mediator.subscribe(LOAD_BOARD, loadBoardHandler);
        mediator.subscribe(CREATE_BOARD, createBoardHandler);
        mediator.subscribe(ADD_FRIEND_SUCCESS, addFriendSuccessHandler);
        mediator.subscribe(FRIEND_REQUEST, friendRequestHandler);
        mediator.subscribe(FRIEND_ACCEPTED, friendAcceptedHandler);
        mediator.subscribe(SERVER_ERROR, serverErrorHandler);
        mediator.subscribe(BOARD_INVITE, boardInviteHandler);
        mediator.subscribe(BOARD_ACCESS_GRANTED, boardAccessGrantedHandler);
        mediator.subscribe(FRIEND_JOINED_BOARD, friendJoinedBoardHandler);
        mediator.subscribe(BOARD_UPDATE, boardUpdateHandler);

        return () => {
            mediator.unsubscribe(GET_INVITES, getInvitesHandler);
            mediator.unsubscribe(GET_FRIENDS, getFriendsHandler);
            mediator.unsubscribe(LOGOUT, logoutHandler);
            mediator.unsubscribe(LOAD_BOARD, loadBoardHandler);
            mediator.unsubscribe(CREATE_BOARD, createBoardHandler);
            mediator.unsubscribe(ADD_FRIEND_SUCCESS, addFriendSuccessHandler);
            mediator.unsubscribe(FRIEND_REQUEST, friendRequestHandler);
            mediator.unsubscribe(FRIEND_ACCEPTED, friendAcceptedHandler);
            mediator.unsubscribe(SERVER_ERROR, serverErrorHandler);
            mediator.unsubscribe(BOARD_INVITE, boardInviteHandler);
            mediator.unsubscribe(BOARD_ACCESS_GRANTED, boardAccessGrantedHandler);
            mediator.unsubscribe(FRIEND_JOINED_BOARD, friendJoinedBoardHandler);
            mediator.unsubscribe(BOARD_UPDATE, boardUpdateHandler);
        };
    }, [mediator, epages, server, shouldOpenNewBoard, currentBoardData?.id]);

    if (currentBoardData) {
        return <Whiteboard onBack={() => setCurrentBoardData(null)} initialBoardId={currentBoardData.id} initialCanvasData={currentBoardData.canvasData} initialStickers={currentBoardData.stickers} />;
    }

    return (
        <div className="mainMenu" id="test-mainMemu">
            <img className="photo-button" src={logo} id="test-logo" alt="Логотип" />

            <div className="buttons-container">
                <div onClick={() => setIsCreateModalOpen(true)} className="button1" id="test-play">
                    Создать Доску
                </div>
                <div onClick={() => setIsBoardListOpen(true)} className="button2" id="test-heroes">
                    Список доступных досок
                </div>
                <div onClick={() => epages(EPAGES.PARAMETERS)} className="button3" id="test-settings">
                    Параметры
                </div>
            </div>

            <div className="profile-panel" id="test-profile">
                <div className="user-profile" id="test-user"></div>
                <hr className="hr-user-profile1" id="test-hr1" />

                <div className="text-button" id="test-friends">
                    Друзья
                    {showIdInput && (
                        <div id="test-new-profile">
                            <input className="add-friend" ref={idRef} type="text" placeholder="Введите ID друга" />
                            <button className="add-friend-button" onClick={clickHandler}>
                                Добавить друга
                            </button>
                        </div>
                    )}
                </div>

                <div className="text-Invitation">
                    Приглашения
                    <hr className="hr-line-Invitation" />
                </div>

                {/* Заявки в друзья */}
                <div className="invites-section">
                    {invites?.friendRequests?.map((req) => {
                        if (!req.requestId) return null;
                        return (
                            <div key={`request-${req.requestId}`} style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "8px" }}>
                                <div className="your-friend">
                                    {req.fromUserName} (ID: {req.fromUserId}) хочет добавить вас в друзья.
                                </div>
                                <button
                                    className="toaccept"
                                    onClick={() => {
                                        server.acceptFriend(req.requestId);
                                        setInvites((prev) => ({
                                            ...prev,
                                            friendRequests: prev.friendRequests.filter((r) => r.requestId !== req.requestId),
                                        }));
                                    }}
                                    aria-label="Принять"
                                />
                                <button
                                    className="deny"
                                    onClick={() => {
                                        setInvites((prev) => ({
                                            ...prev,
                                            friendRequests: prev.friendRequests.filter((r) => r.requestId !== req.requestId),
                                        }));
                                    }}
                                    aria-label="Отклонить"
                                />
                            </div>
                        );
                    })}

                    {/* Старые приглашения */}
                    {invites?.friendsId?.length > 0 ? (
                        invites.friendsId.map((invite) => (
                            <div key={`invite-${invite}`} style={{ display: "flex", alignItems: " center", gap: "6px", marginTop: "8px" }}>
                                <div className="your-friend">Пользователь с id: {invite} приглашает вас.</div>
                                <button
                                    className="toaccept"
                                    onClick={() => {
                                        server.addGamers(invites.lobbyName);
                                        epages(EPAGES.LOBBY);
                                    }}
                                    aria-label="Принять"
                                />
                                <button className="deny" onClick={() => console.log("Отклонено:", invite)} aria-label="Отклонить" />
                            </div>
                        ))
                    ) : invites?.friendRequests?.length === 0 ? (
                        <div className="your-friend">Нет приглашений</div>
                    ) : null}
                </div>

                <div onClick={toggleIdInput} className="new-profile-button"></div>

                {/* Список друзей */}
                <div className="your-friend-menu" id="test-friend-menu">
                    {friends.length > 0 ? (
                        friends.map((friend) => (
                            <div className="your-friend" key={`friend-${friend.id}`}>
                                {`${friend.id}: ${friend.name}`}
                            </div>
                        ))
                    ) : (
                        <div className="your-friend">Нет друзей</div>
                    )}
                </div>
                <hr className="hr-user-profile2" id="test-hr2" />
            </div>

            <button className="button-account" id="test-change-account" onClick={() => server.logout()}>
                Сменить аккаунт
            </button>

            <CreateBoardModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateBoard} />
            <BoardListModal
                isOpen={isBoardListOpen}
                onClose={() => setIsBoardListOpen(false)}
                onOpenBoard={(boardId) => {
                    server.loadBoard(boardId);
                    setIsBoardListOpen(false);
                }}
                friends={friends}
            />
        </div>
    );
};

export default Menu;
