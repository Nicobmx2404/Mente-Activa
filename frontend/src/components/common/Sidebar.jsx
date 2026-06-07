import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { LayoutDashboard, CalendarDays, LogOut, LucideLogOut, LucideList, LucideListCheck, LucideListChecks, LucideHome } from 'lucide-react';

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Función para resaltar el link activo
 const linkClass = (path) => 
  `flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
    location.pathname === path 
      ? 'bg-slate-900/40 text-white shadow-lg' 
      : 'text-white/70 hover:bg-white/10 hover:text-white'
  }`;

  return (
    <aside className="w-64 bg-[#4F46E5] text-white flex flex-col h-screen sticky top-0 shadow-xl">
        <div className="p-2 font-inter font-bold tracking-tight border-b border-slate-700/50">
            {/* text-2xl para un título llamativo */}
            <h1 className="text-2xl">Mente Activa</h1>
            
            {/* text-xs para un subtítulo pequeño y elegante, con opacidad para que no compita */}
            <h6 className="text-xs font-medium text-white/70">Controla tu mundo</h6>
        </div>
      
      
      <nav className="flex-1 p-4 space-y-2 ">
        <Link to="/dashboard" className={linkClass('/dashboard')}>
          <LucideHome size={20} strokeWidth={1.5} />
          <span className="font-medium">Inicio</span>
        </Link>
        <br></br>
        CONTROL DE VIDA
        <Link to="/tareas" className={linkClass('/tareas')}>
          <LucideListChecks size={20} strokeWidth={1.5} />
          <span className="font-medium">Mis Tareas</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-white/10">
  <button 
    onClick={() => { logout(); navigate('/login'); }}
    /* Cambiamos 'block' o cualquier otra clase por 'flex items-center gap-3' */
    className="flex items-center gap-3 w-full p-3 text-white/70 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-200"
  >
    {/* Icono de bordes (outline) */}
    <LogOut size={20} strokeWidth={1.5} className="shrink-0" />
    
    <span className="font-medium">Cerrar Sesión</span>
  </button>
</div>
    </aside>
  );
};

export default Sidebar;