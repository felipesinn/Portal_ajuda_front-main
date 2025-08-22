import { useState, useCallback, useEffect, useRef } from 'react';
import { contentService } from '../services/content.service';
import { ContentType, type ContentItem, type CreateContentData, type UpdateContentData } from '../types/content.types';
import type { SectorType } from '../types/common.types';
import {
  safeLog,
  safeWarn,
  safeError,
  safeTime,
  safeTimeEnd,
  performanceLog
} from '../utils/envUtils';

interface UseContentOptions {
  sector?: SectorType;
  autoLoad?: boolean;
}

interface UseContentReturn {
  // Estado
  contents: ContentItem[];
  loading: boolean;
  error: string | null;

  // Ações básicas
  loadContents: () => Promise<void>;
  refreshContents: () => Promise<void>;

  // CRUD de conteúdo
  createContent: (data: CreateContentData) => Promise<ContentItem>;
  updateContent: (id: string, data: UpdateContentData) => Promise<ContentItem>;
  deleteContent: (id: string) => Promise<boolean>;

  // Wiki Additions
  createWikiAddition: (data: {
    contentId: string;
    title: string;
    textContent: string;
    type: ContentType;
    file?: File;
    author?: string;
  }) => Promise<boolean>;
  deleteWikiAddition: (id: string | number) => Promise<boolean>;
  updateWikiAddition: (id: string | number, data: {
    title?: string;
    textContent?: string;
    file?: File;
  }) => Promise<boolean>;

  // Upload de arquivos
  uploadFile: (file: File) => Promise<any>;
  deleteFile: (fileId: string) => Promise<boolean>;

  // Utilitários
  getContentById: (id: string | number) => ContentItem | undefined;
  clearError: () => void;
}

// Helper function para sanitizar dados de log
const sanitizeLogData = (data: any): any => {
  if (!data) return data;

  const sanitized = { ...data };
  if (sanitized.file && sanitized.file instanceof File) {
    sanitized.file = `[File: ${sanitized.file.name}, ${sanitized.file.size} bytes]`;
  }
  return sanitized;
};

// Helper function para criar timestamp consistente
const getTimestamp = () => new Date().toISOString();

export const useContent = (options: UseContentOptions = {}): UseContentReturn => {
  const { sector, autoLoad = true } = options;

  // Estado
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ref para evitar múltiplas chamadas simultâneas
  const loadingRef = useRef(false);

  // Utilitário para notificações (se você tiver um sistema de notificações)
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    // Implementar de acordo com seu sistema de notificações
    safeLog(`📢 Notification (${type}): ${message}`);
  }, []);

  // Função genérica para tratamento de erros
  const handleError = useCallback((
    operation: string,
    error: any,
    additionalData?: any
  ) => {
    const errorMessage = error?.message || `Erro ao ${operation}`;
    safeError(`❌ useContent: Erro ao ${operation}:`, {
      error: errorMessage,
      stack: error?.stack,
      ...sanitizeLogData(additionalData),
      timestamp: getTimestamp()
    });
    setError(errorMessage);
    showNotification(errorMessage, 'error');
    return errorMessage;
  }, [showNotification]);

  // Carregar conteúdos com debounce para evitar chamadas múltiplas
  const loadContents = useCallback(async () => {
    if (loadingRef.current) {
      safeLog('⏳ useContent: Operação de carregamento já em andamento, ignorando...');
      return;
    }

    const startTime = performance.now();
    const timerLabel = 'useContent-loadContents';
    safeTime(timerLabel);
    loadingRef.current = true;

    setLoading(true);
    setError(null);

    try {
      safeLog('🔄 useContent: Carregando conteúdos...', {
        sector,
        timestamp: getTimestamp(),
        autoLoad
      });

      const data = sector
        ? await contentService.getContentsBySector(sector)
        : await contentService.getAllContents();

      safeLog('✅ useContent: Conteúdos carregados com sucesso:', {
        count: data.length,
        timestamp: getTimestamp()
      });

      setContents(data);
    } catch (err: any) {
      handleError('carregar conteúdos', err, { sector });
    } finally {
      setLoading(false);
      loadingRef.current = false;
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [sector, handleError]);

  // Recarregar conteúdos
  const refreshContents = useCallback(() => {
    safeLog('🔄 useContent: Recarregando conteúdos...');
    return loadContents();
  }, [loadContents]);

  // Criar conteúdo
  const createContent = useCallback(async (data: CreateContentData): Promise<ContentItem> => {
    const startTime = performance.now();
    const timerLabel = 'useContent-createContent';
    safeTime(timerLabel);

    setLoading(true);
    setError(null);

    try {
      safeLog('🔄 useContent: Criando conteúdo...', {
        ...sanitizeLogData(data),
        timestamp: getTimestamp()
      });

      const newContent = await contentService.createContent(data);

      safeLog('✅ useContent: Conteúdo criado com sucesso:', {
        id: newContent.id,
        title: newContent.title,
        timestamp: getTimestamp()
      });

      // Atualização otimista do estado
      setContents(prev => [...prev, newContent]);
      showNotification('Conteúdo criado com sucesso!');

      return newContent;
    } catch (err: any) {
      handleError('criar conteúdo', err, data);
      throw err;
    } finally {
      setLoading(false);
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [handleError, showNotification]);

  // Atualizar conteúdo
  const updateContent = useCallback(async (id: string, data: UpdateContentData): Promise<ContentItem> => {
    const startTime = performance.now();
    const timerLabel = 'useContent-updateContent';
    safeTime(timerLabel);

    setLoading(true);
    setError(null);

    try {
      safeLog('🔄 useContent: Atualizando conteúdo...', {
        id,
        ...sanitizeLogData(data),
        timestamp: getTimestamp()
      });

      const updatedContent = await contentService.updateContent(id, data);

      safeLog('✅ useContent: Conteúdo atualizado com sucesso:', {
        id: updatedContent.id,
        title: updatedContent.title,
        timestamp: getTimestamp()
      });

      // Atualização otimista do estado
      setContents(prev => prev.map(item => item.id === id ? updatedContent : item));
      showNotification('Conteúdo atualizado com sucesso!');

      return updatedContent;
    } catch (err: any) {
      handleError('atualizar conteúdo', err, { id, ...data });
      throw err;
    } finally {
      setLoading(false);
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [handleError, showNotification]);

  // Excluir conteúdo
  const deleteContent = useCallback(async (id: string): Promise<boolean> => {
    const startTime = performance.now();
    const timerLabel = 'useContent-deleteContent';
    safeTime(timerLabel);

    setLoading(true);
    setError(null);

    // Store original state for rollback
    const originalContents = contents;

    try {
      safeLog('🔄 useContent: Excluindo conteúdo...', {
        id,
        timestamp: getTimestamp()
      });

      // Atualização otimista
      setContents(prev => prev.filter(item => item.id !== id));

      const deleteResult = await contentService.deleteContent(id);
      // Assumindo que deleteContent retorna um objeto com propriedade success ou boolean direto
      const success = typeof deleteResult === 'boolean' ? deleteResult : Boolean(deleteResult?.success);

      if (success) {
        safeLog('✅ useContent: Conteúdo excluído com sucesso:', {
          id,
          timestamp: getTimestamp()
        });
        showNotification('Conteúdo excluído com sucesso!');
      } else {
        // Rollback on failure
        setContents(originalContents);
        safeWarn('⚠️ useContent: Falha ao excluir conteúdo, revertendo estado...', { id });
        showNotification('Erro ao excluir conteúdo', 'error');
      }

      return success;
    } catch (err: any) {
      // Rollback on error
      setContents(originalContents);
      handleError('excluir conteúdo', err, { id });
      return false;
    } finally {
      setLoading(false);
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [contents, handleError, showNotification]);

  // Criar adição de wiki
  const createWikiAddition = useCallback(async (data: {
    contentId: string;
    title: string;
    textContent: string;
    type: ContentType;
    file?: File;
    author?: string;
  }): Promise<boolean> => {
    const startTime = performance.now();
    const timerLabel = 'useContent-createWikiAddition';
    safeTime(timerLabel);

    setLoading(true);
    setError(null);

    try {
      const parentContent = contents.find(c => c.id === data.contentId);

      if (!parentContent) {
        throw new Error(`Conteúdo pai não encontrado (ID: ${data.contentId})`);
      }

      safeLog('🔄 useContent: Criando adição de wiki...', {
        ...sanitizeLogData(data),
        parentContentId: parentContent.id,
        parentContentTitle: parentContent.title,
        timestamp: getTimestamp()
      });

      const result = await contentService.createWikiAddition(data.contentId, {
        fileId: undefined,
        title: data.title,
        textContent: data.textContent,
        file: data.file
      }, data);
      const success = Boolean(result?.success);

      if (success) {
        safeLog('✅ useContent: Adição de wiki criada com sucesso:', {
          contentId: data.contentId,
          title: data.title,
          timestamp: getTimestamp()
        });

        // Recarregar conteúdos para obter a nova adição
        await loadContents();
        showNotification('Adição criada com sucesso!');
      } else {
        safeWarn('⚠️ useContent: Falha ao criar adição de wiki');
        showNotification('Erro ao criar adição', 'error');
      }

      return success;
    } catch (err: any) {
      handleError('criar adição de wiki', err, data);
      return false;
    } finally {
      setLoading(false);
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [contents, loadContents, handleError, showNotification]);

  // Excluir adição de wiki
  // const deleteWikiAddition = useCallback(async (id: string | number): Promise<boolean> => {
  //   const startTime = performance.now();
  //   const timerLabel = 'useContent-deleteWikiAddition';
  //   safeTime(timerLabel);

  //   setLoading(true);
  //   setError(null);

  //   // Store original state for rollback
  //   const originalContents = contents;

  //   console.log('Tentando apagar adição com ID:', id);

  //   try {
  //     safeLog('🔄 useContent: Excluindo adição de wiki...', {
  //       id,
  //       timestamp: getTimestamp()
  //     });

  //     // Atualização otimista
  //     setContents(prevContents => prevContents.map(content => ({
  //       ...content,
  //       wikiAdditions: content.wikiAdditions?.filter((add: { id: any; }) => String(add.id) !== String(id))
  //     })));

  //     const deleteResult = await contentService.deleteWikiAddition(id);
  //     // Ajuste para lidar com diferentes tipos de retorno
  //     const success = typeof deleteResult === 'boolean' ? deleteResult : Boolean(deleteResult?.success);

  //     if (success) {
  //       safeLog('✅ useContent: Adição de wiki excluída com sucesso:', {
  //         id,
  //         timestamp: getTimestamp()
  //       });
  //       showNotification('Adição excluída com sucesso!');
  //     } else {
  //       // Rollback on failure
  //       setContents(originalContents);
  //       safeWarn('⚠️ useContent: Falha ao excluir adição de wiki, revertendo estado...', { id });
  //       showNotification('Erro ao excluir adição', 'error');
  //     }

  //     return success;
  //   } catch (err: any) {
  //     // Rollback on error
  //     setContents(originalContents);
  //     handleError('excluir adição de wiki', err, { id });
  //     return false;
  //   } finally {
  //     setLoading(false);
  //     safeTimeEnd(timerLabel);
  //     const endTime = performance.now();
  //     performanceLog(timerLabel, startTime, endTime);
  //   }
  // }, [contents, handleError, showNotification]);

const deleteWikiAddition = useCallback(async (id: string | number): Promise<boolean> => {
  const startTime = performance.now();
  const timerLabel = 'useContent-deleteWikiAddition';
  safeTime(timerLabel);

  setLoading(true);
  setError(null);

  // Store original state for rollback
  const originalContents = contents;

  console.log('Tentando apagar adição com ID:', id);

  try {
    safeLog('🔄 useContent: Excluindo adição de wiki...', {
      id,
      timestamp: getTimestamp()
    });

    // Atualização otimista
    const updatedContents = contents.map(content => ({
      ...content,
      wikiAdditions: content.wikiAdditions?.filter((add: { id: number; }) => String(add.id) !== String(id))
    }));
    console.log('Atualização otimista:', updatedContents);

    setContents(updatedContents);

    const deleteResult = await contentService.deleteWikiAddition(id);
    console.log('Resultado da exclusão:', deleteResult);

    // Ajuste para lidar com diferentes tipos de retorno
    const success = typeof deleteResult === 'boolean' ? deleteResult : Boolean(deleteResult?.success);
    console.log('Sucesso:', success);

    if (success) {
      safeLog('✅ useContent: Adição de wiki excluída com sucesso:', {
        id,
        timestamp: getTimestamp()
      });
      showNotification('Adição excluída com sucesso!');
    } else {
      // Rollback on failure
      setContents(originalContents);
      safeWarn('⚠️ useContent: Falha ao excluir adição de wiki, revertendo estado...', { id });
      showNotification('Erro ao excluir adição', 'error');
    }

    return success;
  } catch (err: any) {
    // Rollback on error
    setContents(originalContents);
    handleError('excluir adição de wiki', err, { id });
    return false;
  } finally {
    setLoading(false);
    safeTimeEnd(timerLabel);
    const endTime = performance.now();
    performanceLog(timerLabel, startTime, endTime);
  }
}, [contents, handleError, showNotification]);



  // Atualizar adição de wiki
  const updateWikiAddition = useCallback(async (id: string | number, data: {
    title?: string;
    textContent?: string;
    file?: File;
  }): Promise<boolean> => {
    const startTime = performance.now();
    const timerLabel = 'useContent-updateWikiAddition';
    safeTime(timerLabel);

    // Validação de entrada
    if (!id) {
      const errorMsg = 'ID inválido para atualização de adição de wiki';
      safeError(`❌ useContent: ${errorMsg}`);
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      return false;
    }

    if (!data.title && !data.textContent && !data.file) {
      const errorMsg = 'Nenhum dado fornecido para atualização';
      safeError(`❌ useContent: ${errorMsg}`);
      setError(errorMsg);
      showNotification(errorMsg, 'error');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      safeLog('🔄 useContent: Atualizando adição de wiki...', {
        id,
        ...sanitizeLogData(data),
        timestamp: getTimestamp()
      });

      // Como updateWikiAddition não existe no service, vamos simular ou usar createWikiAddition
      // Para contornar o problema, você pode:
      // 1. Implementar updateWikiAddition no contentService
      // 2. Ou usar uma abordagem alternativa como recriar a adição

      // Por enquanto, vou comentar esta funcionalidade até que o método seja implementado no service
      safeWarn('⚠️ updateWikiAddition não está implementado no contentService');
      showNotification('Funcionalidade de atualização não disponível', 'error');
      return false;

      // Código original comentado até implementação do método no service:
      /*
      const updatedAddition = await contentService.updateWikiAddition(String(id), data);
      const success = Boolean(updatedAddition?.success);

      if (success) {
        safeLog('✅ useContent: Adição de wiki atualizada com sucesso:', {
          id: updatedAddition.id,
          timestamp: getTimestamp()
        });

        // Atualização otimista do estado
        setContents(prev => prev.map(content => ({
          ...content,
          wikiAdditions: content.wikiAdditions?.map(add => 
            String(add.id) === String(id) ? updatedAddition : add
          )
        })));

        showNotification('Adição atualizada com sucesso!');
      } else {
        safeWarn('⚠️ useContent: Falha ao atualizar adição de wiki');
        showNotification('Erro ao atualizar adição', 'error');
      }

      return success;
      */
    } catch (err: any) {
      handleError('atualizar adição de wiki', err, { id, ...data });
      return false;
    } finally {
      setLoading(false);
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [handleError, showNotification]);

  // Upload de arquivo
  const uploadFile = useCallback(async (file: File) => {
    const startTime = performance.now();
    const timerLabel = 'useContent-uploadFile';
    safeTime(timerLabel);

    try {
      safeLog('🔄 useContent: Fazendo upload de arquivo...', {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        timestamp: getTimestamp()
      });

      const result = await contentService.uploadFile(file);

      safeLog('✅ useContent: Upload de arquivo concluído com sucesso:', {
        fileId: Array.isArray(result) && result.length > 0 ? result[0].id : undefined,
        fileName: file.name,
        timestamp: getTimestamp()
      });

      return result;
    } catch (err: any) {
      handleError('fazer upload de arquivo', err, { fileName: file.name });
      throw err;
    } finally {
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [handleError]);

  // Excluir arquivo
  const deleteFile = useCallback(async (fileId: string): Promise<boolean> => {
    const startTime = performance.now();
    const timerLabel = 'useContent-deleteFile';
    safeTime(timerLabel);

    try {
      safeLog('🔄 useContent: Excluindo arquivo...', {
        fileId,
        timestamp: getTimestamp()
      });

      const deleteResult = await contentService.deleteFile(fileId);
      // Ajuste para lidar com diferentes tipos de retorno
      const success = typeof deleteResult === 'boolean' ? deleteResult : Boolean(deleteResult?.success);

      if (success) {
        safeLog('✅ useContent: Arquivo excluído com sucesso:', {
          fileId,
          timestamp: getTimestamp()
        });
      } else {
        safeWarn('⚠️ useContent: Falha ao excluir arquivo', { fileId });
      }

      return success;
    } catch (err: any) {
      handleError('excluir arquivo', err, { fileId });
      return false;
    } finally {
      safeTimeEnd(timerLabel);
      const endTime = performance.now();
      performanceLog(timerLabel, startTime, endTime);
    }
  }, [handleError]);

  // Obter conteúdo por ID
  const getContentById = useCallback((id: string | number): ContentItem | undefined => {
    return contents.find(item => String(item.id) === String(id));
  }, [contents]);

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Carregar conteúdos automaticamente
  useEffect(() => {
    if (autoLoad) {
      loadContents();
    }
  }, [autoLoad, loadContents]);

  return {
    // Estado
    contents,
    loading,
    error,

    // Ações básicas
    loadContents,
    refreshContents,

    // CRUD de conteúdo
    createContent,
    updateContent,
    deleteContent,

    // Wiki Additions
    createWikiAddition,
    deleteWikiAddition,
    updateWikiAddition,

    // Upload de arquivos
    uploadFile,
    deleteFile,

    // Utilitários
    getContentById,
    clearError
  };
};