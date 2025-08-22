import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { ENV_CONFIG, safeLog, safeError } from '../utils/envUtils';

// Configurações da API
export const STRAPI_CONFIG = {
  // URL base do Strapi
  BASE_URL: ENV_CONFIG.apiUrl,
  
  // URLs específicas
  get API_BASE() { return `${this.BASE_URL}/api`; },
  get UPLOAD_URL() { return `${this.BASE_URL}/api/upload`; },
  get MEDIA_BASE() { return this.BASE_URL; },
  
  // Endpoints
  ENDPOINTS: {
    CONTENTS: '/contents',
    WIKI_ADDITIONS: '/wiki-additions', 
    UPLOAD: '/upload',
    UPLOAD_FILES: '/upload/files',
    AUTH: '/auth',
  },
  
  // Configurações de upload
  UPLOAD: ENV_CONFIG.upload,
  
  // Timeouts
  TIMEOUT: ENV_CONFIG.timeouts
};

// ✅ ADIÇÃO: TokenManager seguro para uso nos interceptors
class TokenManager {
  private static token: string | null = null;
  private static user: any = null;

  static setToken(token: string): void {
    this.token = token;
    // ✅ NÃO salvar no localStorage
  }

  static getToken(): string | null {
    return this.token;
  }

  static setUser(user: any): void {
    this.user = user;
    // ✅ NÃO salvar no localStorage
  }

  static getUser(): any {
    return this.user;
  }

  static clear(): void {
    this.token = null;
    this.user = null;
  }

  static isAuthenticated(): boolean {
    return this.token !== null;
  }
}

// ✅ ADIÇÃO: Exportar TokenManager para uso no auth.service
export { TokenManager };

// Instância do Axios configurada
const createApiInstance = (): AxiosInstance => {
  const instance = axios.create({
    baseURL: STRAPI_CONFIG.API_BASE,
    timeout: STRAPI_CONFIG.TIMEOUT.default,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: false,
  });

  // ✅ MODIFICAÇÃO: Interceptor de request com token seguro
  instance.interceptors.request.use(
    (config: any) => {
      safeLog(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
      
      // ✅ ADIÇÃO: Adicionar token de autorização se disponível
      const token = TokenManager.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (ENV_CONFIG.isDev) {
          safeLog('🔑 Token anexado ao request');
        }
      }
      
      // Adicionar timestamp para evitar cache
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          _t: Date.now()
        };
      }

      // Log do payload apenas em desenvolvimento
      if (ENV_CONFIG.isDev && config.data) {
        safeLog('📤 Payload:', config.data);
      }

      return config;
    },
    (error) => {
      safeError('❌ Erro na requisição:', error);
      return Promise.reject(error);
    }
  );

  // ✅ MODIFICAÇÃO: Interceptor de response com logout automático
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      safeLog(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      
      // Log da resposta apenas em desenvolvimento
      if (ENV_CONFIG.isDev) {
        safeLog('📥 Resposta:', response.data);
      }

      return response;
    },
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      const method = error.config?.method?.toUpperCase();
      
      safeError(`❌ ${method} ${url} - ${status}:`, error.response?.data || error.message);
      
      if (status === 401) {
        safeError('🔒 Erro de autenticação - fazendo logout automático');
        
        // ✅ ADIÇÃO: Logout automático em caso de token inválido
        TokenManager.clear();
        
        // Redirecionar para login apenas se não estiver já lá
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        
      } else if (status === 403) {
        safeError('🚫 Acesso negado');
      } else if (status === 404) {
        safeError('🔍 Recurso não encontrado');
      } else if (status >= 500) {
        safeError('🛠️ Erro interno do servidor');
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

// Instância principal da API
const api = createApiInstance();

// ✅ MODIFICAÇÃO: Instância específica para uploads com token
const strapiUploadApi = axios.create({
  baseURL: STRAPI_CONFIG.API_BASE,
  timeout: STRAPI_CONFIG.TIMEOUT.upload,
  withCredentials: false,
});

// ✅ MODIFICAÇÃO: Interceptors para upload com token
strapiUploadApi.interceptors.request.use(
  (config: any) => {
    safeLog(`📤 UPLOAD ${config.method?.toUpperCase()} ${config.url}`);
    
    // ✅ ADIÇÃO: Adicionar token para uploads
    const token = TokenManager.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

strapiUploadApi.interceptors.response.use(
  (response: AxiosResponse) => {
    safeLog(`✅ UPLOAD ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    
    // ✅ ADIÇÃO: Tratar erro 401 em uploads
    if (status === 401) {
      safeError('🔒 Token inválido em upload - fazendo logout');
      TokenManager.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    safeError(`❌ UPLOAD ERROR:`, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ✅ ADIÇÃO: Utilitários de segurança
export const SecurityUtils = {
  cleanSensitiveData(): void {
    const sensitiveKeys = ['token', 'user', 'jwt', 'authState', 'credentials'];
    
    sensitiveKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        if (ENV_CONFIG.isDev) {
          console.warn(`🚨 Removendo dado sensível: ${key}`);
        }
        localStorage.removeItem(key);
      }
      
      if (sessionStorage.getItem(key)) {
        if (ENV_CONFIG.isDev) {
          console.warn(`🚨 Removendo dado sensível do sessionStorage: ${key}`);
        }
        sessionStorage.removeItem(key);
      }
    });
  },

  validateStorage(): boolean {
    const sensitiveKeys = ['token', 'user', 'jwt', 'authState'];
    const found: string[] = [];
    
    sensitiveKeys.forEach(key => {
      if (localStorage.getItem(key) || sessionStorage.getItem(key)) {
        found.push(key);
      }
    });

    if (found.length > 0) {
      console.error('🚨 VULNERABILIDADE: Dados sensíveis encontrados:', found);
      return false;
    }

    return true;
  },

  initSecurity(): void {
    this.cleanSensitiveData();
    
    if (ENV_CONFIG.isDev) {
      this.monitorStorage();
    }
  },

  monitorStorage(): void {
    const sensitiveKeys = ['token', 'user', 'jwt', 'authState', 'credentials'];
    const originalSetItem = localStorage.setItem.bind(localStorage);
    const originalSessionSetItem = sessionStorage.setItem.bind(sessionStorage);
    
    localStorage.setItem = (key: string, value: string) => {
      if (sensitiveKeys.includes(key)) {
        console.error(`🚨 BLOQUEADO: Tentativa de salvar '${key}' no localStorage`);
        console.trace('Stack trace:');
        return;
      }
      originalSetItem(key, value);
    };

    sessionStorage.setItem = (key: string, value: string) => {
      if (sensitiveKeys.includes(key)) {
        console.error(`🚨 BLOQUEADO: Tentativa de salvar '${key}' no sessionStorage`);
        console.trace('Stack trace:');
        return;
      }
      originalSessionSetItem(key, value);
    };
  }
};

// ✅ INICIALIZAR segurança
SecurityUtils.initSecurity();

// Utilitários para construir URLs
export const urlBuilder = {
  content: (id?: string) => id ? `${STRAPI_CONFIG.ENDPOINTS.CONTENTS}/${id}` : STRAPI_CONFIG.ENDPOINTS.CONTENTS,
  wikiAddition: (id?: string) => id ? `${STRAPI_CONFIG.ENDPOINTS.WIKI_ADDITIONS}/${id}` : STRAPI_CONFIG.ENDPOINTS.WIKI_ADDITIONS,
  upload: () => STRAPI_CONFIG.ENDPOINTS.UPLOAD,
  uploadFile: (id?: string) => id ? `${STRAPI_CONFIG.ENDPOINTS.UPLOAD_FILES}/${id}` : STRAPI_CONFIG.ENDPOINTS.UPLOAD_FILES,
  media: (path: string) => {
    if (path.startsWith('http')) return path;
    if (path.startsWith('/')) return `${STRAPI_CONFIG.MEDIA_BASE}${path}`;
    return `${STRAPI_CONFIG.MEDIA_BASE}/${path}`;
  }
};

// Utilitários para parâmetros comuns
export const queryParams = {
  populate: (fields: string[] = ['*']) => ({ populate: fields.join(',') }),
  filters: (filters: Record<string, any>) => ({ filters }),
  sort: (field: string, direction: 'asc' | 'desc' = 'desc') => ({ sort: `${field}:${direction}` }),
  pagination: (page: number = 1, pageSize: number = 25) => ({ 
    'pagination[page]': page,
    'pagination[pageSize]': pageSize 
  }),
};

// Funções auxiliares para requests comuns
export const apiHelpers = {
  get: async <T = any>(endpoint: string, params?: Record<string, any>): Promise<T> => {
    const response = await api.get(endpoint, { params });
    return response.data;
  },

  post: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.post(endpoint, data);
    return response.data;
  },

  put: async <T = any>(endpoint: string, data?: any): Promise<T> => {
    const response = await api.put(endpoint, data);
    return response.data;
  },

  delete: async <T = any>(endpoint: string): Promise<T> => {
    const response = await api.delete(endpoint);
    return response.data;
  },

  upload: async <T = any>(file: File | File[], endpoint: string = STRAPI_CONFIG.ENDPOINTS.UPLOAD): Promise<T> => {
    const formData = new FormData();
    
    if (Array.isArray(file)) {
      file.forEach(f => formData.append('files', f));
    } else {
      formData.append('files', file);
    }

    const response = await strapiUploadApi.post(endpoint, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },
};

// Validadores de arquivo
export const fileValidators = {
  isValidImage: (file: File): boolean => {
    return STRAPI_CONFIG.UPLOAD.allowedImageTypes.includes(file.type);
  },

  isValidVideo: (file: File): boolean => {
    return STRAPI_CONFIG.UPLOAD.allowedVideoTypes.includes(file.type);
  },

  isValidSize: (file: File): boolean => {
    return file.size <= STRAPI_CONFIG.UPLOAD.maxSize;
  },

  validateFile: (file: File): { valid: boolean; error?: string } => {
    if (!fileValidators.isValidSize(file)) {
      return { 
        valid: false, 
        error: `Arquivo muito grande. Máximo: ${STRAPI_CONFIG.UPLOAD.maxSize / (1024 * 1024)}MB` 
      };
    }

    const isImage = fileValidators.isValidImage(file);
    const isVideo = fileValidators.isValidVideo(file);

    if (!isImage && !isVideo) {
      return { 
        valid: false, 
        error: 'Tipo de arquivo não suportado. Use imagens (JPG, PNG, GIF, WEBP) ou vídeos (MP4, WEBM, OGG).' 
      };
    }

    return { valid: true };
  }
};

// Export da instância principal
export default api;

// Exports nomeados para compatibilidade
export { 
  api, 
  strapiUploadApi as uploadApi, 
  STRAPI_CONFIG as API_CONFIG,
  urlBuilder as buildUrl,
  queryParams as commonParams
};