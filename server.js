const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const port = 10000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

// Получение списка сотрудников
app.get("/employees/list", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM employees");
        res.json(result.rows);
    } catch (error) {
        console.error("Ошибка получения сотрудников:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Добавление сотрудника
app.post("/employees", async (req, res) => {
    try {
        const { first_name, last_name, phone_number } = req.body;
        if (!first_name || !last_name || !phone_number) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }
        const result = await pool.query(
            "INSERT INTO employees (first_name, last_name, phone_number) VALUES ($1, $2, $3) RETURNING *",
            [first_name, last_name, phone_number]
        );
        res.status(201).json({ message: "Сотрудник добавлен", employee: result.rows[0] });
    } catch (error) {
        console.error("Ошибка добавления сотрудника:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Удаление сотрудника
app.delete("/employees/:id", async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query("DELETE FROM employees WHERE id = $1", [id]);
        res.json({ message: "Сотрудник удалён" });
    } catch (error) {
        console.error("Ошибка удаления сотрудника:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Обновление данных сотрудника
app.put("/employees/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, phone_number } = req.body;
        if (!first_name || !last_name || !phone_number) {
            return res.status(400).json({ error: "Все поля обязательны" });
        }
        await pool.query(
            "UPDATE employees SET first_name = $1, last_name = $2, phone_number = $3 WHERE id = $4",
            [first_name, last_name, phone_number, id]
        );
        res.json({ message: "Данные сотрудника обновлены" });
    } catch (error) {
        console.error("Ошибка обновления сотрудника:", error);
        res.status(500).json({ error: "Ошибка сервера" });
    }
});

// Запуск сервера
app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});
