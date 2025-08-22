// src/services/wiki-additions.service.ts - Serviço para gerenciar wiki additions (compatível com Strapi v5)
import { ENV_CONFIG, safeLog, safeError, safeWarn } from '../utils/envUtils';
import type { ContentType } from '../types/content.types';

// ===== CONFIGURAÇÃO BASE =====
const STRAPI_URL = ENV_CONFIG.apiUrl;
const API_BASE = `${STRAPI_URL}/api`;

// ===== INTERFACES =====
export interface WikiAddition {
  id: number;
  documentId?: string;
  title: string;
  content: any[];
  additionType: string;
  order: number;
  author: string;
  isVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
  attachments?: any[];
  parent_content?: any;
}

interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

interface CreateWikiAdditionData {
  contentId: string;
  title: string;
  textContent: string;
  type: ContentType;
  file?: File;
  author?: string;
}

// ===== CLIENTE PARA WIKI ADDITIONS =====
class WikiAdditionsService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    };

    // Para FormData, remover Content-Type
    if (options.body instanceof FormData) {
      delete (config.headers as any)['Content-Type'];
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `Erro na requisição: ${response.status} ${response.statusText}`;
        try {
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error?.message || errorMessage;
        } catch (e) {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      // Para delete sem conteúdo
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return {} as T;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Busca wiki additions por ID do conteúdo
   */
  async getWikiAdditionsByContentId(contentId: string | number): Promise<WikiAddition[]> {
    try {
      // Para Strapi v5, vamos tentar diferentes formas de filtrar
      const endpoints = [
        `/wiki-additions?filters[parent_content][id][$eq]=${contentId}&populate=*&sort=order:asc`,
        `/wiki-additions?filters[parent_content][$eq]=${contentId}&populate=*&sort=order:asc`,
        `/wiki-additions?filters[contentId][$eq]=${contentId}&populate=*&sort=order:asc`,
        `/wiki-additions?populate=*&sort=order:asc`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.request<StrapiResponse<WikiAddition[]>>(endpoint);
          if (response.data && Array.isArray(response.data)) {
            // Filtrar manualmente se necessário
            const filtered = response.data.filter(addition => {
              const parentContent = addition.parent_content;
              if (parentContent) {
                const parentId = parentContent.id || parentContent.data?.id;
                return parentId == contentId;
              }
              return false;
            });
            
            if (filtered.length > 0) {
              return filtered.map(this.mapStrapiWikiAddition);
            }
          }
        } catch (error) {
          console.warn(`Endpoint ${endpoint} falhou:`, error);
          continue;
        }
      }

      return [];
    } catch (error) {
      console.error('Erro ao buscar wiki additions:', error);
      return [];
    }
  }

  /**
   * Cria uma nova wiki addition
   */
  async createWikiAddition(data: CreateWikiAdditionData): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const documentId = data.contentId;

      // 1. Buscar o conteúdo para obter o ID numérico
      let numericId: number;
      try {
        const contentResponse = await this.request<StrapiResponse<any>>(
          `/contents/${documentId}?populate=*`
        );
        if (!contentResponse.data) {
          throw new Error(`Conteúdo com documentId ${documentId} não encontrado`);
        }
        numericId = contentResponse.data.id;
      } catch (error: any) {
        throw new Error(`Conteúdo com documentId ${documentId} não existe. Recarregue a página para atualizar a lista.`);
      }

      // 2. Upload do arquivo se existir
      let uploadedFileId: number | null = null;
      
      if (data.file) {
        try {
          const uploadResult = await this.uploadFile(data.file);
          
          if (uploadResult && uploadResult.length > 0 && uploadResult[0]) {
            uploadedFileId = uploadResult[0].id || null;
          }
        } catch (uploadError) {
          console.warn('Falha no upload, continuando sem arquivo:', uploadError);
        }
      }

      // 3. Buscar adições existentes para determinar a ordem
      const existingAdditions = await this.getWikiAdditionsByContentId(numericId);
      const nextOrder = (existingAdditions.length || 0) + 1;

      // 4. Mapear tipo para additionType
      const additionTypeMap: Record<string, string> = {
        'photo': 'image',
        'video': 'video', 
        'text': 'text',
        'title': 'text',
        'tutorial': 'text'
      };
      const additionType = additionTypeMap[data.type] || 'text';

      // 5. Criar payload compatível com Strapi v5
      const payload: any = {
        data: {
          title: data.title,
          content: [
            {
              type: 'paragraph',
              children: [{ text: data.textContent || 'Nova adição', type: 'text' }]
            }
          ],
          additionType,
          order: nextOrder,
          author: data.author || 'Sistema',
          isVisible: true,
          parent_content: {
            connect: [numericId] // Strapi v5 usa connect para relações
          }
        }
      };

      // 6. Conectar attachment se existe
      if (uploadedFileId) {
        payload.data.attachments = {
          connect: [uploadedFileId]
        };
      }

      // 7. Criar wiki addition
      try {
        const response = await this.request<StrapiResponse<WikiAddition>>(
          '/wiki-additions',
          {
            method: 'POST',
            body: JSON.stringify(payload)
          }
        );
        
        return { 
          success: true, 
          message: 'Adição criada com sucesso',
          data: response.data 
        };
        
      } catch (creationError: any) {
        console.error('Erro ao criar wiki addition:', creationError);
        
        // Tentar com estrutura alternativa para Strapi v5
        const alternativePayload: any = {
          data: {
            title: data.title,
            content: [
              {
                type: 'paragraph',
                children: [{ text: data.textContent || 'Nova adição', type: 'text' }]
              }
            ],
            additionType,
            order: nextOrder,
            author: data.author || 'Sistema',
            isVisible: true,
            parent_content: numericId // Tentar com ID direto
          }
        };

        if (uploadedFileId) {
          alternativePayload.data.attachments = [uploadedFileId];
        }

        try {
          const response = await this.request<StrapiResponse<WikiAddition>>(
            '/wiki-additions',
            {
              method: 'POST',
              body: JSON.stringify(alternativePayload)
            }
          );
          
          return { 
            success: true, 
            message: 'Adição criada com sucesso',
            data: response.data 
          };
          
        } catch (secondError) {
          throw creationError;
        }
      }

    } catch (error: any) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar adição' 
      };
    }
  }

  /**
   * Atualiza uma wiki addition existente
   */
  async updateWikiAddition(id: number, data: Partial<WikiAddition>): Promise<WikiAddition> {
    try {
      // Validação de entrada
      if (!id) throw new Error('ID da adição não fornecido');
      if (!data || Object.keys(data).length === 0) throw new Error('Dados de atualização não fornecidos');
      
      safeLog('🔄 wikiAdditionsService: Atualizando wiki addition:', { id, fields: Object.keys(data) });
      
      const payload = {
        data: {
          ...data
        }
      };

      const response = await this.request<StrapiResponse<WikiAddition>>(
        `/wiki-additions/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      );

      safeLog('✅ wikiAdditionsService: Wiki addition atualizada com sucesso:', { id, title: response.data.title });
      return this.mapStrapiWikiAddition(response.data);
    } catch (error) {
      safeError(`❌ wikiAdditionsService: Erro ao atualizar wiki addition ${id}:`, error);
      throw error;
    }
  }

  /**
   * Exclui uma wiki addition
   */
  async deleteWikiAddition(id: number): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Validação de entrada
      if (!id) throw new Error('ID da adição não fornecido');
      
      safeLog('🗑️ wikiAdditionsService: Excluindo wiki addition:', { id });
      
      // Verificar se a adição existe antes de tentar excluir
      try {
        const checkResponse = await this.request<StrapiResponse<any>>(`/wiki-additions/${id}?populate=*`);
        if (!checkResponse.data) {
          throw new Error(`Wiki addition com ID ${id} não encontrada`);
        }
        safeLog('ℹ️ wikiAdditionsService: Wiki addition encontrada, prosseguindo com exclusão:', { 
          id, 
          title: checkResponse.data.attributes?.title || 'Sem título'
        });
      } catch (checkError: any) {
        if (checkError.message?.includes('não encontrada')) {
          throw checkError;
        }
        // Se o erro for de outro tipo, continuamos com a exclusão
        safeWarn('⚠️ wikiAdditionsService: Erro ao verificar existência da wiki addition, tentando excluir mesmo assim:', checkError);
      }
      
      // Executar a exclusão
      safeLog('🔄 wikiAdditionsService: Enviando requisição DELETE para:', { endpoint: `/wiki-additions/${id}` });
      
      await this.request<void>(`/wiki-additions/${id}`, {
        method: 'DELETE'
      });
      
      safeLog('✅ wikiAdditionsService: Wiki addition excluída com sucesso:', { id });
      return { 
        success: true, 
        message: 'Adição excluída com sucesso',
        data: { id }
      };
    } catch (error: any) {
      safeError(`❌ wikiAdditionsService: Erro ao excluir wiki addition ${id}:`, error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir adição',
        data: null
      };
    }
  }

  /**
   * Upload de arquivo
   */
  async uploadFile(file: File): Promise<any[]> {
    try {
      const formData = new FormData();
      formData.append('files', file);
      
      const response = await this.request<any[]>(
        '/upload',
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response || !Array.isArray(response) || response.length === 0) {
        throw new Error('Resposta de upload inválida ou vazia');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mapeia dados do Strapi para WikiAddition
   */
  private mapStrapiWikiAddition(strapiData: any): WikiAddition {
    // Para Strapi v5, os dados podem vir em diferentes estruturas
    const data = strapiData.attributes || strapiData;
    
    return {
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      title: data.title || '',
      content: data.content || [],
      additionType: data.additionType || 'text',
      order: data.order || 0,
      author: data.author || 'Sistema',
      isVisible: data.isVisible !== false,
      createdAt: data.createdAt || strapiData.createdAt,
      updatedAt: data.updatedAt || strapiData.updatedAt,
      publishedAt: data.publishedAt || strapiData.publishedAt,
      attachments: this.processAttachments(data.attachments || strapiData.attachments),
      parent_content: data.parent_content || strapiData.parent_content
    };
  }

  /**
   * Processa anexos
   */
  private processAttachments(attachments: any): any[] {
    if (!attachments) return [];
    
    let attachmentList = [];
    
    if (attachments.data && Array.isArray(attachments.data)) {
      attachmentList = attachments.data;
    } else if (Array.isArray(attachments)) {
      attachmentList = attachments;
    } else if (attachments.data && !Array.isArray(attachments.data)) {
      attachmentList = [attachments.data];
    } else if (attachments.id) {
      attachmentList = [attachments];
    }
    
    return attachmentList.map((att: any) => {
      const attrs = att.attributes || att;
      return {
        id: att.id || attrs.id,
        name: attrs.name || attrs.filename || 'Arquivo',
        url: attrs.url ? `${STRAPI_URL}${attrs.url}` : '',
        mime: attrs.mime || attrs.mimetype || 'unknown',
        size: attrs.size || 0,
        alt: attrs.alternativeText || attrs.alt || attrs.name || ''
      };
    }).filter((att: any) => att.url);
  }
}

// ===== INSTÂNCIA ÚNICA =====
export const wikiAdditionsService = new WikiAdditionsService();

// ===== EXPORTS =====
export default wikiAdditionsService;

