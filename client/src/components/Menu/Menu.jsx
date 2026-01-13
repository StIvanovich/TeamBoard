import React, { useContext, useEffect, useRef, useState } from "react";
import { EPAGES, MediatorContext, ServerContext } from "../../App";
import logo from "./image/logo.png";
import Whiteboard from "../WhiteBoard/WhiteBoard";
import "./Menu.css";

const Menu = ({ epages }) => {
    const server = useContext(ServerContext);
    const mediator = useContext(MediatorContext);

    const idRef = useRef(null);
    const [friends, setFriends] = useState([{ id: 0, name: "У Вас нет друзей!" }]);
    const [invites, setInvites] = useState(null);
    const [showIdInput, setShowIdInput] = useState(false);
    const [showWhiteboard, setShowWhiteboard] = useState(false);

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

    useEffect(() => {
        const { GET_INVITES, GET_FRIENDS, LOGOUT } = mediator.getEventTypes();

        const getInvitesHandler = (data) => setInvites(data);
        const getFriendsHandler = (data) => setFriends(data);
        const logoutHandler = () => {
            setShowWhiteboard(false);
            epages(EPAGES.LOGIN);
        };

        mediator.subscribe(GET_FRIENDS, getFriendsHandler);
        mediator.subscribe(GET_INVITES, getInvitesHandler);
        mediator.subscribe(LOGOUT, logoutHandler);

        return () => {
            mediator.unsubscribe(GET_FRIENDS, getFriendsHandler);
            mediator.unsubscribe(GET_INVITES, getInvitesHandler);
            mediator.unsubscribe(LOGOUT, logoutHandler);
        };
    }, [mediator, epages]);

    const lobbyHandler = () => {
        setShowWhiteboard(true);
    };

    if (showWhiteboard) {
        return <Whiteboard onBack={() => setShowWhiteboard(false)} />;
    }

    return (
        <div className="mainMenu" id="test-mainMemu">
            <img className="photo-button" src={logo} id="test-logo" alt="Логотип" />

            <div className="buttons-container">
                <div onClick={lobbyHandler} className="button1" id="test-play">
                    Создать Доску
                </div>
                <div onClick={() => epages(EPAGES.HEROES)} className="button2" id="test-heroes">
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
        </div>
    );
};

export default Menu;
