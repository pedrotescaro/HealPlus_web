import React from 'react';

// Função utilitária simples para combinar classes
const combineClasses = (...classes) => classes.filter(Boolean).join(' ');

/**
 * Componente Logo para a Landing Page
 * Renderiza a logo com um ícone de imagem e texto gradiente.
 * Aceita uma prop 'className' para customização externa.
 */
export const Logo = ({ className }) => {
  // URL da imagem (o ícone "H+" individual)
  const imageUrl = "https://i.imgur.com/HJ8HDJs.png"; 

  return (
    // Usa combineClasses para garantir que 'className' externa seja aplicada
    <div className={combineClasses("flex items-center space-x-2", className)}>
      
      {/* Imagem/Ícone da Logo */}
      <img
        src={imageUrl}
        alt="Heal+ Logo"
        // 🚨 Aumentando o tamanho da imagem para h-12 w-12 (e responsivo)
        className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 object-contain"
        // Adicionando um leve drop-shadow para dar profundidade, como na imagem
        style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.2))' }}
      />
      
      {/* Texto Gradiente */}
      <span 
        className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight 
                   bg-gradient-to-r 
                   from-primary-600 via-primary-500 to-primary-400 
                   dark:from-blue-400 dark:via-blue-300 dark:to-blue-200 
                   bg-clip-text text-transparent"
      >
        Heal+
      </span>
    </div>
  );
};

export default Logo;