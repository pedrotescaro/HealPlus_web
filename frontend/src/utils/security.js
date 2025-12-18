/**
 * Security Utilities for HealPlus Frontend
 * Funções de segurança para prevenção de XSS e sanitização de dados
 */

/**
 * Sanitiza uma string para prevenir XSS
 * @param {string} input - String a ser sanitizada
 * @returns {string} - String sanitizada
 */
export const sanitizeHtml = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Remove todas as tags HTML de uma string
 * @param {string} input - String com possíveis tags HTML
 * @returns {string} - String sem tags HTML
 */
export const stripHtml = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input.replace(/<[^>]*>/g, '');
};

/**
 * Valida se uma string é um email válido
 * @param {string} email - Email a ser validado
 * @returns {boolean} - true se válido
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return false;
  }
  
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Valida se uma string contém apenas caracteres alfanuméricos e hífens (para IDs)
 * @param {string} id - ID a ser validado
 * @returns {boolean} - true se válido
 */
export const isValidId = (id) => {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  return /^[a-zA-Z0-9-]+$/.test(id);
};

/**
 * Sanitiza um objeto removendo propriedades perigosas
 * @param {object} obj - Objeto a ser sanitizado
 * @returns {object} - Objeto sanitizado
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }
  
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  const sanitized = {};
  
  for (const [key, value] of Object.entries(obj)) {
    if (dangerous.includes(key)) {
      continue;
    }
    
    if (typeof value === 'string') {
      sanitized[key] = sanitizeHtml(value);
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

/**
 * Valida a força de uma senha
 * @param {string} password - Senha a ser validada
 * @returns {object} - { valid: boolean, errors: string[] }
 */
export const validatePassword = (password) => {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (password && password.length > 128) {
    errors.push('Senha deve ter no máximo 128 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Escapa caracteres especiais para uso seguro em URLs
 * @param {string} input - String a ser escapada
 * @returns {string} - String escapada
 */
export const escapeUrl = (input) => {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return encodeURIComponent(input);
};

/**
 * Valida e sanitiza uma URL
 * @param {string} url - URL a ser validada
 * @returns {string|null} - URL validada ou null se inválida
 */
export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  try {
    const parsed = new URL(url);
    // Apenas permitir HTTP e HTTPS
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
};

/**
 * Gera um token CSRF seguro
 * @returns {string} - Token CSRF
 */
export const generateCsrfToken = () => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Armazena token de forma segura
 * Prefere sessionStorage para dados sensíveis
 * @param {string} key - Chave
 * @param {string} value - Valor
 * @param {boolean} persistent - Usar localStorage (persistente) ou sessionStorage
 */
export const secureStore = (key, value, persistent = false) => {
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(key, value);
};

/**
 * Recupera token armazenado de forma segura
 * @param {string} key - Chave
 * @param {boolean} persistent - Usar localStorage ou sessionStorage
 * @returns {string|null} - Valor ou null
 */
export const secureRetrieve = (key, persistent = false) => {
  const storage = persistent ? localStorage : sessionStorage;
  return storage.getItem(key);
};

/**
 * Remove token armazenado
 * @param {string} key - Chave
 */
export const secureRemove = (key) => {
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
};

export default {
  sanitizeHtml,
  stripHtml,
  isValidEmail,
  isValidId,
  sanitizeObject,
  validatePassword,
  escapeUrl,
  validateUrl,
  generateCsrfToken,
  secureStore,
  secureRetrieve,
  secureRemove
};
