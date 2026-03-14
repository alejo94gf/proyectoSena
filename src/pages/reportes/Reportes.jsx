import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import api from '../../services/api';
import './Reportes.css';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);

export default function Reportes() {
  const [data, setData] = useState([]);
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    api.get(`/reportes/mensual?anio=${anio}`)
      .then(r => setData(r.data))
      .finally(() => setCargando(false));
  }, [anio]);

  const totalIngresos = data.reduce((s, d) => s + d.ingresos, 0);
  const totalGastos = data.reduce((s, d) => s + d.gastos, 0);

  return (
    <div className="page">
      <div className="page-header-row">
        <div><h2>Reportes</h2><p className="text-muted">Análisis financiero anual</p></div>
        <select className="select-anio" value={anio} onChange={e => setAnio(e.target.value)}>
          {[2023, 2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="reportes-summary">
        <div className="summary-item">
          <span className="summary-label">Total Ingresos {anio}</span>
          <span className="summary-value text-green">{fmt(totalIngresos)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total Gastos {anio}</span>
          <span className="summary-value text-red">{fmt(totalGastos)}</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Balance Neto</span>
          <span className={`summary-value ${totalIngresos - totalGastos >= 0 ? 'text-green' : 'text-red'}`}>
            {fmt(totalIngresos - totalGastos)}
          </span>
        </div>
      </div>

      {cargando ? <div className="page-loading">Cargando...</div> : (
        <>
          <div className="chart-panel">
            <h3 className="panel-title">Ingresos vs Gastos por Mes</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4,4,0,0]} />
                <Bar dataKey="gastos" name="Gastos" fill="#ef4444" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-panel">
            <h3 className="panel-title">Tendencia de Balance</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.map(d => ({ ...d, balance: d.ingresos - d.gastos }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => fmt(v)} />
                <Line type="monotone" dataKey="balance" name="Balance" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}
