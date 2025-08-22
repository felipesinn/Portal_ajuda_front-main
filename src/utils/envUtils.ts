// import type { SectorType } from '../types/common.types';

// export const isDevelopment = (): boolean => {
//   try {
//     if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
//       return import.meta.env.MODE === 'development';
//     }
    
//     if (typeof window !== 'undefined' && window.location) {
//       return window.location.hostname === 'localhost' || 
//              window.location.hostname === '127.0.0.1' ||
//              window.location.port === '3000' ||
//              window.location.port === '5173';
//     }
    
//     return false;
//   } catch {
//     return false;
//   }
// };

// export const isProduction = (): boolean => {
//   try {
//     if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
//       return import.meta.env.MODE === 'production';
//     }
    
//     if (typeof window !== 'undefined' && window.location) {
//       return window.location.hostname === 'ajuda.cznet.net.br';
//     }
    
//     return false;
//   } catch {
//     return false;
//   }
// };

// export const getApiUrl = (): string => {
//   try {
//     if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
//       const url = import.meta.env.VITE_API_URL;
//       return url.endsWith('/') ? url.slice(0, -1) : url;
//     }
    
//     if (typeof window !== 'undefined' && window.location) {
//       const { hostname, protocol } = window.location;
      
//       if (hostname === 'localhost' || hostname === '127.0.0.1') {
//         return 'http://localhost:1337';
//       }
      
//       if (hostname === 'ajuda.cznet.net.br') {
//         return 'https://strapi.cznet.net.br';
//       }
//     }
    
//     return 'https://strapi.cznet.net.br';
//   } catch {
//     return 'https://strapi.cznet.net.br';
//   }
// };

// export const ENV_CONFIG = {
//   get isDev() { return isDevelopment(); },
//   get isProd() { return isProduction(); },
//   get apiUrl() { return getApiUrl(); },
//   get apiBase() { return `${this.apiUrl}/api`; },
  
//   get authUrl() { return `${this.apiBase}/auth/local`; },
//   get registerUrl() { return `${this.apiBase}/auth/local/register`; },
//   get forgotPasswordUrl() { return `${this.apiBase}/auth/forgot-password`; },
//   get resetPasswordUrl() { return `${this.apiBase}/auth/reset-password`; },
//   get userUrl() { return `${this.apiBase}/users/me`; },
  
//   upload: {
//     maxSize: 10 * 1024 * 1024, // 10MB
//     allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
//     allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
//     allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
//   },
  
//   timeouts: {
//     default: 30000, // 30s
//     upload: 120000, // 2min
//     auth: 15000, // 15s para autenticação
//   },
  
//   headers: {
//     'Content-Type': 'application/json',
//     'Accept': 'application/json',
//   } as Record<string, string>,
// };

// export const VALID_SECTORS: SectorType[] = ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];

// export const validateSector = (sector: string | undefined): SectorType => {
//   if (!sector) return 'suporte';
//   return VALID_SECTORS.includes(sector as SectorType) ? sector as SectorType : 'suporte';
// };

// export const safeLog = (...args: any[]): void => {
//   if (isDevelopment()) {
//     console.log(`[${new Date().toISOString()}]`, ...args);
//   }
// };

// export const safeWarn = (...args: any[]): void => {
//   if (isDevelopment()) {
//     console.warn(`[${new Date().toISOString()}]`, ...args);
//   }
// };

// export const safeError = (...args: any[]): void => {
//   if (isDevelopment()) {
//     console.error(`[${new Date().toISOString()}]`, ...args);
//   }
// };

// export const apiLog = (method: string, url: string, data?: any): void => {
//   if (isDevelopment()) {
//     console.log(`[API] ${method.toUpperCase()} ${url}`, data ? { data } : '');
//   }
// };

// export const validateApiUrl = (url: string): boolean => {
//   try {
//     const validUrl = new URL(url);
//     return validUrl.protocol === 'http:' || validUrl.protocol === 'https:';
//   } catch {
//     return false;
//   }
// };

// export const getEnvironmentInfo = () => {
//   const info = {
//     isDevelopment: isDevelopment(),
//     isProduction: isProduction(),
//     apiUrl: getApiUrl(),
//     apiBase: ENV_CONFIG.apiBase,
//     mode: typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'unknown',
//     userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
//     timestamp: new Date().toISOString(),
//     location: typeof window !== 'undefined' ? {
//       hostname: window.location.hostname,
//       port: window.location.port,
//       protocol: window.location.protocol,
//       href: window.location.href
//     } : null,
//     envVars: typeof import.meta !== 'undefined' ? {
//       MODE: import.meta.env?.MODE,
//       VITE_API_URL: import.meta.env?.VITE_API_URL,
//       NODE_ENV: import.meta.env?.NODE_ENV,
//     } : {}
//   };
  
//   safeLog('Environment Info:', info);
//   return info;
// };

// export const getRequestHeaders = (includeAuth = true): Record<string, string> => {
//   const headers: Record<string, string> = { ...ENV_CONFIG.headers };
  
//   if (includeAuth && typeof window !== 'undefined') {
//     const token = localStorage.getItem('strapi_jwt');
//     if (token) {
//       headers['Authorization'] = `Bearer ${token}`;
//     }
//   }
  
//   return headers;
// };

// export const clearAuthData = (): void => {
//   if (typeof window !== 'undefined') {
//     localStorage.removeItem('strapi_jwt');
//     localStorage.removeItem('strapi_user');
//     localStorage.removeItem('strapi_refresh_token');
//   }
// };

// export default {
//   isDevelopment,
//   isProduction,
//   getApiUrl,
//   ENV_CONFIG,
//   validateSector,
//   safeLog,
//   safeWarn,
//   safeError,
//   apiLog,
//   validateApiUrl,
//   getEnvironmentInfo,
//   getRequestHeaders,
//   clearAuthData,
// };

// src/utils/envUtils.ts - Versão aprimorada baseada no seu código atual
import type { SectorType } from '../types/common.types';

export const isDevelopment = (): boolean => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
      return import.meta.env.MODE === 'development';
    }
    
    if (typeof window !== 'undefined' && window.location) {
      return window.location.hostname === 'localhost' || 
             window.location.hostname === '127.0.0.1' ||
             window.location.port === '3000' ||
             window.location.port === '5173';
    }
    
    return false;
  } catch {
    return false;
  }
};

export const isProduction = (): boolean => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.MODE) {
      return import.meta.env.MODE === 'production';
    }
    
    if (typeof window !== 'undefined' && window.location) {
      return window.location.hostname === 'ajuda.cznet.net.br';
    }
    
    return false;
  } catch {
    return false;
  }
};

export const getApiUrl = (): string => {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
      const url = import.meta.env.VITE_API_URL;
      return url.endsWith('/') ? url.slice(0, -1) : url;
    }
    
    if (typeof window !== 'undefined' && window.location) {
      const { hostname, protocol } = window.location;
      
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return 'http://localhost:1337';
      }
      
      if (hostname === 'ajuda.cznet.net.br') {
        return 'https://strapi.cznet.net.br';
      }
    }
    
    return 'https://strapi.cznet.net.br';
  } catch {
    return 'https://strapi.cznet.net.br';
  }
};

export const ENV_CONFIG = {
  get isDev() { return isDevelopment(); },
  get isProd() { return isProduction(); },
  get apiUrl() { return getApiUrl(); },
  get apiBase() { return `${this.apiUrl}/api`; },
  
  get authUrl() { return `${this.apiBase}/auth/local`; },
  get registerUrl() { return `${this.apiBase}/auth/local/register`; },
  get forgotPasswordUrl() { return `${this.apiBase}/auth/forgot-password`; },
  get resetPasswordUrl() { return `${this.apiBase}/auth/reset-password`; },
  get userUrl() { return `${this.apiBase}/users/me`; },
  
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowedVideoTypes: ['video/mp4', 'video/webm', 'video/ogg'],
    allowedDocTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  },
  
  timeouts: {
    default: 30000, // 30s
    upload: 120000, // 2min
    auth: 15000, // 15s para autenticação
  },
  
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  } as Record<string, string>,
  
  // ✅ CONFIGURAÇÕES DE LOGGING - NOVO
  logging: {
    enabled: isDevelopment(), // Só habilitar logs em desenvolvimento
    timestamp: true,
    apiLogs: isDevelopment(),
    debugMode: isDevelopment(),
    errorReporting: isProduction(), // Em produção, só reportar erros críticos
  }
};

export const VALID_SECTORS: SectorType[] = ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];

export const validateSector = (sector: string | undefined): SectorType => {
  if (!sector) return 'suporte';
  return VALID_SECTORS.includes(sector as SectorType) ? sector as SectorType : 'suporte';
};

// ===== FUNÇÕES DE LOG CONDICIONAIS APRIMORADAS =====

/**
 * Log que só aparece em desenvolvimento
 */
export const safeLog = (...args: any[]): void => {
  if (isDevelopment()) {
    console.log(`[${new Date().toISOString()}]`, ...args);
  }
};

/**
 * Warn que só aparece em desenvolvimento  
 */
export const safeWarn = (...args: any[]): void => {
  if (isDevelopment()) {
    console.warn(`[${new Date().toISOString()}]`, ...args);
  }
};

/**
 * Error que só aparece em desenvolvimento
 */
export const safeError = (...args: any[]): void => {
  if (isDevelopment()) {
    console.error(`[${new Date().toISOString()}]`, ...args);
  }
};

/**
 * Log de API que só aparece em desenvolvimento - APRIMORADO
 */
export const apiLog = (method: string, url: string, status?: number, data?: any): void => {
  if (isDevelopment()) {
    const timestamp = new Date().toISOString();
    const emoji = status ? (status >= 200 && status < 300 ? '✅' : '❌') : '🌐';
    const statusText = status ? ` - ${status}` : '';
    
    console.log(`[${timestamp}] ${emoji} ${method.toUpperCase()} ${url}${statusText}`);
    
    if (data && method.toUpperCase() === 'POST') {
      console.log(`[${timestamp}] 📤 Payload:`, data);
    }
    
    if (data && status && status >= 200 && status < 300) {
      console.log(`[${timestamp}] 📥 Resposta:`, data);
    }
  }
};

/**
 * Debug detalhado que só aparece em desenvolvimento - NOVO
 */
export const safeDebug = (...args: any[]): void => {
  if (isDevelopment()) {
    console.debug(`[${new Date().toISOString()}] 🐛 DEBUG:`, ...args);
  }
};

/**
 * Info que só aparece em desenvolvimento - NOVO
 */
export const safeInfo = (...args: any[]): void => {
  if (isDevelopment()) {
    console.info(`[${new Date().toISOString()}] ℹ️ INFO:`, ...args);
  }
};

/**
 * Log para sempre aparecer (mesmo em produção) - USAR APENAS PARA ERROS CRÍTICOS
 */
export const forceLog = (...args: any[]): void => {
  console.log(`[${new Date().toISOString()}] 🚨 CRITICAL:`, ...args);
};

/**
 * Error para sempre aparecer (mesmo em produção) - USAR APENAS PARA ERROS CRÍTICOS
 */
export const forceError = (...args: any[]): void => {
  console.error(`[${new Date().toISOString()}] 🚨 CRITICAL ERROR:`, ...args);
};

export const validateApiUrl = (url: string): boolean => {
  try {
    const validUrl = new URL(url);
    return validUrl.protocol === 'http:' || validUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Função para mostrar informações do ambiente - APENAS EM DESENVOLVIMENTO
 */
export const getEnvironmentInfo = () => {
  const info = {
    isDevelopment: isDevelopment(),
    isProduction: isProduction(),
    apiUrl: getApiUrl(),
    apiBase: ENV_CONFIG.apiBase,
    mode: typeof import.meta !== 'undefined' ? import.meta.env?.MODE : 'unknown',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    timestamp: new Date().toISOString(),
    location: typeof window !== 'undefined' ? {
      hostname: window.location.hostname,
      port: window.location.port,
      protocol: window.location.protocol,
      href: window.location.href
    } : null,
    envVars: typeof import.meta !== 'undefined' ? {
      MODE: import.meta.env?.MODE,
      VITE_API_URL: import.meta.env?.VITE_API_URL,
      NODE_ENV: import.meta.env?.NODE_ENV,
    } : {}
  };
  
  // ✅ APENAS MOSTRAR EM DESENVOLVIMENTO
  safeLog('🌍 Environment Info:', info);
  return info;
};

export const getRequestHeaders = (includeAuth = true): Record<string, string> => {
  const headers: Record<string, string> = { ...ENV_CONFIG.headers };
  
  if (includeAuth && typeof window !== 'undefined') {
    const token = localStorage.getItem('strapi_jwt');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      safeDebug('🔑 Token anexado ao request');
    }
  }
  
  return headers;
};

export const clearAuthData = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('strapi_jwt');
    localStorage.removeItem('strapi_user');
    localStorage.removeItem('strapi_refresh_token');
    safeLog('🧹 Dados de autenticação limpos');
  }
};

// ===== FUNÇÕES UTILITÁRIAS ADICIONAIS =====

/**
 * Wrapper para console.table que só funciona em desenvolvimento
 */
export const safeTable = (data: any, columns?: string[]): void => {
  if (isDevelopment()) {
    console.table(data, columns);
  }
};

/**
 * Wrapper para console.group que só funciona em desenvolvimento
 */
export const safeGroup = (label: string): void => {
  if (isDevelopment()) {
    console.group(`[${new Date().toISOString()}] 📁 ${label}`);
  }
};

/**
 * Wrapper para console.groupEnd que só funciona em desenvolvimento
 */
export const safeGroupEnd = (): void => {
  if (isDevelopment()) {
    console.groupEnd();
  }
};

/**
 * Wrapper para console.time que só funciona em desenvolvimento
 */
export const safeTime = (label: string): void => {
  if (isDevelopment()) {
    console.time(`⏱️ ${label}`);
  }
};

/**
 * Wrapper para console.timeEnd que só funciona em desenvolvimento
 */
export const safeTimeEnd = (label: string): void => {
  if (isDevelopment()) {
    console.timeEnd(`⏱️ ${label}`);
  }
};

/**
 * Log de performance que só aparece em desenvolvimento
 */
export const performanceLog = (operation: string, startTime: number, endTime: number): void => {
  if (isDevelopment()) {
    const duration = performance.now() - startTime;
    safeLog(`⚡ ${operation} executado em ${duration.toFixed(2)}ms`);
  }
};

export default {
  isDevelopment,
  isProduction,
  getApiUrl,
  ENV_CONFIG,
  validateSector,
  safeLog,
  safeWarn,
  safeError,
  safeDebug,
  safeInfo,
  apiLog,
  forceLog,
  forceError,
  safeTable,
  safeGroup,
  safeGroupEnd,
  safeTime,
  safeTimeEnd,
  performanceLog,
  validateApiUrl,
  getEnvironmentInfo,
  getRequestHeaders,
  clearAuthData,
};