import { useContext } from "react";
import { io } from "socket.io-client";
import { MediatorContext } from "../App";

export default class Server {
    constructor(HOST, mediator) {
        const socket = io(HOST);
        this.socket = socket;
        this.mediator = mediator;

        this.socket.on("connect", () => {
            this.socket.on("LOGIN", (data) => {
                console.log(data);
                const result = this._validate(data);
                const { LOGIN, SERVER_ERROR } = this.mediator.getEventTypes();
                if (result) {
                    this.token = result.token;
                    this.mediator.call(LOGIN, result);
                    return;
                }
                this.mediator.call(SERVER_ERROR, data.error);
            });

            this.socket.on("SIGNUP", (data) => {
                const result = this._validate(data);
                const { SIGNUP, SERVER_ERROR } = this.mediator.getEventTypes();

                if (result) {
                    this.mediator.call(SIGNUP);
                    return;
                }
                this.mediator.call(SERVER_ERROR, data.error);
            });
            this.socket.on("LOGOUT", (data) => {
                const result = this._validate(data);
                if (result) {
                    const { LOGOUT } = this.mediator.getEventTypes();
                    this.mediator.call(LOGOUT);
                }
            });
        });
    }
    _validate(data) {
        if (data.result === "ok") {
            return data.data || null;
        }
        return null;
    }
    login(login, hash, rnd) {
        this.socket.emit("LOGIN", { login, hash, rnd });
    }

    logout() {
        this.socket.emit("LOGOUT", { token: this.token });
    }

    signUp(login, nickname, hash, verifyHash) {
        this.socket.emit("SIGNUP", { token: this.token, login, nickname, hash, verifyHash });
    }
    disconnect() {
        this.socket.close();
    }
}
