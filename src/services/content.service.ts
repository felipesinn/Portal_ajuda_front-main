// import type { ContentItem, ContentType, ContentCategory, CreateContentData, UpdateContentData } from '../types/content.types';
// import type { SectorType } from '../types/common.types';
// import { ENV_CONFIG, safeLog, safeError, safeWarn } from '../utils/envUtils';

// // ===== CONFIGURAÇÃO BASE =====
// const STRAPI_URL = ENV_CONFIG.apiUrl;
// const API_BASE = `${STRAPI_URL}/api`;

// // ===== CLIENTE STRAPI SIMPLES =====
// class StrapiClient {
//   private baseURL: string;
//   api: any;

//   constructor(baseURL: string) {
//     this.baseURL = baseURL;
//     this.api = this; // Para compatibilidade com código existente
//   }

//   private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
//     const url = `${this.baseURL}${endpoint}`;
    
//     const config: RequestInit = {
//       headers: {
//         'Content-Type': 'application/json',
//         ...options.headers,
//       },
//       ...options,
//     };

//     // Para FormData, remover Content-Type
//     if (options.body instanceof FormData) {
//       delete (config.headers as any)['Content-Type'];
//     }
    
//     try {
//       safeLog('🔄 StrapiClient: Iniciando requisição:', { url, method: options.method });
      
//       const response = await fetch(url, config);
      
//       safeLog('ℹ️ StrapiClient: Resposta recebida:', { 
//         url, 
//         method: options.method, 
//         status: response.status, 
//         statusText: response.statusText,
//         contentType: response.headers.get('content-type'),
//         contentLength: response.headers.get('content-length')
//       });
      
//       if (!response.ok) {
//         let errorText = await response.text();
//         safeError('❌ StrapiClient: Erro na resposta HTTP:', { 
//           url, 
//           method: options.method, 
//           status: response.status, 
//           statusText: response.statusText,
//           errorText 
//         });
        
//         try {
//           // Tenta analisar o erro como JSON para obter mensagem mais detalhada
//           const errorJson = JSON.parse(errorText);
//           errorText = errorJson.error?.message || errorJson.message || errorText;
//         } catch (e) {
//           // Se não for JSON, usa o texto como está
//         }
        
//         throw new Error(`HTTP ${response.status}: ${errorText}`);
//       }

//       // Para delete sem conteúdo
//       if (response.status === 204 || response.headers.get('content-length') === '0') {
//         safeLog('ℹ️ StrapiClient: Resposta sem conteúdo (204 ou content-length=0)', { url, method: options.method });
//         return {} as T;
//       }

//       const data = await response.json();
//       return data;
//     } catch (error) {
//       if (!(error instanceof Error && error.message.startsWith('HTTP'))) {
//         // Apenas loga erros que não foram já logados acima
//         safeError('❌ StrapiClient: Erro na requisição:', { url, method: options.method, error });
//       }
//       throw error;
//     }
//   }

//   async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
//     const searchParams = params ? new URLSearchParams(params).toString() : '';
//     const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
//     return this.request<T>(url, { method: 'GET' });
//   }

//   async post<T>(endpoint: string, data?: any): Promise<T> {
//     const body = data instanceof FormData ? data : JSON.stringify(data);
//     return this.request<T>(endpoint, { method: 'POST', body });
//   }

//   async put<T>(endpoint: string, data?: any): Promise<T> {
//     const body = data instanceof FormData ? data : JSON.stringify(data);
//     return this.request<T>(endpoint, { method: 'PUT', body });
//   }

//   async delete<T>(endpoint: string): Promise<T> {
//     safeLog('🔄 StrapiClient: Executando requisição DELETE:', { endpoint });
//     try {
//       const result = await this.request<T>(endpoint, { method: 'DELETE' });
//       safeLog('✅ StrapiClient: DELETE executado com sucesso:', { endpoint });
//       return result;
//     } catch (error) {
//       safeError('❌ StrapiClient: Erro na requisição DELETE:', { endpoint, error });
//       throw error;
//     }
//   }
// }

// // ===== INTERFACES =====
// interface StrapiResponse<T> {
//   data: T;
//   meta?: any;
// }

// interface StrapiContentRaw {
//   id: number;
//   documentId: string;
//   title: string;
//   description?: string;
//   sector: string;
//   type: string;
//   priority?: number;
//   textContent?: any[];
//   category?: string;
//   complexity?: number;
//   createdAt: string;
//   updatedAt: string;
//   publishedAt: string;
//   media?: any[];
// }

// interface StrapiWikiAddition {
//   id: number;
//   documentId: string;
//   title: string;
//   content: any[];
//   additionType: string;
//   order: number;
//   author: string;
//   isVisible: boolean;
//   createdAt: string;
//   updatedAt: string;
//   publishedAt: string;
//   attachments?: any;
//   parent_content?: any;
// }

// interface StrapiUploadResponse {
//   id: number;
//   name: string;
//   alternativeText?: string;
//   caption?: string;
//   width?: number;
//   height?: number;
//   formats?: any;
//   hash: string;
//   ext: string;
//   mime: string;
//   size: number;
//   url: string;
//   previewUrl?: string;
//   provider: string;
//   provider_metadata?: any;
//   createdAt: string;
//   updatedAt: string;
// }

// export interface DeleteResult {
//   data?: any;
//   success: boolean;
//   message: string;
//   statusCode?: number;
// }

// // ===== CLIENTE STRAPI =====
// const strapiClient = new StrapiClient(API_BASE);

// // ===== UTILITÁRIOS DE CONVERSÃO =====
// class ContentMapper {
//   static extractTextFromStrapiContent(strapiContent: any[]): string {
//     if (!strapiContent || !Array.isArray(strapiContent)) return '';
    
//     return strapiContent.map(block => {
//       if (block.children && Array.isArray(block.children)) {
//         return block.children.map((child: any) => child.text || '').join('');
//       }
//       return '';
//     }).join(' ').trim();
//   }

//   static convertStrapiTypeToContentType(strapiType: string): ContentType {
//     switch (strapiType?.toLowerCase()) {
//       case 'photo': return 'photo' as ContentType;
//       case 'video': return 'video' as ContentType; 
//       case 'text': return 'text' as ContentType;
//       case 'title': return 'title' as ContentType;
//       case 'tutorial': return 'tutorial' as ContentType;
//       default: return 'text' as ContentType;
//     }
//   }

//   static convertStrapiSectorToSectorType(strapiSector: string): SectorType {
//     return strapiSector as SectorType;
//   }

//   static convertStrapiCategoryToContentCategory(strapiCategory?: string): ContentCategory {
//     if (!strapiCategory) return 'configuration' as ContentCategory;
    
//     switch (strapiCategory.toLowerCase()) {
//       case 'tutorial': return 'tutorial' as ContentCategory;
//       case 'procedure': return 'procedure' as ContentCategory;
//       case 'configuration': return 'configuration' as ContentCategory;
//       case 'guide': return 'guide' as ContentCategory;
//       default: return 'configuration' as ContentCategory;
//     }
//   }

//   static strapiToContentItem(
//     strapiItem: StrapiContentRaw, 
//     allWikiAdditions: StrapiWikiAddition[] = []
//   ): ContentItem {
//     // Buscar wiki-additions relacionadas usando parent_content e documentId
//     const relatedWikiAdditions = allWikiAdditions.filter(addition => {
//       const parentContent = addition.parent_content;
      
//       let parentId: string | number | undefined;
      
//       if (parentContent) {
//         if (parentContent.data) {
//           parentId = parentContent.data.documentId || parentContent.data.id;
//         }
//         else if (typeof parentContent === 'object') {
//           parentId = parentContent.documentId || parentContent.id;
//         }
//         else {
//           parentId = parentContent;
//         }
//       }

//       const match = parentId === strapiItem.documentId || parentId === strapiItem.id;
//       return match;
      
//     }).map(addition => ({
//       id: addition.id,
//       title: addition.title,
//       content: addition.content,
//       additionType: addition.additionType,
//       order: addition.order,
//       author: addition.author,
//       isVisible: addition.isVisible,
//       createdAt: addition.createdAt,
//       updatedAt: addition.updatedAt,
//       attachments: (() => {
//         let attachments = [];
        
//         if (addition.attachments?.data && Array.isArray(addition.attachments.data)) {
//           attachments = addition.attachments.data;
//         } else if (Array.isArray(addition.attachments)) {
//           attachments = addition.attachments;
//         } else if (addition.attachments?.data && !Array.isArray(addition.attachments.data)) {
//           attachments = [addition.attachments.data];
//         } else if (addition.attachments && addition.attachments.id) {
//           attachments = [addition.attachments];
//         }
        
//         const processedAttachments = attachments.map((att: any) => {
//           const attrs = att.attributes || att;
//           return {
//             id: att.id || attrs.id,
//             name: attrs.name || attrs.filename || 'Arquivo',
//             url: attrs.url ? `${STRAPI_URL}${attrs.url}` : '',
//             mime: attrs.mime || attrs.mimetype || 'unknown',
//             size: attrs.size || 0,
//             alt: attrs.alternativeText || attrs.alt || attrs.name || ''
//           };
//         }).filter((att: any) => att.url);
        
//         return processedAttachments;
//       })()
//     })).sort((a: any, b: any) => a.order - b.order);

//     return {
//       id: strapiItem.id.toString(),
//       title: strapiItem.title,
//       description: strapiItem.description || '',
//       sector: this.convertStrapiSectorToSectorType(strapiItem.sector),
//       type: this.convertStrapiTypeToContentType(strapiItem.type),
//       priority: strapiItem.priority || 0,
//       category: this.convertStrapiCategoryToContentCategory(strapiItem.category),
//       complexity: strapiItem.complexity || 0,
//       createdAt: strapiItem.createdAt,
//       updatedAt: strapiItem.updatedAt,
//       publishedAt: strapiItem.publishedAt,
//       textContent: this.extractTextFromStrapiContent(strapiItem.textContent || []),
//       createdByName: relatedWikiAdditions[0]?.author || 'Sistema',
//       filePath: strapiItem.media?.[0]?.url ? `${STRAPI_URL}${strapiItem.media[0].url}` : undefined,

//       // Dados específicos do Strapi
//       strapiData: {
//         documentId: strapiItem.documentId,
//         numericId: strapiItem.id,
//         media: strapiItem.media || [],
//         all_wiki_additions: relatedWikiAdditions,
//         wiki_addition: relatedWikiAdditions[0] || null
//       }
//     } as unknown as ContentItem;
//   }
// }

// // ===== SERVIÇO PRINCIPAL =====
// class ContentService {
//   api: StrapiClient;
  
//   constructor() {
//     this.api = strapiClient;
//   }
  
//   // ===== CONTEÚDOS =====
  
//   async getAllContents(): Promise<ContentItem[]> {
//     try {
//       // Buscar conteúdos com paginação e populando campos necessários
//       const contentsResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
//         'populate': '*', // Populate all direct relations
//         'pagination[pageSize]': '100', // Fetch up to 100 contents
//       });

//       // Buscar todas as wiki-additions separadamente com paginação completa
//       const allWikiAdditions = await this.getAllWikiAdditions();

//       const contents = contentsResponse.data || [];
//       return contents.map(content => 
//         ContentMapper.strapiToContentItem(content, allWikiAdditions)
//       );
//     } catch (error) {
//       console.error('Erro ao buscar todos os conteúdos:', error);
//       throw error;
//     }
//   }

//   async getContentsBySector(sector: SectorType): Promise<ContentItem[]> {
//     try {
//       // Buscar conteúdos por setor com paginação e populando campos necessários
//       const contentsResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
//         'populate': '*', // Populate all direct relations
//         'filters[sector][$eq]': sector,
//         'sort': 'priority:desc,updatedAt:desc',
//         'pagination[pageSize]': '100', // Fetch up to 100 contents for the given sector
//       });

//       // Buscar todas as wiki-additions separadamente com paginação completa
//       const allWikiAdditions = await this.getAllWikiAdditions();

//       const contents = contentsResponse.data || [];
//       return contents.map(content => 
//         ContentMapper.strapiToContentItem(content, allWikiAdditions)
//       );
//     } catch (error) {
//       console.error(`Erro ao buscar conteúdos pelo setor ${sector}:`, error);
//       throw error;
//     }
//   }

//   async getContentById(id: string): Promise<ContentItem> {
//     try {
//       let numericContentId: number;
//       let documentIdFromSearch: string | undefined;

//       if (/^\d+$/.test(id)) {
//         // If ID is numeric, first try to find content by its numeric ID
//         numericContentId = Number(id);
//       } else {
//         // If ID is a documentId (string), try to find its numeric ID first
//         const searchResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
//           'filters[documentId][$eq]': id,
//           'pagination[pageSize]': 1, // We only need one match
//         });
//         if (!searchResponse.data || searchResponse.data.length === 0) {
//           throw new Error(`Conteúdo com documentId ${id} não encontrado.`);
//         }
//         numericContentId = searchResponse.data[0].id;
//         documentIdFromSearch = searchResponse.data[0].documentId;
//       }

//       // Fetch the specific content using its numeric ID
//       const contentResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw>>(`/contents/${numericContentId}`, {
//         'populate[media]': '*', // Populate media for the content
//       });

//       if (!contentResponse.data) {
//         throw new Error(`Conteúdo com ID ${id} (numérico: ${numericContentId}) não encontrado.`);
//       }

//       // Fetch all wiki-additions separately with full pagination
//       const allWikiAdditions = await this.getAllWikiAdditions();
      
//       const filteredWikiAdditions = allWikiAdditions.filter(addition => {
//         const parentContent = addition.parent_content;
//         if (parentContent) {
//           // Check if parent_content is a data object or a direct ID
//           const parentId = parentContent.data ? (parentContent.data.documentId || parentContent.data.id) : (parentContent.documentId || parentContent.id);
//           return parentId === (documentIdFromSearch || contentResponse.data.documentId) || parentId === contentResponse.data.id;
//         }
//         return false;
//       });

//       return ContentMapper.strapiToContentItem(contentResponse.data, filteredWikiAdditions);
      
//     } catch (error) {
//       console.error(`Erro ao buscar conteúdo por ID ${id}:`, error);
//       throw error;
//     }
//   }

//   async createContent(data: CreateContentData): Promise<ContentItem> {
//     try {
//       const response = await strapiClient.post<StrapiResponse<StrapiContentRaw>>(
//         '/contents', 
//         { data }
//       );

//       // Re-fetch wiki additions to ensure the new content is reflected in any related lists
//       await this.getAllWikiAdditions(); 

//       return ContentMapper.strapiToContentItem(response.data);
//     } catch (error) {
//       console.error('Erro ao criar conteúdo:', error);
//       throw error;
//     }
//   }

//   async updateContent(id: string, data: UpdateContentData): Promise<ContentItem> {
//     try {
//       // Validação de entrada
//       if (!id) throw new Error('ID do conteúdo não fornecido');
//       if (!data || Object.keys(data).length === 0) throw new Error('Dados de atualização não fornecidos');
      
//       safeLog('🔄 contentService: Atualizando conteúdo:', { id, fields: Object.keys(data) });
      
//       const response = await strapiClient.put<StrapiResponse<StrapiContentRaw>>(
//         `/contents/${id}`, 
//         { data }
//       );

//       // Re-fetch wiki additions to ensure any related updates are reflected
//       await this.getAllWikiAdditions();

//       safeLog('✅ contentService: Conteúdo atualizado com sucesso:', { id, title: response.data.title });
//       return ContentMapper.strapiToContentItem(response.data);
//     } catch (error) {
//       safeError(`❌ contentService: Erro ao atualizar conteúdo ${id}:`, error);
//       throw error;
//     }
//   }

//   async deleteContent(id: string): Promise<DeleteResult> {
//     try {
//       // Validação de entrada
//       if (!id) throw new Error('ID do conteúdo não fornecido');
      
//       safeLog('🗑️ contentService: Excluindo conteúdo:', { id });
      
//       await strapiClient.delete(`/contents/${id}`);
      
//       // Re-fetch wiki additions after deletion
//       await this.getAllWikiAdditions();

//       safeLog('✅ contentService: Conteúdo excluído com sucesso:', { id });
//       return { 
//         success: true, 
//         message: 'Conteúdo excluído com sucesso', 
//         statusCode: 200,
//         data: null
//       };
      
//     } catch (error: any) {
//       safeError(`❌ contentService: Erro ao excluir conteúdo ${id}:`, error);
//       return { 
//         success: false, 
//         message: error instanceof Error ? error.message : 'Erro ao excluir conteúdo',
//         statusCode: error.response?.status || 500,
//         data: null
//       };
//     }
//   }

//   // ===== WIKI ADDITIONS =====

//   async getAllWikiAdditions(): Promise<StrapiWikiAddition[]> {
//     let allAdditions: StrapiWikiAddition[] = [];
//     let page = 1;
//     let hasMore = true;

//     while (hasMore) {
//       try {
//         const response = await strapiClient.get<StrapiResponse<StrapiWikiAddition[]>>('/wiki-additions', {
//           'populate': '*', // Populate all relations for wiki-additions
//           'pagination[page]': page,
//           'pagination[pageSize]': '1000', // Fetch up to 1000 wiki-additions per page
//         });

//         if (response.data && Array.isArray(response.data)) {
//           allAdditions = allAdditions.concat(response.data);
//           // Check if there are more pages
//           if (response.meta && response.meta.pagination && response.meta.pagination.page < response.meta.pagination.pageCount) {
//             page++;
//           } else {
//             hasMore = false;
//           }
//         } else {
//           hasMore = false; // No data or invalid response
//         }
//       } catch (error) {
//         console.error(`Erro ao buscar wiki-additions na página ${page}:`, error);
//         hasMore = false; // Stop on error
//       }
//     }
//     return allAdditions;
//   }


//   async createWikiAddition(_id: string | number, _updateData: { fileId: number | undefined; title?: string; textContent?: string; file?: File; }, data: {
//   contentId: string; // This is the documentId or numeric ID of the parent content
//   title: string;
//   textContent: string;
//   type: ContentType;
//   file?: File;
//   author?: string;
// }): Promise<{ success: boolean; message: string; data?: any }> {
//     try {
//       const contentId = data.contentId;
//       let numericParentContentId: number | undefined;

//       // First, get the numeric ID of the parent content
//       if (/^\d+$/.test(contentId)) {
//         numericParentContentId = Number(contentId);
//       } else {
//         // If contentId is a documentId, find the numeric ID
//         const contentResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
//           'filters[documentId][$eq]': contentId,
//           'pagination[pageSize]': 1,
//         });
//         if (!contentResponse.data || contentResponse.data.length === 0) {
//           throw new Error(`Conteúdo pai com ID/DocumentId ${contentId} não encontrado.`);
//         }
//         numericParentContentId = contentResponse.data[0].id;
//       }

//       if (!numericParentContentId) {
//         throw new Error(`Não foi possível determinar o ID numérico do conteúdo pai ${contentId}.`);
//       }


//       // 1. Upload do arquivo se existir
//       let uploadedFileId: number | null = null;
      
//       if (data.file) {
//         try {
//           const uploadResult = await this.uploadFile(data.file);
          
//           if (uploadResult && uploadResult.length > 0 && uploadResult[0]) {
//             uploadedFileId = uploadResult[0].id || null;
//           }
//         } catch (uploadError) {
//           console.error('Falha no upload:', uploadError);
//           throw new Error(`Falha no upload: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
//         }
//       }

//       // 2. Buscar adições existentes para determinar a próxima ordem
//       const allAdditions = await this.getAllWikiAdditions();
//       const filteredAdditions = allAdditions.filter(addition => {
//         const parentContent = addition.parent_content;
//         if (parentContent) {
//           const parentId = parentContent.data ? (parentContent.data.documentId || parentContent.data.id) : (parentContent.documentId || parentContent.id);
//           return parentId === numericParentContentId;
//         }
//         return false;
//       });

//       const nextOrder = (filteredAdditions.length || 0) + 1;

//       // 3. Mapear tipo para additionType
//       const additionTypeMap: Record<string, string> = {
//         'photo': 'image',
//         'video': 'video', 
//         'text': 'text',
//         'title': 'text',
//         'tutorial': 'text'
//       };
//       const additionType = additionTypeMap[data.type] || 'text';

//       // 4. Criar payload
//       const payload: any = {
//         title: data.title,
//         content: [
//           {
//             type: 'paragraph',
//             children: [{ text: data.textContent || 'Nova adição', type: 'text' }]
//           }
//         ],
//         additionType,
//         order: nextOrder,
//         author: data.author || 'Sistema',
//         isVisible: true,
//         parent_content: numericParentContentId // Link using numeric ID
//       };

//       // 5. Conectar attachment se existe
//       if (uploadedFileId) {
//         payload.attachments = [uploadedFileId];
//       }

//       // 6. Criar wiki addition
//       try {
//         const response = await strapiClient.post<StrapiResponse<StrapiWikiAddition>>(
//           '/wiki-additions',
//           { data: payload }
//         );
        
//         // Re-fetch all wiki additions to update local cache
//         await this.getAllWikiAdditions();

//         return { 
//           success: true, 
//           message: 'Adição criada com sucesso',
//           data: response.data 
//         };
        
//       } catch (creationError: any) {
//         console.error('Erro na criação da adição:', creationError);
//         // Se falhou e tem attachment, tentar sem attachment
//         if (uploadedFileId && payload.attachments) {
//           const payloadWithoutAttachment = { ...payload };
//           delete payloadWithoutAttachment.attachments;
          
//           try {
//             const response = await strapiClient.post<StrapiResponse<StrapiWikiAddition>>(
//               '/wiki-additions',
//               { data: payloadWithoutAttachment }
//             );
            
//             // Re-fetch all wiki additions to update local cache
//             await this.getAllWikiAdditions();

//             return { 
//               success: true, 
//               message: 'Adição criada com sucesso (sem imagem - verifique permissões)',
//               data: response.data 
//             };
            
//           } catch (secondError) {
//             console.error('Erro na segunda tentativa de criação da adição (sem attachment):', secondError);
//             throw creationError; // Re-throw the original error
//           }
//         } else {
//           throw creationError;
//         }
//       }

//     } catch (error: any) {
//       console.error('Erro geral ao criar adição:', error);
//       return { 
//         success: false, 
//         message: error instanceof Error ? error.message : 'Erro ao criar adição' 
//       };
//     }
//   }

//   async deleteWikiAddition(id: string | number): Promise<DeleteResult> {
//     try {
//       // Validação de entrada
//       if (!id) {
//         safeError('❌ contentService: ID da adição não fornecido para exclusão');
//         throw new Error('ID da adição não fornecido');
//       }
      
//       safeLog('🗑️ contentService: Iniciando exclusão de Wiki Addition:', { id, idType: typeof id });
      
//       let numericIdToDelete: number;
      
//       if (/^\d+$/.test(String(id))) {
//         numericIdToDelete = Number(id);
//         if (isNaN(numericIdToDelete)) {
//           throw new Error(`ID inválido: ${id} não é um número válido`);
//         }
//         safeLog('ℹ️ contentService: Usando ID numérico diretamente:', { numericIdToDelete });
//       } else {
//         // If it's a documentId, find the numeric ID first
//         safeLog('ℹ️ contentService: Buscando ID numérico a partir do documentId:', { documentId: id });
        
//         try {
//           const wikiAdditionResponse = await strapiClient.get<StrapiResponse<StrapiWikiAddition[]>>(
//             '/wiki-additions',
//             {
//               'filters[documentId][$eq]': id,
//               'pagination[pageSize]': 1,
//             }
//           );
          
//           const wikiAddition = wikiAdditionResponse.data?.[0];
          
//           if (!wikiAddition) {
//             const errorMsg = `Wiki addition com ID/documentId ${id} não encontrada`;
//             safeError(`❌ contentService: ${errorMsg}`);
//             throw new Error(errorMsg);
//           }
          
//           numericIdToDelete = wikiAddition.id;
//           if (isNaN(numericIdToDelete)) {
//             throw new Error(`ID numérico inválido obtido para documentId ${id}`);
//           }
//           safeLog('ℹ️ contentService: ID numérico encontrado:', { documentId: id, numericIdToDelete });
//         } catch (searchError) {
//           safeError('❌ contentService: Erro ao buscar ID numérico:', { documentId: id, error: searchError });
//           throw searchError;
//         }
//       }
      
//       // Fazer delete com o ID numérico
//       safeLog('🗑️ contentService: Executando DELETE na API:', { endpoint: `/wiki-additions/${numericIdToDelete}` });
      
//       try {
//         await strapiClient.delete(`/wiki-additions/${numericIdToDelete}`);
//         safeLog('✅ contentService: Requisição DELETE executada com sucesso');
//       } catch (deleteError) {
//         safeError('❌ contentService: Erro na requisição DELETE:', { numericIdToDelete, error: deleteError });
//         throw deleteError;
//       }
      
//       // Re-fetch all wiki additions after deletion
//       safeLog('🔄 contentService: Recarregando todas as wiki additions após exclusão');
//       try {
//         await this.getAllWikiAdditions();
//         safeLog('✅ contentService: Wiki additions recarregadas com sucesso');
//       } catch (reloadError) {
//         safeWarn('⚠️ contentService: Erro ao recarregar wiki additions após exclusão:', reloadError);
//         // Não lançamos o erro aqui para não interromper o fluxo, já que a exclusão foi bem-sucedida
//       }

//       safeLog('✅ contentService: Wiki addition excluída com sucesso:', { id, numericIdToDelete });
//       return { 
//         success: true, 
//         message: 'Adição excluída com sucesso',
//         data: { id, numericId: numericIdToDelete }
//       };
      
//     } catch (error: any) {
//       safeError(`❌ contentService: Erro ao excluir adição ${id}:`, error);
//       return { 
//         success: false, 
//         message: error instanceof Error ? error.message : 'Erro ao excluir adição',
//         data: null
//       };
//     }
//   }

//   // ===== UPLOADS =====

//   async uploadFile(file: File): Promise<StrapiUploadResponse[]> {
//     try {
//       const formData = new FormData();
//       formData.append('files', file);
      
//       const response = await strapiClient.post<StrapiUploadResponse[]>(
//         '/upload',
//         formData
//       );
      
//       if (!response || !Array.isArray(response) || response.length === 0) {
//         throw new Error('Resposta de upload inválida ou vazia');
//       }
      
//       const firstFile = response[0];
//       if (!firstFile || !firstFile.id) {
//         throw new Error('Arquivo enviado mas sem ID válido');
//       }
      
//       return response;
//     } catch (error) {
//       console.error('Erro ao fazer upload do arquivo:', error);
//       throw error;
//     }
//   }

//   async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
//     try {
//       await strapiClient.delete(`/upload/files/${fileId}`);
      
//       return { success: true, message: 'Arquivo excluído com sucesso' };
//     } catch (error) {
//       console.error(`Erro ao excluir arquivo ${fileId}:`, error);
//       return { 
//         success: false, 
//         message: error instanceof Error ? error.message : 'Erro ao excluir arquivo' 
//       };
//     }
//   }

//   // ===== UTILITÁRIOS =====

//   getFileUrl(filePath: string): string {
//     if (!filePath) return '';
//     if (filePath.startsWith('http')) return filePath;
//     return `${STRAPI_URL}${filePath}`;
//   }

//   mapStrapiDataToContentItem(data: any): ContentItem {
//     // This assumes data is a single StrapiContentRaw object
//     // If you need to include wikiAdditions here, you'd need to pass them
//     return ContentMapper.strapiToContentItem(data);
//   }

//   async getAllContentsComplete(): Promise<ContentItem[]> {
//     try {
//       const allContents = await this.getAllContents(); // Already handles pagination for contents (up to 100)
//       return allContents;
//     } catch (error) {
//       console.error('Erro ao buscar todos os conteúdos completamente:', error);
//       throw error;
//     }
//   }

//   async getStats(sector?: SectorType) {
//     try {
//       const contents = sector ? 
//         await this.getContentsBySector(sector) : 
//         await this.getAllContents(); // These now use pagination limits

//       const byType = {
//         tutorial: contents.filter(c => c.category === 'tutorial').length,
//         procedure: contents.filter(c => c.category === 'procedure').length,
//         configuration: contents.filter(c => c.category === 'configuration').length,
//         guide: contents.filter(c => c.category === 'guide').length,
//         text: contents.filter(c => c.type === 'text').length,
//         photo: contents.filter(c => c.type === 'photo').length,
//         video: contents.filter(c => c.type === 'video').length,
//         title: contents.filter(c => c.type === 'title').length,
//       };

//       const bySector: Record<string, number> = {};
//       contents.forEach(content => {
//         const sectorKey = content.sector || 'indefinido';
//         bySector[sectorKey] = (bySector[sectorKey] || 0) + 1;
//       });

//       return {
//         total: contents.length,
//         byType,
//         bySector
//       };
//     } catch (error) {
//       console.error('Erro ao obter estatísticas:', error);
//       return { 
//         total: 0, 
//         byType: {
//           tutorial: 0, procedure: 0, configuration: 0, guide: 0,
//           text: 0, photo: 0, video: 0, title: 0
//         }, 
//         bySector: {}
//       };
//     }
//   }

//   async debugPagination(): Promise<{ contents: number; wikiAdditions: number }> {
//     console.log('Iniciando depuração de paginação...');
//     try {
//       const allContents = await this.getAllContents();
//       const allWikiAdditions = await this.getAllWikiAdditions(); // Ensure this method is called

//       console.log(`📊 Resultados carregados: {contents: ${allContents.length}, wikiAdditions: ${allWikiAdditions.length}}`);
//       console.log(`✅ Total wiki-additions carregadas: ${allWikiAdditions.length}`);

//       return {
//         contents: allContents.length,
//         wikiAdditions: allWikiAdditions.length,
//       };
//     } catch (error) {
//       console.error('Erro durante a depuração de paginação:', error);
//       return { contents: 0, wikiAdditions: 0 };
//     }
//   }
// }

// // ===== INSTÂNCIA ÚNICA =====
// export const contentService = new ContentService();

// // ===== EXPORTS =====
// export default contentService;
// export { ContentMapper, StrapiClient };

// // ===== FUNÇÃO DE EXCLUSÃO SEGURA =====
// export const deleteContentSafely = async (contentId: string): Promise<DeleteResult> => {
//   return await contentService.deleteContent(contentId);
// };

// // ===== FUNÇÃO GETCONTENTSTATS CORRIGIDA =====
// export async function getContentStats(sector?: SectorType): Promise<{
//   total: number;
//   byType: Record<string, number>;
//   bySector: Record<string, number>;
// }> {
//   return await contentService.getStats(sector);
// }

// // ===== DISPONIBILIZAR NO WINDOW PARA DEBUG =====
// if (typeof window !== 'undefined') {
//   (window as any).contentService = contentService;
// }


import type { ContentItem, ContentType, ContentCategory, CreateContentData, UpdateContentData } from '../types/content.types';
import type { SectorType } from '../types/common.types';
import { ENV_CONFIG, safeLog, safeError, safeWarn } from '../utils/envUtils';

// ===== CONFIGURAÇÃO BASE =====
const STRAPI_URL = ENV_CONFIG.apiUrl;
const API_BASE = `${STRAPI_URL}/api`;

// ===== CLIENTE STRAPI SIMPLES =====
class StrapiClient {
  private baseURL: string;
  api: any;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.api = this;
  }

  // ✅ CORREÇÃO: Adicionada verificação para status 204
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T | void> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body instanceof FormData) {
      delete (config.headers as any)['Content-Type'];
    }
    
    try {
      safeLog('🔄 StrapiClient: Iniciando requisição:', { url, method: options.method });
      
      const response = await fetch(url, config);
      
      safeLog('ℹ️ StrapiClient: Resposta recebida:', { 
        url, 
        method: options.method, 
        status: response.status, 
        statusText: response.statusText,
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
      
      if (!response.ok) {
        let errorText = await response.text();
        safeError('❌ StrapiClient: Erro na resposta HTTP:', { 
          url, 
          method: options.method, 
          status: response.status, 
          statusText: response.statusText,
          errorText 
        });
        
        try {
          const errorJson = JSON.parse(errorText);
          errorText = errorJson.error?.message || errorJson.message || errorText;
        } catch (e) {
        }
        
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      // ✅ CORREÇÃO: Verifica se a resposta é 204 para evitar erro ao tentar ler um corpo vazio.
      if (response.status === 204) {
        safeLog('✅ StrapiClient: Resposta sem conteúdo (204)');
        return; // Retorna void, indicando sucesso sem dados.
      }

      // Se não for 204, processa a resposta como JSON
      const data = await response.json();
      return data;
    } catch (error) {
      if (!(error instanceof Error && error.message.startsWith('HTTP'))) {
        safeError('❌ StrapiClient: Erro na requisição:', { url, method: options.method, error });
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const searchParams = params ? new URLSearchParams(params).toString() : '';
    const url = searchParams ? `${endpoint}?${searchParams}` : endpoint;
    const result = await this.request<T>(url, { method: 'GET' });
    return result as T;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const result = await this.request<T>(endpoint, { method: 'POST', body });
    return result as T;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const body = data instanceof FormData ? data : JSON.stringify(data);
    const result = await this.request<T>(endpoint, { method: 'PUT', body });
    return result as T;
  }

  async delete<T>(endpoint: string): Promise<T> {
    safeLog('🔄 StrapiClient: Executando requisição DELETE:', { endpoint });
    try {
      const result = await this.request<T>(endpoint, { method: 'DELETE' });
      safeLog('✅ StrapiClient: DELETE executado com sucesso:', { endpoint });
      return result as T;
    } catch (error) {
      safeError('❌ StrapiClient: Erro na requisição DELETE:', { endpoint, error });
      throw error;
    }
  }
}

// ===== INTERFACES =====
interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

interface StrapiContentRaw {
  id: number;
  documentId: string;
  title: string;
  description?: string;
  sector: string;
  type: string;
  priority?: number;
  textContent?: any[];
  category?: string;
  complexity?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  media?: any[];
}

interface StrapiWikiAddition {
  id: number;
  documentId: string;
  title: string;
  content: any[];
  additionType: string;
  order: number;
  author: string;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  attachments?: any;
  parent_content?: any;
}

interface StrapiUploadResponse {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface DeleteResult {
  data?: any;
  success: boolean;
  message: string;
  statusCode?: number;
}

// ===== CLIENTE STRAPI =====
const strapiClient = new StrapiClient(API_BASE);

// ===== UTILITÁRIOS DE CONVERSÃO =====
class ContentMapper {
  static extractTextFromStrapiContent(strapiContent: any[]): string {
    if (!strapiContent || !Array.isArray(strapiContent)) return '';
    
    return strapiContent.map(block => {
      if (block.children && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join(' ').trim();
  }

  static convertStrapiTypeToContentType(strapiType: string): ContentType {
    switch (strapiType?.toLowerCase()) {
      case 'photo': return 'photo' as ContentType;
      case 'video': return 'video' as ContentType; 
      case 'text': return 'text' as ContentType;
      case 'title': return 'title' as ContentType;
      case 'tutorial': return 'tutorial' as ContentType;
      default: return 'text' as ContentType;
    }
  }

  static convertStrapiSectorToSectorType(strapiSector: string): SectorType {
    return strapiSector as SectorType;
  }

  static convertStrapiCategoryToContentCategory(strapiCategory?: string): ContentCategory {
    if (!strapiCategory) return 'configuration' as ContentCategory;
    
    switch (strapiCategory.toLowerCase()) {
      case 'tutorial': return 'tutorial' as ContentCategory;
      case 'procedure': return 'procedure' as ContentCategory;
      case 'configuration': return 'configuration' as ContentCategory;
      case 'guide': return 'guide' as ContentCategory;
      default: return 'configuration' as ContentCategory;
    }
  }

  static strapiToContentItem(
    strapiItem: StrapiContentRaw, 
    allWikiAdditions: StrapiWikiAddition[] = []
  ): ContentItem {
    const relatedWikiAdditions = allWikiAdditions.filter(addition => {
      const parentContent = addition.parent_content;
      
      let parentId: string | number | undefined;
      
      if (parentContent) {
        if (parentContent.data) {
          parentId = parentContent.data.documentId || parentContent.data.id;
        }
        else if (typeof parentContent === 'object') {
          parentId = parentContent.documentId || parentContent.id;
        }
        else {
          parentId = parentContent;
        }
      }

      const match = parentId === strapiItem.documentId || parentId === strapiItem.id;
      return match;
      
    }).map(addition => ({
      id: addition.id,
      title: addition.title,
      content: addition.content,
      additionType: addition.additionType,
      order: addition.order,
      author: addition.author,
      isVisible: addition.isVisible,
      createdAt: addition.createdAt,
      updatedAt: addition.updatedAt,
      attachments: (() => {
        let attachments = [];
        
        if (addition.attachments?.data && Array.isArray(addition.attachments.data)) {
          attachments = addition.attachments.data;
        } else if (Array.isArray(addition.attachments)) {
          attachments = addition.attachments;
        } else if (addition.attachments?.data && !Array.isArray(addition.attachments.data)) {
          attachments = [addition.attachments.data];
        } else if (addition.attachments && addition.attachments.id) {
          attachments = [addition.attachments];
        }
        
        const processedAttachments = attachments.map((att: any) => {
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
        
        return processedAttachments;
      })()
    })).sort((a: any, b: any) => a.order - b.order);

    return {
      id: strapiItem.id.toString(),
      title: strapiItem.title,
      description: strapiItem.description || '',
      sector: this.convertStrapiSectorToSectorType(strapiItem.sector),
      type: this.convertStrapiTypeToContentType(strapiItem.type),
      priority: strapiItem.priority || 0,
      category: this.convertStrapiCategoryToContentCategory(strapiItem.category),
      complexity: strapiItem.complexity || 0,
      createdAt: strapiItem.createdAt,
      updatedAt: strapiItem.updatedAt,
      publishedAt: strapiItem.publishedAt,
      textContent: this.extractTextFromStrapiContent(strapiItem.textContent || []),
      createdByName: relatedWikiAdditions[0]?.author || 'Sistema',
      filePath: strapiItem.media?.[0]?.url ? `${STRAPI_URL}${strapiItem.media[0].url}` : undefined,

      strapiData: {
        documentId: strapiItem.documentId,
        numericId: strapiItem.id,
        media: strapiItem.media || [],
        all_wiki_additions: relatedWikiAdditions,
        wiki_addition: relatedWikiAdditions[0] || null
      }
    } as unknown as ContentItem;
  }
}

// ===== SERVIÇO PRINCIPAL =====
class ContentService {
  api: StrapiClient;
  
  constructor() {
    this.api = strapiClient;
  }
  
  // ===== CONTEÚDOS =====
  
  async getAllContents(): Promise<ContentItem[]> {
    try {
      const contentsResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
        'populate': '*',
        'pagination[pageSize]': '100',
      });

      const allWikiAdditions = await this.getAllWikiAdditions();

      const contents = contentsResponse.data || [];
      return contents.map(content => 
        ContentMapper.strapiToContentItem(content, allWikiAdditions)
      );
    } catch (error) {
      console.error('Erro ao buscar todos os conteúdos:', error);
      throw error;
    }
  }

  async getContentsBySector(sector: SectorType): Promise<ContentItem[]> {
    try {
      const contentsResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
        'populate': '*',
        'filters[sector][$eq]': sector,
        'sort': 'priority:desc,updatedAt:desc',
        'pagination[pageSize]': '100',
      });

      const allWikiAdditions = await this.getAllWikiAdditions();

      const contents = contentsResponse.data || [];
      return contents.map(content => 
        ContentMapper.strapiToContentItem(content, allWikiAdditions)
      );
    } catch (error) {
      console.error(`Erro ao buscar conteúdos pelo setor ${sector}:`, error);
      throw error;
    }
  }

  async getContentById(id: string): Promise<ContentItem> {
    try {
      let numericContentId: number;
      let documentIdFromSearch: string | undefined;

      if (/^\d+$/.test(id)) {
        numericContentId = Number(id);
      } else {
        const searchResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
          'filters[documentId][$eq]': id,
          'pagination[pageSize]': 1,
        });
        if (!searchResponse.data || searchResponse.data.length === 0) {
          throw new Error(`Conteúdo com documentId ${id} não encontrado.`);
        }
        numericContentId = searchResponse.data[0].id;
        documentIdFromSearch = searchResponse.data[0].documentId;
      }

      const contentResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw>>(`/contents/${numericContentId}`, {
        'populate[media]': '*',
      });

      if (!contentResponse.data) {
        throw new Error(`Conteúdo com ID ${id} (numérico: ${numericContentId}) não encontrado.`);
      }

      const allWikiAdditions = await this.getAllWikiAdditions();
      
      const filteredWikiAdditions = allWikiAdditions.filter(addition => {
        const parentContent = addition.parent_content;
        if (parentContent) {
          const parentId = parentContent.data ? (parentContent.data.documentId || parentContent.data.id) : (parentContent.documentId || parentContent.id);
          return parentId === (documentIdFromSearch || contentResponse.data.documentId) || parentId === contentResponse.data.id;
        }
        return false;
      });

      return ContentMapper.strapiToContentItem(contentResponse.data, filteredWikiAdditions);
      
    } catch (error) {
      console.error(`Erro ao buscar conteúdo por ID ${id}:`, error);
      throw error;
    }
  }

  async createContent(data: CreateContentData): Promise<ContentItem> {
    try {
      const response = await strapiClient.post<StrapiResponse<StrapiContentRaw>>(
        '/contents', 
        { data }
      );

      await this.getAllWikiAdditions(); 

      return ContentMapper.strapiToContentItem(response.data);
    } catch (error) {
      console.error('Erro ao criar conteúdo:', error);
      throw error;
    }
  }

  async updateContent(id: string, data: UpdateContentData): Promise<ContentItem> {
    try {
      if (!id) throw new Error('ID do conteúdo não fornecido');
      if (!data || Object.keys(data).length === 0) throw new Error('Dados de atualização não fornecidos');
      
      safeLog('🔄 contentService: Atualizando conteúdo:', { id, fields: Object.keys(data) });
      
      const response = await strapiClient.put<StrapiResponse<StrapiContentRaw>>(
        `/contents/${id}`, 
        { data }
      );

      await this.getAllWikiAdditions();

      safeLog('✅ contentService: Conteúdo atualizado com sucesso:', { id, title: response.data.title });
      return ContentMapper.strapiToContentItem(response.data);
    } catch (error) {
      safeError(`❌ contentService: Erro ao atualizar conteúdo ${id}:`, error);
      throw error;
    }
  }

  async deleteContent(id: string): Promise<DeleteResult> {
    try {
      if (!id) throw new Error('ID do conteúdo não fornecido');
      
      safeLog('🗑️ contentService: Excluindo conteúdo:', { id });
      
      await strapiClient.delete(`/contents/${id}`);
      
      await this.getAllWikiAdditions();

      safeLog('✅ contentService: Conteúdo excluído com sucesso:', { id });
      return { 
        success: true, 
        message: 'Conteúdo excluído com sucesso', 
        statusCode: 200,
        data: null
      };
      
    } catch (error: any) {
      safeError(`❌ contentService: Erro ao excluir conteúdo ${id}:`, error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir conteúdo',
        statusCode: error.response?.status || 500,
        data: null
      };
    }
  }

  // ===== WIKI ADDITIONS =====

  async getAllWikiAdditions(): Promise<StrapiWikiAddition[]> {
    let allAdditions: StrapiWikiAddition[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      try {
        const response = await strapiClient.get<StrapiResponse<StrapiWikiAddition[]>>('/wiki-additions', {
          'populate': '*',
          'pagination[page]': page,
          'pagination[pageSize]': '1000',
        });

        if (response.data && Array.isArray(response.data)) {
          allAdditions = allAdditions.concat(response.data);
          if (response.meta && response.meta.pagination && response.meta.pagination.page < response.meta.pagination.pageCount) {
            page++;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      } catch (error) {
        console.error(`Erro ao buscar wiki-additions na página ${page}:`, error);
        hasMore = false;
      }
    }
    return allAdditions;
  }


  async createWikiAddition(_id: string | number, _updateData: { fileId: number | undefined; title?: string; textContent?: string; file?: File; }, data: {
  contentId: string;
  title: string;
  textContent: string;
  type: ContentType;
  file?: File;
  author?: string;
}): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const contentId = data.contentId;
      let numericParentContentId: number | undefined;

      if (/^\d+$/.test(contentId)) {
        numericParentContentId = Number(contentId);
      } else {
        const contentResponse = await strapiClient.get<StrapiResponse<StrapiContentRaw[]>>('/contents', {
          'filters[documentId][$eq]': contentId,
          'pagination[pageSize]': 1,
        });
        if (!contentResponse.data || contentResponse.data.length === 0) {
          throw new Error(`Conteúdo pai com ID/DocumentId ${contentId} não encontrado.`);
        }
        numericParentContentId = contentResponse.data[0].id;
      }

      if (!numericParentContentId) {
        throw new Error(`Não foi possível determinar o ID numérico do conteúdo pai ${contentId}.`);
      }


      let uploadedFileId: number | null = null;
      
      if (data.file) {
        try {
          const uploadResult = await this.uploadFile(data.file);
          
          if (uploadResult && uploadResult.length > 0 && uploadResult[0]) {
            uploadedFileId = uploadResult[0].id || null;
          }
        } catch (uploadError) {
          console.error('Falha no upload:', uploadError);
          throw new Error(`Falha no upload: ${uploadError instanceof Error ? uploadError.message : 'Erro desconhecido'}`);
        }
      }

      const allAdditions = await this.getAllWikiAdditions();
      const filteredAdditions = allAdditions.filter(addition => {
        const parentContent = addition.parent_content;
        if (parentContent) {
          const parentId = parentContent.data ? (parentContent.data.documentId || parentContent.data.id) : (parentContent.documentId || parentContent.id);
          return parentId === numericParentContentId;
        }
        return false;
      });

      const nextOrder = (filteredAdditions.length || 0) + 1;

      const additionTypeMap: Record<string, string> = {
        'photo': 'image',
        'video': 'video', 
        'text': 'text',
        'title': 'text',
        'tutorial': 'text'
      };
      const additionType = additionTypeMap[data.type] || 'text';

      const payload: any = {
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
        parent_content: numericParentContentId
      };

      if (uploadedFileId) {
        payload.attachments = [uploadedFileId];
      }

      try {
        const response = await strapiClient.post<StrapiResponse<StrapiWikiAddition>>(
          '/wiki-additions',
          { data: payload }
        );
        
        await this.getAllWikiAdditions();

        return { 
          success: true, 
          message: 'Adição criada com sucesso',
          data: response.data 
        };
        
      } catch (creationError: any) {
        console.error('Erro na criação da adição:', creationError);
        if (uploadedFileId && payload.attachments) {
          const payloadWithoutAttachment = { ...payload };
          delete payloadWithoutAttachment.attachments;
          
          try {
            const response = await strapiClient.post<StrapiResponse<StrapiWikiAddition>>(
              '/wiki-additions',
              { data: payloadWithoutAttachment }
            );
            
            await this.getAllWikiAdditions();

            return { 
              success: true, 
              message: 'Adição criada com sucesso (sem imagem - verifique permissões)',
              data: response.data 
            };
            
          } catch (secondError) {
            console.error('Erro na segunda tentativa de criação da adição (sem attachment):', secondError);
            throw creationError;
          }
        } else {
          throw creationError;
        }
      }

    } catch (error: any) {
      console.error('Erro geral ao criar adição:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao criar adição' 
      };
    }
  }

  async deleteWikiAddition(id: string | number): Promise<DeleteResult> {
    try {
      if (!id) {
        safeError('❌ contentService: ID da adição não fornecido para exclusão');
        throw new Error('ID da adição não fornecido');
      }
      
      safeLog('🗑️ contentService: Iniciando exclusão de Wiki Addition:', { id, idType: typeof id });
      
      let numericIdToDelete: number;
      
      if (/^\d+$/.test(String(id))) {
        numericIdToDelete = Number(id);
        if (isNaN(numericIdToDelete)) {
          throw new Error(`ID inválido: ${id} não é um número válido`);
        }
        safeLog('ℹ️ contentService: Usando ID numérico diretamente:', { numericIdToDelete });
      } else {
        safeLog('ℹ️ contentService: Buscando ID numérico a partir do documentId:', { documentId: id });
        
        try {
          const wikiAdditionResponse = await strapiClient.get<StrapiResponse<StrapiWikiAddition[]>>(
            '/wiki-additions',
            {
              'filters[documentId][$eq]': id,
              'pagination[pageSize]': 1,
            }
          );
          
          const wikiAddition = wikiAdditionResponse.data?.[0];
          
          if (!wikiAddition) {
            const errorMsg = `Wiki addition com ID/documentId ${id} não encontrada`;
            safeError(`❌ contentService: ${errorMsg}`);
            throw new Error(errorMsg);
          }
          
          numericIdToDelete = wikiAddition.id;
          if (isNaN(numericIdToDelete)) {
            throw new Error(`ID numérico inválido obtido para documentId ${id}`);
          }
          safeLog('ℹ️ contentService: ID numérico encontrado:', { documentId: id, numericIdToDelete });
        } catch (searchError) {
          safeError('❌ contentService: Erro ao buscar ID numérico:', { documentId: id, error: searchError });
          throw searchError;
        }
      }
      
      safeLog('🗑️ contentService: Executando DELETE na API:', { endpoint: `/wiki-additions/${numericIdToDelete}` });
      
      try {
        await strapiClient.delete(`/wiki-additions/${numericIdToDelete}`);
        safeLog('✅ contentService: Requisição DELETE executada com sucesso');
      } catch (deleteError) {
        safeError('❌ contentService: Erro na requisição DELETE:', { numericIdToDelete, error: deleteError });
        throw deleteError;
      }
      
      safeLog('🔄 contentService: Recarregando todas as wiki additions após exclusão');
      try {
        await this.getAllWikiAdditions();
        safeLog('✅ contentService: Wiki additions recarregadas com sucesso');
      } catch (reloadError) {
        safeWarn('⚠️ contentService: Erro ao recarregar wiki additions após exclusão:', reloadError);
      }

      safeLog('✅ contentService: Wiki addition excluída com sucesso:', { id, numericIdToDelete });
      return { 
        success: true, 
        message: 'Adição excluída com sucesso',
        data: { id, numericId: numericIdToDelete }
      };
      
    } catch (error: any) {
      safeError(`❌ contentService: Erro ao excluir adição ${id}:`, error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir adição',
        data: null
      };
    }
  }

  // ===== UPLOADS =====

  async uploadFile(file: File): Promise<StrapiUploadResponse[]> {
    try {
      const formData = new FormData();
      formData.append('files', file);
      
      const response = await strapiClient.post<StrapiUploadResponse[]>(
        '/upload',
        formData
      );
      
      if (!response || !Array.isArray(response) || response.length === 0) {
        throw new Error('Resposta de upload inválida ou vazia');
      }
      
      const firstFile = response[0];
      if (!firstFile || !firstFile.id) {
        throw new Error('Arquivo enviado mas sem ID válido');
      }
      
      return response;
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      throw error;
    }
  }

  async deleteFile(fileId: string): Promise<{ success: boolean; message: string }> {
    try {
      await strapiClient.delete(`/upload/files/${fileId}`);
      
      return { success: true, message: 'Arquivo excluído com sucesso' };
    } catch (error) {
      console.error(`Erro ao excluir arquivo ${fileId}:`, error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Erro ao excluir arquivo' 
      };
    }
  }

  // ===== UTILITÁRIOS =====

  getFileUrl(filePath: string): string {
    if (!filePath) return '';
    if (filePath.startsWith('http')) return filePath;
    return `${STRAPI_URL}${filePath}`;
  }

  mapStrapiDataToContentItem(data: any): ContentItem {
    return ContentMapper.strapiToContentItem(data);
  }

  async getAllContentsComplete(): Promise<ContentItem[]> {
    try {
      const allContents = await this.getAllContents();
      return allContents;
    } catch (error) {
      console.error('Erro ao buscar todos os conteúdos completamente:', error);
      throw error;
    }
  }

  async getStats(sector?: SectorType) {
    try {
      const contents = sector ? 
        await this.getContentsBySector(sector) : 
        await this.getAllContents();

      const byType = {
        tutorial: contents.filter(c => c.category === 'tutorial').length,
        procedure: contents.filter(c => c.category === 'procedure').length,
        configuration: contents.filter(c => c.category === 'configuration').length,
        guide: contents.filter(c => c.category === 'guide').length,
        text: contents.filter(c => c.type === 'text').length,
        photo: contents.filter(c => c.type === 'photo').length,
        video: contents.filter(c => c.type === 'video').length,
        title: contents.filter(c => c.type === 'title').length,
      };

      const bySector: Record<string, number> = {};
      contents.forEach(content => {
        const sectorKey = content.sector || 'indefinido';
        bySector[sectorKey] = (bySector[sectorKey] || 0) + 1;
      });

      return {
        total: contents.length,
        byType,
        bySector
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { 
        total: 0, 
        byType: {
          tutorial: 0, procedure: 0, configuration: 0, guide: 0,
          text: 0, photo: 0, video: 0, title: 0
        }, 
        bySector: {}
      };
    }
  }

  async debugPagination(): Promise<{ contents: number; wikiAdditions: number }> {
    console.log('Iniciando depuração de paginação...');
    try {
      const allContents = await this.getAllContents();
      const allWikiAdditions = await this.getAllWikiAdditions();

      console.log(`📊 Resultados carregados: {contents: ${allContents.length}, wikiAdditions: ${allWikiAdditions.length}}`);
      console.log(`✅ Total wiki-additions carregadas: ${allWikiAdditions.length}`);

      return {
        contents: allContents.length,
        wikiAdditions: allWikiAdditions.length,
      };
    } catch (error) {
      console.error('Erro durante a depuração de paginação:', error);
      return { contents: 0, wikiAdditions: 0 };
    }
  }
}

// ===== INSTÂNCIA ÚNICA =====
export const contentService = new ContentService();

// ===== EXPORTS =====
export default contentService;
export { ContentMapper, StrapiClient };

// ===== FUNÇÃO DE EXCLUSÃO SEGURA =====
export const deleteContentSafely = async (contentId: string): Promise<DeleteResult> => {
  return await contentService.deleteContent(contentId);
};

// ===== FUNÇÃO GETCONTENTSTATS CORRIGIDA =====
export async function getContentStats(sector?: SectorType): Promise<{
  total: number;
  byType: Record<string, number>;
  bySector: Record<string, number>;
}> {
  return await contentService.getStats(sector);
}

// ===== DISPONIBILIZAR NO WINDOW PARA DEBUG =====
if (typeof window !== 'undefined') {
  (window as any).contentService = contentService;
}