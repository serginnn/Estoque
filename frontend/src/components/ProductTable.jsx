import { useEffect, useState } from 'react';

export default function ProductTable({ token }) {
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', quantidade: '', preco: '', min_stock: '', max_stock: '' });

  useEffect(() => {
    carregar();
  }, [token]);

  const carregar = () => {
    fetch('/api/produtos', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => setProdutos(data || []))
      .catch(err => console.error("Erro ao carregar produtos:", err));
  };

  const deletarProduto = (id) => {
    fetch(`/api/produtos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }})
    .then(() => carregar());
  };
  
  const iniciarEdicao = (produto) => {
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
      carregar();
    });
  };

  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Nome do Produto</th>
          <th>Quantidade</th>
          <th>Preço</th>
          <th>Est. Mínimo</th> {/* NOVO: Cabeçalho */}
          <th>Est. Máximo</th> {/* NOVO: Cabeçalho */}
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {produtos.map(p => (
          <tr key={p.id}>
            {editando === p.id ? (
              <>
                <td><input className="input" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} /></td>
                <td><input className="input" type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: +e.target.value })} /></td>
                <td><input className="input" type="number" min="0" step="0.01" value={form.preco} onChange={e => setForm({ ...form, preco: +e.target.value })} /></td>
                {/* NOVO: Inputs para editar min e max */}
                <td><input className="input" type="number" min="0" value={form.min_stock} onChange={e => setForm({ ...form, min_stock: +e.target.value })} /></td>
                <td><input className="input" type="number" min="0" value={form.max_stock} onChange={e => setForm({ ...form, max_stock: +e.target.value })} /></td>
                <td>
                  <button className="btn btn-primary" onClick={() => salvarEdicao(p.id)}>Salvar</button>
                </td>
              </>
            ) : (
              <>
                <td>{p.nome}</td>
                <td>{p.quantidade}</td>
                <td>R$ {p.preco.toFixed(2)}</td>
                <td>{p.min_stock}</td> {/* NOVO: Exibe o valor */}
                <td>{p.max_stock}</td> {/* NOVO: Exibe o valor */}
                <td>
                  <button className="btn btn-secondary" style={{ marginRight: '0.5rem' }} onClick={() => iniciarEdicao(p)}>Editar</button>
                  <button className="btn btn-primary" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }} onClick={() => deletarProduto(p.id)}>Excluir</button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}