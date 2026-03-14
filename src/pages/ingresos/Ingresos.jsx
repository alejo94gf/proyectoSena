import { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import '../gastos/Gastos.css';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const hoy = () => new Date().toISOString().split('T')[0];

const formVacio = { descripcion: '', monto: '', fecha: hoy(), fuente: '' };

export default function Ingresos() {
  const [ingresos, setIngresos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    api.get('/ingresos').then(r => setIngresos(r.data)).finally(() => setCargando(false));
  };

  useEffect(() => { cargar(); }, []);

  const abrirNuevo = () => { setForm(formVacio); setEditando(null); setModal(true); };
  const abrirEditar = (i) => { setForm({ descripcion: i.descripcion, monto: i.monto, fecha: i.fecha?.split('T')[0], fuente: i.fuente || '' }); setEditando(i.id); setModal(true); };

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/ingresos/${editando}`, form);
        toast.success('Ingreso actualizado');
      } else {
        await api.post('/ingresos', form);
        toast.success('Ingreso registrado');
      }
      setModal(false);
      cargar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este ingreso?')) return;
    await api.delete(`/ingresos/${id}`);
    toast.success('Eliminado');
    cargar();
  };

  const total = ingresos.reduce((s, i) => s + parseFloat(i.monto), 0);

  return (
    <div className="page">
      <div className="page-header-row">
        <div>
          <h2>Ingresos</h2>
          <p className="text-muted">Total: <strong className="text-green">{fmt(total)}</strong></p>
        </div>
        <button className="btn-add" onClick={abrirNuevo}>+ Nuevo Ingreso</button>
      </div>

      {cargando ? <div className="page-loading">Cargando...</div> : (
        <div className="tabla-panel">
          {ingresos.length === 0 ? (
            <div className="empty-state">No hay ingresos registrados. ¡Agrega el primero!</div>
          ) : (
            <table className="tabla">
              <thead>
                <tr><th>Descripción</th><th>Fuente</th><th>Fecha</th><th>Monto</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {ingresos.map(i => (
                  <tr key={i.id}>
                    <td>{i.descripcion}</td>
                    <td className="text-muted">{i.fuente || '-'}</td>
                    <td>{new Date(i.fecha).toLocaleDateString('es')}</td>
                    <td className="text-green font-bold">{fmt(i.monto)}</td>
                    <td>
                      <button className="btn-icon" onClick={() => abrirEditar(i)}>✏️</button>
                      <button className="btn-icon" onClick={() => eliminar(i.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {modal && (
        <Modal titulo={editando ? 'Editar Ingreso' : 'Nuevo Ingreso'} onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="modal-form">
            <div className="form-group">
              <label>Descripción</label>
              <input required value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} placeholder="Ej: Salario mensual" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Monto</label>
                <input type="number" required min="1" step="0.01" value={form.monto} onChange={e => setForm({ ...form, monto: e.target.value })} placeholder="0" />
              </div>
              <div className="form-group">
                <label>Fecha</label>
                <input type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
            </div>
            <div className="form-group">
              <label>Fuente (opcional)</label>
              <input value={form.fuente} onChange={e => setForm({ ...form, fuente: e.target.value })} placeholder="Ej: Trabajo, Freelance..." />
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
