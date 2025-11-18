import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext'; // Importe o hook

export const ThemeToggle = () => {
  const { settings, updateSettings } = useSettings(); // Use o contexto

  const toggle = () => {
    // Atualize o estado global
    updateSettings({ darkMode: !settings.darkMode });
  };

  return (
    <button 
      onClick={toggle} 
      aria-label={settings.darkMode ? 'Ativar modo claro' : 'Ativar modo escuro'} 
      className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors rounded-lg w-10 h-10 text-gray-800 dark:text-gray-200"
    >
      {settings.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle;