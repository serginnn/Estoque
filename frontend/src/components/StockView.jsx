import { useState } from 'react';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

// --- Componente do Modal (sem alterações) ---
const Modal = ({ show, onClose, title, children }) => {
  if (!show) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};

// Componente para o formulário de remoção ---
const RemoveProductForm = ({ token, onProductRemoved }) => {
  const [nome, setNome] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRemove = () => {
    setError('');
    setSuccess('');

    fetch('/api/produtos/remover-quantidade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nome, quantidade: +quantidade })
    })
    .then(async res => {
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error);
      }
      return res.json();
    })
    .then(data => {
      setSuccess(data.message);
      setNome('');
      setQuantidade('');
      onProductRemoved(); // Atualiza a tabela
    })
    .catch(err => {
      setError(err.message);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input
        className="input"
        placeholder="Nome do Produto"
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <input
        className="input"
        placeholder="Quantidade a ser removida"
        type="number"
        min="1"
        value={quantidade}
        onChange={(e) => setQuantidade(e.target.value)}
      />
      {error && <p className="erro" style={{ marginTop: 0 }}>{error}</p>}
      {success && <p style={{ color: 'green', marginTop: 0 }}>{success}</p>}
      <button className="btn btn-primary" style={{ alignSelf: 'flex-end', backgroundColor: '#dc3545', borderColor: '#dc3545' }} onClick={handleRemove}>
        Confirmar Remoção
      </button>
    </div>
  );
};


export default function StockView({ token }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleActionComplete = () => {
    setIsModalOpen(false); // Fecha o modal se estiver aberto
    setRefreshKey(prevKey => prevKey + 1); // Força a atualização da tabela
  };

  return (
    <div>
      <h1 className="main-content-title">Estoque</h1>

      <header className="stock-header">
        <div className="stock-header-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            + Cadastrar produto
          </button>
        </div>
      </header>
      
      <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)} title="Cadastrar Novo Produto">
        <ProductForm token={token} onProductAdded={handleActionComplete} />
      </Modal>

      <ProductTable token={token} key={refreshKey} />

      {/* Seção de Remoção de Produtos */}
      <div className="remove-product-section">
        <h3>Remover Quantidade do Estoque</h3>
        <RemoveProductForm token={token} onProductRemoved={handleActionComplete} />
      </div>
    </div>
  );
}