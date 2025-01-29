require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const path = require("path");

const app = express();
const port = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // Раздача статических файлов

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Получение всех сотрудников
app.get("/employees", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, first_name, last_name, phone_number FROM Employees");
        res.json(result.rows);
    } catch (error) {
        console.error("Ошибка получения сотрудников", error);
        res.status(500).json({ error: "Ошибка получения сотрудников" });
    }
});

// Раздача HTML-файла
app.get("/employees.html", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "employees.html"));
});

// Добавление нового сотрудника
app.post("/employees", async (req, res) => {
    const { first_name, last_name, phone_number } = req.body;
    try {
        const result = await pool.query(
            "INSERT INTO Employees (first_name, last_name, phone_number) VALUES ($1, $2, $3) RETURNING *",
            [first_name, last_name, phone_number]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Ошибка добавления сотрудника", error);
        res.status(500).json({ error: "Ошибка добавления сотрудника" });
    }
});

app.listen(port, () => {
    console.log(`🚀 Сервер запущен на порту ${port}`);
});
