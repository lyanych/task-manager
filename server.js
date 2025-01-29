const express = require("express");
const { Client } = require("pg");

const app = express();

// Твоя строка подключения к PostgreSQL Neon
const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_VTUtx4N2pmaG@ep-frosty-snow-a2igen9e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false }, // Важно для безопасного подключения
});

// Подключение к PostgreSQL
client.connect()
    .then(() => console.log("✅ Подключено к PostgreSQL Neon"))
    .catch(err => console.error("❌ Ошибка подключения:", err));

// Проверка подключения
app.get("/test-db", async (req, res) => {
    try {
        const result = await client.query("SELECT NOW()");
        res.json({ message: "✅ Подключение к базе успешно!", time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "❌ Ошибка подключения", details: err.message });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
