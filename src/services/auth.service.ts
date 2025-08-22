// src/services/auth.service.ts - VERSÃO FINAL LIMPA
// import { api, STRAPI_CONFIG } from './api';
// import type { LoginCredentials, LoginResponse, User, AuthState } from '../types/auth.types';
// import type { UserRole, UserSector } from '../types/common.types';

// class AuthService {
//   async login(credentials: LoginCredentials): Promise<LoginResponse> {
//     try {
//       console.log('🌐 Fazendo login no Strapi...');
      
//       const response = await api.post('/auth/local', {
//         identifier: credentials.email,
//         password: credentials.password
//       });
      
//       const token = response.data.jwt;
//       const user = response.data.user;
      
//       console.log('📊 Dados brutos do Strapi:', user);
      
//       // Armazenar token e usuário
//       this.setToken(token);
//       this.setUser(this.transformUser(user));
      
//       console.log('✅ Login Strapi bem-sucedido:', user.email);
      
//       return {
//         token,
//         user: this.transformUser(user)
//       };
//     } catch (error: any) {
//       console.error('❌ Erro no login Strapi:', error);
      
//       if (error.response) {
//         const errorData = error.response.data?.error;
//         const status = error.response.status;
        
//         switch (status) {
//           case 400:
//             if (errorData?.message?.includes('blocked')) {
//               throw new Error('Sua conta foi bloqueada pelo administrador');
//             } else if (errorData?.message?.includes('Invalid')) {
//               throw new Error('Email ou senha incorretos');
//             } else {
//               throw new Error(errorData?.message || 'Dados de login inválidos');
//             }
//           case 401:
//             throw new Error('Email ou senha incorretos');
//           case 403:
//             throw new Error('Conta desativada ou sem permissão');
//           default:
//             throw new Error(errorData?.message || 'Erro no servidor');
//         }
//       } else if (error.request) {
//         throw new Error('Erro de conexão. Verifique se o Strapi está rodando');
//       } else {
//         throw new Error('Erro desconhecido: ' + error.message);
//       }
//     }
//   }
  
//   async checkAuthentication(): Promise<User | null> {
//     const token = localStorage.getItem('token');
//     if (!token) return null;
    
//     try {
//       const response = await api.get('/users/me');
//       const user = this.transformUser(response.data);
//       this.setUser(user);
//       return user;
//     } catch (error) {
//       console.error('Token inválido:', error);
//       this.logout();
//       return null;
//     }
//   }
  
//   logout(): void {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     console.log('🚪 Logout realizado');
//   }
  
//   private transformUser(strapiUser: any): User {
//     console.log('🔄 Transformando usuário Strapi:', strapiUser);
    
//     const transformedUser = {
//       id: String(strapiUser.id),
//       name: strapiUser.username || strapiUser.email.split('@')[0],
//       email: strapiUser.email,
//       role: this.mapStrapiRole(strapiUser.userRole),
//       sector: this.mapStrapiSector(strapiUser.sector),
//       isActive: strapiUser.isActive !== false,
//       avatar: strapiUser.avatar,
//       createdAt: strapiUser.createdAt,
//       updatedAt: strapiUser.updatedAt
//     };
    
//     console.log('✅ Usuário transformado:', transformedUser);
//     return transformedUser;
//   }
  
//   /**
//    * Mapeia roles do Strapi para o formato do frontend
//    */
//   private mapStrapiRole(strapiRole: string): UserRole {
//     const roleMap: Record<string, UserRole> = {
//       'user': 'user',
//       'admin': 'admin', 
//       'super_admin': 'super_admin',
//       'super': 'super_admin',
//       'viewer': 'user'
//     };
    
//     const mappedRole = roleMap[strapiRole] || 'user';
//     console.log(`🔄 Role mapeado: ${strapiRole} -> ${mappedRole}`);
//     return mappedRole;
//   }
  
//   /**
//    * Mapeia setores do Strapi para o formato do frontend
//    */
//   private mapStrapiSector(strapiSector: string): UserSector {
//     const sectorMap: Record<string, UserSector> = {
//       'suporte': 'suporte',
//       'tecnico': 'tecnico', 
//       'noc': 'noc',
//       'comercial': 'comercial',
//       'adm': 'adm',
//       'geral': 'suporte'
//     };
    
//     const mappedSector = sectorMap[strapiSector] || 'suporte';
//     console.log(`🔄 Setor mapeado: ${strapiSector} -> ${mappedSector}`);
//     return mappedSector;
//   }
  
//   getCurrentUser(): User | null {
//     const userStr = localStorage.getItem('user');
//     if (!userStr) return null;
    
//     try {
//       return JSON.parse(userStr);
//     } catch (error) {
//       console.error('Erro ao obter usuário atual:', error);
//       this.logout();
//       return null;
//     }
//   }
  
//   isAuthenticated(): boolean {
//     return !!localStorage.getItem('token');
//   }
  
//   getInitialAuthState(): AuthState {
//     return {
//       user: this.getCurrentUser(),
//       isAuthenticated: this.isAuthenticated(),
//       loading: false,
//       error: null
//     };
//   }
  
//   private setToken(token: string): void {
//     localStorage.setItem('token', token);
//   }
  
//   private setUser(user: User): void {
//     localStorage.setItem('user', JSON.stringify(user));
//   }
// }

// export const authService = new AuthService();

import { api, TokenManager } from './api';
import type { LoginCredentials, LoginResponse, User, AuthState } from '../types/auth.types';
import type { UserRole, UserSector } from '../types/common.types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      console.log('🌐 Fazendo login no Strapi...');
      
      const response = await api.post('/auth/local', {
        identifier: credentials.email,
        password: credentials.password
      });
      
      const token = response.data.jwt;
      const user = response.data.user;
      
      if (import.meta.env.DEV) {
        console.log('📊 Dados brutos do Strapi:', user);
      }
      
      // ✅ CORREÇÃO: Usar TokenManager do api.ts
      const transformedUser = this.transformUser(user);
      TokenManager.setToken(token);
      TokenManager.setUser(transformedUser);
      
      if (import.meta.env.DEV) {
        console.log('✅ Login Strapi bem-sucedido:', user.email);
      }
      
      return {
        token,
        user: transformedUser
      };
    } catch (error: any) {
      console.error('❌ Erro no login Strapi:', error);
      
      if (error.response) {
        const errorData = error.response.data?.error;
        const status = error.response.status;
        
        switch (status) {
          case 400:
            if (errorData?.message?.includes('blocked')) {
              throw new Error('Sua conta foi bloqueada pelo administrador');
            } else if (errorData?.message?.includes('Invalid')) {
              throw new Error('Email ou senha incorretos');
            } else {
              throw new Error(errorData?.message || 'Dados de login inválidos');
            }
          case 401:
            throw new Error('Email ou senha incorretos');
          case 403:
            throw new Error('Conta desativada ou sem permissão');
          default:
            throw new Error(errorData?.message || 'Erro no servidor');
        }
      } else if (error.request) {
        throw new Error('Erro de conexão. Verifique se o Strapi está rodando');
      } else {
        throw new Error('Erro desconhecido: ' + error.message);
      }
    }
  }
  
  async checkAuthentication(): Promise<User | null> {
    const token = TokenManager.getToken();
    if (!token) return null;
    
    try {
      // ✅ Token será adicionado automaticamente pelo interceptor
      const response = await api.get('/users/me');
      const user = this.transformUser(response.data);
      TokenManager.setUser(user);
      return user;
    } catch (error) {
      console.error('Token inválido:', error);
      this.logout();
      return null;
    }
  }
  
  logout(): void {
    // ✅ CORREÇÃO: Usar TokenManager
    TokenManager.clear();
    
    // ✅ Limpar apenas dados não sensíveis do localStorage
    localStorage.removeItem('theme');
    localStorage.removeItem('preferences');
    localStorage.removeItem('lastVisitedSector');
    
    if (import.meta.env.DEV) {
      console.log('🚪 Logout realizado');
    }
  }
  
  private transformUser(strapiUser: any): User {
    if (import.meta.env.DEV) {
      console.log('🔄 Transformando usuário Strapi:', strapiUser);
    }
    
    const transformedUser: User = {
      id: String(strapiUser.id),
      name: strapiUser.username || (strapiUser.email ? strapiUser.email.split('@')[0] : 'Usuário'),
      email: strapiUser.email || '',
      role: this.mapStrapiRole(strapiUser.userRole),
      sector: this.mapStrapiSector(strapiUser.sector),
      isActive: strapiUser.isActive !== false,
      avatar: strapiUser.avatar,
      createdAt: strapiUser.createdAt,
      updatedAt: strapiUser.updatedAt
    };
    
    if (import.meta.env.DEV) {
      console.log('✅ Usuário transformado:', transformedUser);
    }
    return transformedUser;
  }
  
  /**
   * Mapeia roles do Strapi para o formato do frontend
   */
  private mapStrapiRole(strapiRole: string): UserRole {
    const roleMap: Record<string, UserRole> = {
      'user': 'user',
      'admin': 'admin', 
      'super_admin': 'super_admin',
      'super': 'super_admin',
      'viewer': 'user'
    };
    
    const mappedRole = roleMap[strapiRole] || 'user';
    if (import.meta.env.DEV) {
      console.log(`🔄 Role mapeado: ${strapiRole} -> ${mappedRole}`);
    }
    return mappedRole;
  }
  
  /**
   * Mapeia setores do Strapi para o formato do frontend
   */
  private mapStrapiSector(strapiSector: string): UserSector {
    const sectorMap: Record<string, UserSector> = {
      'suporte': 'suporte',
      'tecnico': 'tecnico', 
      'noc': 'noc',
      'comercial': 'comercial',
      'adm': 'adm',
      'geral': 'suporte'
    };
    
    const mappedSector = sectorMap[strapiSector] || 'suporte';
    if (import.meta.env.DEV) {
      console.log(`🔄 Setor mapeado: ${strapiSector} -> ${mappedSector}`);
    }
    return mappedSector;
  }
  
  getCurrentUser(): User | null {
    // ✅ CORREÇÃO: Usar TokenManager
    return TokenManager.getUser();
  }
  
  isAuthenticated(): boolean {
    // ✅ CORREÇÃO: Usar TokenManager
    return TokenManager.isAuthenticated();
  }
  
  getInitialAuthState(): AuthState {
    return {
      user: this.getCurrentUser(),
      isAuthenticated: this.isAuthenticated(),
      loading: false,
      error: null
    };
  }
  
  // ✅ ADIÇÃO: Método para obter token (se necessário em outros lugares)
  getToken(): string | null {
    return TokenManager.getToken();
  }
}

export const authService = new AuthService();