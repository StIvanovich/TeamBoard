import React, { useState, useMemo } from "react";
import "./App.css";
import Server from "./modules/Server";
import SignUp from "./components/SingUp/SignUp";
import Mediator from "./modules/Mediator";
import Login from "./components/Login/Login";
import Menu from "./components/Menu/Menu";

const MEDIATOR = {
    EVENTS: {
        SERVER_ERROR: "SERVER_ERROR",
        GET_MESSAGES: "GET_MESSAGES",
        GET_SCENE: "GET_SCENE",
        GET_USER: "GET_USER",
        GET_GAMERS: "GET_GAMERS",
        GET_FRIENDS: "GET_FRIENDS",
        GET_INVITES: "GET_INVITES",
        CREATE_BOARD: "CREATE_BOARD",
        SAVE_BOARD: "SAVE_BOARD",
        LOAD_BOARDS: "LOAD_BOARDS",
        LOAD_BOARD: "LOAD_BOARD",
        LOGIN: "LOGIN",
        SIGNUP: "SIGNUP",
        LOGOUT: "LOGOUT",
        ADD_FRIEND: "ADD_FRIEND",
        FRIEND_REQUEST: "FRIEND_REQUEST",
        FRIEND_ACCEPTED: "FRIEND_ACCEPTED",
        ADD_FRIEND_SUCCESS: "ADD_FRIEND_SUCCESS",
        BOARD_INVITE: "BOARD_INVITE",
        INVITE_SENT: "INVITE_SENT",
        BOARD_ACCESS_GRANTED: "BOARD_ACCESS_GRANTED",
        FRIEND_JOINED_BOARD: "FRIEND_JOINED_BOARD",
        BOARD_UPDATE: "BOARD_UPDATE",
    },
    TRIGGERS: {},
};

export const ServerContext = React.createContext(null);
export const MediatorContext = React.createContext(null);

const HOST = "localhost:5000";
export const EPAGES = {
    LOGIN: 0,
    SIGNUP: 1,
    MENU: 2,
};

function App() {
    const [epages, setEpages] = useState(EPAGES.SIGNUP);

    const mediator = useMemo(() => new Mediator(MEDIATOR), []);
    const server = useMemo(() => new Server(HOST, mediator), [mediator]);

    return (
        <MediatorContext.Provider value={mediator}>
            <ServerContext.Provider value={server}>
                {epages === EPAGES.SIGNUP ? <SignUp epages={setEpages} /> : epages === EPAGES.LOGIN ? <Login epages={setEpages} /> : epages === EPAGES.MENU ? <Menu epages={setEpages} /> : <></>}
            </ServerContext.Provider>
        </MediatorContext.Provider>
    );
}

export default App;
