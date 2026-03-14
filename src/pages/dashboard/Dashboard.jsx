import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Dashboard() {
  const { usuario } = useAuth();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.get('/reportes/dashboard')
      .then(r => setData(r.data))
      .catch(console.error)
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <div className="page-loading">Cargando dashboard...</div>;

  const { resumen, gastosPorCategoria, ultimosMovimientos, metas } = data || {};

  return (
    <div className="dashboard">
      <div className="page-header">
        <h2>Hola, {usuario?.nombre} 👋</h2>
        <p className="text-muted">Resumen de {new Date().toLocaleString('es', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Tarjetas resumen */}
      <div className="cards-grid">
        <div className="card card-green">
          <div className="card-icon">💵</div>
          <div>
            <p className="card-label">Ingresos del mes</p>
            <p className="card-value">{fmt(resumen?.ingresos || 0)}</p>
          </div>
        </div>
        <div className="card card-red">
          <div className="card-icon">💸</div>
          <div>
            <p className="card-label">Gastos del mes</p>
            <p className="card-value">{fmt(resumen?.gastos || 0)}</p>
          </div>
        </div>
        <div className={`card ${resumen?.balance >= 0 ? 'card-blue' : 'card-orange'}`}>
          <div className="card-icon">💰</div>
          <div>
            <p className="card-label">Balance disponible</p>
            <p className="card-value">{fmt(resumen?.balance || 0)}</p>
          </div>
        </div>
        <div className="card card-purple">
          <div className="card-icon">🎯</div>
          <div>
            <p className="card-label">Metas activas</p>
            <p className="card-value">{metas?.total || 0} <span className="card-sub">({metas?.completadas || 0} completadas)</span></p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Gráfico de gastos por categoría */}
        <div className="panel">
          <h3 className="panel-title">Gastos por Categoría</h3>
          {gastosPorCategoria?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={gastosPorCategoria} dataKey="total" nameKey="nombre" cx="50%" cy="50%" outerRadius={90} label={({ nombre, percent }) => `${nombre} ${(percent * 100).toFixed(0)}%`}>
                  {gastosPorCategoria.map((entry, i) => (
                    <Cell key={i} fill={entry.color || '#6366f1'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">Sin gastos este mes</div>
          )}
        </div>

        {/* Últimos movimientos */}
        <div className="panel">
          <h3 className="panel-title">Últimos Movimientos</h3>
          <div className="movimientos-list">
            {ultimosMovimientos?.length > 0 ? ultimosMovimientos.map((m, i) => (
              <div key={i} className="movimiento-item">
                <span className="mov-icon">{m.tipo === 'ingreso' ? '⬆️' : '⬇️'}</span>
                <div className="mov-info">
                  <span className="mov-desc">{m.descripcion}</span>
                  <span className="mov-fecha">{new Date(m.fecha).toLocaleDateString('es')}</span>
                </div>
                <span className={`mov-monto ${m.tipo === 'ingreso' ? 'text-green' : 'text-red'}`}>
                  {m.tipo === 'ingreso' ? '+' : '-'}{fmt(m.monto)}
                </span>
              </div>
            )) : (
              <div className="empty-state">Sin movimientos registrados</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
