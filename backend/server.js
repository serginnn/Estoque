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

//Tabela de produtos
db.run(`CREATE TABLE IF NOT EXISTS produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  quantidade INTEGER,
  preco REAL,
  min_stock INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 100 
)`);

//Tabela de usuarios
db.run(`CREATE TABLE IF NOT EXISTS usuarios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL UNIQUE,
  senha TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'comum'
)`);

//Tabela para guardar o histórico de transações de produtos
db.run(`CREATE TABLE IF NOT EXISTS historico_produtos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  produto_id INTEGER,
  produto_nome TEXT NOT NULL,
  acao TEXT NOT NULL, -- Ex: 'CRIADO', 'ATUALIZADO', 'DELETADO'
  detalhes TEXT, -- Ex: 'Quantidade alterada de 10 para 15'
  usuario_nome TEXT NOT NULL, -- Quem fez a ação
  timestamp DATETIME DEFAULT (datetime('now', 'localtime'))
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

//Rota para buscar todos os registros de histórico
app.get('/api/historico', authenticateToken, (req, res) => {
  db.all('SELECT * FROM historico_produtos ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Rota para buscar todos os produtos
app.get('/api/produtos', authenticateToken, (req, res) => {
  const sql = 'SELECT * FROM produtos ORDER BY nome ASC'; // Ordenar por nome é uma boa prática

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Adicionar Produto 
app.post('/api/produtos', authenticateToken, (req, res) => {
  const { nome, quantidade, preco, min_stock, max_stock } = req.body;
  const usuario_nome = req.user.nome;

  if (preco < 0) {
    return res.status(400).json({ error: 'O preço не pode ser negativo.' });
  }

  const sql = 'INSERT INTO produtos (nome, quantidade, preco, min_stock, max_stock) VALUES (?, ?, ?, ?, ?)';
  
  db.run(sql, [nome, quantidade, preco, min_stock, max_stock], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    const novoProdutoId = this.lastID;
    
    const detalhes = `Produto criado com Qtd: ${quantidade}, Preço: R$ ${preco}, Min: ${min_stock}, Max: ${max_stock}`;
    db.run('INSERT INTO historico_produtos (produto_id, produto_nome, acao, detalhes, usuario_nome) VALUES (?, ?, ?, ?, ?)',
      [novoProdutoId, nome, 'CRIADO', detalhes, usuario_nome]);

    res.status(201).json({ id: novoProdutoId, nome, quantidade, preco, min_stock, max_stock });
  });
});

// Deletar Produto 
app.delete('/api/produtos/:id', authenticateToken, (req, res) => {
  const produtoId = req.params.id;
  const usuario_nome = req.user.nome;
   if (preco < 0) {
    return res.status(400).json({ error: 'O preço não pode ser negativo.' });
  }
  // Primeiro, busca o nome do produto antes de deletar, para salvar no log
  db.get('SELECT nome FROM produtos WHERE id = ?', [produtoId], (err, produto) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado' });

    db.run('DELETE FROM produtos WHERE id = ?', [produtoId], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Log da exclusão
      db.run('INSERT INTO historico_produtos (produto_id, produto_nome, acao, detalhes, usuario_nome) VALUES (?, ?, ?, ?, ?)',
        [produtoId, produto.nome, 'DELETADO', 'Produto removido do sistema', usuario_nome]);

      res.status(204).send();
    });
  });
});

//Remove uma quantidade específica de um produto
app.post('/api/produtos/remover-quantidade', authenticateToken, (req, res) => {
  const { nome, quantidade } = req.body;
  const usuario_nome = req.user.nome;

  // Validações iniciais
  if (!nome || !quantidade) {
    return res.status(400).json({ error: 'Nome do produto e quantidade são obrigatórios.' });
  }
  if (parseInt(quantidade) <= 0) {
    return res.status(400).json({ error: 'A quantidade a ser removida deve ser maior que zero.' });
  }

  // Busca o produto pelo nome para verificar o estoque atual
  db.get('SELECT * FROM produtos WHERE nome = ?', [nome], (err, produto) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!produto) return res.status(404).json({ error: 'Produto não encontrado.' });

    // Verifica se há estoque suficiente
    if (produto.quantidade < quantidade) {
      return res.status(400).json({ error: `Estoque insuficiente. Apenas ${produto.quantidade} unidades disponíveis.` });
    }

    const novaQuantidade = produto.quantidade - quantidade;
    
    // Atualiza a quantidade do produto no banco de dados
    db.run('UPDATE produtos SET quantidade = ? WHERE id = ?', [novaQuantidade, produto.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Log da remoção de quantidade no histórico
      const detalhes = `${quantidade} unidade(s) removida(s). Estoque anterior: ${produto.quantidade}, Estoque atual: ${novaQuantidade}.`;
      db.run('INSERT INTO historico_produtos (produto_id, produto_nome, acao, detalhes, usuario_nome) VALUES (?, ?, ?, ?, ?)',
        [produto.id, produto.nome, 'SAÍDA', detalhes, usuario_nome]);
      
      res.json({ message: 'Quantidade removida com sucesso!' });
    });
  });
});

// Atualizar Produto 
app.put('/api/produtos/:id', authenticateToken, (req, res) => {
  const { nome, quantidade, preco, min_stock, max_stock } = req.body;
  const { id } = req.params;
  const usuario_nome = req.user.nome;

  if (preco < 0) {
    return res.status(400).json({ error: 'O preço не pode ser negativo.' });
  }

  db.get('SELECT * FROM produtos WHERE id = ?', [id], (err, produtoAntigo) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!produtoAntigo) return res.status(404).json({ error: 'Produto não encontrado' });
    
    const sql = 'UPDATE produtos SET nome = ?, quantidade = ?, preco = ?, min_stock = ?, max_stock = ? WHERE id = ?';

    db.run(sql, [nome, quantidade, preco, min_stock, max_stock, id], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      
      const detalhes = `De [Qtd: ${produtoAntigo.quantidade}, Preço: R$ ${produtoAntigo.preco}, Min: ${produtoAntigo.min_stock}, Max: ${produtoAntigo.max_stock}] para [Qtd: ${quantidade}, Preço: R$ ${preco}, Min: ${min_stock}, Max: ${max_stock}]`;
      db.run('INSERT INTO historico_produtos (produto_id, produto_nome, acao, detalhes, usuario_nome) VALUES (?, ?, ?, ?, ?)',
        [id, nome, 'ATUALIZADO', detalhes, usuario_nome]);
        
      res.json({ message: 'Produto atualizado com sucesso' });
    });
  });
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
  if (!['comum', 'gerente'].includes(role)) {
    return res.status(400).json({ error: 'Cargo inválido.' });
  }
  // A verificação de gerente já foi feita pelos middlewares
  db.get('SELECT * FROM usuarios WHERE nome = ?', [nome], (err, row) => {
    if (row) {
      return res.status(400).json({ error: 'Usuário já existe' });
    }
    db.run('INSERT INTO usuarios (nome, senha, role) VALUES (?, ?, ?)', [nome, senha, role ], function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, nome, role });
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

// Endpoint para dados agregados (valor total, contagens, etc.)
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const sql = `
    SELECT
      SUM(quantidade * preco) as totalValue,
      COUNT(CASE WHEN quantidade < min_stock THEN 1 END) as lowStockCount,
      COUNT(CASE WHEN quantidade > max_stock THEN 1 END) as highStockCount
    FROM produtos
  `;
  db.get(sql, [], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(row);
  });
});

// Endpoint para listar produtos com estoque baixo
app.get('/api/dashboard/low-stock', authenticateToken, (req, res) => {
  db.all('SELECT id, nome, quantidade, min_stock FROM produtos WHERE quantidade < min_stock ORDER BY quantidade ASC LIMIT 5', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Endpoint para listar produtos com estoque alto
app.get('/api/dashboard/high-stock', authenticateToken, (req, res) => {
  db.all('SELECT id, nome, quantidade, max_stock FROM produtos WHERE quantidade > max_stock ORDER BY quantidade DESC LIMIT 5', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// NOVO ENDPOINT: Adicionar uma quantidade a um produto existente
app.post('/api/produtos/adicionar-quantidade', authenticateToken, (req, res) => {
  const { nome, quantidadeAdicionar } = req.body;
  const usuario_nome = req.user.nome;

  // Validações
  if (!nome || !quantidadeAdicionar) {
    return res.status(400).json({ error: 'Nome do produto e quantidade são obrigatórios.' });
  }
  if (parseInt(quantidadeAdicionar) <= 0) {
    return res.status(400).json({ error: 'A quantidade a ser adicionada deve ser maior que zero.' });
  }

  // Busca o produto pelo nome
  db.get('SELECT * FROM produtos WHERE nome = ?', [nome], (err, produto) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!produto) return res.status(404).json({ error: `Produto com o nome "${nome}" não encontrado.` });

    const novaQuantidade = produto.quantidade + parseInt(quantidadeAdicionar);

    // Atualiza a quantidade do produto
    db.run('UPDATE produtos SET quantidade = ? WHERE id = ?', [novaQuantidade, produto.id], function (err) {
      if (err) return res.status(500).json({ error: err.message });

      // Log da entrada de quantidade no histórico
      const detalhes = `${quantidadeAdicionar} unidade(s) adicionada(s). Estoque anterior: ${produto.quantidade}, Estoque atual: ${novaQuantidade}.`;
      db.run('INSERT INTO historico_produtos (produto_id, produto_nome, acao, detalhes, usuario_nome) VALUES (?, ?, ?, ?, ?)',
        [produto.id, produto.nome, 'ENTRADA', detalhes, usuario_nome]);
      
      res.json({ message: 'Quantidade adicionada com sucesso!' });
    });
  });
});

// Endpoint para buscar o histórico de um produto específico pelo ID
app.get('/api/historico/:produtoId', authenticateToken, (req, res) => {
  const { produtoId } = req.params;
  db.all('SELECT * FROM historico_produtos WHERE produto_id = ? ORDER BY timestamp DESC', [produtoId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});