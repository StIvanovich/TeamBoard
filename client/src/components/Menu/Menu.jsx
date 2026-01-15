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
    const [friends, setFriends] = useState([{ id: 0, name: "У Вас нет друзей!" }]);
    const [invites, setInvites] = useState(null);
    const [showIdInput, setShowIdInput] = useState(false);
    const [currentBoardData, setCurrentBoardData] = useState(null);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isBoardListOpen, setIsBoardListOpen] = useState(false);
    const [shouldOpenNewBoard, setShouldOpenNewBoard] = useState(false);

    const clickHandler = () => {
        const id = idRef.current?.value?.trim();
        if (id) {
            server.addFriend(id);
            if (idRef.current) idRef.current.value = "";
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

    useEffect(() => {
        const { GET_INVITES, GET_FRIENDS, LOGOUT, LOAD_BOARD, CREATE_BOARD, LOAD_BOARDS } = mediator.getEventTypes();

        const getInvitesHandler = (data) => setInvites(data);
        const getFriendsHandler = (data) => setFriends(data);
        const logoutHandler = () => {
            setCurrentBoardData(null);
            epages(EPAGES.LOGIN);
        };
        const loadBoardHandler = (data) => {
            setCurrentBoardData({
                id: data.board_id,
                canvasData: data.canvas_data,
                stickers: JSON.parse(data.stickers || "[]"),
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

        mediator.subscribe(GET_FRIENDS, getFriendsHandler);
        mediator.subscribe(GET_INVITES, getInvitesHandler);
        mediator.subscribe(LOGOUT, logoutHandler);
        mediator.subscribe(LOAD_BOARD, loadBoardHandler);
        mediator.subscribe(CREATE_BOARD, createBoardHandler);

        return () => {
            mediator.unsubscribe(GET_FRIENDS, getFriendsHandler);
            mediator.unsubscribe(GET_INVITES, getInvitesHandler);
            mediator.unsubscribe(LOGOUT, logoutHandler);
            mediator.unsubscribe(LOAD_BOARD, loadBoardHandler);
            mediator.unsubscribe(CREATE_BOARD, createBoardHandler);
        };
    }, [mediator, epages, server, shouldOpenNewBoard]);

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

                <hr className="hr-user-profile1" id="test-hr1-friends" />

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

                <div onClick={toggleIdInput} className="new-profile-button"></div>

                <div
                    style={{
                        position: "absolute",
                        left: 5,
                        bottom: 60,
                        width: 222,
                        height: 240,
                        overflowY: "auto",
                    }}
                >
                    {invites?.friendsId?.length > 0 ? (
                        invites.friendsId.map((invite) => (
                            <div key={invite} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
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
                    ) : (
                        <div className="your-friend">Нет приглашений</div>
                    )}
                </div>

                <div className="your-friend-menu" id="test-friend-menu">
                    {friends.map((friend) => (
                        <div className="your-friend" key={friend.id}>
                            {`${friend.id}: ${friend.name}`}
                        </div>
                    ))}
                </div>
                <hr className="hr-user-profile2" id="test-hr2" />
            </div>

            <button className="button-account" id="test-change-account" onClick={() => server.logout()}>
                Сменить аккаунт
            </button>

            {/* Модальные окна */}
            <CreateBoardModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onCreate={handleCreateBoard} />
            <BoardListModal
                isOpen={isBoardListOpen}
                onClose={() => setIsBoardListOpen(false)}
                onOpenBoard={(boardId) => {
                    server.loadBoard(boardId);
                    setIsBoardListOpen(false);
                }}
            />
        </div>
    );
};

export default Menu;
