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
    <div className="body">
      <div className="auth-container">
        <h2 className="nada">Login</h2>
        
        <input
          className="auth-container input "
          placeholder="Usuário"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />

        <input
          className="auth-container input "
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />

        <button
          className="auth-container button"
          onClick={logar}
        >
          Entrar
        </button>

        <button
          className="auth-container button"
          onClick={onIrParaCadastro}
        >
          Cadastrar-se
        </button>

        {erro && <p className="erro">{erro}</p>}
      </div>
    </div>
  );
}
