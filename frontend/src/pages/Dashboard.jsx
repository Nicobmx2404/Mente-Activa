import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/common/Spinner';
import Navbar from '../components/common/Navbar';
import { ClipboardList, PlusCircle } from 'lucide-react';

const Dashboard = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ racha: 10, semana: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get('/tareas');
        const sieteDiasAtras = new Date();
        sieteDiasAtras.setDate(sieteDiasAtras.getDate() - 7);
        
        const tareasRecientes = data.tareas.filter(t => 
          new Date(t.createdAt || t.fechaLimite) >= sieteDiasAtras
        ).length;

        setStats(prev => ({ ...prev, semana: tareasRecientes }));
      } catch (err) {
        console.error("Error cargando stats:", err);
      } finally { setCargando(false); }
    };
    cargar();
  }, []);

  if (cargando) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="max-w-5xl mx-auto p-8 animate-in fade-in duration-500">
        {/* Saludo Principal */}
        <h1 className="text-3xl font-black text-slate-900 mb-8 tracking-tight">
          Buen día, {usuario?.nombre?.split(' ')[0] || 'Nicolas'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Tarjeta Racha */}
          <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-5xl font-black text-[#4F46E5] mb-2">{stats.racha}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Máxima racha</div>
          </div>

          {/* Tarjeta Tareas Semana */}
          <div className="p-8 rounded-3xl border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all">
            <div className="text-5xl font-black text-slate-800 mb-2">{stats.semana}</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">Tareas de esta semana</div>
          </div>
        </div>

        {/* Banner Próxima Racha */}
        <div className="p-8 rounded-3xl border border-indigo-100 bg-[#F5F3FF] mb-12 group cursor-default">
          <h3 className="text-[#4F46E5] font-black text-xl mb-1 group-hover:scale-[1.01] transition-transform origin-left">
            Próxima racha
          </h3>
          <p className="text-[#4F46E5]/60 font-bold text-sm">Lun 6 de Mayo</p>
        </div>

        {/* Sección Accesos Rápidos */}
        <div className="space-y-4">
          <h2 className="text-[11px] font-black text-slate-300 uppercase tracking-[0.25em] pl-1">
            Accesos rápidos
          </h2>
          <div className="flex gap-4">
            <Link 
              to="/tareas" 
              className="flex items-center gap-3 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-95"
            >
              <ClipboardList size={20} />
              Ver Mis Tareas
            </Link>
            <Link 
              to="/tareas" 
              className="flex items-center gap-3 px-8 py-4 bg-white text-slate-600 border-2 border-slate-100 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95"
            >
              <PlusCircle size={20} />
              Crear Nueva
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;