import { useEffect, useState } from 'react';

export default function ProductTable({ token }) {
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', quantidade: '', preco: '' });

  // NOVO: useEffect para carregar os dados quando o componente é montado
  useEffect(() => {
    carregar();
  }, [token]); // Roda sempre que o token mudar (basicamente uma vez no login)

  const carregar = () => {
    fetch('/api/produtos', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProdutos(data || [])) // Garante que produtos seja sempre um array
      .catch(err => console.error("Erro ao carregar produtos:", err));
  };

  const deletarProduto = (id) => {
    fetch(`/api/produtos/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(() => carregar()); // Recarrega a lista após deletar
  };
  
  // NOVO: Função para iniciar a edição de um produto
  const iniciarEdicao = (produto) => {
    setEditando(produto.id);
    setForm({ nome: produto.nome, quantidade: produto.quantidade, preco: produto.preco });
  };

  const salvarEdicao = (id) => {
    // Validação de preço no frontend antes de salvar
    if (form.preco < 0) {
        alert('O preço não pode ser negativo.');
        return;
    }
    
    fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(form)
    }).then(() => {
      setEditando(null);
      carregar(); // Recarrega a lista após salvar
    });
  };

  return (
    <table className="report-table"> {/* Usando o estilo de tabela dos relatórios */}
      <thead>
        <tr>
          <th>Nome do Produto</th>
          <th>Quantidade</th>
          <th>Preço</th>
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
                <td>
                  <button className="btn btn-primary" onClick={() => salvarEdicao(p.id)}>Salvar</button>
                </td>
              </>
            ) : (
              <>
                <td>{p.nome}</td>
                <td>{p.quantidade}</td>
                <td>R$ {p.preco.toFixed(2)}</td>
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