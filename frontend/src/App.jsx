import { useState, useEffect } from 'react';
import Login from './components/Login';
import GerenteDashboard from './components/GerenteDashboard';
import RelatoriosView from './components/RelatoriosView';
import StockView from './components/StockView';
import DashboardView from './components/DashboardView';
import Footer from './components/Footer';
import './App.css';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token')); 
  
  const [activeView, setActiveView] = useState('inicio');

  const [sessionActivity, setSessionActivity] = useState([]);
  useEffect(() => {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) {
      const storedUser = sessionStorage.getItem('user');
      if(storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);
        } catch (error) {
          console.error("Erro ao fazer parse do usuário do sessionStorage:", error);
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('token');
        }
      }
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
    setSessionActivity([]);
    setActiveView('inicio');
  };

  const addActivityLog = (logMessage) => {
    if (logMessage) {
      const newActivity = {
        message: logMessage,
        time: new Date().toLocaleTimeString('pt-BR'),
      };
      setSessionActivity(prevActivity => [newActivity, ...prevActivity]);
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <button 
            className={`header-title ${activeView === 'inicio' ? 'active' : ''}`}
            onClick={() => setActiveView('inicio')}
          >
            Estocaí
          </button>
          <p className="header-user-info">
            Logado como: <strong>{user.nome} ({user.role})</strong> 
          </p>
        </div>
        <div className="header-right">
          <button onClick={handleLogout} className="button btn-logout">
            Sair 🚪
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

          {user.role === 'gerente' && (
            <button 
              className={`sidebar-button ${activeView === 'relatorios' ? 'active' : ''}`}
              onClick={() => setActiveView('relatorios')}
            >
              Relatórios
            </button>
          )}

          {user.role === 'gerente' && (
            <button
              className={`sidebar-button ${activeView === 'cadastro' ? 'active' : ''}`}
              onClick={() => setActiveView('cadastro')}
            >
              Cadastro
            </button>
          )}
        </aside>

        <div className="content-and-footer-wrapper">
          <main className="main-content">
            {activeView === 'estoque' && <StockView token={token} sessionActivity={sessionActivity} addActivityLog={addActivityLog} />}
            
            {activeView === 'cadastro' && <GerenteDashboard token={token} />}
            
            {activeView === 'inicio' && <DashboardView token={token}/>}
            
            {activeView === 'relatorios' && <RelatoriosView token={token} />}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}

export default App;