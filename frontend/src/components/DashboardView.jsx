import { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DashboardView({ token }) {
  const [stats, setStats] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [highStock, setHighStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, lowStockRes, highStockRes] = await Promise.all([
          fetch('/api/dashboard/stats', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/dashboard/low-stock', { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch('/api/dashboard/high-stock', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        
        const statsData = await statsRes.json();
        const lowStockData = await lowStockRes.json();
        const highStockData = await highStockRes.json();

        setStats(statsData);
        setLowStock(lowStockData);
        setHighStock(highStockData);
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  if (loading) return <p>Carregando dashboard...</p>;
  if (!stats) return <p>Não foi possível carregar os dados.</p>;

  const chartData = {
    labels: ['Valor Total do Estoque'],
    datasets: [{
      label: 'Valor em R$',
      data: [stats.totalValue || 0],
      backgroundColor: ['#5a31f4'],
      borderColor: ['#ffffff'],
      borderWidth: 2,
    }],
  };
  
  return (
    <div>
      <h1 className="main-content-title">Visão Geral</h1>
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Valor Total do Estoque</h3>
          <p style={{fontSize: '2em', fontWeight: 'bold', color: '#f48a00'}}>
            R$ {(stats.totalValue || 0).toFixed(2)}
          </p>
        </div>

        <div className="dashboard-card">
          <h3>Produtos com Baixo Estoque ({stats.lowStockCount || 0})</h3>
          <ul>
            {lowStock.map(p => (
              <li key={p.id}><span>{p.nome}</span> <strong>{p.quantidade} / {p.min_stock}</strong></li>
            ))}
          </ul>
        </div>
        
        <div className="dashboard-card">
          <h3>Produtos com Alto Estoque ({stats.highStockCount || 0})</h3>
          <ul>
            {highStock.map(p => (
              <li key={p.id}><span>{p.nome}</span> <strong>{p.quantidade} / {p.max_stock}</strong></li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}