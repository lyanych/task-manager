const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Получение списка сотрудников
app.get("/employees", async (req, res) => {
    try {
        const result = await pool.query("SELECT e.id, e.last_name, e.first_name, e.middle_name, e.phone_number, p.name AS position_name FROM employees e JOIN positions p ON e.position_id = p.id");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка получения сотрудников" });
    }
});

// Получение списка должностей
app.get("/positions", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, name FROM positions");
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка получения должностей" });
    }
});

// Добавление сотрудника
app.post("/employees", async (req, res) => {
    const { last_name, first_name, middle_name, phone_number, birth_date, password, position_id } = req.body;
    try {
        const result = await pool.query("INSERT INTO employees (last_name, first_name, middle_name, phone_number, birth_date, password, position_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
            [last_name, first_name, middle_name, phone_number, birth_date, password, position_id]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка добавления сотрудника" });
    }
});

// Удаление сотрудника
app.delete("/employees/:id", async (req, res) => {
    const { id } = req.params;
    try {
        console.log("Получен запрос на удаление сотрудника с id:", id);
        const result = await pool.query("DELETE FROM employees WHERE id = $1 RETURNING *", [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Сотрудник не найден" });
        }
        res.json({ message: "Сотрудник удалён" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Ошибка удаления сотрудника" });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
