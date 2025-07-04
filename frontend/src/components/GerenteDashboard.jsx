import React from 'react';
import Register from './Register';

function GerenteDashboard({ token }) { // Recebe o token
  return (
    <div className="manager-dashboard"> 
      <h3 className="manager-title">Painel do Gerente</h3>
      <p>Use o formulário abaixo para cadastrar novos usuários no sistema.</p>

      <Register token={token} /> {/* Passa o token para Register */}
    </div>
  );
}

export default GerenteDashboard;