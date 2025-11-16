import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-20 bg-gray-900/60 backdrop-blur border-b border-white/5 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <span className="text-primary-800 font-bold text-xl">H+</span>
            </div>
            <span className="text-xl font-bold">Heal+</span>
          </Link>

          <div className="flex items-center space-x-3">
            {!user && (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  {t('landing.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white font-semibold shadow-lg shadow-primary-900/30"
                >
                  {t('landing.getStarted')}
                </Link>
              </>
            )}
            {user && (
              <>
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-lg text-primary-200 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  {t('common.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;