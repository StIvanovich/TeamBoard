import { io } from "socket.io-client";

export default class Server {
    constructor(HOST, mediator) {
        const socket = io(HOST);
        this.socket = socket;
        this.mediator = mediator;
        this.token = null;

        socket.on("connect", () => {
            this._registerEventHandlers(socket);
        });

        socket.on("disconnect", () => {});
    }

    _registerEventHandlers(socket) {
        const {
            LOGIN,
            SIGNUP,
            LOGOUT,
            CREATE_BOARD,
            LOAD_BOARDS,
            LOAD_BOARD,
            SERVER_ERROR,
            FRIEND_REQUEST,
            FRIEND_ACCEPTED,
            ADD_FRIEND_SUCCESS,
            GET_FRIENDS,
            BOARD_INVITE,
            INVITE_SENT,
            BOARD_ACCESS_GRANTED,
            FRIEND_JOINED_BOARD,
            BOARD_UPDATE,
        } = this.mediator.getEventTypes();

        socket.on("LOGIN", (data) => {
            const result = this._validate(data);
            if (result) {
                this.token = result.token;
                this.mediator.call(LOGIN, result);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("GET_FRIENDS", (data) => {
            this.mediator.call(GET_FRIENDS, data); // data — массив
        });

        socket.on("ADD_FRIEND_SUCCESS", (message) => {
            this.mediator.call(ADD_FRIEND_SUCCESS, message); // строка
        });

        socket.on("SIGNUP", (data) => {
            if (data.result === "ok") {
                this.mediator.call(SIGNUP, data);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("LOGOUT", (data) => {
            if (data.result === "ok") {
                this.token = null;
                this.mediator.call(LOGOUT, data);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("CREATE_BOARD", (data) => {
            if (data.result === "ok") {
                this.mediator.call(CREATE_BOARD, data.data);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("LOAD_BOARDS", (data) => {
            if (data.result === "ok") {
                this.mediator.call(LOAD_BOARDS, data.data);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("LOAD_BOARD", (data) => {
            if (data.result === "ok") {
                this.mediator.call(LOAD_BOARD, data.data);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("FRIEND_REQUEST", (data) => {
            this.mediator.call(FRIEND_REQUEST, data);
        });

        socket.on("FRIEND_ACCEPTED", (data) => {
            this.mediator.call(FRIEND_ACCEPTED, data);
        });

        socket.on("SERVER_ERROR", (data) => {
            this.mediator.call(SERVER_ERROR, data);
        });
        socket.on("BOARD_INVITE", (data) => {
            this.mediator.call(BOARD_INVITE, data);
        });

        socket.on("INVITE_SENT", (data) => {
            if (data.result === "ok") {
                this.mediator.call(INVITE_SENT, data.data);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("BOARD_ACCESS_GRANTED", (data) => {
            if (data.result === "ok") {
                this.mediator.call(BOARD_ACCESS_GRANTED, data.data);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        socket.on("FRIEND_JOINED_BOARD", (data) => {
            this.mediator.call(FRIEND_JOINED_BOARD, data);
        });

        socket.on("BOARD_UPDATE", (data) => {
            this.mediator.call(BOARD_UPDATE, data);
        });
    }

    _validate(data) {
        if (data.result === "ok") {
            return data.data || null;
        }
        return null;
    }

    login(login, password) {
        this.socket.emit("LOGIN", { login, password });
    }

    signUp(login, nickname, password) {
        this.socket.emit("SIGNUP", { login, nickname, password });
    }

    logout() {
        this.socket.emit("LOGOUT", { token: this.token });
    }

    disconnect() {
        this.socket.close();
    }

    createBoard(name) {
        this.socket.emit("CREATE_BOARD", { name, token: this.token });
    }

    saveBoard(boardId, canvasData, stickers) {
        this.socket.emit("SAVE_BOARD", { boardId, canvasData, stickers, token: this.token });
    }

    loadBoards() {
        this.socket.emit("LOAD_BOARDS", { token: this.token });
    }

    loadBoard(boardId) {
        this.socket.emit("LOAD_BOARD", { boardId, token: this.token });
    }

    loadFriends() {
        if (this.token) {
            this.socket.emit("LOAD_FRIENDS", { token: this.token });
        }
    }

    addFriend(friendId) {
        this.socket.emit("ADD_FRIEND", { friendId, token: this.token });
    }

    acceptFriend(requestId) {
        this.socket.emit("ACCEPT_FRIEND", { requestId, token: this.token });
    }

    inviteToBoard(boardId, friendId) {
        this.socket.emit("INVITE_TO_BOARD", { boardId, friendId, token: this.token });
    }

    acceptBoardInvite(inviteId) {
        this.socket.emit("ACCEPT_BOARD_INVITE", { inviteId, token: this.token });
    }

    joinBoardChannel(boardId) {
        this.socket.emit("JOIN_BOARD", { boardId, token: this.token });
    }

    leaveBoardChannel(boardId) {
        this.socket.emit("LEAVE_BOARD", { boardId, token: this.token });
    }
}
