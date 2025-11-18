import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
// Componentes UI
import { Button } from '../components/ui/button';
import { FeatureCard } from '../components/ui/feature-card';
import { LoadingPage } from '../components/ui/loading-spinner';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { FAQAccordion } from '../components/ui/faq-accordion';
import { Logo } from '../components/logo';
// Ícones Lucide-React
import { 
  Brain, FileText, Users, LogIn, UserPlus, Globe, Zap, TrendingUp,
  Mail, MessageCircle, Linkedin, Youtube, Instagram 
} from 'lucide-react'; 
import { motion } from 'framer-motion';

// --- Definição de Variantes de Animação ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 20
    }
  },
};

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      const saved = localStorage.getItem('userSettings');
      const obj = saved ? JSON.parse(saved) : {};
      localStorage.setItem('userSettings', JSON.stringify({ ...obj, language: lng }));
    } catch (_) {
      // Ignora erros de localStorage
    }
  };

  useEffect(() => {
    // Redireciona o usuário logado para o dashboard
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Estrutura de Features atualizada com ícones Lucide-React
  const features = [
    {
      icon: <Brain className="w-12 h-12 text-primary-600 dark:text-primary-400" />,
      title: t('landing.aiAnalysis'),
      description: t('landing.aiAnalysisDesc'),
    },
    {
      icon: <FileText className="w-12 h-12 text-primary-600 dark:text-primary-400" />,
      title: t('landing.autoReports'),
      description: t('landing.autoReportsDesc'),
    },
    {
      icon: <Users className="w-12 h-12 text-primary-600 dark:text-primary-400" />,
      title: t('landing.medicalTracking'),
      description: t('landing.medicalTrackingDesc'),
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-primary-600 dark:text-primary-400" />,
      title: t('landing.completeHistory'),
      description: t('landing.completeHistoryDesc'),
    },
  ];

  if (user) {
    return <LoadingPage message={`Carregando Heal+...`} />;
  }


  return (
    // --- Container Principal com Fundo e Animações de Fundo ---
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 relative overflow-x-hidden">
      
      {/* Background Orbs/Glow */}
      <div className="fixed inset-0 -z-10 opacity-60 dark:opacity-40 pointer-events-none">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-3xl opacity-30 animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-secondary-500/10 rounded-full blur-[100px] opacity-30 animate-pulse-medium"></div>
      </div>
      
      {/* Header (Responsividade Otimizada) */}
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }} 
        className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-md dark:shadow-lg dark:shadow-primary-900/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Logo />
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              
              {/* Seletor de Idioma */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="text-gray-700 dark:text-gray-100 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                  <Globe className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className='hidden sm:inline'>{i18n.language.toUpperCase()}</span>
                </Button>
                <div className="absolute right-0 mt-2 w-20 rounded-lg shadow-xl bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-20 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 origin-top-right">
                  <div className="py-1">
                    <button onClick={() => changeLanguage('pt')} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150">PT</button>
                    <button onClick={() => changeLanguage('en')} className="w-full text-left px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors duration-150">EN</button>
                  </div>
                </div>
              </div>

              {/* ThemeToggle */}
              <ThemeToggle />

              {/* Botão de Login (Secundário, desktop only) */}
              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-2" /> {t('landing.login')}
                </Link>
              </Button>
              {/* Botão de Cadastro (Principal) */}
              <Button size="sm" asChild className="bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/30 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95">
                <Link to="/register" className="flex items-center">
                  <UserPlus className="w-4 h-4 sm:mr-2" /> 
                  <span className="hidden sm:inline">{t('landing.getStarted')}</span>
                  <span className="inline sm:hidden">{t('landing.getStartedShort') || 'Start'}</span> 
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section (Padding Lateral e Botão Otimizados) */}
      <section className="relative pt-24 pb-40 sm:pt-32 sm:pb-48 lg:pt-40 lg:pb-60 px-6 sm:px-10 lg:px-16 xl:px-20 overflow-hidden">
        {/* Container interno mais restrito e centralizado para melhor tipografia */}
        <div className="max-w-6xl mx-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
            
            {/* Título: Ajustes de mb e tracking */}
            <motion.h1 variants={itemVariants} className="max-w-5xl mx-auto text-4xl md:text-7xl lg:text-8xl font-black mb-8 text-gray-900 dark:text-white leading-tight tracking-tighter">
              {t('landing.title').split(' ').map((word, index) => (
                <span key={index} className={index === 0 ? 'text-primary-600 dark:text-primary-400 drop-shadow-lg' : ''}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>
            
            {/* Subtítulo: Margem inferior aumentada */}
            <motion.p variants={itemVariants} className="text-lg md:text-2xl text-gray-600 dark:text-gray-400 mb-12 max-w-4xl mx-auto font-normal">
              {t('landing.subtitle')}
            </motion.p>
            
            {/* Botões do Hero: Padding interno forçado para melhor visualização (px-8 py-4) */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
              <Button 
                // Removendo size="xl" e aplicando padding diretamente para controle total
                asChild 
                className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-2xl shadow-primary-500/50 transition-all duration-300 transform hover:scale-[1.03] active:scale-100 border-2 border-primary-600 dark:border-primary-400 
                           px-8 py-4 text-xl rounded-lg"
              >
                <Link to="/register">
                  <UserPlus className="w-5 h-5 mr-2" />
                  {t('landing.getStarted')}
                </Link>
              </Button>
              <Button 
                // Removendo size="xl" e aplicando padding diretamente para controle total
                variant="outline" 
                asChild 
                className="w-full sm:w-auto bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 dark:border-primary-400 hover:bg-primary/10 transition-all duration-300 shadow-md hover:shadow-lg dark:bg-gray-800/70
                           px-8 py-4 text-xl rounded-lg"
              >
                <Link to="/login">
                  <LogIn className="w-5 h-5 mr-2" />
                  {t('landing.login')}
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section (Containers de Card Corrigidos para Altura Uniforme) */}
      <section id="features" className="py-20 bg-white dark:bg-gray-950 border-t border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-center mb-16 text-gray-900 dark:text-white">{t('landing.featuresTitle')}</h2>
            
            {/* Grid: items-stretch para garantir altura uniforme dos cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 xl:gap-12 items-stretch"> 
                {features.map((feature, index) => (
                    <motion.div 
                        key={index} 
                        initial={{ scale: 0.85, opacity: 0, y: 50 }} 
                        whileInView={{ scale: 1, opacity: 1, y: 0 }} 
                        transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }} 
                        viewport={{ once: true, amount: 0.2 }}
                        className="h-full hover:shadow-2xl dark:hover:shadow-primary-500/20 transition-shadow duration-300 rounded-xl"
                    >
                        <FeatureCard 
                            icon={feature.icon} 
                            title={feature.title} 
                            description={feature.description} 
                            className="h-full" 
                        />
                    </motion.div>
                ))}
            </div>
        </div>
      </section>

{/* CTA Section (Estilização Aprimorada) */}
      <section className="bg-primary-600 dark:bg-primary-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
            {t('landing.readyTitle')}
          </motion.h2>
          <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} viewport={{ once: true }} className="text-xl text-primary-100 dark:text-primary-200 mb-10 max-w-3xl mx-auto font-light">
            {t('landing.readySubtitle')}
          </motion.p>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4, type: 'spring', stiffness: 100 }} viewport={{ once: true }}>
            <Button
              size="xl"
              onClick={() => navigate('/register')}
              // ESTILIZAÇÃO MELHORADA:
              className="bg-white text-gray-950 px-12 py-3 rounded-full font-bold text-xl 
                         hover:bg-gray-100 transition-all duration-300 
                         shadow-3xl shadow-primary-900/60 hover:shadow-primary-900/80 
                         transform hover:scale-[1.07] active:scale-95 
                         border-2 border-primary-400/50 ring-4 ring-white/30"
            >
              <Zap className="w-6 h-6 mr-2 text-primary-600" />
              {t('landing.getStarted')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> 
          <motion.h2 
            initial={{ y: 20, opacity: 0 }} 
            whileInView={{ y: 0, opacity: 1 }} 
            transition={{ duration: 0.5 }} 
            viewport={{ once: true }} 
            className="text-4xl font-extrabold text-gray-900 dark:text-white mb-12 text-center"
          >
            {t('faq.title')}
          </motion.h2>
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              whileInView={{ y: 0, opacity: 1 }} 
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <FAQAccordion items={[
                { question: t('faq.q1'), answer: t('faq.a1') },
                { question: t('faq.q2'), answer: t('faq.a2') },
                { question: t('faq.q3'), answer: t('faq.a3') },
              ]} />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer (Responsividade Otimizada) */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-gray-400 pt-16 border-t border-primary-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Topo do Footer (Conteúdo em Colunas) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 pb-12">
            
            {/* Coluna 1: Contato (w-full em mobile) */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-primary-400 mb-6 flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                {t('footer.contact') || 'Contato'}
              </h3>
              
              <a 
                href="mailto:healgrupo@gmail.com" 
                className="flex items-center p-3 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white hover:border-primary-500 transition-colors duration-200 w-full"
              >
                <Mail className="w-4 h-4 mr-2" />
                healgrupo@gmail.com
              </a>
            </div>
            
            {/* Coluna 2: Navegação (w-full em mobile) */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-primary-400 mb-6">
                {t('footer.navigation') || 'Navegação'}
              </h3>
              <ul className="space-y-3">
                <li><Link to="/" className="text-sm hover:text-white transition-colors duration-200">{t('footer.home') || 'Home'}</Link></li>
                <li><a href="#features" className="text-sm hover:text-white transition-colors duration-200">{t('footer.resources') || 'Recursos'}</a></li>
                <li><Link to="/testimonials" className="text-sm hover:text-white transition-colors duration-200">{t('footer.testimonials') || 'Depoimentos'}</Link></li>
                <li><a href="#faq" className="text-sm hover:text-white transition-colors duration-200">{t('footer.faqShort') || 'Perguntas Frequentes'}</a></li>
              </ul>
            </div>

            {/* Coluna 3: Conecte-se (w-full em mobile) */}
            <div className="flex flex-col">
              <h3 className="text-lg font-semibold text-primary-400 mb-6">
                {t('footer.connect') || 'Conecte-se'}
              </h3>
              
              <div className="flex space-x-5 mb-3">
                <Link to="/chat" aria-label="Chat" className="text-gray-400 hover:text-white transition-colors duration-200"><MessageCircle className="w-6 h-6" /></Link>
                <a href="https://www.linkedin.com/" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer"><Linkedin className="w-6 h-6" /></a>
                <a href="https://www.youtube.com/" aria-label="YouTube" className="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer"><Youtube className="w-6 h-6" /></a>
                <a href="https://www.instagram.com/" aria-label="Instagram" className="text-gray-400 hover:text-white transition-colors duration-200" target="_blank" rel="noopener noreferrer"><Instagram className="w-6 h-6" /></a>
              </div>
              
              <p className="text-sm text-gray-500 mt-2">
                {t('footer.followUpdates') || 'Siga-nos para atualizações'}
              </p>
            </div>
          </div>
          
          {/* Divisor */}
          <div className="border-t border-gray-800 dark:border-gray-800 my-4"></div>

          {/* Rodapé Inferior (Links Legais: wrap em telas pequenas) */}
          <div className="flex flex-col md:flex-row justify-between items-center py-6">
            <p className="text-sm text-gray-500 mb-4 md:mb-0">
              © 2025 Heal+. {t('footer.allRightsReserved') || 'Todos os direitos reservados.'}
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-end space-x-4 text-sm text-gray-500">
              <Link to="/terms" className="hover:text-white transition-colors duration-200">{t('footer.terms') || 'Termos de Uso'}</Link>
              <Link to="/privacy" className="hover:text-white transition-colors duration-200">{t('footer.privacy') || 'Privacidade'}</Link>
              <a href="/cookies" className="hover:text-white transition-colors duration-200">{t('footer.cookies') || 'Cookies'}</a>
              <a href="/accessibility" className="hover:text-white transition-colors duration-200">{t('footer.accessibility') || 'Acessibilidade'}</a>
              <a href="/references" className="hover:text-white transition-colors duration-200">{t('footer.references') || 'Referências'}</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;