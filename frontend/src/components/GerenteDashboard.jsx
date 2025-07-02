import React from 'react';
import Register from './Register';

function GerenteDashboard() {
  return (
    <div className="manager-dashboard"> 
      {/* DEPOIS: Título com sua própria classe */}
      <h3 className="manager-title">Painel do Gerente</h3>
      <p>Use o formulário abaixo para cadastrar novos usuários no sistema.</p>
      
      <Register />
    </div>
  );
}

export default GerenteDashboard;