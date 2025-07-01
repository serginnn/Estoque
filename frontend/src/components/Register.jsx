import { useState } from 'react';

export default function Register({ onVoltar }) {
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');

  const cadastrar = () => {
    fetch('http://localhost:3000/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, senha })
    })
      .then(res => {
        if (!res.ok) throw new Error('Erro ao cadastrar');
        return res.json();
      })
      .then(() => setMensagem('Usuário cadastrado com sucesso!'))
      .catch(() => setMensagem('Erro: usuário já existe.'));
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
          Cadastrar
        </button>

        <button
          className="auth-container button"
          onClick={onVoltar}
        >
          Voltar para login
        </button>

        {mensagem && (
          <p className={`text-sm text-center ${mensagem.includes('sucesso') ? 'text-green-400' : 'text-red-400'}`}>
            {mensagem}
          </p>
        )}
      </div>
    </div>
  );
}
