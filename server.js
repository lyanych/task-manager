const express = require("express");
const { Pool } = require("pg");
const path = require("path");

const app = express();

// Добавляем JSON парсер
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Подключение к базе данных
const pool = new Pool({
    connectionString: "postgresql://neondb_owner:npg_VTUtx4N2pmaG@ep-frosty-snow-a2igen9e-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require",
    ssl: { rejectUnauthorized: false },
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

pool.connect()
    .then(client => {
        console.log("✅ Подключено к PostgreSQL Neon");
        client.release();
    })
    .catch(err => console.error("❌ Ошибка подключения:", err));

// Отдача HTML-страницы
app.get("/employees", (req, res) => {
    res.sendFile(path.join(__dirname, "employees.html"));
});

// Получение списка должностей
app.get("/positions", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM position");
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Ошибка получения должностей:", err);
        res.status(500).json({ error: "Ошибка получения должностей", details: err.message });
    }
});

// Получение списка сотрудников (ИСПРАВЛЕНО)
app.get("/employees/list", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT e.id, e.last_name, e.first_name, e.middle_name, e.phone_number, e.birth_date, p.name AS position_name
            FROM employees e
            JOIN position p ON e.position_id = p.id
        `);
        res.json(result.rows);
    } catch (err) {
        console.error("❌ Ошибка получения сотрудников:", err);
        res.status(500).json({ error: "Ошибка получения сотрудников", details: err.message });
    }
});

// Добавление сотрудника
app.post("/employees", async (req, res) => {
    const { last_name, first_name, middle_name, phone_number, birth_date, position_id, password } = req.body;
    console.log("📥 Получены данные:", req.body);

    if (!last_name || !first_name || !phone_number || !birth_date || !position_id || !password) {
        return res.status(400).json({ error: "❌ Все поля обязательны для заполнения!" });
    }

    try {
        const result = await pool.query(
            `INSERT INTO employees (last_name, first_name, middle_name, phone_number, birth_date, position_id, password)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
            [last_name, first_name, middle_name || '', phone_number, birth_date, position_id, password]
        );
        res.json({ message: "✅ Сотрудник добавлен", id: result.rows[0].id });
    } catch (err) {
        console.error("❌ Ошибка добавления сотрудника:", err);
        res.status(500).json({ error: "Ошибка добавления сотрудника", details: err.message });
    }
});

// Удаление сотрудника
app.delete("/employees/:id", async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: "ID сотрудника обязателен для удаления" });
    }

    try {
        await pool.query("DELETE FROM employees WHERE id = $1", [id]);
        res.json({ message: "✅ Сотрудник удалён" });
    } catch (err) {
        console.error("❌ Ошибка удаления сотрудника:", err);
        res.status(500).json({ error: "Ошибка удаления сотрудника", details: err.message });
    }
});

// Проверка подключения к базе
app.get("/test-db", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({ message: "✅ Подключение к базе успешно!", time: result.rows[0] });
    } catch (err) {
        console.error("❌ Ошибка подключения к базе:", err);
        res.status(500).json({ error: "Ошибка подключения к базе", details: err.message });
    }
});

// Запуск сервера
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
});
