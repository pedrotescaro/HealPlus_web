import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import Alert from '../components/Alert';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('validation.emailInvalid');
    if (!formData.password) newErrors.password = t('validation.passwordRequired');
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-[#0f1f3a] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between">
          <Link to="/" className="text-primary-200 hover:text-white">{t('common.back')}</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mt-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary-800 font-bold text-xl">H+</span>
              </div>
              <span className="text-2xl font-bold">Heal+</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">Bem-vindo ao <span className="text-primary-400">Heal+</span></h1>
            <p className="text-primary-100 max-w-xl text-lg">A plataforma inteligente para gestão e análise de feridas com tecnologia de ponta.</p>
            <div className="grid grid-cols-2 gap-4 text-primary-200">
              <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span><span>Análise com IA</span></div>
              <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span><span>Relatórios Automáticos</span></div>
              <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span><span>Acompanhamento Médico</span></div>
              <div className="flex items-center space-x-2"><span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span><span>Histórico Completo</span></div>
            </div>
          </div>

          <div className="bg-gray-900/80 border border-white/10 rounded-xl p-8 shadow-2xl shadow-black/40">
            <h2 className="text-2xl font-bold mb-6">Bem-vindo(a) de volta</h2>

            {error && (
              <Alert type="error" message={error} onClose={() => setError('')} className="mb-6" />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Email</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8-4H8m-2 8h12"/></svg>
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border ${errors.email ? 'border-red-500' : 'border-white/10'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    required
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm mb-2">Senha</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21H5a2 2 0 01-2-2v-2a7 7 0 0114 0v2a2 2 0 01-2 2z"/></svg>
                  </span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border ${errors.password ? 'border-red-500' : 'border-white/10'} focus:outline-none focus:ring-2 focus:ring-primary-500`}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-white">
                    {showPassword ? (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 2l20 20"/><path d="M17.94 17.94A10.94 10.94 0 0112 20c-5.523 0-10-4.477-10-10a10.94 10.94 0 013.06-7.94M10.58 10.58A3 3 0 1113.42 13.42"/></svg>
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="w-full mt-2 px-6 py-3 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold">
                {t('auth.loginButton')}
              </button>
            </form>

            <div className="mt-6">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="h-px w-full bg-white/10"></span>
                <span>Ou continue com</span>
                <span className="h-px w-full bg-white/10"></span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 10.2v3.6h5.1c-.2 1.2-.9 2.3-1.9 3l3.1 2.4C20.6 17.9 21.5 15.6 21.5 12c0-.7-.1-1.4-.3-2H12z"/><path fill="#34A853" d="M6.6 14.3l-1 3-3.2.1C3.4 19.5 7.4 22 12 22c3 0 5.5-1 7.3-2.8l-3.1-2.4c-.9.6-2.2 1-4.2 1-3.2 0-5.9-2.1-6.8-5.1z"/><path fill="#4A90E2" d="M2.4 7.4l3.1 2.4c.8-2.4 3.1-4.1 6.5-4.1 1.7 0 3.2.6 4.4 1.6l3.3-3.2C17.5 2.2 14.9 1 12 1 7.4 1 3.4 3.5 2.4 7.4z"/><path fill="#FBBC05" d="M12 4.9c-3.4 0-5.7 1.7-6.5 4.1L2.4 7.4C3.4 3.5 7.4 1 12 1c2.9 0 5.5 1.2 7.3 3.3l-3.3 3.2c-1.2-1-2.7-1.6-4.4-1.6z"/></svg>
                  Google
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><rect width="9" height="9" x="2" y="2" fill="#F25022"/><rect width="9" height="9" x="13" y="2" fill="#7FBA00"/><rect width="9" height="9" x="2" y="13" fill="#00A4EF"/><rect width="9" height="9" x="13" y="13" fill="#FFB900"/></svg>
                  Microsoft
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16.365 1c-.996.06-2.18.7-2.883 1.53-.62.73-1.182 1.835-1.03 2.91 1.12.09 2.27-.64 2.95-1.48.66-.8 1.19-1.93.96-2.96zM20.9 15.89c-.35-.86-1.52-2.46-2.97-2.46-1.4 0-2 .66-2.96.66-.98 0-1.74-.65-2.95-.65-1.19 0-2.45.72-3.33 1.84-1.22 1.55-2.16 4.38-1.19 6.78.89.02 1.65-.58 2.21-1.15.52-.52 1.03-1.13 1.78-1.13.73 0 .97.37 1.72.37.74 0 1.15-.36 1.71-.93.64-.63 1.12-1.36 1.6-2.11.49-.77.9-1.57 1.44-2.33.53-.76 1.09-1.49 1.84-2.09z"/></svg>
                  Apple
                </button>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-primary-200">
              Não tem uma conta? <Link to="/register" className="text-primary-400 hover:text-primary-300">Cadastre-se</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;