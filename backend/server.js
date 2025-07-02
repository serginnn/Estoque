const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 3000;

console.log("Banco sendo usado:", path.resolve(__dirname, '../database/estoque.db'));

const db = new sqlite3.Database(path.resolve(__dirname, '../database/estoque.db'));

app.use(cors());
app.use(express.json());

db.run(`CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  quantidade INTEGER,
  preco REAL
)`);

db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'comum'
)`);


app.get('/api/produtos', (req, res) => {
  db.all('SELECT * FROM produtos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

app.post('/api/produtos', (req, res) => {
  const { nome, quantidade, preco } = req.body;
  db.run('INSERT INTO produtos (nome, quantidade, preco) VALUES (?, ?, ?)',
    [nome, quantidade, preco],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nome, quantidade, preco });
    }
  );
});

app.delete('/api/produtos/:id', (req, res) => {
  db.run('DELETE FROM produtos WHERE id = ?', [req.params.id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.status(204).send();
  });
});

// ROTA PARA ATUALIZAR (EDITAR) UM PRODUTO (PUT)
app.put('/api/produtos/:id', (req, res) => {
  const { nome, quantidade, preco } = req.body;
  const { id } = req.params;

  db.run(
    'UPDATE produtos SET nome = ?, quantidade = ?, preco = ? WHERE id = ?',
    [nome, quantidade, preco, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      res.json({ message: 'Produto atualizado com sucesso' });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Cadastro de usuário

// service

//controlador (estrutura mvc)

// app.post(rota -> res, res, controlador)
app.post('/api/usuarios', (req, res) => {
  const { nome, senha } = req.body;
  db.get('SELECT * FROM usuarios WHERE nome = ?', [nome], (err, row) => {
    if (row) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    db.run('INSERT INTO usuarios (nome, senha) VALUES (?, ?)', [nome, senha], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nome });
    });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { nome, senha } = req.body;
  console.log("Tentativa de login:", nome, senha);

  db.get('SELECT * FROM usuarios WHERE nome = ? AND senha = ?', [nome, senha], (err, row) => {
    if (row) {
      res.json({ token: 'fake-token', nome: row.nome, role: row.role });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  });
});
