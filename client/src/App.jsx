import React, { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import Server from "./modules/Server";
import SignUp from "./components/SingUp/SignUp";
import Mediator from "./modules/Mediator";

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
};
console.log(EPAGES);

function App() {
    const [epages, setEpages] = useState(EPAGES.LOGIN);

    const server = new Server(HOST);
    const mediator = new Mediator(MEDIATOR);

    return (
        <>
            <button onClick={() => server.login(1, 1, 1)}>clickme</button>
            <MediatorContext.Provider value={mediator}>
                <ServerContext.Provider value={server}>
                    <SignUp epages={setEpages} />
                </ServerContext.Provider>
            </MediatorContext.Provider>
        </>
    );
}

export default App;
