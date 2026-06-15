import express from "express";
import cors from "cors";
import pg from "pg";

const app = express();
app.use(cors());
app.use(express.json());

// Conexão com o PostgreSQL
const pool = new pg.Pool({
  host: process.env.DB_HOST || "db",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "postgres",
  database: process.env.DB_NAME || "todo",
  port: 5432,
});

// Cria tabela se não existir
async function init() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      text TEXT NOT NULL,
      checked BOOLEAN DEFAULT false
    )
  `);
  console.log("Banco pronto!");
}

// GET - listar tarefas
app.get("/tasks", async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM tasks ORDER BY id");
  res.json(rows);
});

// POST - criar tarefa
app.post("/tasks", async (req, res) => {
  const { text } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO tasks (text) VALUES ($1) RETURNING *",
    [text]
  );
  res.status(201).json(rows[0]);
});

// PUT - marcar/desmarcar
app.put("/tasks/:id", async (req, res) => {
  const { checked } = req.body;
  const { rows } = await pool.query(
    "UPDATE tasks SET checked=$1 WHERE id=$2 RETURNING *",
    [checked, req.params.id]
  );
  res.json(rows[0]);
});

// DELETE - remover tarefa
app.delete("/tasks/:id", async (req, res) => {
  await pool.query("DELETE FROM tasks WHERE id=$1", [req.params.id]);
  res.json({ ok: true });
});

init().then(() => {
  app.listen(3000, () => console.log("Backend rodando na porta 3000"));
});
