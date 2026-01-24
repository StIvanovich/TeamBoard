const User = require("./User");

class UserManager {
    constructor(answer, db, io) {
        this.users = {};
        this.userSockets = new Map();
        this.answer = answer;
        this.db = db;
        this.io = io;

        if (!io) return;

        io.on("connection", (socket) => {
            console.log("🔌 Пользователь подключился:", socket.id);

            socket.on("LOGIN", (data) => this.login(data, socket.id));
            socket.on("SIGNUP", (data) => this.signUp(data, socket.id));
            socket.on("LOGOUT", (data) => this.logout(data, socket.id));
            socket.on("CREATE_BOARD", (data) => this.createBoard(data, socket.id));
            socket.on("SAVE_BOARD", (data) => this.saveBoard(data, socket.id));
            socket.on("LOAD_BOARDS", (data) => this.loadBoards(data, socket.id));
            socket.on("LOAD_BOARD", (data) => this.loadBoard(data, socket.id));
            socket.on("ADD_FRIEND", (data) => this.addFriend(data, socket.id));
            socket.on("ACCEPT_FRIEND", (data) => this.acceptFriend(data, socket.id));
            socket.on("LOAD_FRIENDS", (data) => this.loadFriends(data, socket.id));
            socket.on("INVITE_TO_BOARD", (data) => this.inviteToBoard(data, socket.id));
            socket.on("ACCEPT_BOARD_INVITE", (data) => this.acceptBoardInvite(data, socket.id));
            socket.on("JOIN_BOARD", (data) => this.joinBoard(data, socket.id));
            socket.on("LEAVE_BOARD", (data) => this.leaveBoard(data, socket.id));

            socket.on("disconnect", () => {
                this.handleDisconnect(socket.id);
            });
        });
    }

    registerUserSocket(userId, socketId) {
        if (!this.userSockets.has(userId)) {
            this.userSockets.set(userId, new Set());
        }
        this.userSockets.get(userId).add(socketId);
    }

    handleDisconnect(socketId) {
        console.log("🔌 Пользователь отключился:", socketId);
        const user = this.users[socketId];
        if (user && user.id) {
            const sockets = this.userSockets.get(user.id);
            if (sockets) {
                sockets.delete(socketId);
                if (sockets.size === 0) {
                    this.userSockets.delete(user.id);
                }
            }
        }
        delete this.users[socketId];
    }

    _getUserBySocketId(socketId) {
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
            this.registerUserSocket(data.id, socketId);
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
            if (user.id) {
                const sockets = this.userSockets.get(user.id);
                if (sockets) {
                    sockets.delete(socketId);
                    if (sockets.size === 0) {
                        this.userSockets.delete(user.id);
                    }
                }
            }
            this.io.to(socketId).emit("LOGOUT", this.answer.good("ok"));
        } else {
            this.io.to(socketId).emit("LOGOUT", this.answer.bad());
        }
    }

    async createBoard({ name, token }, socketId) {
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
            }),
        );
    }

    async saveBoard({ boardId, canvasData, stickers, token }, socketId) {
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            return this.io.to(socketId).emit("SAVE_BOARD", this.answer.bad(455));
        }

        const hasAccess = await this.db.db.query(
            `SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
             UNION
             SELECT 1 FROM board_access WHERE board_id = $1 AND user_id = $2`,
            [boardId, userRecord.id],
        );

        if (hasAccess.rows.length === 0) {
            return this.io.to(socketId).emit("SAVE_BOARD", this.answer.bad(403));
        }

        const stickersToSave = Array.isArray(stickers) ? stickers : [];
        await this.db.saveBoardData(boardId, canvasData, JSON.stringify(stickersToSave));

        this.io.to(`board_${boardId}`).emit("BOARD_UPDATE", {
            boardId,
            canvasData,
            stickers: stickersToSave,
        });

        this.io.to(socketId).emit("SAVE_BOARD", this.answer.good());
    }

    async loadBoards({ token }, socketId) {
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            this.io.to(socketId).emit("LOAD_BOARDS", this.answer.bad(455));
            return;
        }

        const boards = await this.db.getBoardsByUserId(userRecord.id);
        this.io.to(socketId).emit("LOAD_BOARDS", this.answer.good(boards));
    }

    async loadBoard({ boardId, token }, socketId) {
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            return this.io.to(socketId).emit("LOAD_BOARD", this.answer.bad(455));
        }

        // Проверка доступа к доске
        const hasAccess = await this.db.db.query(
            `SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
         UNION
         SELECT 1 FROM board_access WHERE board_id = $1 AND user_id = $2`,
            [boardId, userRecord.id],
        );

        if (hasAccess.rows.length === 0) {
            return this.io.to(socketId).emit("LOAD_BOARD", this.answer.bad(403)); // доступ запрещён
        }

        // Загружаем данные доски
        const data = await this.db.getBoardData(boardId);

        // 🔴 КРИТИЧЕСКАЯ ПРОВЕРКА: доска может не иметь данных (например, новая)
        if (!data) {
            // Возвращаем пустые данные — это нормально для новой доски
            return this.io.to(socketId).emit(
                "LOAD_BOARD",
                this.answer.good({
                    board_id: boardId,
                    canvas_data: null,
                    stickers: [],
                }),
            );
        }

        // Парсим стикеры безопасно
        let parsedStickers = [];
        if (data.stickers) {
            try {
                parsedStickers = JSON.parse(data.stickers);
            } catch (e) {
                console.warn("Не удалось распарсить стикеры:", data.stickers);
                parsedStickers = [];
            }
        }

        const response = {
            board_id: data.board_id,
            canvas_data: data.canvas_data,
            stickers: parsedStickers,
        };

        this.io.to(socketId).emit("LOAD_BOARD", this.answer.good(response));
    }

    async addFriend({ friendId, token }, socketId) {
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(455));
            return;
        }

        const friendIdNum = parseInt(friendId, 10);
        if (isNaN(friendIdNum)) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(488));
            return;
        }

        const friend = await this.db.getUserById(friendIdNum);
        if (!friend) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(488));
            return;
        }

        if (friend.id === userRecord.id) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(500));
            return;
        }

        const existing = await this.db.orm.get("friend_requests", {
            from_user_id: userRecord.id,
            to_user_id: friend.id,
        });

        if (existing) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(501));
            return;
        }

        const result = await this.db.orm.insert("friend_requests", {
            from_user_id: userRecord.id,
            to_user_id: friend.id,
        });

        const targetSockets = this.userSockets.get(friend.id);
        if (targetSockets) {
            targetSockets.forEach((sid) => {
                this.io.to(sid).emit("FRIEND_REQUEST", {
                    fromUserId: userRecord.id,
                    fromUserName: userRecord.name,
                    requestId: result.rows[0].id,
                });
            });
        }

        this.io.to(socketId).emit("ADD_FRIEND_SUCCESS", "Запрос отправлен");
    }

    async acceptFriend({ requestId, token }, socketId) {
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(455));
            return;
        }

        const request = await this.db.orm.get("friend_requests", { id: requestId, to_user_id: userRecord.id });
        if (!request) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(404));
            return;
        }

        await this.db.orm.update("friend_requests", { accepted: true }, { id: requestId });

        const sender = await this.db.getUserById(request.from_user_id);

        await this.db.db.query(`INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [userRecord.id, request.from_user_id]);
        await this.db.db.query(`INSERT INTO friends (user_id, friend_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, [request.from_user_id, userRecord.id]);

        const senderSockets = this.userSockets.get(request.from_user_id);
        if (senderSockets) {
            senderSockets.forEach((sid) => {
                this.io.to(sid).emit("FRIEND_ACCEPTED", {
                    friendId: userRecord.id,
                    friendName: userRecord.name,
                });
            });
        }

        const receiverSockets = this.userSockets.get(userRecord.id);
        if (receiverSockets) {
            receiverSockets.forEach((sid) => {
                this.io.to(sid).emit("FRIEND_ACCEPTED", {
                    friendId: sender.id,
                    friendName: sender.name,
                });
            });
        }

        this.io.to(socketId).emit("ACCEPT_FRIEND_SUCCESS", "Друг добавлен");
    }

    async loadFriends({ token }, socketId) {
        const userRecord = await this.db.getUserByToken(token);
        if (!userRecord) {
            this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(455));
            return;
        }

        const friendsRes = await this.db.db.query(
            `SELECT u.id, u.name AS name 
             FROM friends f
             JOIN users u ON u.id = f.friend_id
             WHERE f.user_id = $1`,
            [userRecord.id],
        );

        this.io.to(socketId).emit("GET_FRIENDS", friendsRes.rows);
    }

    // === НОВЫЕ МЕТОДЫ ДЛЯ СОВМЕСТНЫХ ДОСОК ===

    async inviteToBoard({ boardId, friendId, token }, socketId) {
        const user = await this.db.getUserByToken(token);
        if (!user) return this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(455));

        const board = await this.db.orm.get("boards", { id: boardId, owner_id: user.id });
        if (!board) return this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(404));

        const friend = await this.db.getUserById(friendId);
        if (!friend) return this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(488));

        const existing = await this.db.orm.get("board_invites", { board_id: boardId, to_user_id: friendId });
        if (existing) return this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(501));

        const invite = await this.db.orm.insert("board_invites", {
            board_id: boardId,
            from_user_id: user.id,
            to_user_id: friendId,
        });

        const targetSockets = this.userSockets.get(friendId);
        if (targetSockets) {
            targetSockets.forEach((sid) => {
                this.io.to(sid).emit("BOARD_INVITE", {
                    inviteId: invite.rows[0].id,
                    boardId: boardId,
                    boardName: board.name,
                    fromUserId: user.id,
                    fromUserName: user.name,
                });
            });
        }

        this.io.to(socketId).emit("INVITE_SENT", this.answer.good());
    }

    async acceptBoardInvite({ inviteId, token }, socketId) {
        const user = await this.db.getUserByToken(token);
        if (!user) return this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(455));

        const invite = await this.db.orm.get("board_invites", { id: inviteId, to_user_id: user.id });
        if (!invite) return this.io.to(socketId).emit("SERVER_ERROR", this.answer.bad(404));

        await this.db.orm.insert("board_access", {
            board_id: invite.board_id,
            user_id: user.id,
        });

        await this.db.orm.delete("board_invites", { id: inviteId });

        const board = await this.db.orm.get("boards", { id: invite.board_id });

        this.io.to(socketId).emit(
            "BOARD_ACCESS_GRANTED",
            this.answer.good({
                boardId: invite.board_id,
                boardName: board.name,
            }),
        );

        const senderSockets = this.userSockets.get(invite.from_user_id);
        if (senderSockets) {
            senderSockets.forEach((sid) => {
                this.io.to(sid).emit("FRIEND_JOINED_BOARD", {
                    friendId: user.id,
                    friendName: user.name,
                    boardId: invite.board_id,
                });
            });
        }
    }

    async joinBoard({ boardId, token }, socketId) {
        const user = await this.db.getUserByToken(token);
        if (!user) return;

        const hasAccess = await this.db.db.query(
            `SELECT 1 FROM boards WHERE id = $1 AND owner_id = $2
             UNION
             SELECT 1 FROM board_access WHERE board_id = $1 AND user_id = $2`,
            [boardId, user.id],
        );

        if (hasAccess.rows.length > 0) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) socket.join(`board_${boardId}`);
        }
    }

    async leaveBoard({ boardId }, socketId) {
        const socket = this.io.sockets.sockets.get(socketId);
        if (socket) {
            socket.leave(`board_${boardId}`);
        }
    }
}

module.exports = UserManager;
