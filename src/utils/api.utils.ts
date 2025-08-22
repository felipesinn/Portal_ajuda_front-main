// // src/utils/api.utils.ts
// import api from '../services/api';

// /**
//  * Função utilitária para excluir conteúdo com verificações detalhadas
//  */
// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export async function deleteContentSafely(id: any): Promise<{
//   statusCode: number; success: boolean; message: string 
// }> {
//   try {
//     // Converte ID para o formato correto se necessário
//     const contentId = typeof id === 'object' ? id.id || id._id : id;
    
//     // Log para diagnóstico
//     console.log('Excluindo conteúdo com ID:', contentId, 'Tipo:', typeof contentId);
    
//     // Primeira tentativa: com o endpoint "contents" (plural)
//     try {
//       console.log('Tentando excluir com endpoint no plural (/contents)');
//       const response = await api.delete(`/contents/${contentId}`);
//       console.log('Resposta da exclusão (contents):', response);
      
//       return { 
//         success: true, 
//         message: response.data?.message || 'Conteúdo excluído com sucesso' 
//       };
//     } catch (pluralError) {
//       if (pluralError instanceof Error && (pluralError as any)?.response) {
//         console.log('Falha ao excluir com endpoint no plural:', (pluralError as any).response?.status);
//       } else {
//         console.log('Falha ao excluir com endpoint no plural:', pluralError);
//       }
      
//       // Segunda tentativa: com o endpoint "content" (singular)
//       try {
//         console.log('Tentando excluir com endpoint no singular (/content)');
//         const response = await api.delete(`/content/${contentId}`);
//         console.log('Resposta da exclusão (content):', response);
        
//         return { 
//           success: true, 
//           message: response.data?.message || 'Conteúdo excluído com sucesso' 
//         };
//       } catch (singularError) {
//         // Se ambos os endpoints falharem, verificar se algum deles é 404
//         if ((pluralError as any)?.response?.status === 404 || (singularError as any)?.response?.status === 404) {
//           console.log('Conteúdo não encontrado (404) - considerando como já excluído');
//           return {
//             success: true,
//             message: 'Conteúdo não encontrado. Ele pode já ter sido excluído.'
//           };
//         }
        
//         // Se nenhum for 404, lançar o erro mais recente
//         throw singularError;
//       }
//     }
//   } catch (error) {
//     console.error('Erro detalhado na exclusão:', error);
    
//     // Extrair mensagem de erro para usuário
//     let errorMessage = 'Não foi possível excluir o conteúdo.';
    
//     if (error instanceof Error && (error as any).response) {
//       const status = (error as any)?.response?.status;
//       const apiMessage = (error as any)?.response?.data?.message;
      
//       switch (status) {
//         case 401:
//           errorMessage = 'Você não tem permissão para excluir este conteúdo.';
//           break;
//         case 403:
//           errorMessage = 'Acesso negado. Você não tem permissões suficientes.';
//           break;
//         case 404:
//           // Este caso não deveria ocorrer aqui pois já tratamos 404 acima
//           return { 
//             success: true, 
//             message: 'Conteúdo não encontrado. Ele pode já ter sido excluído.' 
//           };
//         case 500:
//           errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
//           break;
//         default:
//           errorMessage = apiMessage || errorMessage;
//       }
//     } else if (error instanceof Error && 'request' in error) {
//       // Erro de rede
//       errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
//     }
    
//     return { success: false, message: errorMessage };
//   }
// }

// api.utils.ts - Solução universal para exclusão de conteúdo

// src/utils/api.utils.ts
import { api } from './../services/api';


/**
 * Interface para resultado padronizado da exclusão
 */
export interface DeleteResult {
  success: boolean;
  message: string;
  statusCode?: number;
}

/**
 * Função utilitária para excluir conteúdo com verificações detalhadas
 */
export async function deleteContentSafely(id: any): Promise<DeleteResult> {
  try {
    // Converte ID para o formato correto se necessário
    const contentId = typeof id === 'object' ? id.id || id._id : id;
    
    console.log(`🗑️ Excluindo conteúdo com ID: ${contentId} (Tipo: ${typeof contentId})`);
    
    // Tentar o endpoint PLURAL primeiro (que é o correto segundo contentService.ts)
    try {
      console.log(`🔄 Tentativa 1: DELETE /contents/${contentId}`);
      const response = await api.delete(`/contents/${contentId}`);
      
      console.log(`✅ Exclusão bem-sucedida via /contents/${contentId}:`, response);
      return { 
        success: true,
        statusCode: response.status, 
        message: response.data?.message || 'Conteúdo excluído com sucesso' 
      };
    } catch (error1: any) {
      console.log(`❌ Falha na primeira tentativa: ${error1?.response?.status || 'Erro sem status'}`);
      
      // Se não for 404, propagar o erro
      if (error1.response && error1.response.status !== 404) {
        throw error1;
      }
      
      // Tentar o endpoint SINGULAR como fallback
      try {
        console.log(`🔄 Tentativa 2: DELETE /content/${contentId}`);
        const response = await api.delete(`/content/${contentId}`);
        
        console.log(`✅ Exclusão bem-sucedida via /content/${contentId}:`, response);
        return { 
          success: true,
          statusCode: response.status, 
          message: response.data?.message || 'Conteúdo excluído com sucesso' 
        };
      } catch (error2: any) {
        console.log(`❌ Falha na segunda tentativa: ${error2?.response?.status || 'Erro sem status'}`);
        
        // Se ambos os endpoints falharam com 404, tratamos como "já excluído"
        if (error2.response && error2.response.status === 404) {
          console.log('⚠️ Ambos os endpoints retornaram 404 - considerando como já excluído');
          return {
            success: true,
            statusCode: 404,
            message: 'Conteúdo não encontrado. Ele pode já ter sido excluído.'
          };
        }
        
        // Se não for 404, propagar o erro
        throw error2;
      }
    }
  } catch (error: any) {
    console.error('❌ Erro detalhado na exclusão:', error);
    
    // Extrair mensagem e código de erro
    let errorMessage = 'Não foi possível excluir o conteúdo.';
    let statusCode = error.response?.status || 500;
    
    if (error.response) {
      const apiMessage = error.response.data?.message;
      
      switch (statusCode) {
        case 401:
          errorMessage = 'Você não tem permissão para excluir este conteúdo.';
          break;
        case 403:
          errorMessage = 'Acesso negado. Você não tem permissões suficientes.';
          break;
        case 404:
          errorMessage = 'Conteúdo não encontrado. Ele pode já ter sido excluído.';
          break;
        case 500:
          errorMessage = 'Erro no servidor. Tente novamente mais tarde.';
          break;
        default:
          errorMessage = apiMessage || errorMessage;
      }
    } else if (error.request) {
      // Erro de rede
      errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
    }
    
    return { 
      success: false, 
      statusCode, 
      message: errorMessage 
    };
  }
}