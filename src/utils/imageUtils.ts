// src/utils/imageUtils.ts
import React from 'react';

/**
 * Configuração centralizada para URLs de imagem
 */
const IMAGE_CONFIG = {
  // URL base do Strapi
  STRAPI_BASE: 'http://localhost:1337',
  
  // Caminhos de upload
  UPLOAD_PATH: '/uploads',
  API_UPLOAD_PATH: '/api/uploads',
  
  // Fallbacks
  PLACEHOLDER: 'https://via.placeholder.com/150?text=Imagem+Nao+Disponivel',
  ERROR_IMAGE: 'https://via.placeholder.com/150?text=Erro+ao+Carregar',
} as const;

/**
 * Normaliza URLs de imagem para garantir consistência
 */
export const normalizeImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath || imagePath.trim() === '') {
    return IMAGE_CONFIG.PLACEHOLDER;
  }

  const cleanPath = imagePath.trim();

  // Se já é uma URL completa, retorna como está
  if (cleanPath.startsWith('http://') || cleanPath.startsWith('https://')) {
    return cleanPath;
  }

  // Se é um placeholder ou erro, retorna como está
  if (cleanPath.includes('placeholder') || cleanPath.includes('via.placeholder')) {
    return cleanPath;
  }

  // Remove barras iniciais múltiplas
  const normalizedPath = cleanPath.replace(/^\/+/, '');

  // Se começa com 'api/uploads', converte para Strapi direto
  if (normalizedPath.startsWith('api/uploads/')) {
    const fileName = normalizedPath.replace('api/uploads/', '');
    return `${IMAGE_CONFIG.STRAPI_BASE}${IMAGE_CONFIG.UPLOAD_PATH}/${fileName}`;
  }

  // Se começa com 'uploads', adiciona apenas a base
  if (normalizedPath.startsWith('uploads/')) {
    return `${IMAGE_CONFIG.STRAPI_BASE}/${normalizedPath}`;
  }

  // Para qualquer outro caso, assume que é um nome de arquivo
  return `${IMAGE_CONFIG.STRAPI_BASE}${IMAGE_CONFIG.UPLOAD_PATH}/${normalizedPath}`;
};

/**
 * Gera URL de thumbnail (se o backend suportar)
 */
export const getThumbnailUrl = (imagePath: string | undefined | null, size: 'small' | 'medium' | 'large' = 'medium'): string => {
  const baseUrl = normalizeImageUrl(imagePath);
  
  // Se é placeholder, retorna como está
  if (baseUrl.includes('placeholder')) {
    return baseUrl;
  }
  
  // Se o Strapi suportar thumbnails automáticos, adiciona parâmetros
  const sizeMappings = {
    small: '150x150',
    medium: '300x300',
    large: '600x600'
  };
  
  // Exemplo: adicionar parâmetros de redimensionamento se o backend suportar
  // return `${baseUrl}?format=webp&resize=${sizeMappings[size]}`;
  
  return baseUrl;
};

/**
 * Valida se uma URL de imagem é válida
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Obtém extensão do arquivo de uma URL
 */
export const getImageExtension = (url: string): string | null => {
  if (!url) return null;
  
  const matches = url.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
  return matches ? matches[1].toLowerCase() : null;
};

/**
 * Verifica se a extensão é de imagem suportada
 */
export const isSupportedImageFormat = (url: string): boolean => {
  const extension = getImageExtension(url);
  const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];
  return extension ? supportedFormats.includes(extension) : false;
};

/**
 * Função para criar props de imagem otimizada
 */
export const createOptimizedImageProps = (
  src: string | undefined | null,
  alt: string,
  options: {
    className?: string;
    onClick?: () => void;
    loading?: 'lazy' | 'eager';
    thumbnail?: boolean;
    thumbnailSize?: 'small' | 'medium' | 'large';
  } = {}
) => {
  const {
    className = '',
    onClick,
    loading = 'lazy',
    thumbnail = false,
    thumbnailSize = 'medium'
  } = options;

  const imageUrl = thumbnail ? getThumbnailUrl(src, thumbnailSize) : normalizeImageUrl(src);
  
  return {
    src: imageUrl,
    alt,
    className,
    loading,
    onClick: onClick && imageUrl !== IMAGE_CONFIG.PLACEHOLDER ? onClick : undefined,
    onError: (e: Event) => {
      const img = e.target as HTMLImageElement;
      if (img.src !== IMAGE_CONFIG.ERROR_IMAGE) {
        img.src = IMAGE_CONFIG.ERROR_IMAGE;
      }
    },
    style: {
      cursor: onClick && imageUrl !== IMAGE_CONFIG.PLACEHOLDER ? 'pointer' : 'default',
      transition: 'opacity 0.2s ease-in-out'
    }
  };
};

/**
 * Componente de imagem otimizada (versão simplificada)
 */
export const OptimizedImage = {
  create: createOptimizedImageProps,
  placeholder: IMAGE_CONFIG.PLACEHOLDER,
  errorImage: IMAGE_CONFIG.ERROR_IMAGE
};

/**
 * Hook para gerenciar múltiplas imagens
 */
export const useImageGallery = (images: (string | { path: string; alt?: string })[] = []) => {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = React.useState(false);

  const normalizedImages = React.useMemo(() => 
    images.map((img, index) => ({
      url: normalizeImageUrl(typeof img === 'string' ? img : img.path),
      alt: typeof img === 'string' ? `Imagem ${index + 1}` : (img.alt || `Imagem ${index + 1}`),
      original: img
    })), 
    [images]
  );

  const openGallery = React.useCallback((index: number = 0) => {
    setCurrentIndex(Math.max(0, Math.min(index, normalizedImages.length - 1)));
    setIsGalleryOpen(true);
  }, [normalizedImages.length]);

  const closeGallery = React.useCallback(() => {
    setIsGalleryOpen(false);
  }, []);

  const nextImage = React.useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % normalizedImages.length);
  }, [normalizedImages.length]);

  const prevImage = React.useCallback(() => {
    setCurrentIndex(prev => prev === 0 ? normalizedImages.length - 1 : prev - 1);
  }, [normalizedImages.length]);

  return {
    images: normalizedImages,
    currentIndex,
    isGalleryOpen,
    currentImage: normalizedImages[currentIndex],
    openGallery,
    closeGallery,
    nextImage,
    prevImage,
    hasMultiple: normalizedImages.length > 1
  };
};

/**
 * Constantes para tipos de erro
 */
export const IMAGE_ERROR_TYPES = {
  LOAD_ERROR: 'load_error',
  INVALID_URL: 'invalid_url',
  UNSUPPORTED_FORMAT: 'unsupported_format',
  NETWORK_ERROR: 'network_error'
} as const;

export type ImageErrorType = typeof IMAGE_ERROR_TYPES[keyof typeof IMAGE_ERROR_TYPES];

/**
 * Hook para monitorar status de carregamento de imagens
 */
export const useImageStatus = (src: string | undefined | null) => {
  const [status, setStatus] = React.useState<'loading' | 'loaded' | 'error'>('loading');
  const [errorType, setErrorType] = React.useState<ImageErrorType | null>(null);

  React.useEffect(() => {
    if (!src) {
      setStatus('error');
      setErrorType(IMAGE_ERROR_TYPES.INVALID_URL);
      return;
    }

    const normalizedUrl = normalizeImageUrl(src);
    
    if (!isSupportedImageFormat(normalizedUrl)) {
      setStatus('error');
      setErrorType(IMAGE_ERROR_TYPES.UNSUPPORTED_FORMAT);
      return;
    }

    setStatus('loading');
    setErrorType(null);

    const img = new Image();
    
    img.onload = () => {
      setStatus('loaded');
      setErrorType(null);
    };
    
    img.onerror = () => {
      setStatus('error');
      setErrorType(IMAGE_ERROR_TYPES.LOAD_ERROR);
    };
    
    img.src = normalizedUrl;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  return { status, errorType, isLoading: status === 'loading', isLoaded: status === 'loaded', hasError: status === 'error' };
};

export default {
  normalizeImageUrl,
  getThumbnailUrl,
  isValidImageUrl,
  getImageExtension,
  isSupportedImageFormat,
  createOptimizedImageProps,
  useImageGallery,
  useImageStatus,
  IMAGE_CONFIG,
  IMAGE_ERROR_TYPES
};