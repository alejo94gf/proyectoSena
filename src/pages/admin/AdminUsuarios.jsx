import { useEffect, useState } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import '../gastos/Gastos.css';
import './Admin.css';

export default function AdminUsuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  const cargar = () => {
    api.get('/usuarios').then(r => setUsuarios(r.data)).finally(() => setCargando(false));
  };
  useEffect(() => { cargar(); }, []);

  const toggleActivo = async (id) => {
    await api.put(`/usuarios/${id}/toggle`);
    toast.success('Estado actualizado');
    cargar();
  };

  const cambiarRol = async (id, rol) => {
    await api.put(`/usuarios/${id}/rol`, { rol });
    toast.success('Rol actualizado');
    cargar();
  };

  return (
    <div className="page">
      <div className="page-header-row">
        <div><h2>Gestión de Usuarios</h2><p className="text-muted">{usuarios.length} usuarios registrados</p></div>
      </div>

      {cargando ? <div className="page-loading">Cargando...</div> : (
        <div className="tabla-panel">
          <table className="tabla">
            <thead>
              <tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Estado</th><th>Registro</th><th>Acciones</th></tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="font-bold">{u.nombre}</td>
                  <td className="text-muted">{u.email}</td>
                  <td>
                    <select
                      className="select-rol"
                      value={u.rol}
                      onChange={e => cambiarRol(u.id, e.target.value)}
                    >
                      <option value="usuario">Usuario</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span className={`status-badge ${u.activo ? 'activo' : 'inactivo'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="text-muted">{new Date(u.created_at).toLocaleDateString('es')}</td>
                  <td>
                    <button
                      className={`btn-toggle ${u.activo ? 'desactivar' : 'activar'}`}
                      onClick={() => toggleActivo(u.id)}
                    >
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
