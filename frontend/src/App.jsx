import { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import Login from './components/Login';
import GerenteDashboard from './components/GerenteDashboard';
import './App.css';
import './index.css';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

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

  const handleLogin = (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const StockView = () => (
    <>
      <h1 className="main-content-title">Controle de Estoque</h1>
      <ProductForm />
      <ProductTable />
    </>
  );

  // Se não estiver logado, mostra apenas o componente de Login
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Se ESTIVER LOGADO, renderiza o layout completo do dashboard
  return (
    <div className="dashboard-container">
      {/* ================= HEADER (TOPO) ================= */}
      <header className="dashboard-header">
        <div className="header-left">
          <h2 className="header-title">Estocaí</h2>
          <p className="header-user-info">
            Logado como: <strong>{user.nome}</strong> 
          </p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="button btn-logout">
            Sair
          </button>
        </div>
      </header>

      <div className="dashboard-body">
        {/* ================= SIDEBAR (LATERAL) ================= */}
        <aside className="dashboard-sidebar">
          {/* Você pode adicionar botões de navegação aqui no futuro */}
          <button className="sidebar-button">Início</button>
          <button className="sidebar-button active">Estoque</button>
          <button className="sidebar-button">Relatórios</button>
        </aside>

        {/* ================= CONTEÚDO PRINCIPAL ================= */}
        <main className="main-content">
          {user.role === 'gerente' ? (
            <>
              <StockView />
              <GerenteDashboard />
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