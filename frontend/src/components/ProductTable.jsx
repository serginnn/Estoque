import React, { useEffect, useState } from 'react';

export default function ProductTable({ token, refreshKey }) {
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', quantidade: '', preco: '', min_stock: '', max_stock: '' });
  
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    carregarProdutos();
  }, [token, refreshKey]);

  const carregarProdutos = () => {
    fetch('/api/produtos', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setProdutos(data || []))
      .catch(err => console.error("Erro ao carregar produtos:", err));
  };

  const deletarProduto = (id) => {
    fetch(`/api/produtos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }})
    .then(() => carregarProdutos());
  };
  
  const iniciarEdicao = (produto) => {
    setExpandedRowId(null);
    setEditando(produto.id);
    setForm({ 
      nome: produto.nome, 
      quantidade: produto.quantidade, 
      preco: produto.preco,
      min_stock: produto.min_stock,
      max_stock: produto.max_stock
    });
  };

  const salvarEdicao = (id) => {
    if (form.preco < 0 || form.min_stock < 0 || form.max_stock < 0) {
      alert('Valores não podem ser negativos.');
      return;
    }
    
    fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(form)
    }).then(() => {
      setEditando(null);
      carregarProdutos();
    });
  };

  // A lógica de clique agora pertence apenas ao botão
  const handleToggleHistory = (produtoId) => {
    if (expandedRowId === produtoId) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(produtoId);
      setHistoryLoading(true);
      fetch(`/api/historico/${produtoId}`, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => res.json())
        .then(data => {
          setHistoryData(data || []);
          setHistoryLoading(false);
        });
    }
  };

  return (
    <table className="report-table">
      <thead>
        <tr>
          {/* NOVO: Coluna vazia para o botão de expandir */}
          <th style={{ width: '50px' }}></th> 
          <th>Nome do Produto</th>
          <th>Quantidade</th>
          <th>Preço</th>
          <th>Est. Mínimo</th>
          <th>Est. Máximo</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {produtos.map(p => (
          <React.Fragment key={p.id}>
            {/* A linha não tem mais o onClick */}
            <tr>
              {editando === p.id ? (
                <>
                  <td></td> {/* Coluna do botão fica vazia no modo de edição */}
                  <td><input className="input" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></td>
                  <td><input className="input" type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: +e.target.value })} /></td>
                  <td><input className="input" type="number" min="0" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: +e.target.value })} /></td>
                  <td><input className="input" type="number" min="0" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: +e.target.value })} /></td>
                  <td><input className="input" type="number" min="0" value={form.max_stock} onChange={e => setForm({ ...form, max_stock: +e.target.value })} /></td>
                  <td>
                    <button className="btn btn-primary" onClick={() => salvarEdicao(p.id)}>Salvar</button>
                  </td>
                </>
              ) : (
                <>
                  {/* NOVO: Coluna com o botão de expandir/recolher */}
                  <td>
                    <button className="details-button" onClick={() => handleToggleHistory(p.id)}>
                      <svg fill="currentColor" viewBox="0 0 16 16">
                        {/* O ícone muda dependendo se a linha está expandida ou не */}
                        {expandedRowId === p.id 
                          ? <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/> // Seta para cima
                          : <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/> // Seta para baixo
                        }
                      </svg>
                    </button>
                  </td>
                  <td>{p.nome}</td>
                  <td>{p.quantidade}</td>
                  <td>R$ {p.preco ? p.preco.toFixed(2) : '0.00'}</td>
                  <td>{p.min_stock}</td>
                  <td>{p.max_stock}</td>
                  <td>
                    <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => iniciarEdicao(p)}>Editar</button>
                    <button className="btn btn-primary" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }} onClick={() => deletarProduto(p.id)}>Excluir</button>
                  </td>
                </>
              )}
            </tr>

            {/* A linha do histórico continua a mesma */}
            {expandedRowId === p.id && (
              <tr>
                <td colSpan="7" className="history-details-cell">
                  <h4>Histórico de Transações: {p.nome}</h4>
                  {historyLoading ? <p>Carregando histórico...</p> : 
                    historyData.length > 0 ? (
                      <ul>
                        {historyData.map(hist => (
                          <li key={hist.id}>
                            <span>{new Date(hist.timestamp).toLocaleString('pt-BR')} - <strong>{hist.acao}</strong> por {hist.usuario_nome}</span>
                            <span style={{color: '#555'}}>{hist.detalhes}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Nenhum histórico encontrado para este produto.</p>
                    )}
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
}