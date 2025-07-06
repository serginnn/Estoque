import { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import Login from './components/Login';
import GerenteDashboard from './components/GerenteDashboard';
import './App.css';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token')); // NOVO: Estado para o token
  
  //Estado para controlar a view ativa. Começa com 'estoque'.
  const [activeView, setActiveView] = useState('estoque');

  // Efeito para carregar usuário a partir do token ao iniciar
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      // A API de login agora retorna o token e o objeto 'user'
      // Para simplificar, vamos buscar o usuário no localStorage também
      const storedUser = sessionStorage.getItem('user');
      if(storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        } catch (error) {
          console.error("Erro ao fazer parse do usuário do sessionStorage:", error);
          // ALTERADO: Limpa o sessionStorage em caso de erro
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      }
    }
  }, []);

  // Efeito para classes do body 
  useEffect(() => {
    document.body.classList.remove('login-background', 'app-background');
    if (user) {
      document.body.classList.add('app-background');
    } else {
      document.body.classList.add('login-background');
    }
    return () => {
      document.body.classList.remove('login-background', 'app-background');
    };
  }, [user]);

  // ALTERADO: handleLogin agora recebe dados da API (token e user)
  const handleLogin = (data) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
  };

   const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const StockView = () => (
    <>
      <h1 className="main-content-title">Controle de Estoque</h1>
      {/* Passa o token para os componentes que fazem chamadas à API */}
      <ProductForm token={token} />
      <ProductTable token={token} />
    </>
  );

  // Se não estiver logado (sem usuário/token), mostra o Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Se ESTIVER LOGADO, renderiza o dashboard
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h2 className="header-title">Estocaí</h2>
          <p className="header-user-info">
            Logado como: <strong>{user.nome} ({user.role})</strong> 
          </p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="button btn-logout">
            Sair
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        <aside className="dashboard-sidebar">
          <button 
            className={`sidebar-button ${activeView === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveView('inicio')}
          >
            Início
          </button>

          <button 
            className={`sidebar-button ${activeView === 'estoque' ? 'active' : ''}`}
            onClick={() => setActiveView('estoque')}
          >
            Estoque
          </button>
          
          {/* NOVO: Botão de Cadastro, visível apenas para o gerente */}
          {user.role === 'gerente' && (
            <button
              className={`sidebar-button ${activeView === 'cadastro' ? 'active' : ''}`}
              onClick={() => setActiveView('cadastro')}
            >
              Cadastro
            </button>
          )}

          <button 
            className={`sidebar-button ${activeView === 'relatorios' ? 'active' : ''}`}
            onClick={() => setActiveView('relatorios')}
          >
            Relatórios
          </button>
        </aside>

        <main className="main-content">
          {/* Renderiza o conteúdo com base na view ativa */}
          {activeView === 'estoque' && <StockView />}
          
          {activeView === 'cadastro' && <GerenteDashboard token={token} />}
          
          {activeView === 'inicio' && <h1 className="main-content-title">Página Inicial</h1>}
          
          {activeView === 'relatorios' && <h1 className="main-content-title">Relatórios</h1>}
        </main>
      </div>
    </div>
  );
}

export default App;