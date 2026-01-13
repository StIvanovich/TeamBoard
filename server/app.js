const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const DB = require("./application/modules/db/DB");
const Answer = require("./application/modules/Answer/Answer");
const UserManager = require("./application/modules/user/UserManager");

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});

const answer = new Answer();
const db = new DB();
new UserManager(answer, db, io);

app.get("/api/test", (req, res) => {
    res.json({
        users: [
            { id: 1, name: "Залупа" },
            { id: 2, name: "Член" },
        ],
    });
});

server.listen(PORT, () => {
    console.log(`Эта залупа запустилась(Ай вырубай)`);
});
