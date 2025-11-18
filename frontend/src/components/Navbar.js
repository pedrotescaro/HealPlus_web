import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './logo';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Globe, LogIn, UserPlus, LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    try {
      const saved = localStorage.getItem('userSettings');
      const obj = saved ? JSON.parse(saved) : {};
      localStorage.setItem('userSettings', JSON.stringify({ ...obj, language: lng }));
    } catch (_) {
      // noop
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
      <motion.header 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.5, type: 'spring', stiffness: 120 }} 
        className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-md dark:shadow-lg dark:shadow-primary-900/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to={user ? "/dashboard" : "/"}>
              <Logo />
            </Link>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              
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

              <ThemeToggle />

              {user ? (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <Link to="/dashboard">
                      <LayoutDashboard className="w-4 h-4 mr-2" /> {t('dashboard.title')}
                    </Link>
                  </Button>
                  <Button size="sm" onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/30 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95">
                    <LogOut className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">{t('common.logout')}</span>
                    <span className="inline sm:hidden">Sair</span>
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" size="sm" asChild className="hidden sm:inline-flex text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                    <Link to="/login">
                      <LogIn className="w-4 h-4 mr-2" /> {t('landing.login')}
                    </Link>
                  </Button>
                  <Button size="sm" asChild className="bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/30 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-95">
                    <Link to="/register" className="flex items-center">
                      <UserPlus className="w-4 h-4 sm:mr-2" /> 
                      <span className="hidden sm:inline">{t('landing.getStarted')}</span>
                      <span className="inline sm:hidden">{t('landing.getStartedShort') || 'Start'}</span> 
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.header>
  );
};

export default Navbar;
