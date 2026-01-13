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

    getBoardsByUserId(userId) {
        return this.orm.all("boards", { owner_id: userId }, "id, name, created_at", true);
    }

    // Создать доску
    async createBoard(ownerId, name = "Новая доска") {
        const result = await this.orm.insert("boards", { owner_id: ownerId, name });
        // Добавьте RETURNING id
        return result; // Убедитесь, что ORM возвращает данные
    }
    // Сохранить данные доски
    saveBoardData(boardId, canvasData, stickers) {
        return this.orm.insert(
            "board_data",
            {
                board_id: boardId,
                canvas_data: canvasData,
                stickers: JSON.stringify(stickers),
            },
            "ON CONFLICT (board_id) DO UPDATE SET canvas_data = EXCLUDED.canvas_data, stickers = EXCLUDED.stickers, updated_at = NOW()"
        );
    }

    // Загрузить данные доски
    getBoardData(boardId) {
        return this.orm.get("board_data", { board_id: boardId });
    }
}

module.exports = DB;
