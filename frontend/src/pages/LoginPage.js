import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button'; 
import { Input } from '../components/ui/input'; 
import Alert from '../components/Alert'; 
import { Logo } from '../components/logo';
import { Eye, EyeOff, ArrowLeft, Shield, Brain, FileText, Activity, Sparkles } from 'lucide-react';
import { GoogleIcon, MicrosoftIcon, AppleIcon } from '../components/ui/social-icons';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, loginAnonymous } = useAuth();
  const DEMO_MODE = String(process.env.REACT_APP_DEMO_MODE).toLowerCase() === 'true';
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
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
      const errorMessage = err.response?.data?.detail || t('messages.loginFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8080';
    
    if (provider === 'Google') {
      window.location.href = `${backendUrl}/api/auth/login/google`;
    } else if (provider === 'Microsoft') {
      window.location.href = `${backendUrl}/api/auth/login/microsoft`;
    } else if (provider === 'Apple') {
      window.location.href = `${backendUrl}/api/auth/login/apple`;
    } else {
      setError(t('messages.socialLoginNotImplemented', { provider }));
    }
  };

  const handleAnonymousLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginAnonymous();
      navigate('/dashboard');
    } catch (err) {
      setError(t('messages.error'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Brain, text: 'Análise com IA avançada' },
    { icon: FileText, text: 'Relatórios automáticos' },
    { icon: Activity, text: 'Acompanhamento em tempo real' },
    { icon: Shield, text: 'Dados seguros e protegidos' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 text-gray-900 dark:text-white flex">
      
      {/* Coluna Esquerda: Informações e Logo */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-16 relative overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/90 via-primary-700/95 to-primary-800 dark:from-primary-800/90 dark:via-primary-900/95 dark:to-gray-950"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-300 rounded-full blur-3xl"></div>
        </div>
        
        {/* Botão Voltar */}
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => navigate('/')} 
          className="absolute top-8 left-8 text-white/80 hover:text-white transition-colors flex items-center z-10 group"
        >
          <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium">Voltar</span>
        </motion.button>

        {/* Conteúdo Central */}
        <div className="flex flex-col justify-center h-full space-y-10 z-10 mt-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-left"
          >
            {/* Logo igual à landing page */}
            <div className="mb-8">
              <Logo />
            </div>
            
            <h2 className="text-4xl xl:text-5xl font-extrabold mb-4 text-white leading-tight">
              Bem-vindo à plataforma de 
              <span className="block bg-gradient-to-r from-primary-200 via-primary-100 to-white bg-clip-text text-transparent">saúde inteligente</span>
            </h2>
            <p className="text-primary-100/90 text-lg xl:text-xl max-w-lg leading-relaxed">
              Gestão e análise de feridas com tecnologia de ponta e inteligência artificial.
            </p>
          </motion.div>
          
          {/* Features com ícones */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                className="flex items-center gap-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10 hover:bg-white/15 transition-colors"
              >
                <feature.icon className="w-5 h-5 text-primary-200" />
                <span className="text-white/90 text-sm font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
        
        {/* Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-sm text-white/60 z-10"
        >
          © 2025 Heal+. Todos os direitos reservados.
        </motion.div>
      </div>
      
      {/* Coluna Direita: Formulário de Login */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          
          {/* Botão Voltar (Mobile) */}
          <button onClick={() => navigate('/')} className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center mb-8 group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium">Voltar</span>
          </button>

          {/* Header do formulário */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Bem-vindo(a) de volta
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Insira suas credenciais para acessar sua conta
            </p>
          </div>

          {error && (
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
              className="mb-6"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>
            
            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  className="h-12 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-12 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 hover:scale-[1.02] active:scale-[0.98]"
              loading={loading}
              disabled={loading}
            >
              {loading ? t('auth.loggingIn') : 'Entrar'}
            </Button>
          </form>

          {/* Separador */}
          <div className="flex items-center my-8">
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
            <span className="flex-shrink mx-4 text-gray-500 dark:text-gray-400 text-sm font-medium">
              ou continue com
            </span>
            <div className="flex-grow h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent"></div>
          </div>

          {/* Opções de Login Social */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center gap-3 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              <GoogleIcon className="w-5 h-5" />
              <span>Google</span>
            </button>
            <button
              onClick={() => handleSocialLogin('Microsoft')}
              className="flex items-center justify-center gap-3 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
            >
              <MicrosoftIcon className="w-5 h-5" />
              <span>Microsoft</span>
            </button>
            <div className="col-span-2">
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="w-full flex items-center justify-center gap-3 h-12 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-lg active:scale-[0.98] transition-all duration-200"
              >
                <AppleIcon className="w-5 h-5" />
                <span>Apple</span>
              </button>
            </div>
          </div>

          {DEMO_MODE && (
            <Button
              type="button"
              onClick={handleAnonymousLogin}
              className="w-full mt-4 h-12 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white font-medium rounded-xl transition-all"
              disabled={loading}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Entrar como visitante (modo demo)
            </Button>
          )}

          {/* Link para Cadastro */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
                Cadastre-se
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
