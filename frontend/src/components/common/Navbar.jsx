import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="bg-navy text-white px-6 py-3 flex items-center justify-between shadow-md">
      <Link to="/dashboard" className="text-lg font-semibold tracking-tight">🧠 Mente Activa</Link>
      <div className="flex items-center gap-5">
        <Link to="/tareas" className="text-sm text-slate-300 hover:text-white transition-colors">Mis Tareas</Link>
        <span className="text-sm text-slate-400">{usuario?.nombre}</span>
        <button onClick={handleLogout} className="text-sm bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors">
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
};
export default Navbar;
