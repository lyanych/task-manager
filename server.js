const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Подключение к MongoDB через Mongoose
mongoose.connect("mongodb://admin:pass1234@task-manager-cluster-shard-00-00.mongodb.net:27017,task-manager-cluster-shard-00-01.mongodb.net:27017,task-manager-cluster-shard-00-02.mongodb.net:27017/task_manager?ssl=true&replicaSet=atlas-xyz-shard-0&authSource=admin&retryWrites=true&w=majority")
    .then(() => console.log("Подключено к MongoDB"))
    .catch(err => console.error("Ошибка подключения:", err));

// Устанавливаем порт для сервера (Render использует переменную PORT)
const PORT = process.env.PORT || 5000;

// --- Добавим тестовую строку для проверки авто-деплоя ---
console.log("Проверка авто-деплоя работает!");

// --- Маршрут для проверки подключения к базе данных ---
app.get("/test-db", (req, res) => {
    try {
        // Проверяем состояние подключения через mongoose.connection.readyState
        const connectionState = mongoose.connection.readyState;

        if (connectionState === 1) {
            res.json({ message: "Подключение к базе данных успешно!" });
        } else {
            res.status(500).json({ error: "Нет активного подключения к базе данных" });
        }
    } catch (err) {
        res.status(500).json({ error: "Ошибка подключения к базе данных", details: err.message });
    }
});

// --- Запуск сервера ---
// Сервер начинает слушать запросы на указанном порту
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
