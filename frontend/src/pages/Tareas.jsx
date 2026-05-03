import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import Navbar from '../components/common/Navbar';
import Spinner from '../components/common/Spinner';
import useSocket from '../hooks/useSocket';

const PRIORIDADES = ['alta', 'media', 'baja'];

const BadgePrioridad = ({ prioridad }) => {
  const map = { alta: 'badge-alta', media: 'badge-media', baja: 'badge-baja' };
  return <span className={map[prioridad]}>{prioridad.charAt(0).toUpperCase() + prioridad.slice(1)}</span>;
};

const formatFecha = (fecha) =>
  new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });

const FormTarea = ({ onGuardar, onCancelar, tareaEditar }) => {
  const [form, setForm] = useState(tareaEditar || { titulo: '', descripcion: '', fechaLimite: '', prioridad: 'media' });
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setCargando(true);
    try {
      if (tareaEditar) {
        const { data } = await api.put(`/tareas/${tareaEditar._id}`, form);
        onGuardar(data.tarea, 'editar');
      } else {
        const { data } = await api.post('/tareas', form);
        onGuardar(data.tarea, 'crear');
      }
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al guardar la tarea');
    } finally { setCargando(false); }
  };

  return (
    <div className="card mb-6 border-primary-200 border">
      <h3 className="font-semibold text-slate-800 mb-4">{tareaEditar ? '✏️ Editar tarea' : '+ Nueva tarea'}</h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{error}</div>}
        <input className="input-field" name="titulo" placeholder="Título de la tarea *" value={form.titulo} onChange={handleChange} required />
        <textarea className="input-field resize-none" name="descripcion" placeholder="Descripción (opcional)" rows={2} value={form.descripcion} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Fecha límite *</label>
            <input className="input-field" type="date" name="fechaLimite" value={form.fechaLimite?.split('T')[0] || ''} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-xs text-slate-600 mb-1 block">Prioridad</label>
            <select className="input-field" name="prioridad" value={form.prioridad} onChange={handleChange}>
              {PRIORIDADES.map((p) => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-1">
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={cargando}>
            {cargando ? <Spinner size="sm" /> : (tareaEditar ? 'Guardar cambios' : 'Crear tarea')}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancelar}>Cancelar</button>
        </div>
      </form>
    </div>
  );
};

const TareaCard = ({ tarea, onCompletar, onEditar, onEliminar }) => {
  const [accion, setAccion] = useState(false);

  const handleCompletar = async () => { setAccion(true); await onCompletar(tarea._id); setAccion(false); };
  const handleEliminar  = () => { if (confirm('¿Eliminar esta tarea?')) onEliminar(tarea._id); };

  return (
    <div className={`card flex flex-col gap-2 ${tarea.completada ? 'opacity-60' : ''} ${tarea.vencida ? 'border-red-200' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <input type="checkbox" checked={tarea.completada} onChange={handleCompletar} disabled={tarea.completada || accion}
            className="mt-1 h-4 w-4 accent-green-600 cursor-pointer flex-shrink-0" />
          <div className="min-w-0">
            <p className={`font-medium text-sm ${tarea.completada ? 'line-through text-slate-400' : 'text-slate-800'}`}>{tarea.titulo}</p>
            {tarea.descripcion && <p className="text-xs text-slate-500 mt-0.5 truncate">{tarea.descripcion}</p>}
          </div>
        </div>
        <BadgePrioridad prioridad={tarea.prioridad} />
      </div>
      <div className="flex items-center justify-between mt-1">
        <span className={`text-xs ${tarea.vencida ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
          {tarea.vencida ? '⚠️ Vencida · ' : '📅 '}{formatFecha(tarea.fechaLimite)}
        </span>
        {!tarea.completada && (
          <div className="flex gap-1">
            <button onClick={() => onEditar(tarea)} className="text-xs text-slate-400 hover:text-primary-600 px-2 py-1 rounded transition-colors">Editar</button>
            <button onClick={handleEliminar} className="text-xs text-slate-400 hover:text-red-500 px-2 py-1 rounded transition-colors">Eliminar</button>
          </div>
        )}
      </div>
    </div>
  );
};

const Tareas = () => {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [tareaEditar, setTareaEditar] = useState(null);
  const [filtro, setFiltro] = useState('todas');
  const socket = useSocket();

  const cargarTareas = useCallback(async () => {
    try { const { data } = await api.get('/tareas'); setTareas(data.tareas); }
    finally { setCargando(false); }
  }, []);

  useEffect(() => { cargarTareas(); }, [cargarTareas]);

  useEffect(() => {
    if (!socket) return;
    socket.on('tarea:nueva',       (t) => setTareas((p) => [t, ...p]));
    socket.on('tarea:actualizada', (t) => setTareas((p) => p.map((x) => x._id === t._id ? t : x)));
    socket.on('tarea:completada',  (t) => setTareas((p) => p.map((x) => x._id === t._id ? t : x)));
    socket.on('tarea:eliminada',   ({ id }) => setTareas((p) => p.filter((x) => x._id !== id)));
    return () => {
      ['tarea:nueva', 'tarea:actualizada', 'tarea:completada', 'tarea:eliminada'].forEach((e) => socket.off(e));
    };
  }, [socket]);

  const handleGuardar = (tarea, tipo) => {
    if (tipo === 'crear') setTareas((p) => [tarea, ...p]);
    if (tipo === 'editar') setTareas((p) => p.map((x) => x._id === tarea._id ? tarea : x));
    setMostrarForm(false); setTareaEditar(null);
  };

  const handleCompletar = async (id) => {
    try { const { data } = await api.patch(`/tareas/${id}/completar`); setTareas((p) => p.map((x) => x._id === id ? data.tarea : x)); }
    catch (err) { alert(err.response?.data?.mensaje || 'Error'); }
  };

  const handleEliminar = async (id) => {
    try { await api.delete(`/tareas/${id}`); setTareas((p) => p.filter((x) => x._id !== id)); }
    catch { alert('Error al eliminar'); }
  };

  const tareasFiltradas = tareas.filter((t) => {
    if (filtro === 'pendientes')  return !t.completada && !t.vencida;
    if (filtro === 'completadas') return t.completada;
    if (filtro === 'vencidas')    return t.vencida;
    return true;
  });

  const filtros = [
    { key: 'todas',       label: `Todas (${tareas.length})` },
    { key: 'pendientes',  label: `Pendientes (${tareas.filter((t) => !t.completada && !t.vencida).length})` },
    { key: 'completadas', label: `Completadas (${tareas.filter((t) => t.completada).length})` },
    { key: 'vencidas',    label: `Vencidas (${tareas.filter((t) => t.vencida).length})` },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Mis Tareas</h1>
          {!mostrarForm && !tareaEditar && (
            <button className="btn-primary text-sm" onClick={() => setMostrarForm(true)}>+ Nueva tarea</button>
          )}
        </div>

        {(mostrarForm || tareaEditar) && (
          <FormTarea
            tareaEditar={tareaEditar}
            onGuardar={handleGuardar}
            onCancelar={() => { setMostrarForm(false); setTareaEditar(null); }}
          />
        )}

        <div className="flex gap-2 flex-wrap mb-4">
          {filtros.map(({ key, label }) => (
            <button key={key} onClick={() => setFiltro(key)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                filtro === key ? 'bg-primary-600 text-white border-primary-600' : 'border-slate-200 text-slate-600 hover:border-primary-400'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {cargando ? (
          <div className="flex justify-center py-12"><Spinner /></div>
        ) : tareasFiltradas.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-3xl mb-2">📭</div>
            <p className="text-slate-500">No hay tareas en esta categoría.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tareasFiltradas.map((tarea) => (
              <TareaCard key={tarea._id} tarea={tarea} onCompletar={handleCompletar}
                onEditar={(t) => { setTareaEditar(t); setMostrarForm(false); }}
                onEliminar={handleEliminar} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};
export default Tareas;
