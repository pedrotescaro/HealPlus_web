import React from 'react';

export const FeatureCard = ({ icon, title, description, className = '' }) => (
  <div className={`group relative p-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5 ${className}`}>
    {/* Gradient overlay on hover */}
    <div className="absolute inset-0 bg-gradient-to-br from-primary-50/50 to-transparent dark:from-primary-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none"></div>
    
    {/* Icon container */}
    <div className="relative mb-6">
      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-900/50 dark:to-primary-800/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-primary-500/10">
        <div className="text-primary-600 dark:text-primary-400">
          {icon}
        </div>
      </div>
    </div>
    
    {/* Content */}
    <div className="relative">
      <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
    
    {/* Decorative element */}
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-primary-400 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
  </div>
);

export default FeatureCard;
