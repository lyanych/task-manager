require("dotenv").config();
const express = require("express");
const { neon } = require("@neondatabase/serverless");
const path = require("path");

const app = express();

console.log("🔍 DATABASE_URL:", process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
    console.error("❌ ОШИБКА: DATABASE_URL не задан в .env");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
console.log("✅ Подключение к базе данных установлено");

// Добавляем JSON парсер
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Настройка статических файлов
app.use(express.static(path.join(__dirname, "public")));

// Проверка подключения к базе
app.get("/test-db", async (req, res) => {
    try {
        const result = await sql`SELECT NOW()`;
        res.json({ message: "✅ Подключение к базе успешно!", time: result[0] });
    } catch (err) {
        console.error("❌ Ошибка подключения к базе:", err);
        res.status(500).json({ error: "Ошибка подключения к базе", details: err.message });
    }
});

// Удаление сотрудника
app.delete("/employees/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "❌ ID сотрудника обязателен для удаления!" });
    }

    try {
        const result = await sql`DELETE FROM employees WHERE id = ${id} RETURNING id`;
        if (result.length === 0) {
            return res.status(404).json({ error: "❌ Сотрудник не найден!" });
        }
        res.json({ message: "✅ Сотрудник удалён", id: result[0].id });
    } catch (err) {
        console.error("❌ Ошибка удаления сотрудника:", err);
        res.status(500).json({ error: "Ошибка удаления сотрудника", details: err.message });
    }
});

// Редактирование данных сотрудника
app.put("/employees/:id", async (req, res) => {
    const { id } = req.params;
    const { first_name, last_name, phone_number, position_id } = req.body;
    if (!id || !first_name || !last_name || !phone_number || !position_id) {
        return res.status(400).json({ error: "❌ Все поля обязательны для редактирования!" });
    }

    try {
        const result = await sql`
            UPDATE employees
            SET first_name = ${first_name}, last_name = ${last_name}, phone_number = ${phone_number}, position_id = ${position_id}
            WHERE id = ${id}
            RETURNING *`;
        
        if (result.length === 0) {
            return res.status(404).json({ error: "❌ Сотрудник не найден!" });
        }
        res.json({ message: "✅ Данные сотрудника обновлены", employee: result[0] });
    } catch (err) {
        console.error("❌ Ошибка обновления данных сотрудника:", err);
        res.status(500).json({ error: "Ошибка обновления сотрудника", details: err.message });
    }
});

// Запуск сервера с обработкой ошибок
const PORT = process.env.PORT || 5000;
app.listen(PORT, (err) => {
    if (err) {
        console.error("❌ Ошибка при запуске сервера:", err);
        process.exit(1);
    }
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});