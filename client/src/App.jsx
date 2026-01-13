import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
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
        LOGIN: "LOGIN",
        SIGNUP: "SIGNUP",
        LOGOUT: "LOGOUT",
        GET_MOBS: "GET_MOBS",
        GET_ERROR: "GET_ERROR",
        UPDATE_ARR_BULLET_TRAJECTORY: "UPDATE_ARR_BULLET_TRAJECTORY",
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

    const mediator = new Mediator(MEDIATOR);
    const server = new Server(HOST, mediator);
    return (
        <>
            <MediatorContext.Provider value={mediator}>
                <ServerContext.Provider value={server}>
                    {epages === EPAGES.SIGNUP ? <SignUp epages={setEpages} /> : epages === EPAGES.LOGIN ? <Login epages={setEpages} /> : epages === EPAGES.MENU ? <Menu /> : <></>}
                </ServerContext.Provider>
            </MediatorContext.Provider>
        </>
    );
}

export default App;
