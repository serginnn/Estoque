import { useState } from 'react';

export default function Register({ token }) { // Recebe o token
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const cadastrar = () => {
    fetch('/api/usuarios', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` // NOVO: Envia o token
      },
      body: JSON.stringify({ nome, senha })
    })
    .then(res => {
        if (res.status === 403) throw new Error('Acesso negado');
        if (res.status === 400) throw new Error('Usuário já existe');
        if (!res.ok) throw new Error('Erro ao cadastrar');
        return res.json();
      })
      .then(()=> {
        setMensagem('Usuário cadastrado com sucesso!');
        setNome('');
        setSenha('');
      })
      .catch(err => setMensagem(`Erro: ${err.message}.`));
  };

  return (
    <div className="body">
      <div className="auth-container">
        <h2 className="nada">Cadastro</h2>

        <input
          className="auth-container input"
          placeholder="Novo usuário"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />

        <input
          className="auth-container input"
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={e => setSenha(e.target.value)}
        />

        <button
          className="auth-container button"
          onClick={cadastrar}
        >
          Cadastrar Usuário
        </button>

        {mensagem && <p style={{ color: mensagem.includes('sucesso') ? 'lightgreen' : 'salmon' }}>{mensagem}</p>}
      </div>
    </div>
  );
}
