import { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import './Gastos.css';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const hoy = () => new Date().toISOString().split('T')[0];
const formVacio = { descripcion: '', monto: '', fecha: hoy(), categoria_id: '', notas: '' };

export default function Gastos() {
  const [gastos, setGastos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    Promise.all([api.get('/gastos'), api.get('/categorias')])
      .then(([g, c]) => { setGastos(g.data); setCategorias(c.data); })
      .finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm(formVacio); setEditando(null); setModal(true); };
  const abrirEditar = (g) => {
    setForm({ descripcion: g.descripcion, monto: g.monto, fecha: g.fecha?.split('T')[0], categoria_id: g.categoria_id || '', notas: g.notas || '' });
    setEditando(g.id); setModal(true);
  };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/gastos/${editando}`, form);
        toast.success('Gasto actualizado');
      } else {
        await api.post('/gastos', form);
        toast.success('Gasto registrado');
      }
      setModal(false); cargar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este gasto?')) return;
    await api.delete(`/gastos/${id}`);
    toast.success('Eliminado'); cargar();
  };

  const total = gastos.reduce((s, g) => s + parseFloat(g.monto), 0);

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h2>Gastos</h2>
          <p className="text-muted">Total: <strong className="text-red">{fmt(total)}</strong></p>
        </div>
        <button className="btn-add" onClick={abrirNuevo}>+ Nuevo Gasto</button>
      </div>

      {cargando ? <div className="page-loading">Cargando...</div> : (
        <div className="tabla-panel">
          {gastos.length === 0 ? (
            <div className="empty-state">No hay gastos registrados.</div>
          ) : (
            <table className="tabla">
              <thead>
                <tr><th>Descripción</th><th>Categoría</th><th>Fecha</th><th>Monto</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {gastos.map(g => (
                  <tr key={g.id}>
                    <td>{g.descripcion}</td>
                    <td>
                      {g.categoria_icono && <span>{g.categoria_icono} </span>}
                      <span className="badge" style={{ background: g.categoria_color + '22', color: g.categoria_color }}>
                        {g.categoria_nombre || 'Sin categoría'}
                      </span>
                    </td>
                    <td>{new Date(g.fecha).toLocaleDateString('es')}</td>
                    <td className="text-red font-bold">{fmt(g.monto)}</td>
                    <td>
                      <button className="btn-icon" onClick={() => abrirEditar(g)}>✏️</button>
                      <button className="btn-icon" onClick={() => eliminar(g.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <Modal titulo={editando ? 'Editar Gasto' : 'Nuevo Gasto'} onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="modal-form">
            <div className="form-group">
              <label>Descripción</label>
              <input required value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Almuerzo" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Monto</label>
                <input type="number" required min="1" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Categoría</label>
              <select value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                <option value="">Sin categoría</option>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Notas (opcional)</label>
              <textarea rows={2} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Detalles adicionales..." />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary-sm">Guardar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
