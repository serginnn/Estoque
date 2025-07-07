import React from 'react';
import Register from './Register';

function GerenteDashboard({ token }) {
  return (
    <div className="manager-dashboard-view"> 
    
      <h1 className="main-content-title">Painel de Cadastro</h1>

      <div className="register-form-container">
        <Register token={token} />
      </div>

    </div>
  );
}

export default GerenteDashboard;