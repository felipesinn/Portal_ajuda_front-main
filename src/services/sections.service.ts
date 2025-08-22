// src/services/sections.service.ts - Serviço para gerenciar seções (compatível com Strapi v5)
import { ENV_CONFIG } from '../utils/envUtils';

// ===== CONFIGURAÇÃO BASE =====
const STRAPI_URL = ENV_CONFIG.apiUrl;
const API_BASE = `${STRAPI_URL}/api`;

// ===== INTERFACES =====
export interface Section {
  id: number;
  documentId?: string;
  title: string;
  content: string;
  order: number;
  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
}

interface StrapiResponse<T> {
  data: T;
  meta?: any;
}

interface CreateSectionData {
  title: string;
  content: string;
  order: number;
  contentId: number;
}

interface UpdateSectionData {
  title: string;
  content: string;
  order: number;
}

// ===== CLIENTE PARA SEÇÕES =====
class SectionsService {
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
   * Busca seções por ID do conteúdo
   */
  async getSectionsByContentId(contentId: number): Promise<Section[]> {
    try {
      // Para Strapi v5, vamos tentar diferentes endpoints possíveis
      const endpoints = [
        `/sections?filters[contentId][$eq]=${contentId}&sort=order:asc`,
        `/sections?filters[content][$eq]=${contentId}&sort=order:asc`,
        `/sections?filters[parent_content][$eq]=${contentId}&sort=order:asc`,
        `/wiki-additions?filters[parent_content][$eq]=${contentId}&sort=order:asc`
      ];

      for (const endpoint of endpoints) {
        try {
          const response = await this.request<StrapiResponse<Section[]>>(endpoint);
          if (response.data && Array.isArray(response.data) && response.data.length > 0) {
            return response.data.map(this.mapStrapiSection);
          }
        } catch (error) {
          // Continua para o próximo endpoint
          continue;
        }
      }

      // Se nenhum endpoint funcionou, retorna array vazio
      return [];
    } catch (error) {
      console.error('Erro ao buscar seções:', error);
      return [];
    }
  }

  /**
   * Cria uma nova seção
   */
  async createSection(data: CreateSectionData): Promise<Section> {
    try {
      // Para Strapi v5, o payload pode precisar ser estruturado diferentemente
      const payload = {
        data: {
          title: data.title,
          content: data.content,
          order: data.order,
          contentId: data.contentId,
          // Alternativas para diferentes estruturas
          content_id: data.contentId,
          parent_content: data.contentId
        }
      };

      const response = await this.request<StrapiResponse<Section>>(
        '/sections',
        {
          method: 'POST',
          body: JSON.stringify(payload)
        }
      );

      return this.mapStrapiSection(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Atualiza uma seção existente
   */
  async updateSection(id: number, data: UpdateSectionData): Promise<Section> {
    try {
      const payload = {
        data: {
          title: data.title,
          content: data.content,
          order: data.order
        }
      };

      // Para Strapi v5, pode usar documentId ou ID numérico
      const response = await this.request<StrapiResponse<Section>>(
        `/sections/${id}`,
        {
          method: 'PUT',
          body: JSON.stringify(payload)
        }
      );

      return this.mapStrapiSection(response.data);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Exclui uma seção
   */
  async deleteSection(id: number): Promise<void> {
    try {
      await this.request<void>(`/sections/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mapeia dados do Strapi para Section
   */
  private mapStrapiSection(strapiData: any): Section {
    // Para Strapi v5, os dados podem vir em diferentes estruturas
    const data = strapiData.attributes || strapiData;
    
    return {
      id: strapiData.id || data.id,
      documentId: strapiData.documentId || data.documentId,
      title: data.title || '',
      content: data.content || '',
      order: data.order || 0,
      createdAt: data.createdAt || strapiData.createdAt,
      updatedAt: data.updatedAt || strapiData.updatedAt,
      publishedAt: data.publishedAt || strapiData.publishedAt
    };
  }
}

// ===== INSTÂNCIA ÚNICA =====
export const sectionsService = new SectionsService();

// ===== EXPORTS =====
export default sectionsService;

