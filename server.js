const express = require("express");
const { Pool } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// Создаём пул соединений
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_VTUtx4N2pmaG@ep-frosty-snow-a2igen9e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
    max: 5, // Максимум 5 соединений
    idleTimeoutMillis: 30000, // Закрыть соединение после 30 секунд простоя
    connectionTimeoutMillis: 2000, // Тайм-аут подключения - 2 секунды
});

// Проверка подключения к базе
pool.connect()
    .then(client => {
        console.log("✅ Подключено к PostgreSQL Neon");
        client.release(); // Освобождаем соединение обратно в пул
    })
    .catch(err => console.error("❌ Ошибка подключения:", err));

// --- Отдача HTML-страницы ---
app.get("/employees", (req, res) => {
    res.sendFile(path.join(__dirname, "employees.html"));
});

// --- API для должностей ---
app.get("/positions", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM Position");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Ошибка получения должностей:", err);
        res.status(500).json({ error: "Ошибка получения должностей", details: err.message });
    }
});

// --- API для сотрудников ---
app.get("/employees/list", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.*, p.name AS position_name
            FROM Employees e
            JOIN Position p ON e.position_id = p.id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Ошибка получения сотрудников:", err);
        res.status(500).json({ error: "Ошибка получения сотрудников", details: err.message });
    }
});

// --- Добавление нового сотрудника ---
app.post("/employees", async (req, res) => {
    const { last_name, first_name, middle_name, phone_number, birth_date, position_id, password } = req.body;

    // Логирование полученных данных
    console.log("Полученные данные для добавления:", req.body);

    // Проверка на пустые значения
    if (!last_name || !first_name || !phone_number || !birth_date || !position_id || !password) {
        console.error("❌ Все поля обязательны для заполнения!");
        return res.status(400).json({ error: "Все поля обязательны для заполнения!" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO Employees (last_name, first_name, middle_name, phone_number, birth_date, position_id, password)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [last_name, first_name, middle_name, phone_number, birth_date, position_id, password]
        );
        console.log("✅ Сотрудник добавлен с ID:", result.rows[0].id);
        res.json({ message: "✅ Сотрудник добавлен", id: result.rows[0].id });
    } catch (err) {
        console.error("❌ Ошибка добавления сотрудника:", err);
        res.status(500).json({ error: "Ошибка добавления сотрудника", details: err.message });
    }
});

// --- Обновление данных сотрудника ---
app.put("/employees", async (req, res) => {
    const { id, last_name, first_name, middle_name, phone_number, birth_date, position_id, password } = req.body;

    console.log("Обновление данных для ID:", id, req.body);

    if (!id) {
        return res.status(400).json({ error: "ID сотрудника обязателен для обновления" });
    }

    try {
        await pool.query(
            `UPDATE Employees
             SET last_name = $1, first_name = $2, middle_name = $3, phone_number = $4, birth_date = $5, position_id = $6, password = $7
             WHERE id = $8`,
            [last_name, first_name, middle_name, phone_number, birth_date, position_id, password, id]
        );
        res.json({ message: "✅ Данные сотрудника обновлены" });
    } catch (err) {
        console.error("❌ Ошибка обновления данных сотрудника:", err);
        res.status(500).json({ error: "Ошибка обновления данных сотрудника", details: err.message });
    }
});

// --- Удаление сотрудника ---
app.delete("/employees/:id", async (req, res) => {
    const { id } = req.params;
    console.log("Удаление сотрудника с ID:", id);

    if (!id) {
        return res.status(400).json({ error: "ID сотрудника обязателен для удаления" });
    }

    try {
        await pool.query("DELETE FROM Employees WHERE id = $1", [id]);
        res.json({ message: "✅ Сотрудник удалён" });
    } catch (err) {
        console.error("❌ Ошибка удаления сотрудника:", err);
        res.status(500).json({ error: "Ошибка удаления сотрудника", details: err.message });
    }
});

// --- Проверка подключения к базе ---
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ message: "✅ Подключение к базе успешно!", time: result.rows[0] });
    } catch (err) {
        console.error("❌ Ошибка подключения к базе:", err);
        res.status(500).json({ error: "Ошибка подключения к базе", details: err.message });
    }
});

// --- Запуск сервера ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
