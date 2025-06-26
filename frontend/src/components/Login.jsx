import { useState } from 'react';

export default function Login({ onLogin, onIrParaCadastro }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const logar = () => {
    fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha })
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro no login');
        return res.json();
      })
      .then(data => {
        localStorage.setItem('token', data.token);
        onLogin();
      })
      .catch(() => setErro('Usuário ou senha inválidos'));
  };

  return (
    <div className="flex flex-col gap-4">
      <input
        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        placeholder="Usuário"
        value={nome}
        onChange={e => setNome(e.target.value)}
      />
      <input
        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={e => setSenha(e.target.value)}
      />
      <button
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        onClick={logar}
      >
        Entrar
      </button>
      <button
        className="text-sm text-blue-600 hover:underline self-start"
        onClick={onIrParaCadastro}
      >
        Cadastrar-se
      </button>
      {erro && <p className="text-red-500 text-sm">{erro}</p>}
    </div>
  );
}
