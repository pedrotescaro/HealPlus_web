import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userSettings');
      const stored = saved ? JSON.parse(saved) : null;
      const enabled = stored?.darkMode ?? document.documentElement.classList.contains('dark');
      setIsDark(enabled);
      if (enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (_) {
      // noop
    }
  }, []);

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

  const toggleDarkMode = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      const saved = localStorage.getItem('userSettings');
      const obj = saved ? JSON.parse(saved) : {};
      localStorage.setItem('userSettings', JSON.stringify({ ...obj, darkMode: next }));
    } catch (_) {
      // noop
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-primary-800 dark:bg-primary-900 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-800 font-bold text-xl">H+</span>
            </div>
            <span className="text-xl font-bold">Heal+</span>
          </Link>

          <div className="flex items-center space-x-2 sm:space-x-4 flex-wrap">
            {/* Language Switcher */}
            <div className="flex bg-primary-700 dark:bg-primary-800 rounded-lg p-1">
              <button
                onClick={() => changeLanguage('pt')}
                className={`px-3 py-1 rounded transition-colors ${
                  i18n.language === 'pt'
                    ? 'bg-white text-primary-800'
                    : 'text-white hover:bg-primary-600'
                }`}
              >
                PT
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-1 rounded transition-colors ${
                  i18n.language === 'en'
                    ? 'bg-white text-primary-800'
                    : 'text-white hover:bg-primary-600'
                }`}
              >
                EN
              </button>
            </div>

            <button
              onClick={toggleDarkMode}
              aria-label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'}
              className="flex items-center justify-center bg-primary-700 dark:bg-primary-800 hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors rounded-lg w-10 h-10"
            >
              {isDark ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364l-1.414-1.414M7.05 7.05L5.636 5.636m12.728 0l-1.414 1.414M7.05 16.95l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 118.646 3.646 7 7 0 0020.354 15.354z" />
                </svg>
              )}
            </button>

            {user && (
              <>
                <Link
                  to="/settings"
                  className="hover:bg-primary-700 dark:hover:bg-primary-800 px-3 py-2 rounded-lg transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </Link>
                <button
                  onClick={handleLogout}
                  className="hover:bg-primary-700 dark:hover:bg-primary-800 px-4 py-2 rounded-lg transition-colors"
                >
                  {t('common.logout')}
                </button>
              </>
            )}
            {!user && (
              <>
                <Link
                  to="/login"
                  className="hidden sm:inline-flex px-3 py-2 rounded-lg transition-colors text-white hover:bg-primary-700"
                >
                  {t('landing.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-3 py-2 rounded-lg transition-colors bg-white text-primary-800 hover:bg-gray-100 shadow"
                >
                  <span className="hidden sm:inline">{t('landing.getStarted')}</span>
                  <span className="sm:hidden">{t('landing.getStarted')}</span>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;