import { io } from "socket.io-client";

export default class Server {
    constructor(HOST) {
        const socket = io(HOST);
        this.socket = socket;

        this.socket.on("connect", () => {
            this.socket.on("LOGIN", (data) => {
                console.log(data);
                // const result = this._validate(data);
                // if (result) {
                //     this.token = result.token;
                //     const { LOGIN } = this.mediator.getEventTypes();
                //     this.mediator.call(LOGIN, result);
                // }
            });

            this.socket.on("SIGNUP", (data) => {
                const result = this._validate(data);
                if (result) {
                    const { SIGNUP } = this.mediator.getEventTypes();
                    this.mediator.call < Array < TMessage >> SIGNUP;
                }
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
