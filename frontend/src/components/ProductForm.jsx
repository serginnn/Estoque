import { useState } from 'react';

export default function ProductForm({ token }) { // Recebe o token como prop
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');

  const adicionarProduto = () => {
    fetch('/api/produtos', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` //  Envia o token
      },
      body: JSON.stringify({ nome, quantidade: +quantidade, preco: +preco })
    }).then(() => {
      setNome('');
      setQuantidade('');
      setPreco('');
      // Idealmente, você deve ter uma forma de recarregar a tabela aqui
    });
  };

  return (
    <div className="mb-4 flex gap-2">
      <input
        className="border p-1"
        placeholder="Nome"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        className="border p-1"
        placeholder="Qtd"
        type="number"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      <input
        className="border p-1"
        placeholder="Preço"
        type="number"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 rounded" onClick={adicionarProduto}>
        Adicionar
      </button>
    </div>
  );
}
