import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const Registro = () => {
  const { registro, cargando } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ nombre: '', correo: '', password: '', semestre: '', programa: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const res = await registro(form);
    if (res.ok) navigate('/dashboard');
    else setError(res.mensaje);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🧠</div>
          <h1 className="text-2xl font-bold text-slate-900">Crear cuenta</h1>
          <p className="text-slate-500 text-sm mt-1">Únete a Mente Activa</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
            {[
              { label: 'Nombre completo', name: 'nombre', type: 'text', placeholder: 'Nicolás Luna', required: true },
              { label: 'Correo electrónico', name: 'correo', type: 'email', placeholder: 'tu@correo.com', required: true },
              { label: 'Contraseña', name: 'password', type: 'password', placeholder: 'Mín. 8 caracteres, 1 mayúscula, 1 número', required: true },
              { label: 'Programa académico', name: 'programa', type: 'text', placeholder: 'Ingeniería de Software', required: false },
            ].map(({ label, name, type, placeholder, required }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
                <input className="input-field" type={type} name={name} placeholder={placeholder} value={form[name]} onChange={handleChange} required={required} />
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Semestre</label>
              <select className="input-field" name="semestre" value={form.semestre} onChange={handleChange}>
                <option value="">Selecciona tu semestre</option>
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>Semestre {i + 1}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-1" disabled={cargando}>
              {cargando ? <Spinner size="sm" /> : 'Crear cuenta'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Registro;
