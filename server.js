const express = require("express");
const mongoose = require("mongoose");

const app = express();

// Подключение к MongoDB через Mongoose
mongoose.connect("mongodb+srv://admin:pass1234@cluster0.mongodb.net/task_manager?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Подключено к MongoDB"))
    .catch(err => console.error("Ошибка подключения:", err));

// Устанавливаем порт для сервера (Render использует переменную PORT)
const PORT = process.env.PORT || 5000;

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

// --- Маршрут для тестового создания коллекции и документа ---
app.get("/test-db-create", async (req, res) => {
    try {
        // Получаем коллекцию "test_collection"
        const collection = mongoose.connection.db.collection("test_collection");

        // Вставляем тестовый документ
        const result = await collection.insertOne({ testField: "This is a test document" });

        res.json({ message: "Тестовая коллекция и документ успешно созданы!", result });
    } catch (err) {
        res.status(500).json({ error: "Ошибка при создании базы данных или коллекции", details: err.message });
    }
});

// --- Запуск сервера ---
// Сервер начинает слушать запросы на указанном порту
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
