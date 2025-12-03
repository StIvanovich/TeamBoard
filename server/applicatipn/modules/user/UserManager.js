const User = require("./User");

class UserManager {
    constructor(answer, db, io) {
        this.users = {};

        this.answer = answer;
        this.db = db;
        //this.mediator = mediator;
        if (!io) {
            return;
        }
        this.io = io;
        io.on("connection", (socket) => {
            socket.on("LOGIN", (data) => this.login(data, socket.id));
            socket.on("SIGNUP", (data) => this.signUp(data, socket.id));
            socket.on("LOGOUT", (data) => this.logout(data, socket.id));
        });
    }

    _getUserBySocketId(socketId) {
        if (socketId) {
            if (this.users[socketId]) {
                return this.users[socketId];
            }
            const user = new User(this.db, socketId);
            this.users[socketId] = user;
            return user;
        }
        return null;
    }

    async login({ login, hash, rnd }, socketId) {
        const user = this._getUserBySocketId(socketId);
        if (user) {
            const data = await user.login(login, hash, rnd, socketId);
            if (data) {
                this.io.to(socketId).emit("LOGIN", this.answer.good(data));
                //this.io.to(socketId).emit("GET_USER", this.answer.good(data));
                return;
            }
            this.io.to(socketId).emit("LOGIN", this.answer.bad(1000));
            return;
        }
        this.io.to(socketId).emit("LOGIN", this.answer.bad(488));
    }

    async signUp({ login, nickname, hash, verifyHash }, socketId) {
        if (login && nickname) {
            if (hash && verifyHash && hash === verifyHash) {
                const user = this._getUserBySocketId(socketId);
                const data = await user.signUp(login, nickname, hash);
                if (data) {
                    this.io.to(socketId).emit("SIGNUP", this.answer.good());
                    return;
                }
                this.io.to(socketId).emit("SIGNUP", this.answer.bad(9999));
                return;
            }
            this.io.to(socketId).emit("SIGNUP", this.answer.bad(1501));

            return;
        }
        this.io.to(socketId).emit("SIGNUP", this.answer.bad(1001));
        return;
    }

    async logout({ token }, socketId) {
        const user = this._getUserBySocketId(socketId);
        if (user) {
            if (await user.logout(token)) {
                delete this.users[socketId];
                this.io.to(socketId).emit("LOGOUT", this.answer.good("ok"));
                return;
            }
            this.io.to(socketId).emit("LOGOUT", this.answer.bad());
            return;
        }
        this.io.to(socketId).emit("LOGOUT", this.answer.bad());
    }

    async getUserById(id, socketId) {
        const user = this._getUserBySocketId(socketId);
        if (user && user.getUserById(id)) {
            return this.answer.good(user);
        }
        return this.answer.bad(455);
    }

    async getUserByToken(token) {
        const user = this._getUserBySocketId(socketId);
        if (user && user.getUserByToken(token)) {
            return this.answer.good(user);
        }
        return this.answer.bad(455);
    }
}

module.exports = UserManager;
