import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
// Componentes presumidos da sua UI library
import { Button } from '../components/ui/button'; 
import { Input } from '../components/ui/input'; 
import Alert from '../components/Alert'; 
import { Logo } from '../components/logo'; // Componente Logo customizado
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'; // Ícones

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loginSocial } = useAuth(); // Presumindo uma função loginSocial
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    role: 'professional',
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Novo state para confirmar senha

  // --- Lógica de Validação ---

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = t('validation.nameRequired');
    if (!formData.email.trim()) newErrors.email = t('validation.emailRequired');
    
    // Regex simples para validação de e-mail
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('validation.emailInvalid');
    }
    
    if (!formData.password) newErrors.password = t('validation.passwordRequired');
    if (formData.password.length < 6) newErrors.password = t('validation.passwordTooShort');
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsMismatch');
    }
    
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
      await register(formData.email, formData.password, formData.name, formData.role);
      navigate('/dashboard');
    } catch (err) {
      // Tratamento de erro
      const errorMessage = err.response?.data?.detail || t('messages.registerFailed');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Função fictícia para login social (usada para botões)
  const handleSocialLogin = (provider) => {
    setError(t('messages.socialLoginNotImplemented', { provider }));
  };

  // --- Renderização do Componente ---

  return (
    // Container principal: tela cheia com tema escuro
    <div className="min-h-screen bg-gray-900 dark:bg-gray-950 text-white flex">
      
      {/* Coluna Esquerda: Informações e Logo (Escondida em Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 xl:p-24 bg-gray-950 relative overflow-hidden">
        {/* Adiciona um efeito de gradiente sutil no fundo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 to-blue-900/40"></div>
        
        {/* Botão Voltar */}
        <button onClick={() => navigate('/')} className="absolute top-8 left-8 text-gray-400 hover:text-white transition-colors flex items-center z-10">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </button>

        {/* Conteúdo Central */}
        <div className="flex flex-col justify-center h-full space-y-8 z-10">
          <div className="text-left">
            <Logo size="lg" /> {/* Componente Logo adaptado ao tema escuro */}
            <h2 className="text-4xl font-extrabold mt-6 mb-2">
              Comece sua jornada no <span className="text-blue-400">Heal+</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-md">
              Junte-se a nós para transformar a gestão de feridas com inteligência artificial e relatórios completos.
            </p>
          </div>
          
          {/* Lista de Recursos */}
          <ul className="list-disc list-inside text-gray-300 space-y-2 text-md">
            <li className="flex items-center">
              <span className="text-blue-400 text-xl mr-2">•</span> Análise com IA
            </li>
            <li className="flex items-center">
              <span className="text-blue-400 text-xl mr-2">•</span> Relatórios Automáticos
            </li>
            <li className="flex items-center">
              <span className="text-blue-400 text-xl mr-2">•</span> Acompanhamento Médico
            </li>
            <li className="flex items-center">
              <span className="text-blue-400 text-xl mr-2">•</span> Histórico Completo
            </li>
          </ul>
        </div>
        
        {/* Footer da Coluna Esquerda */}
        <div className="text-sm text-gray-500 z-10">
          © 2025 Heal+. Todos os direitos reservados.
        </div>
      </div>
      
      {/* Coluna Direita: Formulário de Cadastro */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-16 xl:p-24 bg-gray-900 dark:bg-gray-950 overflow-y-auto">
        <div className="w-full max-w-md">
          
          {/* Botão Voltar (Mobile) */}
          <button onClick={() => navigate('/')} className="lg:hidden text-gray-400 hover:text-white transition-colors flex items-center mb-8">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </button>

          <h2 className="text-3xl font-bold text-white mb-2">
            Crie sua conta
          </h2>
          <p className="text-gray-400 mb-8">
            Preencha os dados abaixo para começar.
          </p>

          {error && (
            // Componente Alert estilizado para o Dark Mode
            <Alert
              type="error"
              message={error}
              onClose={() => setError('')}
              className="mb-6 bg-red-900/30 border-red-700 text-red-300"
            />
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Campo Nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-300">Nome Completo</label>
              <Input
                id="name"
                name="name"
                placeholder={t('auth.namePlaceholder')}
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500"
              />
            </div>

            {/* Campo Email */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500"
              />
            </div>
            
            {/* Campo Tipo de Usuário (Role) */}
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-300">Tipo de Usuário</label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                // Estilização Dark Mode para Select
                className="w-full px-4 py-2.5 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-800 text-white"
              >
                <option value="professional">{t('auth.professional')}</option>
                <option value="patient">{t('auth.patient')}</option>
              </select>
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">Senha</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={formData.password}
                  onChange={handleChange}
                  error={errors.password}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300">Confirmar Senha</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 focus:outline-none"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Botão Cadastrar */}
            <Button
              type="submit"
              // Estilo do botão primário azul na imagem
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg"
              loading={loading}
              disabled={loading}
            >
              {loading ? t('auth.registering') : t('auth.registerButton')}
            </Button>
          </form>

          {/* Separador "OU CONTINUE COM" */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-700"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm font-medium">OU CONTINUE COM</span>
            <div className="flex-grow border-t border-gray-700"></div>
          </div>

          {/* Opções de Login Social (Simulando ícones) */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleSocialLogin('Google')}
              className="flex items-center justify-center p-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
            >
              <span className="w-5 h-5 mr-2 inline-flex items-center justify-center rounded-sm bg-white text-black text-xs font-bold">G</span>
              Google
            </button>
            <button
              onClick={() => handleSocialLogin('Microsoft')}
              className="flex items-center justify-center p-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
            >
              <span className="w-5 h-5 mr-2 inline-flex items-center justify-center rounded-sm bg-white text-black text-[10px] font-bold">MS</span>
              Microsoft
            </button>
            <div className="col-span-2">
              <button
                onClick={() => handleSocialLogin('Apple')}
                className="w-full flex items-center justify-center p-3 border border-gray-700 rounded-lg text-white hover:bg-gray-800 transition-colors"
              >
                <span className="w-5 h-5 mr-2 inline-flex items-center justify-center rounded-sm bg-white text-black text-xs font-bold"></span>
                Apple
              </button>
            </div>
          </div>

          {/* Link para Login */}
          <div className="mt-8 text-center">
            <p className="text-gray-400">
              {t('auth.hasAccount')}{' '}
              <Link to="/login" className="text-blue-500 hover:text-blue-400 font-medium transition-colors">
                {t('auth.loginHere')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;