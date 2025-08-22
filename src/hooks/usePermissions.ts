// // src/hooks/usePermissions.ts
// import { useMemo } from 'react';
// import { useAuth } from '../contexts/AuthContext';
// import type { SectorType, UserRole } from '../types/common.types';
// import type { ContentItem } from '../types/content.types';

// export const usePermissions = () => {
//   const { authState } = useAuth();
//   const { user } = authState;

//   // Memoizar cálculos pesados de permissões
//   const permissions = useMemo(() => {
//     if (!user) {
//       return {
//         isAuthenticated: false,
//         isSuperAdmin: false,
//         isAdmin: false,
//         canCreateContent: false,
//         canEditAnyContent: false,
//         canDeleteAnyContent: false,
//         canManageUsers: false,
//         canAccessAdminPanel: false,
//         currentSector: 'suporte' as SectorType,
//         availableSectors: [] as SectorType[]
//       };
//     }

//     const isSuperAdmin = user.role === 'super_admin';
//     const isAdmin = user.role === 'admin' || isSuperAdmin;
//     const isUser = user.role === 'user';

//     const allSectors: SectorType[] = ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];
    
//     return {
//       isAuthenticated: authState.isAuthenticated,
//       isSuperAdmin,
//       isAdmin,
//       isUser,
      
//       // Permissões de conteúdo
//       canCreateContent: isAdmin,
//       canEditAnyContent: isSuperAdmin,
//       canDeleteAnyContent: isSuperAdmin,
      
//       // Permissões administrativas
//       canManageUsers: isSuperAdmin,
//       canAccessAdminPanel: isAdmin,
//       canCreateUsers: isAdmin,
//       canEditUsers: isSuperAdmin,
//       canDeleteUsers: isSuperAdmin,
      
//       // Informações do usuário
//       currentSector: (user.sector as SectorType) || 'suporte',
//       availableSectors: isSuperAdmin ? allSectors : [user.sector as SectorType],
      
//       // Permissões específicas por setor
//       canAccessAllSectors: isSuperAdmin,
//       ownSectorOnly: !isSuperAdmin
//     };
//   }, [user, authState.isAuthenticated]);

//   // Verificar permissões específicas
//   const canEditContent = (contentSector?: SectorType, createdBy?: any): boolean => {
//     if (!user) return false;
    
//     // Super admin pode editar tudo
//     if (permissions.isSuperAdmin) return true;
    
//     // Admin pode editar apenas conteúdo do seu setor
//     if (user.role === 'admin') {
//       const targetSector = contentSector || permissions.currentSector;
//       return targetSector === user.sector;
//     }
    
//     return false;
//   };

//   const canDeleteContent = (contentSector?: SectorType, contentCreatorId?: string) => {
//     if (!user) return false;
    
//     // Super admin pode excluir qualquer coisa
//     if (permissions.isSuperAdmin) return true;
    
//     // Admin pode excluir conteúdo do seu setor
//     if (permissions.isAdmin && contentSector === user.sector) return true;
    
//     // Usuário pode excluir apenas seu próprio conteúdo (se implementado)
//     if (contentCreatorId && contentCreatorId === user.id) return true;
    
//     return false;
//   };

//   const canAccessSector = (sector: SectorType) => {
//     if (!user) return false;
    
//     // Super admin pode acessar qualquer setor
//     if (permissions.isSuperAdmin) return true;
    
//     // Outros usuários só podem acessar seu próprio setor
//     return user.sector === sector;
//   };

//   const hasRole = (allowedRoles: UserRole[]) => {
//     if (!user?.role) return false;
//     return allowedRoles.includes(user.role);
//   };

//   const hasAnyRole = (roles: UserRole[]) => {
//     return roles.some(role => hasRole([role]));
//   };

//   const hasAllRoles = (roles: UserRole[]) => {
//     return roles.every(role => hasRole([role]));
//   };

//   // Verificar permissões para uma ação específica
//   const can = (action: string, resource?: any) => {
//     switch (action) {
//       case 'create:content':
//         return permissions.canCreateContent;
      
//       case 'edit:content':
//         return canEditContent(resource?.sector, resource?.createdBy);
      
//       case 'delete:content':
//         return canDeleteContent(resource?.sector, resource?.createdBy);
      
//       case 'manage:users':
//         return permissions.canManageUsers;
      
//       case 'access:admin':
//         return permissions.canAccessAdminPanel;
      
//       case 'access:sector':
//         return canAccessSector(resource as SectorType);
      
//       case 'create:user':
//         return permissions.canCreateUsers;
      
//       case 'edit:user':
//         // Super admin pode editar qualquer usuário
//         // Admin pode editar usuários do seu setor (se implementado)
//         return permissions.canEditUsers;
      
//       case 'delete:user':
//         return permissions.canDeleteUsers;
      
//       default:
//         console.warn(`Permissão desconhecida: ${action}`);
//         return false;
//     }
//   };

//   // Obter permissões para um conteúdo específico
//   const getContentPermissions = (content: ContentItem) => {
//     return {
//       canView: canAccessSector(content.sector as SectorType),
//       canEdit: canEditContent(content.sector as SectorType, content.createdBy),
//       canDelete: canDeleteContent(content.sector as SectorType, content.createdBy),
//       canAddTo: canEditContent(content.sector as SectorType, content.createdBy)
//     };
//   };

//   // Filtrar conteúdos baseado nas permissões
//   const filterContentByPermissions = (contents: ContentItem[]) => {
//     return contents.filter(content => 
//       canAccessSector(content.sector as SectorType)
//     );
//   };

//   // Obter setores acessíveis
//   const getAccessibleSectors = (): SectorType[] => {
//     if (permissions.isSuperAdmin) {
//       return ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];
//     }
    
//     return [permissions.currentSector];
//   };

//   // Debug: informações sobre permissões (apenas em desenvolvimento)
//   const getPermissionDebug = () => {
//     if (process.env.NODE_ENV !== 'development') return null;
    
//     return {
//       user: {
//         id: user?.id,
//         name: user?.name,
//         role: user?.role,
//         sector: user?.sector
//       },
//       permissions: {
//         ...permissions,
//         availableActions: [
//           'create:content',
//           'edit:content', 
//           'delete:content',
//           'manage:users',
//           'access:admin'
//         ].filter(action => can(action))
//       }
//     };
//   };

//   return {
//     // Dados básicos
//     user,
//     ...permissions,
    
//     // Métodos de verificação
//     canEditContent,
//     canDeleteContent,
//     canAccessSector,
//     hasRole,
//     hasAnyRole,
//     hasAllRoles,
//     can,
    
//     // Métodos utilitários
//     getContentPermissions,
//     filterContentByPermissions,
//     getAccessibleSectors,
    
//     // Debug (apenas desenvolvimento)
//     getPermissionDebug: getPermissionDebug()
//   };
// };

// export default usePermissions;

// src/hooks/usePermissions.ts
import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';
import type { SectorType, UserRole } from '../types/common.types';
import type { ContentItem } from '../types/content.types';

export const usePermissions = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const location = useLocation();
  
  // Extrair o setor atual da URL
  const getCurrentSector = (): SectorType => {
    const pathSegments = location.pathname.split('/');
    const sectorFromPath = pathSegments[1] as SectorType;
    
    // Lista de setores válidos
    const validSectors: SectorType[] = ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];
    
    if (validSectors.includes(sectorFromPath)) {
      return sectorFromPath;
    }
    
    // Retornar o setor do usuário como fallback
    return (user?.sector as SectorType) || 'suporte';
  };
  
  // Memoizar valores e cálculos para evitar recálculos desnecessários
  const permissions = useMemo(() => {
    const currentSector = getCurrentSector();
    const isSuperAdmin = user?.role === 'super_admin';
    const isAdmin = user?.role === 'admin' || isSuperAdmin;
    
    return {
      currentSector,
      isSuperAdmin,
      isAdmin,
      isAuthenticated: authState.isAuthenticated,
      
      // Permissões específicas
      canCreateContent: isAdmin,
      canAccessAllSectors: isSuperAdmin,
      canManageUsers: isSuperAdmin,
      canCreateUsers: isAdmin,
      
      // Atalhos úteis
      isUserSector: (sector: SectorType) => user?.sector === sector,
      hasRole: (roles: UserRole[]) => user?.role ? roles.includes(user.role) : false
    };
  }, [user, authState.isAuthenticated, location.pathname]);
  
  // Função para verificar se pode editar conteúdo
  const canEditContent = (contentSector?: SectorType): boolean => {
    if (!user) return false;
    
    // Super admin pode editar tudo
    if (permissions.isSuperAdmin) return true;
    
    // Admin pode editar apenas conteúdo do seu setor
    if (user.role === 'admin') {
      // Se não foi especificado um setor de conteúdo, assume o setor atual
      const targetSector = contentSector || permissions.currentSector;
      return targetSector === user.sector;
    }
    
    // Usuários normais não podem editar
    return false;
  };
  
  // Função para verificar se pode acessar um setor
  const canAccessSector = (sector: SectorType): boolean => {
    if (!user) return false;
    
    // Super admin pode acessar todos os setores
    if (permissions.isSuperAdmin) return true;
    
    // Outros usuários só podem acessar seu próprio setor
    return user.sector === sector;
  };
  
  // Função para verificar se pode deletar conteúdo
  const canDeleteContent = (contentSector?: SectorType): boolean => {
    return canEditContent(contentSector);
  };
  
  // Função para verificar se pode adicionar conteúdo incremental
  const canAddToContent = (contentSector?: SectorType): boolean => {
    return canEditContent(contentSector);
  };
  
  // Obter permissões para um conteúdo específico
  const getContentPermissions = (content: ContentItem) => {
    return {
      canView: canAccessSector(content.sector as SectorType),
      canEdit: canEditContent(content.sector as SectorType),
      canDelete: canDeleteContent(content.sector as SectorType),
      canAddTo: canAddToContent(content.sector as SectorType)
    };
  };

  // Obter setores acessíveis pelo usuário atual
  const getAccessibleSectors = (): SectorType[] => {
    if (permissions.isSuperAdmin) {
      return ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];
    }
    
    return [permissions.currentSector];
  };
  
  return {
    // Valores memoizados
    ...permissions,
    
    // Funções de verificação
    canEditContent,
    canAccessSector,
    canDeleteContent,
    canAddToContent,
    getContentPermissions,
    getAccessibleSectors,
    
    // Atalhos adicionais
    canEdit: () => canEditContent(permissions.currentSector)
  };
};

export default usePermissions;