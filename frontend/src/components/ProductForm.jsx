import { useState } from 'react';

export default function ProductForm({ token, onProductAdded }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  
  const [minStock, setMinStock] = useState(10);
  const [maxStock, setMaxStock] = useState(100);
  const [error, setError] = useState('');

  const adicionarProduto = () => {
    if (+preco < 0 || +minStock < 0 || +maxStock < 0) {
      setError('Valores não podem ser negativos.');
      return;
    }
    setError('');

    const body = { 
      nome, 
      quantidade: +quantidade, 
      preco: +preco,
      min_stock: +minStock,
      max_stock: +maxStock 
    };

    fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(body)
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(() => {
      onProductAdded();
    })
    .catch(async err => {
        const errData = await err.json();
        setError(errData.error || 'Ocorreu um erro ao adicionar o produto.');
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input className="input" placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input className="input" placeholder="Quantidade Inicial" type="number" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
      <input className="input" placeholder="Preço" type="number" min="0" step="0.01" value={preco} onChange={(e) => setPreco(e.target.value)} />
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <input className="input" placeholder="Estoque Mínimo" type="number" min="0" value={minStock} onChange={(e) => setMinStock(e.target.value)} />
        <input className="input" placeholder="Estoque Máximo" type="number" min="0" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} />
      </div>
      
      {error && <p className="erro">{error}</p>}
      <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={adicionarProduto}>
        Salvar Produto
      </button>
    </div>
  );
}