// src/utils/mapper.utils.ts - Utilitários de mapeamento de dados
import type { ContentItem, ContentType, ContentCategory } from '../types/content.types';
import type { SectorType } from '../types/common.types';

// ===== INTERFACES PARA DADOS DO STRAPI =====
export interface StrapiContentRaw {
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
  createdBy?: {
    id: number;
    firstname?: string;
    lastname?: string;
    username?: string;
    email?: string;
  };
}

export interface StrapiWikiAddition {
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

export interface StrapiUploadResponse {
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

// ===== CLASSE DE MAPEAMENTO =====
export class DataMapper {
  private static STRAPI_URL = 'https://strapi.cznet.net.br';

  /**
   * Extrai texto de conteúdo estruturado do Strapi
   */
  static extractTextFromStrapiContent(strapiContent: any[]): string {
    if (!strapiContent || !Array.isArray(strapiContent)) return '';
    
    return strapiContent.map(block => {
      if (block.children && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join(' ').trim();
  }

  /**
   * Converte tipo do Strapi para ContentType
   */
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

  /**
   * Converte setor do Strapi para SectorType
   */
  static convertStrapiSectorToSectorType(strapiSector: string): SectorType {
    return strapiSector as SectorType;
  }

  /**
   * Converte categoria do Strapi para ContentCategory
   */
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

  /**
   * Processa anexos de wiki additions
   */
  static processWikiAdditionAttachments(attachments: any): any[] {
    let attachmentList = [];
    
    if (attachments?.data && Array.isArray(attachments.data)) {
      attachmentList = attachments.data;
    } else if (Array.isArray(attachments)) {
      attachmentList = attachments;
    } else if (attachments?.data && !Array.isArray(attachments.data)) {
      attachmentList = [attachments.data];
    } else if (attachments && attachments.id) {
      attachmentList = [attachments];
    }
    
    return attachmentList.map((att: any) => {
      const attrs = att.attributes || att;
      return {
        id: att.id || attrs.id,
        name: attrs.name || attrs.filename || 'Arquivo',
        url: attrs.url ? `${this.STRAPI_URL}${attrs.url}` : '',
        mime: attrs.mime || attrs.mimetype || 'unknown',
        size: attrs.size || 0,
        alt: attrs.alternativeText || attrs.alt || attrs.name || ''
      };
    }).filter((att: any) => att.url);
  }

  /**
   * Filtra wiki additions relacionadas a um conteúdo
   */
  static filterRelatedWikiAdditions(
    allWikiAdditions: StrapiWikiAddition[], 
    strapiItem: StrapiContentRaw
  ): any[] {
    return allWikiAdditions.filter(addition => {
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

      return parentId === strapiItem.documentId || parentId === strapiItem.id;
      
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
      attachments: this.processWikiAdditionAttachments(addition.attachments)
    })).sort((a: any, b: any) => a.order - b.order);
  }

  /**
   * Converte item do Strapi para ContentItem
   */
  static strapiToContentItem(
    strapiItem: StrapiContentRaw, 
    allWikiAdditions: StrapiWikiAddition[] = []
  ): ContentItem {
    const relatedWikiAdditions = this.filterRelatedWikiAdditions(allWikiAdditions, strapiItem);

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
      createdByName: strapiItem.createdBy?.username || relatedWikiAdditions[0]?.author || 'Sistema',
      createdBy: strapiItem.createdBy ? { 
        id: strapiItem.createdBy.id.toString(), 
        username: strapiItem.createdBy.username || '', 
        email: strapiItem.createdBy?.email || '' 
      } : undefined,
      filePath: strapiItem.media?.[0]?.url ? `${this.STRAPI_URL}${strapiItem.media[0].url}` : undefined,

      // Dados específicos do Strapi
      strapiData: {
        documentId: strapiItem.documentId,
        numericId: strapiItem.id,
        media: strapiItem.media || [],
        all_wiki_additions: relatedWikiAdditions,
        wiki_addition: relatedWikiAdditions[0] || null
      }
    } as unknown as ContentItem;
  }

  /**
   * Mapeia tipo de conteúdo para tipo de adição
   */
  static mapContentTypeToAdditionType(contentType: ContentType): string {
    const additionTypeMap: Record<string, string> = {
      'photo': 'image',
      'video': 'video', 
      'text': 'text',
      'title': 'text',
      'tutorial': 'text'
    };
    return additionTypeMap[contentType] || 'text';
  }

  /**
   * Cria payload para wiki addition
   */
  static createWikiAdditionPayload(data: {
    title: string;
    textContent: string;
    type: ContentType;
    order: number;
    author: string;
    parentContentId: number;
    uploadedFileId?: number | null;
  }): any {
    const payload: any = {
      title: data.title,
      content: [
        {
          type: 'paragraph',
          children: [{ text: data.textContent || 'Nova adição', type: 'text' }]
        }
      ],
      additionType: this.mapContentTypeToAdditionType(data.type),
      order: data.order,
      author: data.author,
      isVisible: true,
      parent_content: data.parentContentId 
    };

    if (data.uploadedFileId) {
      payload.attachments = [data.uploadedFileId];
    }

    return payload;
  }
}

// ===== EXPORTS =====
export default DataMapper;

