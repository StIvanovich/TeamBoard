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
        return this.db
            .query(
                `
        (
            SELECT 
                b.id, 
                b.name, 
                b.owner_id, 
                u.name AS owner_name
            FROM boards b
            JOIN users u ON b.owner_id = u.id
            WHERE b.owner_id = $1
        )
        UNION
        (
            SELECT 
                b.id, 
                b.name, 
                b.owner_id, 
                u.name AS owner_name
            FROM board_access ba
            JOIN boards b ON ba.board_id = b.id
            JOIN users u ON b.owner_id = u.id
            WHERE ba.user_id = $1
        )
        ORDER BY id DESC
    `,
                [userId],
            )
            .then((res) => res.rows);
    }

    async createBoard(ownerId, name = "Новая доска") {
        const result = await this.orm.insert("boards", { owner_id: ownerId, name });

        return result;
    }

    saveBoardData(boardId, canvasData, stickers) {
        return this.orm.insert(
            "board_data",
            {
                board_id: boardId,
                canvas_data: canvasData,
                stickers: JSON.stringify(stickers),
            },
            "ON CONFLICT (board_id) DO UPDATE SET canvas_data = EXCLUDED.canvas_data, stickers = EXCLUDED.stickers, updated_at = NOW()",
        );
    }

    getBoardData(boardId) {
        return this.orm.get("board_data", { board_id: boardId });
    }
    deleteBoard(boardId) {
        return this.orm.delete("boards", { id: boardId });
    }
    getFriendsByUserId(userId) {
        return this.orm.query(
            `SELECT u.id, u.name 
         FROM friends f
         JOIN users u ON u.id = f.friend_id
         WHERE f.user_id = $1`,
            [userId],
        );
    }
}

module.exports = DB;
