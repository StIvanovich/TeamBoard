const { Client } = require("pg");
const ORM = require("./ORM");

const { Pool } = require("pg");

const DATABASE = {
    database: "teamboard",
    HOST: "localhost",
    PORT: 5432,
    USER: "postgres",
    PASS: "111",
};
class DB {
    constructor() {
        this.db = new Pool({
            host: DATABASE.HOST,
            port: DATABASE.PORT,
            database: DATABASE.database,
            user: DATABASE.USER,
            password: DATABASE.PASS,
        });
        this.orm = new ORM(this.db);
        (async () => {
            await this.db.connect();
        })();
    }
    test() {
        return this.orm.get("users", { id: 1 });
    }

    getUserById(id) {
        return this.orm.get("users", { id });
    }

    getUserByLogin(login) {
        return this.orm.get("users", { login });
    }

    async getUserByToken(token) {
        return await this.orm.get("users", { token });
    }

    updateToken(id, token) {
        this.orm.update("users", { token }, { id });
    }

    addUser(login, name, password) {
        return this.orm.insert("users", { login, name, password });
    }
}

module.exports = DB;
