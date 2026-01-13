const bcrypt = require("bcrypt");
const crypto = require("crypto");

class User {
    constructor(db, socketId) {
        this.db = db;
        this.socketId = socketId;
        this.id = null;
        this.name = null;
        this.token = null;
    }

    get() {
        return {
            id: this.id,
            name: this.name,
            token: this.token,
        };
    }

    _includeData({ name, token, id }, socketId) {
        this.id = id;
        this.name = name;
        this.token = token;
        this.socketId = socketId;
    }

    async login(login, password, socketId) {
        const user = await this.db.getUserByLogin(login);
        if (!user) return null;

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return null;

        const token = crypto.randomBytes(32).toString("hex");
        await this.db.updateToken(user.id, token);
        this._includeData({ name: user.name, token, id: user.id }, socketId);
        return this.get();
    }

    async signUp(login, nickname, password) {
        const existing = await this.db.getUserByLogin(login);
        if (existing) return null;

        const hashedPassword = await bcrypt.hash(password, 12);
        await this.db.addUser(login, nickname, hashedPassword);
        return { login, name: nickname };
    }

    async logout(token) {
        if (token === this.token) {
            await this.db.updateToken(this.id, null);
            return true;
        }
        return false;
    }

    getById(id) {
        return this.id === id;
    }

    getUserByToken(token) {
        return this.token === token;
    }
}

module.exports = User;
