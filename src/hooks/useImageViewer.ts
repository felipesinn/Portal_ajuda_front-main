// // src/hooks/useImageViewer.ts
// import { useState, useCallback, useEffect, useRef } from 'react';

// interface ImageViewerState {
//   imagePreview: string | null;
//   imageZoom: number;
//   imageRotation: number;
//   isLoading: boolean;
//   error: string | null;
//   imageData?: {
//     naturalWidth: number;
//     naturalHeight: number;
//     aspectRatio: number;
//   };
// }

// export const useImageViewer = () => {
//   const [state, setState] = useState<ImageViewerState>({
//     imagePreview: null,
//     imageZoom: 1,
//     imageRotation: 0,
//     isLoading: false,
//     error: null
//   });

//   const imageRef = useRef<HTMLImageElement | null>(null);
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   // Configurações
//   const MIN_ZOOM = 0.1;
//   const MAX_ZOOM = 5;
//   const ZOOM_STEP = 0.2;

//   const openImage = useCallback((url: string) => {
//     console.log('🖼️ Abrindo imagem:', url);
    
//     setState(prev => ({
//       ...prev,
//       imagePreview: url,
//       imageZoom: 1,
//       imageRotation: 0,
//       isLoading: true,
//       error: null,
//       imageData: undefined
//     }));

//     // Pré-carregar a imagem para obter dimensões
//     const img = new Image();
    
//     img.onload = () => {
//       const aspectRatio = img.naturalWidth / img.naturalHeight;
      
//       setState(prev => ({
//         ...prev,
//         isLoading: false,
//         imageData: {
//           naturalWidth: img.naturalWidth,
//           naturalHeight: img.naturalHeight,
//           aspectRatio
//         }
//       }));
      
//       console.log('✅ Imagem carregada:', {
//         width: img.naturalWidth,
//         height: img.naturalHeight,
//         aspectRatio
//       });
//     };
    
//     img.onerror = () => {
//       console.error('❌ Erro ao carregar imagem');
//       setState(prev => ({
//         ...prev,
//         isLoading: false,
//         error: 'Não foi possível carregar a imagem'
//       }));
//     };
    
//     img.src = url;
//   }, []);

//   const closeImage = useCallback(() => {
//     console.log('🔒 Fechando visualizador de imagem');
//     setState({
//       imagePreview: null,
//       imageZoom: 1,
//       imageRotation: 0,
//       isLoading: false,
//       error: null,
//       imageData: undefined
//     });
//   }, []);

//   const setZoom = useCallback((newZoom: number) => {
//     const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
//     setState(prev => ({ ...prev, imageZoom: clampedZoom }));
//     console.log('🔍 Zoom alterado para:', clampedZoom);
//   }, []);

//   const zoomIn = useCallback(() => {
//     setState(prev => {
//       const newZoom = Math.min(prev.imageZoom + ZOOM_STEP, MAX_ZOOM);
//       console.log('➕ Zoom in:', newZoom);
//       return { ...prev, imageZoom: newZoom };
//     });
//   }, []);

//   const zoomOut = useCallback(() => {
//     setState(prev => {
//       const newZoom = Math.max(prev.imageZoom - ZOOM_STEP, MIN_ZOOM);
//       console.log('➖ Zoom out:', newZoom);
//       return { ...prev, imageZoom: newZoom };
//     });
//   }, []);

//   const resetZoom = useCallback(() => {
//     console.log('🔄 Resetando zoom');
//     setState(prev => ({ ...prev, imageZoom: 1 }));
//   }, []);

//   const fitToScreen = useCallback(() => {
//     if (!containerRef.current || !state.imageData) return;

//     const container = containerRef.current.getBoundingClientRect();
//     const { aspectRatio } = state.imageData;
    
//     const containerAspectRatio = container.width / container.height;
    
//     let newZoom: number;
//     if (aspectRatio > containerAspectRatio) {
//       // Imagem é mais larga, ajustar pela largura
//       newZoom = (container.width * 0.9) / (state.imageData.naturalWidth);
//     } else {
//       // Imagem é mais alta, ajustar pela altura
//       newZoom = (container.height * 0.9) / (state.imageData.naturalHeight);
//     }
    
//     const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
//     setState(prev => ({ ...prev, imageZoom: clampedZoom }));
//     console.log('📐 Ajustado à tela:', clampedZoom);
//   }, [state.imageData]);

//   const rotate = useCallback(() => {
//     setState(prev => {
//       const newRotation = (prev.imageRotation + 90) % 360;
//       console.log('🔄 Rotação:', newRotation);
//       return { ...prev, imageRotation: newRotation };
//     });
//   }, []);

//   const setRotation = useCallback((angle: number) => {
//     const normalizedAngle = ((angle % 360) + 360) % 360;
//     setState(prev => ({ ...prev, imageRotation: normalizedAngle }));
//     console.log('🎯 Rotação definida:', normalizedAngle);
//   }, []);

//   const resetRotation = useCallback(() => {
//     console.log('🔄 Resetando rotação');
//     setState(prev => ({ ...prev, imageRotation: 0 }));
//   }, []);

//   const resetAll = useCallback(() => {
//     console.log('🔄 Resetando tudo');
//     setState(prev => ({
//       ...prev,
//       imageZoom: 1,
//       imageRotation: 0
//     }));
//   }, []);

//   // Atalhos de teclado
//   useEffect(() => {
//     if (!state.imagePreview) return;

//     const handleKeyDown = (e: KeyboardEvent) => {
//       switch (e.key) {
//         case 'Escape':
//           closeImage();
//           break;
//         case '=':
//         case '+':
//           e.preventDefault();
//           zoomIn();
//           break;
//         case '-':
//           e.preventDefault();
//           zoomOut();
//           break;
//         case '0':
//           e.preventDefault();
//           resetZoom();
//           break;
//         case 'r':
//         case 'R':
//           e.preventDefault();
//           rotate();
//           break;
//         case 'f':
//         case 'F':
//           e.preventDefault();
//           fitToScreen();
//           break;
//       }
//     };

//     window.addEventListener('keydown', handleKeyDown);
//     return () => window.removeEventListener('keydown', handleKeyDown);
//   }, [state.imagePreview, closeImage, zoomIn, zoomOut, resetZoom, rotate, fitToScreen]);

//   // Gesture/Touch support (básico)
//   const handleWheel = useCallback((e: WheelEvent) => {
//     if (!state.imagePreview) return;
    
//     e.preventDefault();
//     const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
//     const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.imageZoom + delta));
//     setState(prev => ({ ...prev, imageZoom: newZoom }));
//   }, [state.imagePreview, state.imageZoom]);

//   // Informações sobre o estado atual
//   const getImageInfo = useCallback(() => {
//     if (!state.imageData) return null;
    
//     return {
//       dimensions: `${state.imageData.naturalWidth} × ${state.imageData.naturalHeight}`,
//       aspectRatio: state.imageData.aspectRatio.toFixed(2),
//       zoom: `${Math.round(state.imageZoom * 100)}%`,
//       rotation: `${state.imageRotation}°`,
//       isPortrait: state.imageData.aspectRatio < 1,
//       isLandscape: state.imageData.aspectRatio > 1,
//       isSquare: Math.abs(state.imageData.aspectRatio - 1) < 0.1
//     };
//   }, [state.imageData, state.imageZoom, state.imageRotation]);

//   return {
//     // Estado atual
//     imagePreview: state.imagePreview,
//     imageZoom: state.imageZoom,
//     imageRotation: state.imageRotation,
//     isLoading: state.isLoading,
//     error: state.error,
//     imageData: state.imageData,
    
//     // Controles básicos
//     openImage,
//     closeImage,
    
//     // Controles de zoom
//     zoomIn,
//     zoomOut,
//     setZoom,
//     resetZoom,
//     fitToScreen,
    
//     // Controles de rotação
//     rotate,
//     setRotation,
//     resetRotation,
    
//     // Utilitários
//     resetAll,
//     getImageInfo,
//     handleWheel,
    
//     // Refs para componentes
//     imageRef,
//     containerRef,
    
//     // Configurações
//     minZoom: MIN_ZOOM,
//     maxZoom: MAX_ZOOM,
//     zoomStep: ZOOM_STEP,
    
//     // Estados derivados
//     isOpen: state.imagePreview !== null,
//     canZoomIn: state.imageZoom < MAX_ZOOM,
//     canZoomOut: state.imageZoom > MIN_ZOOM,
//     isZoomed: state.imageZoom !== 1,
//     isRotated: state.imageRotation !== 0,
//     isModified: state.imageZoom !== 1 || state.imageRotation !== 0
//   };
// };

// export default useImageViewer;

// src/hooks/useImageViewer.ts
import { useState, useCallback, useEffect, useRef } from 'react';

interface ImageViewerState {
  imagePreview: string | null;
  imageZoom: number;
  imageRotation: number;
  isLoading: boolean;
  error: string | null;
  imageData?: {
    naturalWidth: number;
    naturalHeight: number;
    aspectRatio: number;
  };
}

export const useImageViewer = () => {
  const [state, setState] = useState<ImageViewerState>({
    imagePreview: null,
    imageZoom: 1,
    imageRotation: 0,
    isLoading: false,
    error: null
  });

  const imageRef = useRef<HTMLImageElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Configurações
  const MIN_ZOOM = 0.1;
  const MAX_ZOOM = 5;
  const ZOOM_STEP = 0.2;

  const openImage = useCallback((url: string) => {
    console.log('🖼️ Abrindo imagem:', url);
    
    setState(prev => ({
      ...prev,
      imagePreview: url,
      imageZoom: 1,
      imageRotation: 0,
      isLoading: true,
      error: null,
      imageData: undefined
    }));

    // Pré-carregar a imagem para obter dimensões
    const img = new Image();
    
    img.onload = () => {
      const aspectRatio = img.naturalWidth / img.naturalHeight;
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        imageData: {
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          aspectRatio
        }
      }));
      
      console.log('✅ Imagem carregada:', {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio
      });
    };
    
    img.onerror = () => {
      console.error('❌ Erro ao carregar imagem');
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Não foi possível carregar a imagem'
      }));
    };
    
    img.src = url;
  }, []);

  const closeImage = useCallback(() => {
    console.log('🔒 Fechando visualizador de imagem');
    setState({
      imagePreview: null,
      imageZoom: 1,
      imageRotation: 0,
      isLoading: false,
      error: null,
      imageData: undefined
    });
  }, []);

  const setZoom = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    setState(prev => ({ ...prev, imageZoom: clampedZoom }));
    console.log('🔍 Zoom alterado para:', clampedZoom);
  }, []);

  const zoomIn = useCallback(() => {
    setState(prev => {
      const newZoom = Math.min(prev.imageZoom + ZOOM_STEP, MAX_ZOOM);
      console.log('➕ Zoom in:', newZoom);
      return { ...prev, imageZoom: newZoom };
    });
  }, []);

  const zoomOut = useCallback(() => {
    setState(prev => {
      const newZoom = Math.max(prev.imageZoom - ZOOM_STEP, MIN_ZOOM);
      console.log('➖ Zoom out:', newZoom);
      return { ...prev, imageZoom: newZoom };
    });
  }, []);

  const resetZoom = useCallback(() => {
    console.log('🔄 Resetando zoom');
    setState(prev => ({ ...prev, imageZoom: 1 }));
  }, []);

  const fitToScreen = useCallback(() => {
    if (!containerRef.current || !state.imageData) return;

    const container = containerRef.current.getBoundingClientRect();
    const { aspectRatio } = state.imageData;
    
    const containerAspectRatio = container.width / container.height;
    
    let newZoom: number;
    if (aspectRatio > containerAspectRatio) {
      // Imagem é mais larga, ajustar pela largura
      newZoom = (container.width * 0.9) / (state.imageData.naturalWidth);
    } else {
      // Imagem é mais alta, ajustar pela altura
      newZoom = (container.height * 0.9) / (state.imageData.naturalHeight);
    }
    
    const clampedZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
    setState(prev => ({ ...prev, imageZoom: clampedZoom }));
    console.log('📐 Ajustado à tela:', clampedZoom);
  }, [state.imageData]);

  const rotate = useCallback(() => {
    setState(prev => {
      const newRotation = (prev.imageRotation + 90) % 360;
      console.log('🔄 Rotação:', newRotation);
      return { ...prev, imageRotation: newRotation };
    });
  }, []);

  const setRotation = useCallback((angle: number) => {
    const normalizedAngle = ((angle % 360) + 360) % 360;
    setState(prev => ({ ...prev, imageRotation: normalizedAngle }));
    console.log('🎯 Rotação definida:', normalizedAngle);
  }, []);

  const resetRotation = useCallback(() => {
    console.log('🔄 Resetando rotação');
    setState(prev => ({ ...prev, imageRotation: 0 }));
  }, []);

  const resetAll = useCallback(() => {
    console.log('🔄 Resetando tudo');
    setState(prev => ({
      ...prev,
      imageZoom: 1,
      imageRotation: 0
    }));
  }, []);

  // Atalhos de teclado
  useEffect(() => {
    if (!state.imagePreview) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeImage();
          break;
        case '=':
        case '+':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'r':
        case 'R':
          e.preventDefault();
          rotate();
          break;
        case 'f':
        case 'F':
          e.preventDefault();
          fitToScreen();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.imagePreview, closeImage, zoomIn, zoomOut, resetZoom, rotate, fitToScreen]);

  // ✅ CORREÇÃO: Usando React.WheelEvent<HTMLDivElement>
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    if (!state.imagePreview) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.imageZoom + delta));
    setState(prev => ({ ...prev, imageZoom: newZoom }));
  }, [state.imagePreview, state.imageZoom]);

  // Suporte a gestos de toque (básico)
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      // Preparar para pinch zoom
      e.preventDefault();
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      // Implementar pinch zoom se necessário
    }
  }, []);

  // Informações sobre o estado atual
  const getImageInfo = useCallback(() => {
    if (!state.imageData) return null;
    
    return {
      dimensions: `${state.imageData.naturalWidth} × ${state.imageData.naturalHeight}`,
      aspectRatio: state.imageData.aspectRatio.toFixed(2),
      zoom: `${Math.round(state.imageZoom * 100)}%`,
      rotation: `${state.imageRotation}°`,
      isPortrait: state.imageData.aspectRatio < 1,
      isLandscape: state.imageData.aspectRatio > 1,
      isSquare: Math.abs(state.imageData.aspectRatio - 1) < 0.1
    };
  }, [state.imageData, state.imageZoom, state.imageRotation]);

  // Função para calcular o tamanho da imagem renderizada
  const getRenderedSize = useCallback(() => {
    if (!state.imageData) return null;
    
    const { naturalWidth, naturalHeight } = state.imageData;
    const renderedWidth = naturalWidth * state.imageZoom;
    const renderedHeight = naturalHeight * state.imageZoom;
    
    return {
      width: Math.round(renderedWidth),
      height: Math.round(renderedHeight),
      formattedSize: `${Math.round(renderedWidth)} × ${Math.round(renderedHeight)}`
    };
  }, [state.imageData, state.imageZoom]);

  return {
    // Estado atual
    imagePreview: state.imagePreview,
    imageZoom: state.imageZoom,
    imageRotation: state.imageRotation,
    isLoading: state.isLoading,
    error: state.error,
    imageData: state.imageData,
    
    // Controles básicos
    openImage,
    closeImage,
    
    // Controles de zoom
    zoomIn,
    zoomOut,
    setZoom,
    resetZoom,
    fitToScreen,
    
    // Controles de rotação
    rotate,
    setRotation,
    resetRotation,
    
    // Utilitários
    resetAll,
    getImageInfo,
    getRenderedSize,
    handleWheel,
    handleTouchStart,
    handleTouchMove,
    
    // Refs para componentes
    imageRef,
    containerRef,
    
    // Configurações
    minZoom: MIN_ZOOM,
    maxZoom: MAX_ZOOM,
    zoomStep: ZOOM_STEP,
    
    // Estados derivados
    isOpen: state.imagePreview !== null,
    canZoomIn: state.imageZoom < MAX_ZOOM,
    canZoomOut: state.imageZoom > MIN_ZOOM,
    isZoomed: state.imageZoom !== 1,
    isRotated: state.imageRotation !== 0,
    isModified: state.imageZoom !== 1 || state.imageRotation !== 0,
    
    // Informações úteis
    zoomPercentage: Math.round(state.imageZoom * 100),
    isMinZoom: state.imageZoom <= MIN_ZOOM,
    isMaxZoom: state.imageZoom >= MAX_ZOOM
  };
};

export default useImageViewer;