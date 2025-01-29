const express = require("express");
const { Client } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.json());

// Твоя строка подключения к PostgreSQL Neon
const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_VTUtx4N2pmaG@ep-frosty-snow-a2igen9e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
});

client.connect()
    .then(() => console.log("✅ Подключено к PostgreSQL Neon"))
    .catch(err => console.error("❌ Ошибка подключения:", err));

// --- Отдача HTML-страницы ---
app.get("/employees", (req, res) => {
    res.sendFile(path.join(__dirname, "employees.html"));
});

// --- API для должностей ---
app.get("/positions", async (req, res) => {
    try {
        const result = await client.query("SELECT * FROM Position");
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка получения должностей", details: err.message });
    }
});

// --- API для сотрудников ---
app.get("/employees/list", async (req, res) => {
    try {
        const result = await client.query(`
            SELECT e.*, p.name AS position_name
            FROM Employees e
            JOIN Position p ON e.position_id = p.id
        `);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: "Ошибка получения сотрудников", details: err.message });
    }
});

app.post("/employees", async (req, res) => {
    const { last_name, first_name, middle_name, phone_number, birth_date, position_id, password } = req.body;
    try {
        await client.query(
            `INSERT INTO Employees (last_name, first_name, middle_name, phone_number, birth_date, position_id, password)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [last_name, first_name, middle_name, phone_number, birth_date, position_id, password]
        );
        res.json({ message: "Сотрудник добавлен" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка добавления сотрудника", details: err.message });
    }
});

app.put("/employees", async (req, res) => {
    const { id, last_name, first_name, middle_name, phone_number, birth_date, position_id, password } = req.body;
    try {
        await client.query(
            `UPDATE Employees
             SET last_name = $1, first_name = $2, middle_name = $3, phone_number = $4, birth_date = $5, position_id = $6, password = $7
             WHERE id = $8`,
            [last_name, first_name, middle_name, phone_number, birth_date, position_id, password, id]
        );
        res.json({ message: "Данные сотрудника обновлены" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка обновления данных сотрудника", details: err.message });
    }
});

app.delete("/employees/:id", async (req, res) => {
    const { id } = req.params;
    try {
        await client.query("DELETE FROM Employees WHERE id = $1", [id]);
        res.json({ message: "Сотрудник удалён" });
    } catch (err) {
        res.status(500).json({ error: "Ошибка удаления сотрудника", details: err.message });
    }
});

// --- Проверка подключения к базе ---
app.get("/test-db", async (req, res) => {
    try {
        const result = await client.query("SELECT NOW()");
        res.json({ message: "✅ Подключение к базе успешно!", time: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: "❌ Ошибка подключения", details: err.message });
    }
});

// --- Запуск сервера ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
