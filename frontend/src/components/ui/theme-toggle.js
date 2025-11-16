import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('userSettings');
      const obj = saved ? JSON.parse(saved) : {};
      const enabled = obj.darkMode ?? document.documentElement.classList.contains('dark');
      setDark(enabled);
      if (enabled) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
    } catch (_) {}
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    try {
      const saved = localStorage.getItem('userSettings');
      const obj = saved ? JSON.parse(saved) : {};
      localStorage.setItem('userSettings', JSON.stringify({ ...obj, darkMode: next }));
    } catch (_) {}
  };

  return (
    <button onClick={toggle} aria-label={dark ? 'Ativar modo claro' : 'Ativar modo escuro'} className="flex items-center justify-center bg-primary-700 dark:bg-primary-800 hover:bg-primary-600 dark:hover:bg-primary-700 transition-colors rounded-lg w-10 h-10">
      {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

export default ThemeToggle;