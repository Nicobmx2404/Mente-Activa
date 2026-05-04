import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/common/Spinner';

const Login = () => {
  const { login, cargando } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ correo: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    const res = await login(form.correo, form.password);
    if (res.ok) navigate('/dashboard');
    else setError(res.mensaje);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          
          <h1 className="text-2xl font-bold text-slate-900">Mente Activa</h1>
          <p className="text-slate-500 text-sm mt-1">Inicia sesión en tu cuenta</p>
        </div>
        <div className="card">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Correo electrónico</label>
              <input className="input-field" type="email" name="correo" placeholder="tu@correo.com" value={form.correo} onChange={handleChange} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contraseña</label>
              <input className="input-field" type="password" name="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 mt-1" disabled={cargando}>
              {cargando ? <Spinner size="sm" /> : 'Iniciar sesión'}
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-5">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-primary-600 font-medium hover:underline">Regístrate</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
export default Login;
