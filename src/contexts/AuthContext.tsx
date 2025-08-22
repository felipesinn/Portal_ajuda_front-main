/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   isMaster: boolean;
//   sector?: string;
//   permissions: string[];
// }

// interface AuthState {
//   isAuthenticated: boolean;
//   user: User | null;
//   loading: boolean;
// }

// interface AuthContextType {
//   authState: AuthState;
//   login: (email: string, password: string) => Promise<void>;
//   logout: () => void;
// }

// const AuthContext = createContext<AuthContextType | undefined>(undefined);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
//   const [authState, setAuthState] = useState<AuthState>({
//     isAuthenticated: false,
//     user: null,
//     loading: true
//   });

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const response = await fetch('/api/auth/me', {
//           credentials: 'include'
//         });

//         if (response.ok) {
//           const user = await response.json();
//           setAuthState({
//             isAuthenticated: true,
//             user,
//             loading: false
//           });
//         } else {
//           setAuthState({
//             isAuthenticated: false,
//             user: null,
//             loading: false
//           });
//         }
//       } catch (error) {
//         console.error('Erro ao verificar autenticação:', error);
//         setAuthState({
//           isAuthenticated: false,
//           user: null,
//           loading: false
//         });
//       }
//     };

//     checkAuth();
//   }, []);

//   const login = async (email: string, password: string) => {
//     try {
//       const response = await fetch('/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ email, password }),
//         credentials: 'include'
//       });

//       if (!response.ok) {
//         throw new Error('Credenciais inválidas');
//       }

//       const data = await response.json();

//       setAuthState({
//         isAuthenticated: true,
//         user: data.user,
//         loading: false
//       });
//     } catch (error) {
//       console.error('Erro no login:', error);
//       throw error;
//     }
//   };

//   const logout = async () => {
//     try {
//       await fetch('/api/auth/logout', {
//         method: 'POST',
//         credentials: 'include'
//       });
//     } catch (error) {
//       console.error('Erro ao fazer logout:', error);
//     } finally {
//       setAuthState({
//         isAuthenticated: false,
//         user: null,
//         loading: false
//       });
//     }
//   };

//   return (
//     <AuthContext.Provider value={{ authState, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuth deve ser usado dentro de um AuthProvider');
//   }
//   return context;
// };

// import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
// import { authService } from '../services/auth.service';
// import { AUTH_CONFIG } from '../config/auth.config';
// import type { LoginCredentials, AuthState } from '../types/auth.types';

// interface AuthContextType {
//   authState: AuthState;
//   login: (credentials: LoginCredentials) => Promise<void>;
//   logout: () => void;
//   isLoading: boolean;
//   authMode: { isMock: boolean; mode: string };
// }

// const AuthContext = createContext<AuthContextType | null>(null);

// export const useAuth = (): AuthContextType => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth deve ser usado dentro de um AuthProvider');
//   }
//   return context;
// };

// interface AuthProviderProps {
//   children: ReactNode;
// }

// const initialState: AuthState = {
//   user: null,
//   isAuthenticated: false,
//   loading: true,
//   error: null
// };

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [authState, setAuthState] = useState<AuthState>(initialState);
  
//   // Obter modo de autenticação
//   const authMode = authService.getAuthMode();
  
//   useEffect(() => {
//     const checkAuth = async () => {
//       setAuthState(prev => ({ ...prev, loading: true }));
      
//       try {
//         console.log(`🔄 Verificando autenticação em modo: ${authMode.mode}`);
        
//         const user = await authService.checkAuthentication();
        
//         if (user) {
//           setAuthState({
//             user,
//             isAuthenticated: true,
//             loading: false,
//             error: null
//           });
//           console.log(`✅ Usuário autenticado: ${user.name} (${authMode.mode})`);
//         } else {
//           setAuthState({
//             user: null,
//             isAuthenticated: false,
//             loading: false,
//             error: null
//           });
//           console.log(`❌ Usuário não autenticado (${authMode.mode})`);
//         }
//       } catch (error) {
//         console.error('Erro ao verificar autenticação:', error);
//         setAuthState({
//           user: null,
//           isAuthenticated: false,
//           loading: false,
//           error: 'Erro ao verificar autenticação'
//         });
//       }
//     };
    
//     checkAuth();
//   }, [authMode.mode]);

//   const login = async (credentials: LoginCredentials): Promise<void> => {
//     setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
//     try {
//       console.log(`🔐 Iniciando login em modo: ${authMode.mode}`);
      
//       const response = await authService.login(credentials);
      
//       setAuthState({
//         user: response.user,
//         isAuthenticated: true,
//         loading: false,
//         error: null
//       });
      
//       console.log(`✅ Login realizado com sucesso (${authMode.mode})`);
//     } catch (error) {
//       console.error(`❌ Erro no login (${authMode.mode}):`, error);
      
//       let errorMessage = 'Credenciais inválidas';
      
//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }
      
//       setAuthState({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: errorMessage
//       });
      
//       throw new Error(errorMessage);
//     }
//   };

//   const logout = async (): Promise<void> => {
//     try {
//       console.log(`🚪 Fazendo logout em modo: ${authMode.mode}`);
//       await authService.logout();
      
//       setAuthState({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: null
//       });
      
//       console.log(`✅ Logout realizado (${authMode.mode})`);
//     } catch (error) {
//       console.error('Erro ao fazer logout:', error);
      
//       // Mesmo com erro, limpar estado local
//       setAuthState({
//         user: null,
//         isAuthenticated: false,
//         loading: false,
//         error: null
//       });
//     }
//   };

//   return (
//     <AuthContext.Provider 
//       value={{ 
//         authState, 
//         login, 
//         logout,
//         isLoading: authState.loading,
//         authMode
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export default AuthContext;

import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type { User, LoginCredentials, AuthState } from '../types/auth.types';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  useEffect(() => {
    const checkAuth = async () => {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      try {
        const initialState = authService.getInitialAuthState();
        setAuthState(initialState);
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          loading: false,
          error: 'Erro ao verificar autenticação'
        });
      }
    };
    
    checkAuth();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      console.log('🔐 Iniciando login com:', credentials.email);
      
      const response = await authService.login(credentials);
      console.log('✅ Login bem-sucedido:', response.user);
      
      setAuthState({
        user: response.user,
        isAuthenticated: true,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('❌ Erro ao fazer login:', error);
      
      let errorMessage = 'Credenciais inválidas';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        loading: false,
        error: errorMessage
      });
      
      throw error;
    }
  };

  const logout = (): void => {
    console.log('🚪 Fazendo logout');
    authService.logout();
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        authState, 
        login, 
        logout,
        isLoading: authState.loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;