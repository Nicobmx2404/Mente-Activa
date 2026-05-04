import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import { Plus, Eye, Trash2, Calendar, Edit2 } from 'lucide-react';

// 1. Mapeo para normalizar prioridades viejas a estados nuevos
const MAPA_ESTADOS = {
  'alta': 'cancelada',     // Lo que era Alta ahora se ve como Cancelada (Rojo)
  'media': 'pendiente',    // Lo que era Media ahora se ve como Pendiente (Naranja)
  'baja': 'completada',    // Lo que era Baja ahora se ve como Completada (Verde)
  // Mantener los nuevos por si ya existen
  'completada': 'completada',
  'cancelada': 'cancelada',
  'pendiente': 'pendiente'
};

const ESTADOS_STYLE = {
  completada: {
    bg: 'bg-[#E6F5EE]/90',
    text: 'text-[#155E43]',
    dot: 'bg-[#155E43]'
  },
  cancelada: {
    bg: 'bg-[#FEE2E2]/90',
    text: 'text-[#DC2626]',
    dot: 'bg-[#DC2626]'
  },
  pendiente: {
    bg: 'bg-[#fff3e0]/80',
    text: 'text-[#D97706]',
    dot: 'bg-[#D97706]'
  },
  default: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    dot: 'bg-slate-400'
  }
};

const FormTarea = ({ onGuardar, onCancelar, tareaEditar }) => {
  // Al cargar para editar, normalizamos el valor que venga de la DB
  const estadoInicial = tareaEditar 
    ? (MAPA_ESTADOS[(tareaEditar.estado || tareaEditar.prioridad || '').toLowerCase()] || 'pendiente')
    : 'pendiente';

  const [form, setForm] = useState(tareaEditar ? 
    { ...tareaEditar, estado: estadoInicial } : 
    { titulo: '', descripcion: '', fechaLimite: '', estado: 'pendiente' }
  );
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setCargando(true);

  try {
    // 1. Mapeo inverso: Si el backend espera prioridades, se las enviamos
    // basándonos en el estado seleccionado para que no rechace la petición.
    const mapeoInverso = {
      'pendiente': 'media',
      'completada': 'baja',
      'cancelada': 'alta'
    };

    // 2. Construcción del objeto estrictamente compatible
    const datosEnvio = {
      titulo: form.titulo.trim(),
      descripcion: form.descripcion?.trim() || "",
      fechaLimite: form.fechaLimite,
      estado: form.estado, 
      prioridad: mapeoInverso[form.estado] || 'media' // Evita el Error 400
    };

    console.log("Enviando a SaludYa:", datosEnvio);

    if (tareaEditar) {
      // 3. EDITAR: Sin enviar el ID en el cuerpo (body)
      const { data } = await api.put(`/tareas/${tareaEditar._id}`, datosEnvio);
      
      // Actualizamos localmente
      const tareaActualizada = data.tarea || { ...datosEnvio, _id: tareaEditar._id };
      onGuardar(tareaActualizada, 'editar');
    } else {
      // 4. CREAR
      const { data } = await api.post('/tareas', datosEnvio);
      onGuardar(data.tarea, 'crear');
    }

  } catch (err) {
    // Capturamos el error real del backend para verlo en consola
    const errorReal = err.response?.data?.mensaje || err.response?.data?.error || "Error de validación";
    console.error("Detalle técnico del Error 400:", err.response?.data);
    
    alert(`Error 400: El servidor de SaludYa rechazó los datos. Verifica que todos los campos obligatorios estén llenos.`);
  } finally {
    setCargando(false);
  }
};

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 mb-8 animate-in fade-in zoom-in duration-300">
      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
        {tareaEditar ? <Edit2 size={16}/> : <Plus size={16}/>} 
        {tareaEditar ? 'Editar Tarea Administrativa' : 'Nueva Tarea Administrativa'}
      </h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-medium">
        <input className="p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500" name="titulo" placeholder="Título *" value={form.titulo} onChange={handleChange} required />
        <select className="p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" name="estado" value={form.estado} onChange={handleChange}>
          <option value="pendiente">Pendiente</option>
          <option value="completada">Completada</option>
          <option value="cancelada">Cancelada</option>
        </select>
        <input className="p-3 border border-slate-200 rounded-xl outline-none" type="date" name="fechaLimite" value={form.fechaLimite?.split('T')[0] || ''} onChange={handleChange} required />
        <textarea className="p-3 border border-slate-200 rounded-xl md:col-span-2 resize-none" name="descripcion" placeholder="Detalles de la actividad..." rows={2} value={form.descripcion} onChange={handleChange} />
        <div className="flex gap-3 md:col-span-2">
          <button type="submit" className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">Confirmar</button>
          <button type="button" className="px-6 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200" onClick={onCancelar}>Descartar</button>
        </div>
      </form>
    </div>
  );
};

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tareaEditar, setTareaEditar] = useState(null);

  const cargarTareas = useCallback(async () => {
    try { 
      const { data } = await api.get('/tareas'); 
      setTareas(data.tareas || []); 
    } catch (e) {
      console.error(e);
    } finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarTareas(); }, [cargarTareas]);

  const handleGuardar = (tarea, tipo) => {
    if (tipo === 'crear') setTareas((p) => [tarea, ...p]);
    if (tipo === 'editar') setTareas((p) => p.map((x) => x._id === tarea._id ? tarea : x));
    setMostrarForm(false); setTareaEditar(null);
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8fafc]">
      <Navbar />
      <main className="w-full p-6 md:p-10 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-200 pb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Tareas</h1>
            <p className="text-slate-500 text-sm font-medium">Panel Administrativo SaludYa</p>
          </div>
          {!mostrarForm && !tareaEditar && (
            <button onClick={() => setMostrarForm(true)} className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-indigo-700 hover:scale-110 transition-all active:scale-95 shadow-indigo-200">
              <Plus size={32} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {(mostrarForm || tareaEditar) && (
          <FormTarea tareaEditar={tareaEditar} onGuardar={handleGuardar} onCancelar={() => { setMostrarForm(false); setTareaEditar(null); }} />
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-200">
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest">Actividad</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Vencimiento</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">Estado</th>
                <th className="px-6 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tareas.map((t) => {
                // NORMALIZACIÓN: Convertimos 'Alta' a 'cancelada', etc., para aplicar el color
                const rawValue = (t.estado || t.prioridad || 'pendiente').toLowerCase();
                const estadoNormalizado = MAPA_ESTADOS[rawValue] || 'pendiente';
                const config = ESTADOS_STYLE[estadoNormalizado] || ESTADOS_STYLE.default;
                
                return (
                  <tr key={t._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-700">{t.titulo}</span>
                        <span className="text-xs text-slate-400 font-medium truncate max-w-[250px]">{t.descripcion}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="inline-flex items-center gap-2 text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                        <Calendar size={12} className="text-indigo-500" />
                        {new Date(t.fechaLimite).toLocaleDateString('es-CO')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {/* Badge con el Punto Indicador y Color Normalizado */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs ${config.bg} ${config.text}`}>
                        <div className={`w-2 h-2 rounded-full ${config.dot}`} />
                        {estadoNormalizado.charAt(0).toUpperCase() + estadoNormalizado.slice(1)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setTareaEditar(t)} className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                          <Eye size={18} />
                        </button>
                        <button className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-white border border-transparent hover:border-slate-200">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default Tareas;