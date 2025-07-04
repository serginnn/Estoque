import { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import Login from './components/Login';
import GerenteDashboard from './components/GerenteDashboard';
import './App.css';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token')); // NOVO: Estado para o token

  // Efeito para carregar usuário a partir do token ao iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // A API de login agora retorna o token e o objeto 'user'
      // Para simplificar, vamos buscar o usuário no localStorage também
      const storedUser = localStorage.getItem('user');
      if(storedUser) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
      }
    }
  }, []);

  // Efeito para classes do body (sem alterações)
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
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user)); // Armazena o usuário também
    setToken(data.token);
    setUser(data.user);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
          <button className="sidebar-button">Início</button>
          <button className="sidebar-button active">Estoque</button>
          <button className="sidebar-button">Relatórios</button>
        </aside>

        <main className="main-content">
          {/* Renderização condicional baseada no cargo do usuário */}
          {user.role === 'gerente' ? (
            <>
              <StockView />
              {/* Passa o token para o painel do gerente */}
              <GerenteDashboard token={token} /> 
            </>
          ) : (
            <StockView />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;