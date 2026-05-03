import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login    from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Tareas   from './pages/Tareas';

const PrivadaRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? children : <Navigate to="/login" replace />;
};

const PublicaRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
  <Routes>
    <Route path="/"          element={<Navigate to="/dashboard" replace />} />
    <Route path="/login"     element={<PublicaRoute><Login /></PublicaRoute>} />
    <Route path="/registro"  element={<PublicaRoute><Registro /></PublicaRoute>} />
    <Route path="/dashboard" element={<PrivadaRoute><Dashboard /></PrivadaRoute>} />
    <Route path="/tareas"    element={<PrivadaRoute><Tareas /></PrivadaRoute>} />
    <Route path="*"          element={<Navigate to="/" replace />} />
  </Routes>
);
export default App;
