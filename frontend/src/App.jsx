import { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import Login from './components/Login';
import Register from './components/Register';
import './App.css';

function App() {
  const [logado, setLogado] = useState(false);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  useEffect(() => {
    // Forçar logout automático ao abrir o app
    localStorage.removeItem('token');
    setLogado(false);
  }, []);

  return (
    <div>
      <div className="content">
        <h1 className="titulo">Gerenciador Estocaí</h1>
        {!logado ? (
          mostrarCadastro ? (
            <Register onVoltar={() => setMostrarCadastro(false)} />
          ) : (
            <Login onLogin={() => setLogado(true)} onIrParaCadastro={() => setMostrarCadastro(true)} />
          )
        ) : (
          <>
            <ProductForm />
            <ProductTable />
          </>
        )}
      </div>
    </div>
  );
}

export default App;