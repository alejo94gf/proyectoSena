import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/ingresos', icon: '💵', label: 'Ingresos' },
  { to: '/gastos', icon: '💸', label: 'Gastos' },
  { to: '/metas', icon: '🎯', label: 'Metas de Ahorro' },
  { to: '/reportes', icon: '📈', label: 'Reportes' },
];

export default function Sidebar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="sidebar-logo">💰</span>
        <span className="sidebar-title">AhorroApp</span>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
        {usuario?.rol === 'admin' && (
          <NavLink to="/admin/usuarios" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <span className="nav-icon">👥</span>
            <span>Usuarios</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">{usuario?.nombre?.[0]?.toUpperCase()}</div>
          <div className="user-info">
            <span className="user-name">{usuario?.nombre}</span>
            <span className="user-role">{usuario?.rol}</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Cerrar sesión">⏻</button>
      </div>
    </aside>
  );
}
