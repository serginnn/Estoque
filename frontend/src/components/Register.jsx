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
    <div className="flex flex-col gap-4">
      <input className="border border-gray-300 p-2 rounded" placeholder="Novo usuário" value={nome} onChange={e => setNome(e.target.value)} />
      <input className="border border-gray-300 p-2 rounded" type="password" placeholder="Senha" value={senha} onChange={e => setSenha(e.target.value)} />
      <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded" onClick={cadastrar}>Cadastrar</button>
      <button className="text-sm text-blue-600 hover:underline self-start" onClick={onVoltar}>Voltar para login</button>
      {mensagem && <p className="text-sm text-green-700">{mensagem}</p>}
    </div>
  );
}
