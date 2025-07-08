import React, { useEffect, useState } from 'react';

export default function StockProductTable({ token, searchTerm }) {
  const [allProducts, setAllProducts] = useState([]);
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetch('/api/produtos', { headers: { 'Authorization': `Bearer ${token}` }})
      .then(res => res.json())
      .then(data => {
        setAllProducts(data || []);
      })
      .catch(err => console.error("Erro ao carregar produtos:", err));
  }, [token]);

  useEffect(() => {
    const term = searchTerm.trim().toLowerCase();
    if (term === '') {
      setProdutos(allProducts);
    } else {
      const filtered = allProducts.filter(p =>
        p.nome.toLowerCase().includes(term)
      );
      setProdutos(filtered);
    }
  }, [searchTerm, allProducts]);

  return (
    <table className="report-table">
      <thead>
        <tr>
          <th>Nome do Produto</th>
          <th>Quantidade em Estoque</th>
          <th>Preço Unitário</th>
        </tr>
      </thead>
      <tbody>
        {produtos.map(p => (
          <tr key={p.id}>
            <td>{p.nome}</td>
            <td>{p.quantidade}</td>
            <td>R$ {p.preco ? p.preco.toFixed(2) : '0.00'}</td>
          </tr>
        ))}

        {produtos.length === 0 && searchTerm.trim() !== '' && (
          <tr>
            <td colSpan="3" className="no-results-cell">
              Produto não encontrado
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}