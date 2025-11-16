import React from 'react';

export const FAQAccordion = ({ items = [] }) => (
  <div className="space-y-3">
    {items.map((item, idx) => (
      <details key={idx} className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
        <summary className="cursor-pointer select-none px-4 py-3 text-gray-900 dark:text-gray-100 font-medium flex justify-between items-center">
          <span>{item.question}</span>
          <span className="text-primary-600 group-open:rotate-180 transition-transform">▼</span>
        </summary>
        <div className="px-4 pb-4 text-gray-600 dark:text-gray-300">{item.answer}</div>
      </details>
    ))}
  </div>
);

export default FAQAccordion;