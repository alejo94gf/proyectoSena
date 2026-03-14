import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../login/Login.css';

export default function Registro() {
  const [form, setForm] = useState({ nombre: '', email: '', password: '', confirmar: '' });
  const [cargando, setCargando] = useState(false);
  const { registro } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmar) return toast.error('Las contraseñas no coinciden');
    if (form.password.length < 6) return toast.error('Mínimo 6 caracteres');
    setCargando(true);
    try {
      await registro(form.nombre, form.email, form.password);
      toast.success('Cuenta creada exitosamente');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error al registrarse');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">💰</div>
        <h1 className="auth-title">Crear Cuenta</h1>
        <p className="auth-subtitle">Empieza a controlar tus finanzas</p>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Nombre completo</label>
            <input type="text" required value={form.nombre}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              placeholder="Tu nombre" />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="tu@email.com" />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" required value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Mínimo 6 caracteres" />
          </div>
          <div className="form-group">
            <label>Confirmar contraseña</label>
            <input type="password" required value={form.confirmar}
              onChange={e => setForm({ ...form, confirmar: e.target.value })}
              placeholder="Repite tu contraseña" />
          </div>
          <button type="submit" className="btn-primary" disabled={cargando}>
            {cargando ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <p className="auth-link">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
