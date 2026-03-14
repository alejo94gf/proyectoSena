import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/login/Login';
import Registro from './pages/registro/Registro';
import Dashboard from './pages/dashboard/Dashboard';
import Ingresos from './pages/ingresos/Ingresos';
import Gastos from './pages/gastos/Gastos';
import Metas from './pages/metas/Metas';
import Reportes from './pages/reportes/Reportes';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/ingresos" element={<Ingresos />} />
            <Route path="/gastos" element={<Gastos />} />
            <Route path="/metas" element={<Metas />} />
            <Route path="/reportes" element={<Reportes />} />
            <Route path="/admin/usuarios" element={
              <ProtectedRoute soloAdmin><AdminUsuarios /></ProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
