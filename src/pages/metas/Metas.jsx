import { useEffect, useState } from 'react';
import api from '../../services/api';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import '../gastos/Gastos.css';
import './Metas.css';

const fmt = (n) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n);
const formVacio = { nombre: '', descripcion: '', monto_objetivo: '', fecha_limite: '' };

export default function Metas() {
  const [metas, setMetas] = useState([]);
  const [modal, setModal] = useState(false);
  const [modalAbonar, setModalAbonar] = useState(null);
  const [form, setForm] = useState(formVacio);
  const [montoAbono, setMontoAbono] = useState('');
  const [editando, setEditando] = useState(null);

  const cargar = () => api.get('/metas').then(r => setMetas(r.data));
  useEffect(() => { cargar(); }, []);

  const guardar = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        await api.put(`/metas/${editando}`, form);
        toast.success('Meta actualizada');
      } else {
        await api.post('/metas', form);
        toast.success('Meta creada');
      }
      setModal(false); setForm(formVacio); setEditando(null); cargar();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al guardar');
    }
  };

  const abonar = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/metas/${modalAbonar}/abonar`, { monto: parseFloat(montoAbono) });
      toast.success('Abono registrado');
      setModalAbonar(null); setMontoAbono(''); cargar();
    } catch (err) {
      toast.error('Error al abonar');
    }
  };

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta meta?')) return;
    await api.delete(`/metas/${id}`);
    toast.success('Meta eliminada'); cargar();
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div><h2>Metas de Ahorro</h2><p className="text-muted">{metas.length} metas registradas</p></div>
        <button className="btn-add" onClick={() => { setForm(formVacio); setEditando(null); setModal(true); }}>+ Nueva Meta</button>
      </div>

      <div className="metas-grid">
        {metas.length === 0 ? (
          <div className="empty-state" style={{ gridColumn: '1/-1' }}>No hay metas. ¡Crea tu primera meta de ahorro!</div>
        ) : metas.map(m => {
          const pct = Math.min((parseFloat(m.monto_actual) / parseFloat(m.monto_objetivo)) * 100, 100);
          return (
            <div key={m.id} className={`meta-card ${m.completada ? 'completada' : ''}`}>
              <div className="meta-header">
                <span className="meta-nombre">{m.nombre}</span>
                {m.completada && <span className="badge-completada">✅ Completada</span>}
              </div>
              {m.descripcion && <p className="meta-desc">{m.descripcion}</p>}
              <div className="meta-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%` }} />
                </div>
                <div className="progress-labels">
                  <span>{fmt(m.monto_actual)}</span>
                  <span className="text-muted">{pct.toFixed(0)}%</span>
                  <span>{fmt(m.monto_objetivo)}</span>
                </div>
              </div>
              {m.fecha_limite && (
                <p className="meta-fecha">📅 Límite: {new Date(m.fecha_limite).toLocaleDateString('es')}</p>
              )}
              <div className="meta-actions">
                {!m.completada && (
                  <button className="btn-abonar" onClick={() => setModalAbonar(m.id)}>💰 Abonar</button>
                )}
                <button className="btn-icon" onClick={() => { setForm({ nombre: m.nombre, descripcion: m.descripcion || '', monto_objetivo: m.monto_objetivo, fecha_limite: m.fecha_limite?.split('T')[0] || '' }); setEditando(m.id); setModal(true); }}>✏️</button>
                <button className="btn-icon" onClick={() => eliminar(m.id)}>🗑️</button>
              </div>
            </div>
          );
        })}
      </div>

      {modal && (
        <Modal titulo={editando ? 'Editar Meta' : 'Nueva Meta de Ahorro'} onClose={() => setModal(false)}>
          <form onSubmit={guardar} className="modal-form">
            <div className="form-group">
              <label>Nombre de la meta</label>
              <input required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Vacaciones, Carro nuevo..." />
            </div>
            <div className="form-group">
              <label>Descripción (opcional)</label>
              <textarea rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Monto objetivo</label>
                <input type="number" required min="1" value={form.monto_objetivo} onChange={e => setForm({ ...form, monto_objetivo: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Fecha límite</label>
                <input type="date" value={form.fecha_limite} onChange={e => setForm({ ...form, fecha_limite: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button type="submit" className="btn-primary-sm">Guardar</button>
            </div>
          </form>
        </Modal>
      )}

      {modalAbonar && (
        <Modal titulo="Abonar a Meta" onClose={() => setModalAbonar(null)}>
          <form onSubmit={abonar} className="modal-form">
            <div className="form-group">
              <label>Monto a abonar</label>
              <input type="number" required min="1" value={montoAbono} onChange={e => setMontoAbono(e.target.value)} placeholder="0" />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-secondary" onClick={() => setModalAbonar(null)}>Cancelar</button>
              <button type="submit" className="btn-primary-sm">Abonar</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
