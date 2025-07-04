const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const jwt = require('jsonwebtoken'); // Importa a biblioteca JWT
require('dotenv').config(); //  Carrega as variáveis de ambiente do arquivo .env

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

// Ele irá verificar o token em cada requisição protegida
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer TOKEN"

  if (token == null) return res.sendStatus(401); // Se não há token, não autorizado

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403); // Se o token não for válido, acesso proibido
    req.user = user; // Anexa os dados do usuário (payload do token) à requisição
    next(); // Passa para a próxima função (a rota em si)
  });
};

// Ele verifica se o usuário autenticado tem o cargo de 'gerente'
const authorizeGerente = (req, res, next) => {
    // Este middleware deve rodar DEPOIS do authenticateToken
    if (req.user.role !== 'gerente') {
        return res.status(403).json({ error: 'Acesso negado. Rota exclusiva para gerentes.' });
    }
    next();
}

//Exibir produtos
app.get('/api/produtos', authenticateToken, (req, res) => {
  db.all('SELECT * FROM produtos', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

//inserir produto
app.post('/api/produtos', authenticateToken, (req, res) => {
  const { nome, quantidade, preco } = req.body;
  db.run('INSERT INTO produtos (nome, quantidade, preco) VALUES (?, ?, ?)',
    [nome, quantidade, preco],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nome, quantidade, preco });
    }
  );
});

//deletar produto
app.delete('/api/produtos/:id', authenticateToken, (req, res) => {
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

// cadastro
app.post('/api/usuarios', authenticateToken, authorizeGerente, (req, res) => {
  const { nome, senha, role } = req.body;
  // A verificação de gerente já foi feita pelos middlewares
  db.get('SELECT * FROM usuarios WHERE nome = ?', [nome], (err, row) => {
    if (row) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    db.run('INSERT INTO usuarios (nome, senha, role) VALUES (?, ?)', [nome, senha, role ], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nome });
    });
  });
});

// Login
app.post('/api/login', (req, res) => {
  const { nome, senha } = req.body;
  console.log("Tentativa de login:", nome);

  db.get('SELECT * FROM usuarios WHERE nome = ? AND senha = ?', [nome, senha], (err, row) => {
    if (row) {
      // Usuário encontrado, gerar o token!
      const payload = { id: row.id, nome: row.nome, role: row.role };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '20m' }); // Token expira em 8 horas

      // Retorna o token e os dados básicos do usuário
      res.json({ token, user: { nome: row.nome, role: row.role } });
    } else {
      res.status(401).json({ error: 'Credenciais inválidas' });
    }
  });
});