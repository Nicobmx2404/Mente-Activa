import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import Tareas from './pages/Tareas';

// Importamos el nuevo componente que crearemos a continuación
import Sidebar from './components/common/Sidebar'; 

const PrivadaRoute = ({ children }) => {
  const { usuario } = useAuth();
  
  if (!usuario) return <Navigate to="/login" replace />;

  // Envolvemos el contenido privado en una estructura de Flexbox
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Barra Lateral Fija */}
      <Sidebar />
      
      {/* Contenido Principal Dinámico */}
      <main className="flex-1 p-0">
        {children}
      </main>
    </div>
  );
};

const PublicaRoute = ({ children }) => {
  const { usuario } = useAuth();
  return usuario ? <Navigate to="/dashboard" replace /> : children;
};

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicaRoute><Login /></PublicaRoute>} />
    <Route path="/registro" element={<PublicaRoute><Registro /></PublicaRoute>} />
    
    {/* Estas rutas ahora heredarán el Sidebar automáticamente */}
    <Route path="/dashboard" element={<PrivadaRoute><Dashboard /></PrivadaRoute>} />
    <Route path="/tareas" element={<PrivadaRoute><Tareas /></PrivadaRoute>} />
    
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default App;