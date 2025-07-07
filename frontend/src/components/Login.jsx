import { useState } from 'react';

export default function Login({ onLogin, onIrParaCadastro }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const logar = () => {
    fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha })
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro no login');
        return res.json();
      })
      .then(data => {
        onLogin(data);
      })
      .catch(() => setErro('Usuário ou senha inválidos'));
  };

  return (
    <div className="login-page-wrapper">
      <div className="auth-container">
        <h2 className="nada">Login</h2>
        
        <input
          className="input" // Classe corrigida
          placeholder="Usuário"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />

        <input
          className="input" // Classe corrigida
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />

        <button className="button" onClick={logar}>
          Entrar
        </button>


        {erro && <p className="erro">{erro}</p>}
      </div>
    </div>
  );
}
