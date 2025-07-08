import { useState } from 'react';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';
import RecentActivity from './RecentActivity';

// --- Componente do Modal ---
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

// --- Formulário de Adicionar Quantidade ---
const AddQuantityForm = ({ token, onActionComplete }) => {
  const [nome, setNome] = useState('');
  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAddQuantity = () => {
    setError('');
    setSuccess('');
    fetch('/api/produtos/adicionar-quantidade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ nome, quantidadeAdicionar: +quantidadeAdicionar })
    })
    .then(async res => {
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error); }
      return res.json();
    })
    .then(data => {
      setSuccess(data.message);
      onActionComplete(`Adicionou ${quantidadeAdicionar} unidade(s) ao produto "${nome}".`);
      setNome('');
      setQuantidadeAdicionar('');
    })
    .catch(err => setError(err.message));
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input className="input" placeholder="Nome do Produto Existente" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input className="input" placeholder="Quantidade a Adicionar" type="number" min="1" value={quantidadeAdicionar} onChange={(e) => setQuantidadeAdicionar(e.target.value)} />
      {error && <p className="erro">{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <button className="btn btn-primary" onClick={handleAddQuantity}>Confirmar Adição</button>
    </div>
  );
};

// --- Formulário de Remover Quantidade ---
const RemoveQuantityForm = ({ token, onActionComplete }) => {
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
      if (!res.ok) { const errData = await res.json(); throw new Error(errData.error); }
      return res.json();
    })
    .then(data => {
      setSuccess(data.message);
      onActionComplete(`Removeu ${quantidade} unidade(s) do produto "${nome}".`);
      setNome('');
      setQuantidade('');
    })
    .catch(err => setError(err.message));
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <input className="input" placeholder="Nome do Produto" value={nome} onChange={(e) => setNome(e.target.value)} />
      <input className="input" placeholder="Quantidade a ser removida" type="number" min="1" value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
      {error && <p className="erro">{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <button className="btn btn-primary" style={{ backgroundColor: '#dc3545', borderColor: '#dc3545' }} onClick={handleRemove}>
        Confirmar Remoção
      </button>
    </div>
  );
};


// --- Componente Principal da Tela de Estoque ---
export default function StockView({ token, sessionActivity, addActivityLog }) {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAddQuantityModalOpen, setIsAddQuantityModalOpen] = useState(false);
  const [isRemoveQuantityModalOpen, setIsRemoveQuantityModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // CORREÇÃO: A declaração do estado da pesquisa estava faltando
  const [searchTerm, setSearchTerm] = useState('');

  const handleActionComplete = (logMessage) => {
    if (logMessage) {
        addActivityLog(logMessage);
    }
    setIsRegisterModalOpen(false);
    setIsAddQuantityModalOpen(false);
    setIsRemoveQuantityModalOpen(false);
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleProductAdded = () => {
    handleActionComplete("Novo produto cadastrado.");
  };

  return (
    <div>
      <h1 className="main-content-title">Estoque</h1>

      <header className="stock-header">
        <div className="stock-header-actions">
          <button className="btn btn-primary" onClick={() => setIsRegisterModalOpen(true)}>
            + Cadastrar produto
          </button>
          <button className="btn btn-secondary" onClick={() => setIsAddQuantityModalOpen(true)}>
            + Adicionar Quantidade
          </button>
          <button className="btn btn-secondary" style={{ color: '#dc3545', borderColor: '#dc3545' }} onClick={() => setIsRemoveQuantityModalOpen(true)}>
            - Remover Quantidade
          </button>
        </div>
        <div className="stock-header-search">
          <input
            type="search"
            className="search-input"
            placeholder="Pesquisar por nome..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </header>
      
      <Modal show={isRegisterModalOpen} onClose={() => setIsRegisterModalOpen(false)} title="Cadastrar Novo Produto">
        <ProductForm token={token} onProductAdded={handleProductAdded} />
      </Modal>

      <Modal show={isAddQuantityModalOpen} onClose={() => setIsAddQuantityModalOpen(false)} title="Adicionar Quantidade ao Estoque">
        <AddQuantityForm token={token} onActionComplete={handleActionComplete} />
      </Modal>
      
      <Modal show={isRemoveQuantityModalOpen} onClose={() => setIsRemoveQuantityModalOpen(false)} title="Remover Quantidade do Estoque">
        <RemoveQuantityForm token={token} onActionComplete={handleActionComplete} />
      </Modal>
      
      <RecentActivity sessionActivity={sessionActivity} />
      <ProductTable token={token} refreshKey={refreshKey} searchTerm={searchTerm} />
    </div>
  );
}