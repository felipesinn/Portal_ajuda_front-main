// frontend/src/config/auth.config.ts - CORRIGIDO
export const AUTH_CONFIG = {
  // Usar variável de ambiente, fallback para false
  USE_MOCK: import.meta.env.VITE_USE_MOCK === 'true' || false,
  
  // URL da API via variável de ambiente
  API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  
  // Credenciais mock (apenas para desenvolvimento)
  MOCK_CREDENTIALS: {
    email: 'felipe.sinn@cznet.net.br',
    password: 'CZnet1277'
  },
  
  // Configurações de token
  TOKEN_STORAGE_KEY: 'auth_token',
  TOKEN_EXPIRY_HOURS: 24,
  
  // Configurações de API
  API_TIMEOUT: 10000, // 10 segundos
  
  // Debug logs (apenas em desenvolvimento)
  DEBUG: import.meta.env.DEV || false
};

// Log para debug (apenas em desenvolvimento)
if (AUTH_CONFIG.DEBUG) {
  console.log('🔧 AUTH_CONFIG carregado:', {
    USE_MOCK: AUTH_CONFIG.USE_MOCK,
    API_URL: AUTH_CONFIG.API_URL,
    VITE_USE_MOCK: import.meta.env.VITE_USE_MOCK,
    VITE_API_URL: import.meta.env.VITE_API_URL
  });
}