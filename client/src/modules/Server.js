import { io } from "socket.io-client";

export default class Server {
    constructor(HOST, mediator) {
        const socket = io(HOST);
        this.socket = socket;
        this.mediator = mediator;
        this.token = null;

        socket.on("connect", () => {
            console.log("✅ Подключено к серверу");
            this._registerEventHandlers(socket);
        });

        socket.on("disconnect", () => {
            console.log("❌ Отключено от сервера");
        });
    }

    _registerEventHandlers(socket) {
        const { LOGIN, SIGNUP, LOGOUT, CREATE_BOARD, LOAD_BOARDS, LOAD_BOARD, SERVER_ERROR } = this.mediator.getEventTypes();

        const handleResponse = (eventType, data) => {
            const result = this._validate(data);
            if (result) {
                this.mediator.call(eventType, result);
            } else {
                this.mediator.call(SERVER_ERROR, data.error || { code: 9000, text: "Неизвестная ошибка" });
            }
        };

        // Обработка LOGIN с сохранением токена
        socket.on("LOGIN", (data) => {
            console.log("📥 LOGIN ответ:", data);
            const result = this._validate(data);
            if (result) {
                this.token = result.token;
                console.log("✅ Токен установлен:", this.token); // ← отладка
                this.mediator.call(LOGIN, result);
            } else {
                this.mediator.call(SERVER_ERROR, data.error);
            }
        });

        // Остальные события — через универсальный обработчик
        socket.on("SIGNUP", (data) => handleResponse(SIGNUP, data));
        socket.on("LOGOUT", (data) => handleResponse(LOGOUT, data));
        socket.on("CREATE_BOARD", (data) => handleResponse(CREATE_BOARD, data));
        socket.on("LOAD_BOARDS", (data) => handleResponse(LOAD_BOARDS, data));
        socket.on("LOAD_BOARD", (data) => handleResponse(LOAD_BOARD, data));
    }

    _validate(data) {
        if (data.result === "ok") {
            return data.data || null;
        }
        return null;
    }

    login(login, password) {
        console.log("📤 LOGIN отправлено:", { login });
        this.socket.emit("LOGIN", { login, password });
    }

    signUp(login, nickname, password) {
        console.log("📤 SIGNUP отправлено:", { login, nickname });
        this.socket.emit("SIGNUP", { login, nickname, password });
    }

    logout() {
        console.log("📤 LOGOUT отправлено, токен:", this.token);
        this.socket.emit("LOGOUT", { token: this.token });
    }

    disconnect() {
        this.socket.close();
    }

    createBoard(name) {
        console.log("📤 CREATE_BOARD отправлено:", name, "токен:", this.token);
        this.socket.emit("CREATE_BOARD", { name, token: this.token });
    }

    saveBoard(boardId, canvasData, stickers) {
        console.log("📤 SAVE_BOARD отправлено, токен:", this.token);
        this.socket.emit("SAVE_BOARD", { boardId, canvasData, stickers, token: this.token });
    }

    loadBoards() {
        console.log("📤 LOAD_BOARDS отправлено, токен:", this.token);
        this.socket.emit("LOAD_BOARDS", { token: this.token });
    }

    loadBoard(boardId) {
        console.log("📤 LOAD_BOARD отправлено, токен:", this.token);
        this.socket.emit("LOAD_BOARD", { boardId, token: this.token });
    }
}
