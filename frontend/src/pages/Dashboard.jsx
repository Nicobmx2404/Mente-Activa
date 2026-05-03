import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';

const Dashboard = () => {
  const { usuario } = useAuth();
  const [stats, setStats] = useState({ total: 0, completadas: 0, pendientes: 0, vencidas: 0 });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargar = async () => {
      try {
        const { data } = await api.get('/tareas');
        const t = data.tareas;
        setStats({
          total: t.length,
          completadas: t.filter((x) => x.completada).length,
          pendientes:  t.filter((x) => !x.completada && !x.vencida).length,
          vencidas:    t.filter((x) => x.vencida).length,
        });
      } finally { setCargando(false); }
    };
    cargar();
  }, []);

  const tarjetas = [
    { label: 'Total', valor: stats.total, color: 'text-blue-600', emoji: '📋' },
    { label: 'Pendientes', valor: stats.pendientes, color: 'text-yellow-600', emoji: '⏳' },
    { label: 'Completadas', valor: stats.completadas, color: 'text-green-600', emoji: '✅' },
    { label: 'Vencidas', valor: stats.vencidas, color: 'text-red-600', emoji: '⚠️' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Buen día, {usuario?.nombre?.split(' ')[0]} 👋</h1>
          <p className="text-slate-500 mt-1">Aquí tienes el resumen de tu actividad</p>
        </div>
        {cargando ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {tarjetas.map(({ label, valor, color, emoji }) => (
              <div key={label} className="card text-center">
                <div className="text-2xl mb-1">{emoji}</div>
                <div className={`text-3xl font-bold mb-1 ${color}`}>{valor}</div>
                <div className="text-xs text-slate-500">{label}</div>
              </div>
            ))}
          </div>
        )}
        <div className="card">
          <h2 className="font-semibold text-slate-800 mb-4">Accesos rápidos</h2>
          <div className="flex gap-3 flex-wrap">
            <Link to="/tareas" className="btn-primary">📋 Ir a Mis Tareas</Link>
            <Link to="/tareas" className="btn-secondary">+ Nueva Tarea</Link>
          </div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
