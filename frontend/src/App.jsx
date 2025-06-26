import { useState, useEffect } from 'react';
import ProductForm from './components/ProductForm';
import ProductTable from './components/ProductTable';
import Login from './components/Login';
import Register from './components/Register';

function App() {
  const [logado, setLogado] = useState(false);
  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  useEffect(() => {
    // Forçar logout automático ao abrir o app
    localStorage.removeItem('token');
    setLogado(false);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl">
        <h1 className="text-center text-3xl font-extrabold text-blue-700">Gerenciador de Estoque</h1>
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