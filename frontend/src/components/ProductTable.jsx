import { useEffect, useState } from 'react';

export default function ProductTable({ token }) { // Recebe o token como prop
  const [produtos, setProdutos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nome: '', quantidade: '', preco: '' });

   const carregar = () => {
    fetch('/api/produtos', {
      headers: { 'Authorization': `Bearer ${token}` } // NOVO
    })
      .then(res => res.json())
      .then(setProdutos);
  };

  const deletarProduto = (id) => {
    fetch(`/api/produtos/${id}`, { 
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` } // NOVO
    })
      .then(carregar);
  };

  const salvarEdicao = (id) => {
    fetch(`/api/produtos/${id}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // NOVO
      },
      body: JSON.stringify(form)
    }).then(() => {
      setEditando(null);
      carregar();
    });
  };

  return (
    <table className="w-full border mt-6">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2 border">Nome</th>
          <th className="p-2 border">Qtd</th>
          <th className="p-2 border">Preço</th>
          <th className="p-2 border">Ação</th>
        </tr>
      </thead>
      <tbody>
        {produtos.map(p => (
          <tr key={p.id}>
            {editando === p.id ? (
              <>
                <td className="p-2 border">
                  <input value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
                </td>
                <td className="p-2 border">
                  <input type="number" value={form.quantidade} onChange={e => setForm({ ...form, quantidade: +e.target.value })} />
                </td>
                <td className="p-2 border">
                  <input type="number" value={form.preco} onChange={e => setForm({ ...form, preco: +e.target.value })} />
                </td>
                <td className="p-2 border">
                  <button className="bg-green-500 text-white px-2 rounded" onClick={() => salvarEdicao(p.id)}>Salvar</button>
                </td>
              </>
            ) : (
              <>
                <td className="p-2 border">{p.nome}</td>
                <td className="p-2 border">{p.quantidade}</td>
                <td className="p-2 border">R$ {p.preco}</td>
                <td className="p-2 border">
                  <button className="bg-yellow-500 text-white px-2 mr-2 rounded" onClick={() => iniciarEdicao(p)}>Editar</button>
                  <button className="bg-red-500 text-white px-2 rounded" onClick={() => deletarProduto(p.id)}>Excluir</button>
                </td>
              </>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
