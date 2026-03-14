import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, soloAdmin = false }) {
  const { usuario, cargando } = useAuth();

  if (cargando) return <div className="loading-screen">Cargando...</div>;
  if (!usuario) return <Navigate to="/login" replace />;
  if (soloAdmin && usuario.rol !== 'admin') return <Navigate to="/dashboard" replace />;

  return children;
}
