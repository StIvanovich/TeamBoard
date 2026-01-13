const User = require("./User");

class UserManager {
    constructor(answer, db, io) {
        this.users = {};
        this.answer = answer;
        this.db = db;
        if (!io) return;
        this.io = io;

        io.on("connection", (socket) => {
            socket.on("LOGIN", (data) => this.login(data, socket.id));
            socket.on("SIGNUP", (data) => this.signUp(data, socket.id));
            socket.on("LOGOUT", (data) => this.logout(data, socket.id));
            socket.on("CREATE_BOARD", (data) => this.createBoard(data, socket.id));
            socket.on("SAVE_BOARD", (data) => this.saveBoard(data, socket.id));
            socket.on("LOAD_BOARDS", (data) => this.loadBoards(data, socket.id));
            socket.on("LOAD_BOARD", (data) => this.loadBoard(data, socket.id));
        });
    }

    _getUserBySocketId(socketId) {
        if (!socketId) return null;
        if (!this.users[socketId]) {
            this.users[socketId] = new User(this.db, socketId);
        }
        return this.users[socketId];
    }

    async login({ login, password }, socketId) {
        const user = this._getUserBySocketId(socketId);
        if (!user) {
            this.io.to(socketId).emit("LOGIN", this.answer.bad(488));
            return;
        }

        const data = await user.login(login, password, socketId);
        if (data) {
            this.io.to(socketId).emit("LOGIN", this.answer.good(data));
        } else {
            this.io.to(socketId).emit("LOGIN", this.answer.bad(456));
        }
    }

    async signUp({ login, nickname, password }, socketId) {
        if (!login || !nickname || !password) {
            this.io.to(socketId).emit("SIGNUP", this.answer.bad(1001));
            return;
        }

        const user = this._getUserBySocketId(socketId);
        const result = await user.signUp(login, nickname, password);
        if (result) {
            this.io.to(socketId).emit("SIGNUP", this.answer.good());
        } else {
            this.io.to(socketId).emit("SIGNUP", this.answer.bad(487));
        }
    }

    async logout({ token }, socketId) {
        const user = this._getUserBySocketId(socketId);
        if (user && (await user.logout(token))) {
            delete this.users[socketId];
            this.io.to(socketId).emit("LOGOUT", this.answer.good("ok"));
        } else {
            this.io.to(socketId).emit("LOGOUT", this.answer.bad());
        }
    }

    async createBoard({ name, token }, socketId) {
        console.log("📥 CREATE_BOARD получено:", { name, token });
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            this.io.to(socketId).emit("CREATE_BOARD", this.answer.bad(455));
            return;
        }

        const board = await this.db.createBoard(userRecord.id, name);
        this.io.to(socketId).emit(
            "CREATE_BOARD",
            this.answer.good({
                id: board.rows[0].id,
                name: board.rows[0].name,
            })
        );
    }

    async saveBoard({ boardId, canvasData, stickers, token }, socketId) {
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            this.io.to(socketId).emit("SAVE_BOARD", this.answer.bad(455));
            return;
        }

        await this.db.saveBoardData(boardId, canvasData, stickers);
        this.io.to(socketId).emit("SAVE_BOARD", this.answer.good());
    }

    async loadBoards({ token }, socketId) {
        console.log("📥 LOAD_BOARDS получено, токен:", token);
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            this.io.to(socketId).emit("LOAD_BOARDS", this.answer.bad(455));
            return;
        }

        const boards = await this.db.getBoardsByUserId(userRecord.id);
        this.io.to(socketId).emit("LOAD_BOARDS", this.answer.good(boards));
    }

    async loadBoard({ boardId, token }, socketId) {
        const data = await this.db.getBoardData(boardId);
        this.io.to(socketId).emit("LOAD_BOARD", this.answer.good(data));
    }
}

module.exports = UserManager;
