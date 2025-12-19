import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { FeatureCard } from '../components/ui/feature-card';
import { LoadingPage } from '../components/ui/loading-spinner';
import { ThemeToggle } from '../components/ui/theme-toggle';
import { FAQAccordion } from '../components/ui/faq-accordion';
import { Logo } from '../components/logo';
import { 
  Brain, FileText, Users, LogIn, UserPlus, Globe, Zap, TrendingUp,
  Mail, MessageCircle, Linkedin, Youtube, Instagram, ArrowRight, 
  Sparkles, Shield, ChevronDown
} from 'lucide-react'; 
import { motion } from 'framer-motion';

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
  hidden: { y: 30, opacity: 0 },
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
    } catch (_) {}
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: t('landing.aiAnalysis'),
      description: t('landing.aiAnalysisDesc'),
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: t('landing.autoReports'),
      description: t('landing.autoReportsDesc'),
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: t('landing.medicalTracking'),
      description: t('landing.medicalTrackingDesc'),
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: t('landing.completeHistory'),
      description: t('landing.completeHistoryDesc'),
    },
  ];

  const stats = [
    { value: '68%', label: t('landing.stats.aiPrecision', 'Precisão IA') },
    { value: '50k+', label: t('landing.stats.analysesPerformed', 'Análises realizadas') },
    { value: '24/7', label: t('landing.stats.availability', 'Disponibilidade') },
    { value: '4.9★', label: t('landing.stats.averageRating', 'Avaliação média') },
  ];

  if (user) {
    return <LoadingPage message={t('common.loading')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 relative overflow-x-hidden">
      
      {/* Background decorativo */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-500/3 to-blue-500/3 dark:from-primary-500/5 dark:to-blue-500/5 rounded-full blur-[150px]"></div>
      </div>
      
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.6, type: 'spring', stiffness: 100 }} 
        className="sticky top-0 z-50 border-b border-gray-200/50 dark:border-gray-800/50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 lg:h-20 items-center justify-between">
            <Logo />
            
            <div className="flex items-center gap-2 sm:gap-3">
              
              {/* Seletor de Idioma */}
              <div className="relative group">
                <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                  <Globe className="w-4 h-4 mr-1.5" />
                  <span className='hidden sm:inline font-medium'>{i18n.language.toUpperCase()}</span>
                  <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                </Button>
                <div className="absolute right-0 mt-2 w-24 rounded-xl shadow-xl bg-white dark:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700 z-20 opacity-0 scale-95 invisible group-hover:opacity-100 group-hover:scale-100 group-hover:visible transition-all duration-200 origin-top-right overflow-hidden">
                  <button onClick={() => changeLanguage('pt')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">🇧🇷 PT</button>
                  <button onClick={() => changeLanguage('en')} className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">🇺🇸 EN</button>
                </div>
              </div>

              <ThemeToggle />

              <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-medium">
                <Link to="/login">
                  <LogIn className="w-4 h-4 mr-2" /> {t('landing.login')}
                </Link>
              </Button>
              
              <Button size="sm" asChild className="bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30 transition-all duration-300 hover:scale-105 active:scale-95 font-medium">
                <Link to="/register" className="flex items-center">
                  <UserPlus className="w-4 h-4 sm:mr-2" /> 
                  <span className="hidden sm:inline">{t('landing.getStarted')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 sm:pt-24 sm:pb-32 lg:pt-32 lg:pb-40 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center">
            
            {/* Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full mb-8">
              <Sparkles className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {t('landing.badge', 'Tecnologia de ponta em saúde')}
              </span>
            </motion.div>
            
            {/* Título */}
            <motion.h1 variants={itemVariants} className="max-w-4xl mx-auto text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 text-gray-900 dark:text-white leading-[1.1] tracking-tight">
              {t('landing.title').split(' ').map((word, index) => (
                <span key={index} className={index === 0 ? 'text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-500 dark:from-primary-400 dark:to-primary-300' : ''}>
                  {word}{' '}
                </span>
              ))}
            </motion.h1>
            
            {/* Subtítulo */}
            <motion.p variants={itemVariants} className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              {t('landing.subtitle')}
            </motion.p>
            
            {/* Botões do Hero */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row justify-center gap-4">
              <Button 
                size="lg"
                asChild 
                className="bg-primary-600 hover:bg-primary-700 text-white font-semibold shadow-2xl shadow-primary-500/30 transition-all duration-300 hover:scale-105 active:scale-95 rounded-xl px-8 h-14 text-lg"
              >
                <Link to="/register" className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  {t('landing.getStarted')}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button 
                size="lg"
                variant="outline" 
                asChild 
                className="border-2 border-gray-300 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm text-gray-700 dark:text-gray-200 transition-all duration-300 hover:shadow-lg rounded-xl px-8 h-14 text-lg font-semibold"
              >
                <Link to="/login" className="flex items-center gap-2">
                  <LogIn className="w-5 h-5" />
                  {t('landing.login')}
                </Link>
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div 
              variants={itemVariants} 
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full mb-4">
              <Shield className="w-4 h-4 text-primary-600 dark:text-primary-400" />
              <span className="text-sm font-medium text-primary-700 dark:text-primary-300">{t('landing.resourcesBadge', 'Recursos')}</span>
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
              {t('landing.featuresTitle')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                initial={{ scale: 0.9, opacity: 0, y: 30 }} 
                whileInView={{ scale: 1, opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: index * 0.1 }} 
                viewport={{ once: true, amount: 0.2 }}
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

      {/* CTA Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-primary-800 dark:via-primary-900 dark:to-gray-950"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.2),transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              {t('landing.readyTitle')}
            </h2>
            <p className="text-lg sm:text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
              {t('landing.readySubtitle')}
            </p>
            <button
              onClick={() => navigate('/register')}
              className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-primary-700 px-10 py-4 rounded-xl font-bold text-lg shadow-2xl shadow-black/20 hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95"
            >
              <Zap className="w-5 h-5 text-primary-600" />
              <span className="text-primary-700">{t('landing.getStarted')}</span>
              <ArrowRight className="w-5 h-5 text-primary-600" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"> 
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              {t('faq.title')}
            </h2>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
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
      </section>

      {/* Footer */}
      <footer className="relative bg-gradient-to-b from-gray-900 to-gray-950 dark:from-gray-950 dark:to-black text-gray-400 pt-20 overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-600/5 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-600/5 rounded-full blur-[100px]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Seção superior com Logo e descrição */}
          <div className="flex flex-col lg:flex-row justify-between items-start gap-12 pb-12 border-b border-gray-800/50">
            
            {/* Logo e descrição */}
            <div className="max-w-sm">
              <Logo />
              <p className="mt-4 text-gray-500 leading-relaxed">
                {t('landing.subtitle')}
              </p>
              
              {/* Redes sociais */}
              <div className="flex gap-3 mt-6">
                <Link to="/chat" aria-label="Chat" className="group w-11 h-11 bg-gray-800/80 hover:bg-primary-600 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-primary-500/25">
                  <MessageCircle className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </Link>
                <a href="https://www.linkedin.com/" aria-label="LinkedIn" className="group w-11 h-11 bg-gray-800/80 hover:bg-[#0A66C2] rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25" target="_blank" rel="noopener noreferrer">
                  <Linkedin className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a href="https://www.youtube.com/" aria-label="YouTube" className="group w-11 h-11 bg-gray-800/80 hover:bg-[#FF0000] rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25" target="_blank" rel="noopener noreferrer">
                  <Youtube className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
                <a href="https://www.instagram.com/" aria-label="Instagram" className="group w-11 h-11 bg-gray-800/80 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-pink-500/25" target="_blank" rel="noopener noreferrer">
                  <Instagram className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
            
            {/* Links de navegação */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 lg:gap-16">
              
              {/* Coluna: Produto */}
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {t('footer.product', 'Produto')}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="#features" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.resources', 'Recursos')}
                    </a>
                  </li>
                  <li>
                    <Link to="/pricing" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.pricing', 'Preços')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/testimonials" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.testimonials', 'Depoimentos')}
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Coluna: Suporte */}
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {t('footer.support', 'Suporte')}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <a href="mailto:healgrupo@gmail.com" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.contact', 'Contato')}
                    </a>
                  </li>
                  <li>
                    <a href="#faq" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      FAQ
                    </a>
                  </li>
                  <li>
                    <Link to="/help" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.helpCenter', 'Central de Ajuda')}
                    </Link>
                  </li>
                </ul>
              </div>
              
              {/* Coluna: Legal */}
              <div>
                <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                  {t('footer.legal', 'Legal')}
                </h4>
                <ul className="space-y-3">
                  <li>
                    <Link to="/terms" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.terms', 'Termos de Uso')}
                    </Link>
                  </li>
                  <li>
                    <Link to="/privacy" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.privacy', 'Privacidade')}
                    </Link>
                  </li>
                  <li>
                    <a href="/cookies" className="text-sm text-gray-400 hover:text-primary-400 transition-colors duration-200 flex items-center gap-2 group">
                      <span className="w-1.5 h-1.5 bg-gray-600 group-hover:bg-primary-400 rounded-full transition-colors"></span>
                      {t('footer.cookies', 'Cookies')}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Rodapé inferior */}
          <div className="py-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500">
              © 2025 Heal+. {t('footer.allRightsReserved', 'Todos os direitos reservados.')}
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>{t('footer.madeWith', 'Feito com')}</span>
              <span className="text-red-500 animate-pulse">❤</span>
              <span>{t('footer.inBrazil', 'no Brasil')} 🇧🇷</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
