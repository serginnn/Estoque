import { useState } from 'react';

// ATENÇÃO: onProductAdded é uma nova prop para comunicar que o produto foi adicionado
export default function ProductForm({ token, onProductAdded }) {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [preco, setPreco] = useState('');
  const [error, setError] = useState('');

  const adicionarProduto = () => {
    // Validação do preço no frontend
    if (+preco < 0) {
      setError('O preço não pode ser negativo.');
      return;
    }
    setError(''); // Limpa o erro se for válido

    fetch('/api/produtos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nome, quantidade: +quantidade, preco: +preco })
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(() => {
      setNome('');
      setQuantidade('');
      setPreco('');
      onProductAdded(); // Chama a função do pai para fechar o modal e atualizar a tabela
    })
    .catch(async err => {
        const errData = await err.json();
        setError(errData.error || 'Ocorreu um erro ao adicionar o produto.');
    });
  };

  // Alteramos o layout para um formulário mais tradicional
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        className="input" // Usando a classe de input que já temos
        placeholder="Nome do Produto"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        className="input"
        placeholder="Quantidade"
        type="number"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      <input
        className="input"
        placeholder="Preço"
        type="number"
        min="0" // Impede valores negativos no controle do navegador
        step="0.01"
        value={preco}
        onChange={(e) => setPreco(e.target.value)}
      />
      
      {error && <p className="erro">{error}</p>}

      <button className="btn btn-primary" style={{ alignSelf: 'flex-end' }} onClick={adicionarProduto}>
        Salvar Produto
      </button>
    </div>
  );
}