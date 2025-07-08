
import { useState, useEffect, useRef } from 'react';
import ManagerProductTable from './ManagerProductTable'; // Usa a tabela completa do gerente

// Função para renderizar o badge de ação (sem alterações)
const renderActionBadge = (action) => {
    switch (action) {
      case 'CRIADO': case 'ENTRADA': return <span className="action-badge badge-created">Entrada</span>;
      case 'DELETADO': case 'SAÍDA': return <span className="action-badge badge-deleted">Saída</span>;
      case 'ATUALIZADO': return <span className="action-badge badge-updated">Edição</span>;
      default: return action;
    }
};

export default function RelatoriosView({ token }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const historySectionRef = useRef(null);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  // Função para forçar o recarregamento dos componentes filhos
  const handleActionComplete = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };

  const handleScrollToHistory = () => {
    historySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setLoading(true);
    fetch('/api/historico', { headers: { 'Authorization': `Bearer ${token}` }})
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => setHistorico(data))
    .catch(err => console.error("Erro ao buscar histórico:", err))
    .finally(() => setLoading(false));
  }, [token, refreshKey]);

  return (
    <div>
      {/* NOVO: Contêiner para o título e o botão */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="main-content-title" style={{ marginBottom: 0 }}>
          Gerenciamento de Catálogo e Relatórios
        </h1>
        {/* BOTÃO MOVIDO PARA CÁ */}
        <button className="btn btn-secondary" onClick={handleScrollToHistory}>
          Ver Histórico de Transações ↓
        </button>
      </div>

      <section className="dashboard-card" style={{marginBottom: '2rem'}}>
        <h3>Catálogo de Produtos</h3>
        
        {/* ALTERADO: A barra de busca agora fica sozinha */}
        <div className="stock-header-search" style={{ marginBottom: '1rem' }}>
            <input 
              type="search" 
              className="search-input" 
              placeholder="Pesquisar para Editar/Excluir..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            {/* O BOTÃO FOI MOVIDO DAQUI... */}
        </div>
        
        <ManagerProductTable 
          token={token} 
          refreshKey={refreshKey} 
          searchTerm={searchTerm}
          onActionComplete={handleActionComplete} 
        />
      </section>
      
      <section className="dashboard-card" ref={historySectionRef}>
        <h3>Histórico de Transações Recentes</h3>
        {loading ? <p>Carregando histórico...</p> : (
          <table className="report-table">
            <thead>
                <tr>
                    <th>Data</th>
                    <th>Categoria</th>
                    <th>Atividade</th>
                    <th>Usuário</th>
                </tr>
            </thead>
            <tbody>
                {historico.map(item => (
                    <tr key={item.id}>
                        <td>{new Date(item.timestamp).toLocaleString('pt-BR')}</td>
                        <td>{renderActionBadge(item.acao)}</td>
                        <td>
                            <strong>{item.produto_nome}</strong><br />
                            <span style={{ fontSize: '0.9em', color: '#666' }}>{item.detalhes}</span>
                        </td>
                        <td>
                            <div className="user-cell">
                                <svg fill="#007bff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,12A5,5,0,1,0,7,7,5,5,0,0,0,12,12Zm0-8A3,3,0,1,1,9,7,3,3,0,0,1,12,4Zm0,10c-3.87,0-10,1.94-10,6v2H22V20C22,13.94,15.87,14,12,14Zm-8,6c0-2.4,2.85-4,8-4s8,1.6,8,4Z"/></svg>
                                <span>{item.usuario_nome}</span>
                            </div>
                        </td>
                    </tr>
                ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}