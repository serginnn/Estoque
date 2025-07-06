import { useState, useEffect } from 'react';

// Função para renderizar o badge de ação com a cor e texto corretos
const renderActionBadge = (action) => {
  switch (action) {
    case 'CRIADO':
      return <span className="action-badge badge-created">Entrada</span>;
    case 'DELETADO':
      return <span className="action-badge badge-deleted">Saída</span>;
    case 'ATUALIZADO':
      return <span className="action-badge badge-updated">Edição</span>;
    default:
      return action;
  }
};

export default function RelatoriosView({ token }) {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/historico', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => res.ok ? res.json() : Promise.reject(res))
    .then(data => {
      setHistorico(data);
    })
    .catch(err => console.error("Erro ao buscar histórico:", err))
    .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return <p>Carregando relatórios...</p>;
  }

  return (
    <div>
      <h1 className="main-content-title">Relatório de Transações</h1>

      {/* Tabela com a nova classe CSS */}
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
              {/* Coluna de Data formatada */}
              <td>{new Date(item.timestamp).toLocaleString('pt-BR')}</td>
              
              {/* Coluna de Categoria com o badge colorido */}
              <td>{renderActionBadge(item.acao)}</td>

              {/* Coluna de Atividade (Produto e Detalhes) */}
              <td>
                <strong>{item.produto_nome}</strong>
                <br />
                <span style={{ fontSize: '0.9em', color: '#666' }}>{item.detalhes}</span>
              </td>

              {/* Coluna de Usuário com ícone */}
              <td>
                <div className="user-cell">
                  {/* Ícone de usuário em SVG */}
                  <svg fill="#007bff" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12,12A5,5,0,1,0,7,7,5,5,0,0,0,12,12Zm0-8A3,3,0,1,1,9,7,3,3,0,0,1,12,4Zm0,10c-3.87,0-10,1.94-10,6v2H22V20C22,13.94,15.87,14,12,14Zm-8,6c0-2.4,2.85-4,8-4s8,1.6,8,4Z"/></svg>
                  <span>{item.usuario_nome}</span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}