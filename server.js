const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Middleware для обработки JSON
app.use(express.json());

// Подключение к MongoDB через переменную окружения
const mongoURI = process.env.MONGO_URI || "mongodb+srv://admin:pass1234@task-manager-cluster.rs81g.mongodb.net/task_manager?retryWrites=true&w=majority";

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Подключено к MongoDB"))
    .catch(err => console.error("Ошибка подключения:", err));

// Корневой маршрут для проверки работы сервера
app.get("/", (req, res) => {
    res.send("Сервер работает!");
});

// Дополнительный маршрут для проверки базы данных
app.get("/test-db", async (req, res) => {
    try {
        const testConnection = await mongoose.connection.db.admin().ping();
        res.json({ message: "Подключение к базе данных успешно!", ping: testConnection });
    } catch (err) {
        res.status(500).json({ error: "Ошибка подключения к базе данных", details: err.message });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
