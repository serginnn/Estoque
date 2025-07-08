import React, { useEffect, useState } from 'react';

export default function ProductTable({ token, refreshKey, searchTerm }) {
  const [allProducts, setAllProducts] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', quantidade: '', preco: '', min_stock: '', max_stock: '' });
  const [expandedRowId, setExpandedRowId] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    fetch('/api/produtos', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => {
        setAllProducts(data || []);
      })
      .catch(err => console.error("Erro ao carregar produtos:", err));
  }, [token, refreshKey]);

  // 2. USA um useEffect para filtrar a lista sempre que o termo muda
  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') {
      setProdutos(allProducts);
    } else {
      const filtered = allProducts.filter(p =>
        p.nome.toLowerCase().includes(term)
      );
      setProdutos(filtered);
    }
  }, [searchTerm, allProducts]);


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

  const handleToggleHistory = (produtoId) => {
    if (editando === produtoId) return;

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
      <tbody>
        {produtos.map(p => (
          <React.Fragment key={p.id}>
            <tr>
              {editando === p.id ? (
                <>
                  <td></td>
                  <td><input className="input" value={form.nome} onClick={e => e.stopPropagation()} onChange={e => setForm({ ...form, nome: e.target.value })} /></td>
                  <td><input className="input" type="number" value={form.quantidade} onClick={e => e.stopPropagation()} onChange={e => setForm({ ...form, quantidade: +e.target.value })} /></td>
                  <td><input className="input" type="number" min="0" step="0.01" value={form.preco} onClick={e => e.stopPropagation()} onChange={e => setForm({ ...form, preco: +e.target.value })} /></td>
                  <td><input className="input" type="number" min="0" value={form.min_stock} onClick={e => e.stopPropagation()} onChange={e => setForm({ ...form, min_stock: +e.target.value })} /></td>
                  <td><input className="input" type="number" min="0" value={form.max_stock} onClick={e => e.stopPropagation()} onChange={e => setForm({ ...form, max_stock: +e.target.value })} /></td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-primary" onClick={() => salvarEdicao(p.id)}>Salvar</button>
                  </td>
                </>
              ) : (
                <>
                  <td>
                    <button className="details-button" onClick={() => handleToggleHistory(p.id)}>
                      <svg fill="currentColor" viewBox="0 0 16 16">
                        {expandedRowId === p.id 
                          ? <path d="M7.646 4.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 5.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
                          : <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
                        }
                      </svg>
                    </button>
                  </td>
                  <td>{p.nome}</td>
                  <td>{p.quantidade}</td>
                  <td>R$ {p.preco ? p.preco.toFixed(2) : '0.00'}</td>
                  <td>{p.min_stock}</td>
                  <td>{p.max_stock}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => iniciarEdicao(p)}>Editar</button>
                    <button className="btn btn-primary" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }} onClick={() => deletarProduto(p.id)}>Excluir</button>
                  </td>
                </>
              )}
            </tr>

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

        {produtos.length === 0 && searchTerm.trim() !== '' && (
          <tr>
            <td colSpan="7" className="no-results-cell">
              Produto não encontrado
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}