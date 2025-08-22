


// import React, { useState, type JSX } from 'react';
// import { X, Edit, Trash2, Plus, ZoomIn, RefreshCw, ZoomOut, RotateCw, Maximize2, Home } from 'lucide-react';
// import { useImageViewer } from '../../hooks/useImageViewer'; // Ajuste o caminho conforme necessário

// // ✅ Configuração centralizada da API
// const getApiBaseUrl = () => {
//   // Verifica se estamos em produção pelo hostname
//   const isProduction = window.location.hostname !== 'localhost' &&
//                        window.location.hostname !== '127.0.0.1';

//   return isProduction
//     ? 'https://strapi.cznet.net.br'
//     : 'http://localhost:1337';
// };

// const API_BASE_URL = getApiBaseUrl();

// interface SimpleContentViewerProps {
//   content: any;
//   onClose: () => void;
//   onEdit?: () => void;
//   onDelete?: () => void;
//   onAddContent?: () => void;
//   onEditAddition?: (additionId: string) => void;
//   onDeleteAddition?: (additionId: string) => void;
//   isAdmin?: boolean;
//   isSuperAdmin?: boolean;
// }

// // ---
// // ✅ FUNÇÃO formatTextContent MELHORADA PARA INDENTAÇÃO
// // ---
// const formatTextContent = (text: string): JSX.Element => {
//   if (!text) return <></>;

//   // Quebra o texto em linhas para processamento individual
//   const lines = text.split('\n');

//   return (
//     <div className="space-y-1"> {/* Espaçamento entre as linhas/itens */}
//       {lines.map((line, index) => {
//         const trimmedLine = line.trim();

//         if (!trimmedLine) return <br key={`empty-${index}`} />; // Lida com linhas vazias

//         // Regex para detectar padrões de lista numerada multinível:
//         // Ex: "1.", "1.1.", "2.3.4. Algum texto"
//         const numberedListPattern = /^(\d+(\.\d+)*\.)\s*(.*)/;
//         const numberedMatch = trimmedLine.match(numberedListPattern);

//         if (numberedMatch) {
//           const fullPrefix = numberedMatch[1]; // Ex: "1.", "1.1."
//           const content = numberedMatch[3];    // O resto da linha após o prefixo

//           // Calcula o nível de indentação baseado no número de pontos no prefixo
//           // "1." -> 0 níveis, "1.1." -> 1 nível, "1.1.1." -> 2 níveis
//           // Adicionamos +1 para garantir que "1." já tenha uma pequena indentação
//           const indentLevel = fullPrefix.split('.').length - 1; 
          
//           // Usar 'ml-' do Tailwind para indentação. Cada nível 4 unidades (16px)
//           // Você pode ajustar 'ml-4', 'ml-8', 'ml-12' conforme necessário.
//           // O `Math.min` é para evitar indentações excessivas para níveis muito profundos.
//           const indentClass = `ml-${Math.min(indentLevel + 1, 5) * 4}`; 
//           // Ex: nível 0 (1.) -> ml-4, nível 1 (1.1.) -> ml-8, nível 2 (1.1.1.) -> ml-12

//           return (
//             <p key={index} className={`flex items-baseline text-gray-800 leading-relaxed ${indentClass}`}>
//               <span className="font-semibold text-blue-700 mr-2 flex-shrink-0">
//                 {fullPrefix}
//               </span>
//               <span className="flex-1 text-sm sm:text-base">{content}</span>
//             </p>
//           );
//         }

//         // Regex para detectar listas não ordenadas simples (hífen)
//         const bulletListPattern = /^(-|\*)\s*(.*)/;
//         const bulletMatch = trimmedLine.match(bulletListPattern);

//         if (bulletMatch) {
//             const content = bulletMatch[2];
//             return (
//                 <p key={index} className="flex items-baseline ml-4 text-sm sm:text-base text-gray-800 leading-relaxed">
//                     <span className="mr-2 text-blue-500">•</span> {/* Marcador de lista */}
//                     <span>{content}</span>
//                 </p>
//             );
//         }

//         // Detecta se é um título/subtítulo (texto curto e em caixa alta, ou com marcadores de seção)
//         const isHeading = trimmedLine.length < 100 && 
//                           (trimmedLine === trimmedLine.toUpperCase() || 
//                            trimmedLine.startsWith('## ') || 
//                            trimmedLine.startsWith('### ') ||
//                            trimmedLine.match(/^(Passo|Etapa|Fase|Procedimento|Instrução|Seção)\b/i));

//         if (isHeading) {
//           // Remove marcadores de markdown se existirem para evitar duplicidade
//           const cleanHeading = trimmedLine.replace(/^(## |### )\s*/, '');
//           return (
//             <h4 key={index} className="text-base sm:text-lg font-bold text-gray-900 mt-4 mb-2 border-b-2 border-blue-200 pb-1">
//               {cleanHeading}
//             </h4>
//           );
//         }

//         // Parágrafo normal.
//         // Se houver múltiplas quebras de linha no original, tratamos como parágrafos separados.
//         return (
//           <p key={index} className="text-sm sm:text-base text-gray-800 leading-relaxed mb-2">
//             {trimmedLine}
//           </p>
//         );
//       })}
//     </div>
//   );
// };

// // ... (restante do seu código permanece inalterado)

// // ✅ Modal de imagem responsivo com zoom avançado
// const AdvancedImageModal: React.FC<{
//   src: string;
//   alt: string;
//   isOpen: boolean;
//   onClose: () => void;
// }> = ({ src, alt, isOpen, onClose }) => {
//   const imageViewer = useImageViewer();

//   React.useEffect(() => {
//     if (isOpen && src) {
//       console.log('🖼️ Abrindo modal com imagem:', src);
//       imageViewer.openImage(src);
//     }
//   }, [isOpen, src]);

//   const handleClose = React.useCallback(() => {
//     console.log('🔒 Fechando modal de imagem');
//     imageViewer.closeImage();
//     onClose();
//   }, [imageViewer, onClose]);

//   React.useEffect(() => {
//     if (!isOpen) return;

//     const handleEscKey = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') {
//         handleClose();
//       }
//     };

//     document.addEventListener('keydown', handleEscKey);
//     return () => document.removeEventListener('keydown', handleEscKey);
//   }, [isOpen, handleClose]);

//   if (!isOpen) return null;

//   const imageInfo = imageViewer.getImageInfo();

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col z-[60]">
//       {/* Header responsivo com controles */}
//       <div className="bg-black bg-opacity-80 text-white p-2 sm:p-4 flex justify-between items-center backdrop-blur-sm">
//         <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
//           <h3 className="text-sm sm:text-lg font-medium truncate">{alt}</h3>
//           {imageInfo && (
//             <div className="hidden md:flex items-center space-x-2 sm:space-x-4 text-xs sm:text-sm text-gray-300">
//               <span>{imageInfo.dimensions}</span>
//               <span>{imageInfo.zoom}</span>
//               <span>{imageInfo.rotation}</span>
//             </div>
//           )}
//         </div>

//         {/* Controles responsivos */}
//         <div className="flex items-center space-x-1 sm:space-x-2">
//           {/* Mobile: apenas controles essenciais */}
//           <div className="flex sm:hidden items-center space-x-1">
//             <button
//               onClick={imageViewer.zoomOut}
//               disabled={!imageViewer.canZoomOut}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 transition-colors"
//               title="Zoom -"
//             >
//               <ZoomOut size={16} />
//             </button>

//             <span className="text-xs min-w-[40px] text-center">
//               {Math.round(imageViewer.imageZoom * 100)}%
//             </span>

//             <button
//               onClick={imageViewer.zoomIn}
//               disabled={!imageViewer.canZoomIn}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 transition-colors"
//               title="Zoom +"
//             >
//               <ZoomIn size={16} />
//             </button>

//             <button
//               onClick={imageViewer.resetAll}
//               disabled={!imageViewer.isModified}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 transition-colors"
//               title="Reset"
//             >
//               <Home size={16} />
//             </button>

//             <button
//               onClick={handleClose}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
//               title="Fechar"
//             >
//               <X size={16} />
//             </button>
//           </div>

//           {/* Desktop: todos os controles */}
//           <div className="hidden sm:flex items-center space-x-2">
//             <button
//               onClick={imageViewer.zoomOut}
//               disabled={!imageViewer.canZoomOut}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               title="Diminuir zoom (tecla -)"
//             >
//               <ZoomOut size={20} />
//             </button>

//             <span className="text-sm min-w-[60px] text-center">
//               {Math.round(imageViewer.imageZoom * 100)}%
//             </span>

//             <button
//               onClick={imageViewer.zoomIn}
//               disabled={!imageViewer.canZoomIn}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               title="Aumentar zoom (tecla +)"
//             >
//               <ZoomIn size={20} />
//             </button>

//             <div className="h-6 w-px bg-gray-600 mx-2"></div>

//             <button
//               onClick={imageViewer.fitToScreen}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
//               title="Ajustar à tela (tecla F)"
//             >
//               <Maximize2 size={20} />
//             </button>

//             <button
//               onClick={imageViewer.rotate}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
//               title="Rotacionar (tecla R)"
//             >
//               <RotateCw size={20} />
//             </button>

//             <button
//               onClick={imageViewer.resetAll}
//               disabled={!imageViewer.isModified}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//               title="Resetar (tecla 0)"
//             >
//               <Home size={20} />
//             </button>

//             <div className="h-6 w-px bg-gray-600 mx-2"></div>

//             <button
//               onClick={handleClose}
//               className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
//               title="Fechar (tecla Esc)"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Container da imagem responsivo */}
//       <div
//         ref={imageViewer.containerRef}
//         className="flex-1 overflow-hidden relative cursor-move touch-none"
//         onWheel={imageViewer.handleWheel}
//         onClick={(e) => {
//           if (e.target === e.currentTarget) {
//             handleClose();
//           }
//         }}
//       >
//         <div className="w-full h-full flex items-center justify-center p-2 sm:p-4">
//           {imageViewer.isLoading ? (
//             <div className="text-white text-center">
//               <RefreshCw className="animate-spin mx-auto mb-4" size={24} />
//               <p className="text-sm sm:text-base">Carregando imagem...</p>
//             </div>
//           ) : imageViewer.error ? (
//             <div className="text-white text-center px-4">
//               <div className="text-red-400 mb-4 text-2xl sm:text-4xl">⚠️</div>
//               <p className="text-red-300 text-sm sm:text-base">{imageViewer.error}</p>
//             </div>
//           ) : (
//             <img
//               ref={imageViewer.imageRef}
//               src={src}
//               alt={alt}
//               className="select-none transition-transform duration-200 ease-out max-w-full max-h-full"
//               style={{
//                 transform: `scale(${imageViewer.imageZoom}) rotate(${imageViewer.imageRotation}deg)`,
//                 objectFit: 'contain'
//               }}
//               draggable={false}
//             />
//           )}
//         </div>
//       </div>

//       {/* Footer responsivo com atalhos */}
//       <div className="bg-black bg-opacity-80 text-gray-400 px-2 sm:px-4 py-1 sm:py-2 text-xs backdrop-blur-sm">
//         <div className="flex flex-wrap gap-2 sm:gap-4 justify-center sm:justify-start">
//           <span className="hidden sm:inline"><strong>Esc:</strong> Fechar</span>
//           <span><strong>+/-:</strong> Zoom</span>
//           <span className="hidden sm:inline"><strong>0:</strong> Reset</span>
//           <span className="hidden sm:inline"><strong>R:</strong> Girar</span>
//           <span className="hidden sm:inline"><strong>F:</strong> Ajustar</span>
//           <span><strong>Scroll:</strong> Zoom</span>
//         </div>
//       </div>
//     </div>
//   );
// };

// const AttachmentItem: React.FC<{
//   attachment: any;
//   index: number;
//   onDelete?: (attachmentId: string) => void;
//   isDeleting?: boolean;
// }> = ({ attachment, index, onDelete, isDeleting }) => {
//   const [imageModalOpen, setImageModalOpen] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   const imageUrl = attachment?.url
//     ? (attachment.url.startsWith('http')
//         ? attachment.url
//         : `${API_BASE_URL}${attachment.url}`)
//     : '';

//   const imageName = attachment?.name || attachment?.alt || `Imagem ${index + 1}`;

//   const handleDeleteAttachment = async () => {
//     if (!onDelete || !attachment?.id) return;

//     if (window.confirm(`Tem certeza que deseja excluir "${imageName}"?`)) {
//       await onDelete(attachment.id);
//     }
//   };

//   const handleOpenModal = React.useCallback(() => {
//     console.log('🖼️ Abrindo modal para anexo:', imageName);
//     setImageModalOpen(true);
//   }, [imageName]);

//   const handleCloseModal = React.useCallback(() => {
//     console.log('🔒 Fechando modal para anexo:', imageName);
//     setImageModalOpen(false);
//   }, [imageName]);

//   if (!imageUrl || imageError) {
//     return (
//       <div className="bg-gray-100 rounded-xl p-4 sm:p-6 text-center border-2 border-dashed border-gray-300 min-h-[120px] sm:min-h-[180px] flex flex-col items-center justify-center">
//         <div className="text-gray-400 mb-2 sm:mb-3 text-xl sm:text-2xl">📎</div>
//         <p className="text-xs sm:text-sm text-gray-500 mb-1">
//           {imageError ? 'Erro ao carregar imagem' : 'Sem URL válida'}
//         </p>
//         <p className="text-xs sm:text-sm text-gray-600 font-medium">{imageName}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="relative group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gray-300">
//       <div className="relative p-2 sm:p-4">
//         <div className="w-full h-32 sm:h-48 md:h-56 lg:h-64 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center">
//           <img
//             src={imageUrl}
//             alt={imageName}
//             className="max-w-full max-h-full w-auto h-auto object-contain cursor-pointer transition-transform hover:scale-105"
//             onClick={handleOpenModal}
//             onError={() => setImageError(true)}
//             loading="lazy"
//           />
//         </div>

//         {/* Overlay responsivo */}
//         <div className="absolute inset-2 sm:inset-4 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center rounded-lg">
//           <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2 sm:space-x-4">
//             <button
//               onClick={handleOpenModal}
//               className="bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-800 rounded-full p-2 sm:p-4 shadow-lg backdrop-blur-sm transform hover:scale-110 transition-all"
//               title="Ver com zoom avançado"
//             >
//               <ZoomIn size={16} className="sm:w-[22px] sm:h-[22px]" />
//             </button>

//             {onDelete && (
//               <button
//                 onClick={handleDeleteAttachment}
//                 disabled={isDeleting}
//                 className="bg-red-500 bg-opacity-95 hover:bg-opacity-100 text-white rounded-full p-2 sm:p-4 shadow-lg disabled:opacity-50 backdrop-blur-sm transform hover:scale-110 transition-all"
//                 title="Excluir anexo"
//               >
//                 {isDeleting ? (
//                   <RefreshCw size={16} className="sm:w-[22px] sm:h-[22px] animate-spin" />
//                 ) : (
//                   <Trash2 size={16} className="sm:w-[22px] sm:h-[22px]" />
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Footer responsivo */}
//       <div className="px-3 sm:px-6 py-2 sm:py-4 bg-gradient-to-r from-gray-50 to-gray-100">
//         <p className="text-sm sm:text-base font-semibold text-gray-800 truncate mb-1" title={imageName}>
//           {imageName}
//         </p>
//         {attachment?.size && (
//           <p className="text-xs text-gray-700">
//             📁 {(attachment.size / 1024).toFixed(1)} KB
//           </p>
//         )}
//       </div>

//       <AdvancedImageModal
//         key={`attachment-${attachment?.id || index}-${imageModalOpen}`}
//         src={imageUrl}
//         alt={imageName}
//         isOpen={imageModalOpen}
//         onClose={handleCloseModal}
//       />
//     </div>
//   );
// };

// const ContentViewer: React.FC<SimpleContentViewerProps> = ({
//   content,
//   onClose,
//   onEdit,
//   onDelete,
//   onAddContent,
//   onEditAddition,
//   onDeleteAddition,
//   isAdmin,
//   isSuperAdmin
// }) => {
//   const [deletingAddition, setDeletingAddition] = useState<string | null>(null);
//   const [deletingAttachment, setDeletingAttachment] = useState<string | null>(null);
//   const [mainImageModalOpen, setMainImageModalOpen] = useState(false);

//   if (!content) return null;

//   const safeContent = {
//     title: content.title || 'Sem título',
//     description: content.description || '',
//     category: content.category || 'configuration',
//     updatedAt: content.updatedAt || new Date().toISOString(),
//     textContent: content.textContent || '',
//     filePath: content.filePath || '',
//     strapiData: content.strapiData || {}
//   };

//   const showMessage = (message: string, type: 'success' | 'error' = 'success') => {
//     const notification = document.createElement('div');
//     const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
//     notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-[70] max-w-xs sm:max-w-sm text-sm`;
//     notification.textContent = message;
//     document.body.appendChild(notification);

//     setTimeout(() => {
//       if (document.body.contains(notification)) {
//         document.body.removeChild(notification);
//       }
//     }, type === 'error' ? 5000 : 3000);
//   };

//   const handleDeleteAddition = async (additionId: string) => {
//     if (!additionId) {
//       showMessage('ID da adição inválido', 'error');
//       return;
//     }

//     if (!window.confirm('Tem certeza que deseja excluir esta adição?')) {
//       return;
//     }

//     setDeletingAddition(additionId);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/wiki-additions/${additionId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });

//       if (response.status === 200 || response.status === 204) {
//         showMessage('Adição excluída com sucesso!', 'success');

//         if (onDeleteAddition) {
//           await onDeleteAddition(additionId);
//         } else {
//           setTimeout(() => window.location.reload(), 1500);
//         }
//       } else {
//         const errorData = await response.json().catch(() => ({}));
//         showMessage(errorData.message || `Erro HTTP ${response.status}`, 'error');
//       }
//     } catch (error: any) {
//       showMessage('Erro de conexão ao excluir adição', 'error');
//     } finally {
//       setDeletingAddition(null);
//     }
//   };

//   const handleDeleteAttachment = async (attachmentId: string) => {
//     if (!attachmentId) {
//       showMessage('ID do anexo inválido', 'error');
//       return;
//     }

//     setDeletingAttachment(attachmentId);

//     try {
//       const response = await fetch(`${API_BASE_URL}/api/upload/files/${attachmentId}`, {
//         method: 'DELETE',
//         headers: {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         }
//       });

//       if (response.status === 200 || response.status === 204) {
//         showMessage('Anexo excluído com sucesso!', 'success');
//         setTimeout(() => window.location.reload(), 1500);
//       } else {
//         showMessage(`Erro HTTP ${response.status} ao excluir anexo`, 'error');
//       }
//     } catch (error: any) {
//       showMessage('Erro de conexão ao excluir anexo', 'error');
//     } finally {
//       setDeletingAttachment(null);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
//       {/* Modal responsivo com animação de entrada */}
//       <div className="bg-white rounded-lg shadow-2xl w-full h-full sm:max-w-[95vw] sm:w-full sm:max-h-[90vh] sm:h-auto overflow-hidden flex flex-col transition-all duration-300 ease-out transform scale-95 sm:scale-100 opacity-100">
//         {/* Header responsivo */}
//         <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-start flex-shrink-0">
//           <div className="flex-1 min-w-0 pr-2">
//             <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 truncate">{safeContent.title}</h2>
//             <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-500">
//               <span className="capitalize">{safeContent.category}</span>
//               <span className="hidden sm:inline">•</span>
//               <span className="mt-1 sm:mt-0">
//                 Atualizado em {new Date(safeContent.updatedAt).toLocaleDateString('pt-BR')}
//               </span>
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="ml-2 p-2 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0"
//           >
//             <X size={20} className="w-5 h-5 sm:w-6 sm:h-6" />
//           </button>
//         </div>

//         {/* Content responsivo */}
//         <div className="flex-1 overflow-y-auto p-3 sm:p-6">
//           {safeContent.description && (
//             <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 border-l-4 border-blue-400 rounded-lg shadow-sm">
//               <p className="text-sm sm:text-base text-gray-700">{safeContent.description}</p>
//             </div>
//           )}

//           {/* Imagem principal responsiva */}
//           {safeContent.filePath && (
//             <div className="mb-4 sm:mb-6 relative group rounded-lg overflow-hidden border shadow-md">
//                 <img
//                   src={safeContent.filePath}
//                   alt={safeContent.title}
//                   className="w-full cursor-pointer transition-transform hover:scale-105"
//                   style={{ maxHeight: 'min(60vh, 500px)', objectFit: 'contain' }}
//                   onClick={() => setMainImageModalOpen(true)}
//                   onError={(e) => {
//                     e.currentTarget.style.display = 'none';
//                   }}
//                 />

//                 {/* Overlay responsivo */}
//                 <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
//                   <button
//                     onClick={() => setMainImageModalOpen(true)}
//                     className="bg-white bg-opacity-95 hover:bg-opacity-100 text-gray-800 rounded-full p-3 sm:p-4 shadow-lg backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform"
//                     title="Ver com zoom avançado"
//                   >
//                     <ZoomIn size={20} className="sm:w-6 sm:h-6" />
//                   </button>
//                 </div>
//               <AdvancedImageModal
//                 src={safeContent.filePath}
//                 alt={safeContent.title}
//                 isOpen={mainImageModalOpen}
//                 onClose={() => setMainImageModalOpen(false)}
//               />
//             </div>
//           )}

//           {/* ✅ SEÇÃO MELHORADA - Conteúdo textual com formatação aprimorada */}
//           {safeContent.textContent && (
//             <div className="mb-4 sm:mb-6">
//               <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 border-b border-gray-200 pb-2">
//                 📄 Conteúdo Principal
//               </h3>
//               <div className="bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
//                 {formatTextContent(safeContent.textContent)}
//               </div>
//             </div>
//           )}

//           {/* Adições responsivas com formatação melhorada */}
//           {safeContent.strapiData?.all_wiki_additions && Array.isArray(safeContent.strapiData.all_wiki_additions) && safeContent.strapiData.all_wiki_additions.length > 0 && (
//             <div className="mb-4 sm:mb-6">
//               <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-900 border-b border-gray-200 pb-2">
//                 ➕ Adições ao Conteúdo
//               </h3>
//               <div className="space-y-4 sm:space-y-6">
//                 {safeContent.strapiData.all_wiki_additions.map((wikiAddition: any, index: number) => (
//                   <div key={wikiAddition?.id || index} className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-4 sm:p-6 relative group shadow-sm hover:shadow-md transition-all">

//                     {/* Botões de ação responsivos */}
//                     <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
//                       {onEditAddition && (
//                         <button
//                           onClick={() => onEditAddition(wikiAddition?.id || `wiki-addition-${index}`)}
//                           className="p-2 bg-white hover:bg-blue-100 text-blue-600 rounded-md shadow-sm border border-blue-200"
//                           title="Editar esta adição"
//                         >
//                           <Edit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
//                         </button>
//                       )}
//                       {onDeleteAddition && wikiAddition?.id && (
//                         <button
//                           onClick={() => handleDeleteAddition(wikiAddition.id)}
//                           disabled={deletingAddition === wikiAddition.id}
//                           className="p-2 bg-white hover:bg-red-100 text-red-600 rounded-md shadow-sm border border-red-200 disabled:opacity-50"
//                           title={`Excluir: ${wikiAddition?.title || 'Esta adição'}`}
//                         >
//                           {deletingAddition === wikiAddition.id ? (
//                             <RefreshCw size={16} className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
//                           ) : (
//                             <Trash2 size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
//                           )}
//                         </button>
//                       )}
//                     </div>

//                     <h4 className="font-bold text-blue-900 mb-3 sm:mb-4 pr-16 sm:pr-20 text-base sm:text-lg border-b border-blue-200 pb-2">
//                       {wikiAddition?.title || `Adição ${index + 1}`}
//                     </h4>

//                     {/* ✅ Conteúdo da adição com formatação melhorada */}
//                     <div className="text-blue-800 mb-3 sm:mb-4">
//                       {wikiAddition?.content && Array.isArray(wikiAddition.content) && (
//                         <div className="space-y-3">
//                           {wikiAddition.content.map((block: any, blockIndex: number) => {
//                             const blockText = block?.children && Array.isArray(block.children)
//                               ? block.children.map((child: any) => child?.text || '').join('')
//                               : '';
                            
//                             if (!blockText.trim()) return null;
                            
//                             return (
//                               <div key={blockIndex} className="bg-white bg-opacity-50 p-3 rounded-lg border-l-4 border-blue-300">
//                                 {formatTextContent(blockText)}
//                               </div>
//                             );
//                           })}
//                         </div>
//                       )}
//                     </div>

//                     {/* Anexos responsivos */}
//                     {wikiAddition?.attachments && Array.isArray(wikiAddition.attachments) && wikiAddition.attachments.length > 0 && (
//                       <div className="mt-4 sm:mt-5">
//                         <h5 className="text-sm sm:text-base font-semibold text-blue-900 mb-3 flex items-center">
//                             Anexos ({wikiAddition.attachments.length})
//                         </h5>
//                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
//                           {wikiAddition.attachments.map((attachment: any, attachIndex: number) => (
//                             <AttachmentItem
//                               key={attachment?.id || attachIndex}
//                               attachment={attachment}
//                               index={attachIndex}
//                               onDelete={handleDeleteAttachment}
//                               isDeleting={deletingAttachment === attachment?.id}
//                             />
//                           ))}
//                         </div>
//                       </div>
//                     )}

//                     {/* Footer responsivo */}
//                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-blue-200 space-y-1 sm:space-y-0">
//                       <p className="text-xs sm:text-sm text-blue-600 flex items-center">
//                         👤 <span className="font-medium ml-1">{wikiAddition?.author || 'Sistema'}</span>
//                       </p>
//                       <p className="text-xs sm:text-sm text-blue-600 flex items-center">
//                         🕒 <span className="ml-1">
//                           {wikiAddition?.createdAt
//                             ? new Date(wikiAddition.createdAt).toLocaleDateString('pt-BR', {
//                                 day: '2-digit',
//                                 month: '2-digit',
//                                 year: 'numeric',
//                                 hour: '2-digit',
//                                 minute: '2-digit'
//                               })
//                             : 'Data não disponível'
//                           }
//                         </span>
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           )}

//           {/* Botão adicionar responsivo */}
//           {onAddContent && (
//             <div className="mb-4 sm:mb-6">
//               <button
//                 onClick={onAddContent}
//                 className="w-full p-4 sm:p-5 border-2 border-dashed border-green-300 rounded-xl text-green-600 hover:border-green-400 hover:bg-green-50 transition-all flex items-center justify-center space-x-3 group shadow-md hover:shadow-lg"
//               >
//                 <Plus size={20} className="sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" />
//                 <span className="font-bold text-sm sm:text-base">Adicionar Nova Seção</span>
//               </button>
//             </div>
//           )}

//           {/* Mensagem de conteúdo vazio melhorada */}
//           {!safeContent.textContent &&
//             !safeContent.filePath &&
//             (!safeContent.strapiData?.all_wiki_additions || safeContent.strapiData.all_wiki_additions.length === 0) && (
//             <div className="text-center py-12 sm:py-16 bg-gradient-to-br from-gray-50 to-white rounded-xl border-2 border-dashed border-gray-300">
//               <div className="text-gray-400 mb-4 sm:mb-6 text-4xl sm:text-6xl">📝</div>
//               <h3 className="text-gray-600 text-lg sm:text-xl font-semibold mb-2">Conteúdo em Branco</h3>
//               <p className="text-gray-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
//                 Este item ainda não possui conteúdo principal ou adições. 
//                 Use os botões de ação para começar a adicionar informações.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Botões de ação responsivos */}
//         {(onEdit || onDelete || onAddContent) && (
//           <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex-shrink-0">
//             <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
//               {onAddContent && (
//                 <button
//                   onClick={onAddContent}
//                   className="flex-1 min-w-0 sm:flex-none sm:min-w-[140px] px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   title="Adicionar um novo conteúdo de wiki"
//                 >
//                   <Plus size={18} className="mr-2" />
//                   Nova Seção
//                 </button>
//               )}
//               {onEdit && (isAdmin || isSuperAdmin) && (
//                 <button
//                   onClick={onEdit}
//                   className="flex-1 min-w-0 sm:flex-none sm:min-w-[140px] px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   title="Editar este conteúdo"
//                 >
//                   <Edit size={18} className="mr-2" />
//                   Editar
//                 </button>
//               )}
//               {onDelete && isSuperAdmin && (
//                 <button
//                   onClick={onDelete}
//                   className="flex-1 min-w-0 sm:flex-none sm:min-w-[140px] px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all flex items-center justify-center shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//                   title="Excluir este conteúdo permanentemente"
//                 >
//                   <Trash2 size={18} className="mr-2" />
//                   Excluir
//                 </button>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ContentViewer;




import React, { useState, useEffect, useCallback, useRef, type JSX } from 'react';
import { X, Edit, Trash2, Plus, ZoomIn, RefreshCw, ZoomOut, RotateCw, Maximize2, Home, Info, ImageOff, Clock, User, FileImage, Sparkles, BookOpenText, Tag, CalendarDays, Link as LinkIcon, Save, Ban } from 'lucide-react';
import { create } from 'zustand';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const getApiBaseUrl = () => {
  const isProduction = window.location.hostname !== 'localhost' &&
                       window.location.hostname !== '127.0.0.1';
  return isProduction
    ? 'https://strapi.cznet.net.br'
    : 'http://localhost:1337';
};

const API_BASE_URL = getApiBaseUrl();

interface Attachment {
  id: string;
  documentId?: string;
  url: string;
  name?: string;
  alt?: string;
  size?: number;
}

interface WikiAdditionContentBlock {
  type: string;
  children: Array<{ text: string }>;
}

export interface WikiAddition { 
  id: string;
  documentId?: string;
  title: string;
  content?: WikiAdditionContentBlock[];
  attachments?: Attachment[];
  author?: string;
  createdAt?: string;
}

interface WikiContent {
  id: string | number;
  title: string;
  description?: string;
  category?: string;
  updatedAt: string;
  textContent?: string;
  filePath?: string;
  strapiData?: {
    all_wiki_additions?: WikiAddition[];
  };
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ContentViewerProps {
  content: WikiContent;
  onClose: () => void;
  onEdit?: () => void;
  onDeleteMainContent?: () => void;
  onAddContent?: () => void;
  onEditAddition?: (additionId: string) => void;
  onDeleteAdditionSuccess?: (additionId: string) => void;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeNotification: (id: string) => void;
}

const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [],
  addNotification: (message, type = 'success') => {
    const id = Date.now().toString();
    set((state) => ({
      notifications: [...state.notifications, { id, message, type }],
    }));
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      }));
    }, type === 'error' ? 5000 : 3000);
  },
  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },
}));

const GlobalNotifications: React.FC = () => {
  const { notifications, removeNotification } = useNotificationStore();

  return (
    <div className="fixed top-6 right-6 z-[70] space-y-3 pointer-events-none">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`
            max-w-sm p-4 rounded-2xl shadow-2xl backdrop-blur-md border
            flex items-start justify-between transition-all duration-500 ease-out
            transform translate-x-0 opacity-100 hover:scale-105 pointer-events-auto cursor-pointer
            ${notif.type === 'success'
              ? 'bg-gradient-to-r from-emerald-500/95 to-teal-500/95 border-emerald-300/30 text-white shadow-emerald-500/25'
              : notif.type === 'error'
                ? 'bg-gradient-to-r from-red-600/95 to-rose-700/95 border-red-400/30 text-white shadow-red-600/25'
                : 'bg-gradient-to-r from-gray-600/95 to-gray-700/95 border-gray-400/30 text-white shadow-gray-600/25'
            }
          `}
          onClick={() => removeNotification(notif.id)}
        >
          <div className="flex items-start space-x-3">
            <div className={`
              w-2 h-2 rounded-full mt-2 animate-pulse
              ${notif.type === 'success' ? 'bg-emerald-200' : notif.type === 'error' ? 'bg-red-300' : 'bg-gray-300'}
            `} />
            <span className="text-sm font-medium leading-relaxed">{notif.message}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); removeNotification(notif.id); }}
            className="ml-4 p-1.5 rounded-full hover:bg-white/20 transition-all duration-200 group"
            title="Fechar"
          >
            <X size={14} className="group-hover:rotate-90 transition-transform duration-200" />
          </button>
        </div>
      ))}
    </div>
  );
};

interface ImageViewerState {
  imageSrc: string | null;
  imageZoom: number;
  imageRotation: number;
  isLoading: boolean;
  error: string | null;
  isDragging: boolean;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  offsetX: number;
  offsetY: number;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  containerWidth: number;
  containerHeight: number;
}

interface ImageViewerActions {
  openImage: (src: string) => void;
  closeImage: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  rotate: () => void;
  resetAll: () => void;
  fitToScreen: () => void;
  handleWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  handleMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLDivElement>) => void;
  handleTouchEnd: () => void;
  getImageInfo: () => { dimensions: string; zoom: string; rotation: string } | null;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isModified: boolean;
  imageRef: React.RefObject<HTMLImageElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const useImageViewer = create<ImageViewerState & ImageViewerActions>((set, get) => ({
  imageSrc: null,
  imageZoom: 1,
  imageRotation: 0,
  isLoading: false,
  error: null,
  isDragging: false,
  startX: 0,
  startY: 0,
  currentX: 0,
  currentY: 0,
  offsetX: 0,
  offsetY: 0,
  imageNaturalWidth: 0,
  imageNaturalHeight: 0,
  containerWidth: 0,
  containerHeight: 0,
  imageRef: React.createRef<HTMLImageElement>(),
  containerRef: React.createRef<HTMLDivElement>(),

  openImage: async (src) => {
    set({ imageSrc: src, isLoading: true, error: null, imageZoom: 1, imageRotation: 0, offsetX: 0, offsetY: 0 });
    const img = new Image();
    img.onload = () => {
      set({
        isLoading: false,
        imageNaturalWidth: img.naturalWidth,
        imageNaturalHeight: img.naturalHeight,
      });
      get().fitToScreen();
    };
    img.onerror = () => {
      set({ isLoading: false, error: 'Não foi possível carregar a imagem.' });
    };
    img.src = src;
  },
  closeImage: () => {
    set({ imageSrc: null });
  },
  zoomIn: () => set((state) => ({ imageZoom: Math.min(state.imageZoom * 1.2, 5) })),
  zoomOut: () => set((state) => ({ imageZoom: Math.max(state.imageZoom / 1.2, 0.1) })),
  rotate: () => set((state) => ({ imageRotation: (state.imageRotation + 90) % 360 })),
  resetAll: () => set({ imageZoom: 1, imageRotation: 0, offsetX: 0, offsetY: 0 }),
  fitToScreen: () => {
    const { imageNaturalWidth, imageNaturalHeight, containerRef } = get();
    if (containerRef.current && imageNaturalWidth && imageNaturalHeight) {
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;

      const ratioX = containerWidth / imageNaturalWidth;
      const ratioY = containerHeight / imageNaturalHeight;
      const fitZoom = Math.min(ratioX, ratioY) * 0.9;

      set({
        imageZoom: fitZoom,
        imageRotation: 0,
        offsetX: 0,
        offsetY: 0,
        containerWidth,
        containerHeight,
      });
    }
  },
  handleWheel: (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 1 / 1.1;
    set((state) => ({ imageZoom: Math.min(Math.max(state.imageZoom * zoomFactor, 0.1), 5) }));
  },
  handleMouseDown: (e) => {
    e.preventDefault();
    set({
      isDragging: true,
      startX: e.clientX - get().offsetX,
      startY: e.clientY - get().offsetY,
    });
  },
  handleMouseMove: (e) => {
    if (!get().isDragging) return;
    const { imageRef, startX, startY, imageZoom, imageRotation } = get();
    if (imageRef.current) {
        const newCurrentX = e.clientX - startX;
        const newCurrentY = e.clientY - startY;
        set({
            currentX: newCurrentX,
            currentY: newCurrentY,
        });
        imageRef.current.style.transform = `translate(${newCurrentX}px, ${newCurrentY}px) scale(${imageZoom}) rotate(${imageRotation}deg)`;
    }
  },
  handleMouseUp: () => {
    set((state) => ({
      isDragging: false,
      offsetX: state.currentX,
      offsetY: state.currentY,
    }));
  },
  handleTouchStart: (e) => {
    if (e.touches.length === 1) {
      set({
        isDragging: true,
        startX: e.touches[0].clientX - get().offsetX,
        startY: e.touches[0].clientY - get().offsetY,
      });
    }
  },
  handleTouchMove: (e) => {
    if (!get().isDragging || e.touches.length !== 1) return;
    const { imageRef, startX, startY, imageZoom, imageRotation } = get();
    if (imageRef.current) {
        const newCurrentX = e.touches[0].clientX - startX;
        const newCurrentY = e.touches[0].clientY - startY;
        set({
            currentX: newCurrentX,
            currentY: newCurrentY,
        });
        imageRef.current.style.transform = `translate(${newCurrentX}px, ${newCurrentY}px) scale(${imageZoom}) rotate(${imageRotation}deg)`;
    }
  },
  handleTouchEnd: () => {
    set((state) => ({
      isDragging: false,
      offsetX: state.currentX,
      offsetY: state.currentY,
    }));
  },
  getImageInfo: () => {
    const { imageNaturalWidth, imageNaturalHeight, imageZoom, imageRotation } = get();
    if (imageNaturalWidth && imageNaturalHeight) {
      return {
        dimensions: `${imageNaturalWidth}x${imageNaturalHeight}px`,
        zoom: `${Math.round(imageZoom * 100)}%`,
        rotation: `${imageRotation}°`,
      };
    }
    return null;
  },
  get canZoomIn() { return get().imageZoom < 5; },
  get canZoomOut() { return get().imageZoom > 0.1; },
  get isModified() { return get().imageZoom !== 1 || get().imageRotation !== 0 || get().offsetX !== 0 || get().offsetY !== 0; },
}));

const AdvancedImageModal: React.FC<{
  src: string;
  alt: string;
  isOpen: boolean;
  onClose: () => void;
}> = ({ src, alt, isOpen, onClose }) => {
  const imageViewer = useImageViewer();

  useEffect(() => {
    if (isOpen && src) {
      imageViewer.openImage(src);
    }
  }, [isOpen, src, imageViewer.openImage]);

  const handleClose = useCallback(() => {
    imageViewer.closeImage();
    onClose();
  }, [imageViewer.closeImage, onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape': handleClose(); break;
        case '+': case '=': imageViewer.zoomIn(); break;
        case '-': imageViewer.zoomOut(); break;
        case '0': imageViewer.resetAll(); break;
        case 'r': case 'R': imageViewer.rotate(); break;
        case 'f': case 'F': imageViewer.fitToScreen(); break;
        default: break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, imageViewer]);

  if (!isOpen) return null;

  const imageInfo = imageViewer.getImageInfo();

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-md flex flex-col z-[60] animate-in fade-in duration-300">
      <div className="bg-black/80 backdrop-blur-sm border-b border-white/10 text-white p-4 flex justify-between items-center">
        <div className="flex items-center space-x-4 flex-1 min-w-0">
          <FileImage size={20} className="text-red-400" />
          <h3 className="text-lg font-semibold truncate">{alt}</h3>
          {imageInfo && (
            <div className="hidden md:flex items-center space-x-4 text-sm text-gray-300">
              <span className="bg-white/10 px-2 py-1 rounded-lg">{imageInfo.dimensions}</span>
              <span className="bg-white/10 px-2 py-1 rounded-lg">{imageInfo.zoom}</span>
              <span className="bg-white/10 px-2 py-1 rounded-lg">{imageInfo.rotation}</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button onClick={imageViewer.zoomOut} disabled={!imageViewer.canZoomOut} className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 group disabled:opacity-50" title="Diminuir Zoom (-)">
            <ZoomOut size={20} className="group-hover:text-gray-400" />
          </button>
          <span className="text-sm min-w-[60px] text-center bg-white/10 px-3 py-1 rounded-lg">
            {Math.round(imageViewer.imageZoom * 100)}%
          </span>
          <button onClick={imageViewer.zoomIn} disabled={!imageViewer.canZoomIn} className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 group disabled:opacity-50" title="Aumentar Zoom (+)">
            <ZoomIn size={20} className="group-hover:text-gray-400" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <button onClick={imageViewer.fitToScreen} className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 group" title="Ajustar à tela (F)">
            <Maximize2 size={20} className="group-hover:text-red-400" />
          </button>
          <button onClick={imageViewer.rotate} className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 group" title="Rotacionar (R)">
            <RotateCw size={20} className="group-hover:text-red-400" />
          </button>
          <button onClick={imageViewer.resetAll} disabled={!imageViewer.isModified} className="p-2 hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-110 group disabled:opacity-50" title="Redefinir (0)">
            <Home size={20} className="group-hover:text-gray-400" />
          </button>

          <div className="w-px h-6 bg-white/20 mx-2" />

          <button onClick={handleClose} className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110 group" title="Fechar (Esc)">
            <X size={20} className="group-hover:text-red-400" />
          </button>
        </div>
      </div>

      <div
        ref={imageViewer.containerRef}
        className="flex-1 flex items-center justify-center p-4 overflow-hidden relative cursor-grab active:cursor-grabbing touch-none"
        onWheel={imageViewer.handleWheel}
        onMouseDown={imageViewer.handleMouseDown}
        onMouseMove={imageViewer.handleMouseMove}
        onMouseUp={imageViewer.handleMouseUp}
        onMouseLeave={imageViewer.handleMouseUp}
        onTouchStart={imageViewer.handleTouchStart}
        onTouchMove={imageViewer.handleTouchMove}
        onTouchEnd={imageViewer.handleTouchEnd}
        onClick={(e) => {
          if (e.target === imageViewer.containerRef.current) {
            handleClose();
          }
        }}
      >
        {imageViewer.isLoading ? (
          <div className="text-white text-center">
            <RefreshCw className="animate-spin mx-auto mb-4" size={32} />
            <p className="text-lg">Carregando imagem...</p>
          </div>
        ) : imageViewer.error ? (
          <div className="text-white text-center px-6 py-4 rounded-lg bg-red-800/20 border border-red-700/50">
            <div className="text-red-400 mb-4 text-4xl">⚠️</div>
            <p className="text-red-300 text-lg">{imageViewer.error}</p>
          </div>
        ) : (
          <img
            ref={imageViewer.imageRef}
            src={imageViewer.imageSrc || ''}
            alt={alt}
            className="select-none transition-transform duration-200 ease-out will-change-transform"
            style={{
              transform: `translate(${imageViewer.currentX}px, ${imageViewer.currentY}px) scale(${imageViewer.imageZoom}) rotate(${imageViewer.imageRotation}deg)`,
              objectFit: 'contain',
              maxWidth: 'initial',
              maxHeight: 'initial',
            }}
            draggable={false}
          />
        )}
      </div>

      <div className="bg-black/80 backdrop-blur-sm border-t border-white/10 text-gray-400 px-4 py-2 text-xs">
        <div className="flex gap-4 justify-center flex-wrap">
          <span><kbd className="bg-white/10 px-2 py-1 rounded">Esc</kbd> Fechar</span>
          <span><kbd className="bg-white/10 px-2 py-1 rounded">+/-</kbd> Zoom</span>
          <span><kbd className="bg-white/10 px-2 py-1 rounded">R</kbd> Girar</span>
          <span><kbd className="bg-white/10 px-2 py-1 rounded">0</kbd> Reset</span>
          <span><kbd className="bg-white/10 px-2 py-1 rounded">F</kbd> Ajustar</span>
          <span><kbd className="bg-white/10 px-2 py-1 rounded">Drag</kbd> Mover</span>
        </div>
      </div>
    </div>
  );
};

const formatTextContent = (text: string): JSX.Element => {
  if (!text) return <></>;

  const components = {
    h1: ({ node, ...props }: any) => <h1 className="text-3xl font-extrabold text-gray-900 mb-6 pb-2 border-b-2 border-gray-200 bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent" {...props} />,
    h2: ({ node, ...props }: any) => <h2 className="text-2xl font-bold text-gray-800 mb-4 border-l-4 border-red-600 pl-4 py-2 rounded-r-lg bg-gray-100/50" {...props} />,
    h3: ({ node, ...props }: any) => <h3 className="text-xl font-semibold text-gray-700 mb-3 border-l-2 border-red-400 pl-3 py-1 rounded-r-md" {...props} />,
    p: ({ node, ...props }: any) => <p className="text-gray-700 leading-relaxed mb-4" {...props} />,
    strong: ({ node, ...props }: any) => <strong className="font-bold text-gray-900 bg-yellow-100 px-1 rounded" {...props} />,
    em: ({ node, ...props }: any) => <em className="italic text-red-700" {...props} />,
    code: ({ node, inline, ...props }: any) => {
      if (inline) {
        return <code className="bg-gray-100 border border-gray-200 px-2 py-1 rounded text-sm font-mono text-gray-600 shadow-sm" {...props} />;
      }
      return (
        <pre className="bg-gray-900 text-white p-4 rounded-lg my-4 overflow-x-auto text-sm font-mono shadow-inner">
          <code className="block" {...props} />
        </pre>
      );
    },
    blockquote: ({ node, ...props }: any) => (
      <blockquote className="border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-gray-50 p-4 my-4 rounded-r-xl shadow-sm">
        <p className="text-red-800 font-medium italic" {...props} />
      </blockquote>
    ),
    ul: ({ node, ...props }: any) => <ul className="list-disc list-inside space-y-2 mb-4 pl-4" {...props} />,
    ol: ({ node, ...props }: any) => <ol className="list-decimal list-inside space-y-2 mb-4 pl-4" {...props} />,
    li: ({ node, ...props }: any) => <li className="text-gray-700 hover:text-red-700 transition-colors" {...props} />,
    a: ({ node, ...props }: any) => (
      <a target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-800 underline transition-colors inline-flex items-center gap-1" {...props}>
        {props.children}
        <LinkIcon size={14} className="flex-shrink-0" />
      </a>
    ),
    table: ({ node, ...props }: any) => <table className="w-full border-collapse my-4" {...props} />,
    thead: ({ node, ...props }: any) => <thead className="bg-gray-100 border-b border-gray-200" {...props} />,
    th: ({ node, ...props }: any) => <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border border-gray-200" {...props} />,
    tbody: ({ node, ...props }: any) => <tbody className="divide-y divide-gray-100" {...props} />,
    tr: ({ node, ...props }: any) => <tr className="even:bg-gray-50 hover:bg-gray-100" {...props} />,
    td: ({ node, ...props }: any) => <td className="px-4 py-2 text-sm text-gray-800 border border-gray-200" {...props} />,
  };

  return (
    <div className="prose prose-sm sm:prose-base max-w-none text-gray-800 leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {text}
      </ReactMarkdown>
    </div>
  );
};

// 🔧 FUNÇÃO AUXILIAR PARA OBTER ID CORRETO - STRAPI V5
const getCorrectId = (item: any): string => {
  // Priorizar ID numérico, depois documentId
  if (item.id) {
    return String(item.id);
  }
  if (item.documentId) {
    return item.documentId;
  }
  console.error('❌ Nenhum ID válido encontrado:', item);
  return '';
};

const AttachmentItem: React.FC<{
  attachment: Attachment;
  index: number;
  onDelete?: (attachmentId: string) => Promise<void>;
  isDeleting?: boolean;
}> = ({ attachment, index, onDelete, isDeleting }) => {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const imageUrl = attachment?.url
    ? (attachment.url.startsWith('http')
        ? attachment.url
        : `${API_BASE_URL}${attachment.url}`)
    : '';

  const imageName = attachment?.name || attachment?.alt || `Anexo ${index + 1}`;

  const handleDeleteAttachment = async () => {
    if (!onDelete || !attachment?.id) return;
    if (window.confirm(`Tem certeza que deseja excluir "${imageName}"? Esta ação é irreversível.`)) {
      await onDelete(getCorrectId(attachment));
    }
  };

  const handleOpenModal = useCallback(() => {
    setImageModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setImageModalOpen(false);
  }, []);

  if (!imageUrl || imageError) {
    return (
      <div className="flex-grow flex-shrink-0 basis-full sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-0.5rem)] lg:basis-[calc(25%-0.5rem)] xl:basis-[calc(20%-0.5rem)]">
        <div className="bg-gray-100 rounded-xl p-2 text-center border-2 border-dashed border-gray-300 min-h-[90px] flex flex-col items-center justify-center transition-shadow hover:shadow-lg h-full">
          <div className="text-red-400 mb-1 text-xl">
            <ImageOff size={28} />
          </div>
          <p className="text-xs text-gray-600 font-medium mb-0.5 truncate max-w-full">{imageName}</p>
          {onDelete && attachment?.id && (
            <button
              onClick={handleDeleteAttachment}
              disabled={isDeleting}
              className="mt-1 px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1 hover:bg-red-200 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? <RefreshCw size={10} className="animate-spin" /> : <Trash2 size={10} />}
              Excluir
            </button>
          )}
        </div>
        <AdvancedImageModal
          src={imageUrl}
          alt={imageName}
          isOpen={imageModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    );
  }

  return (
    <div className="flex-grow flex-shrink-0 basis-full sm:basis-[calc(50%-0.5rem)] md:basis-[calc(33.333%-0.5rem)] lg:basis-[calc(25%-0.5rem)] xl:basis-[calc(20%-0.5rem)]">
      <div className="relative group bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-gray-300 h-full">
        <div className="relative p-1">
          <div className="w-full aspect-[28/8] bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center border border-gray-100">
            <img
              src={imageUrl}
              alt={imageName}
              className="w-full h-full object-contain cursor-pointer transition-transform hover:scale-105"
              onClick={handleOpenModal}
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>

          <div className="absolute inset-1.5 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100">
            <div className="flex space-x-1">
              <button
                onClick={handleOpenModal}
                className="bg-white/95 hover:bg-white text-gray-800 rounded-full p-1.5 shadow-lg backdrop-blur-sm transform transition-all"
                title="Visualizar em tela cheia"
              >
                <ZoomIn size={14} />
              </button>

              {onDelete && (
                <button
                  onClick={handleDeleteAttachment}
                  disabled={isDeleting}
                  className="bg-red-600/95 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg disabled:opacity-50 backdrop-blur-sm transform transition-all"
                  title="Excluir anexo"
                >
                  {isDeleting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="px-2 py-1 bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-800 truncate mb-0.5" title={imageName}>
            {imageName}
          </p>
          <div className="flex items-center justify-between text-xs text-gray-600 mt-0.5">
            <p className="flex items-center gap-1">
              <FileImage size={10} className="text-gray-500" />
              {imageName.split('.').pop()?.toUpperCase() || 'ARQ'}
            </p>
            {attachment?.size && (
              <p className="flex items-center gap-1">
                <span className="font-medium text-xs">{(attachment.size / 1024).toFixed(1)} KB</span>
              </p>
            )}
          </div>
        </div>
      </div>

      <AdvancedImageModal
        src={imageUrl}
        alt={imageName}
        isOpen={imageModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export const ContentViewer: React.FC<ContentViewerProps> = ({
  content,
  onClose,
  onEdit,
  onDeleteMainContent,
  onAddContent,
  onEditAddition,
  onDeleteAdditionSuccess,
  isAdmin,
  isSuperAdmin
}) => {
  const { addNotification } = useNotificationStore();
  const [deletingAddition, setDeletingAddition] = useState<string | null>(null);
  const [deletingAttachment, setDeletingAttachment] = useState<string | null>(null);
  const [currentContent, setCurrentContent] = useState<WikiContent>(content);
  const [mainImageModalOpen, setMainImageModalOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // --- Lógica de Edição Integrada ---
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(content.textContent || '');

  useEffect(() => {
    setIsVisible(true);
    setEditedText(content.textContent || '');
  }, [content]);

  // Lógica de Drag-and-Drop
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (isEditing) {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = 'copy';
    }
  }, [isEditing]);

  const handleDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    if (!isEditing) return;
    
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        addNotification(`Carregando imagem: ${file.name}...`, 'info');

        try {
          const formData = new FormData();
          formData.append('files', file);

          const response = await fetch(`${API_BASE_URL}/api/upload`, {
            method: 'POST',
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Erro ao fazer upload da imagem.');
          }

          const uploadedFiles = await response.json();
          if (uploadedFiles && uploadedFiles.length > 0) {
            const imageUrl = uploadedFiles[0].url;
            const imageName = uploadedFiles[0].name || file.name;

            setEditedText(prev => prev + `\n\n![${imageName}](${API_BASE_URL}${imageUrl})\n\n`);
            addNotification('Imagem carregada e inserida como Markdown!', 'success');
          } else {
            throw new Error('Nenhuma imagem retornada após o upload.');
          }
        } catch (error: any) {
          addNotification(`Erro ao enviar imagem: ${error.message}`, 'error');
          console.error('Erro ao arrastar e soltar imagem:', error);
        }
      } else {
        addNotification('Por favor, solte apenas arquivos de imagem.', 'error');
      }
    }
  }, [isEditing, addNotification]);

  // Lógica de Salvar
  const handleSaveEdit = () => {
    setCurrentContent(prev => ({
      ...prev!,
      textContent: editedText,
    }));
    setIsEditing(false);
    addNotification('Conteúdo principal salvo localmente.', 'success');
  };

  const handleCancelEdit = () => {
    setEditedText(content.textContent || '');
    setIsEditing(false);
    addNotification('Edição cancelada.', 'info');
  };

  // 🔧 FUNÇÃO CORRIGIDA PARA EXCLUSÃO DE WIKI ADDITION
  const handleDeleteAddition = async (additionId: string) => {
    console.log('🗑️ [FIXED] Iniciando exclusão de wiki addition:', additionId);

    if (!additionId?.toString().trim()) {
      console.error('❌ [FIXED] ID inválido:', additionId);
      addNotification('ID da seção inválido.', 'error');
      return;
    }

    if (!window.confirm('Tem certeza que deseja excluir esta seção? Esta ação é irreversível.')) {
      return;
    }

    setDeletingAddition(additionId);
    
    try {
      // ✅ URL testada e funcionando
      const deleteUrl = `${API_BASE_URL}/api/wiki-additions/${additionId}`;
      console.log('🌐 [FIXED] URL de exclusão:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📥 [FIXED] Resposta:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      // ✅ CORREÇÃO PRINCIPAL: Aceitar qualquer resposta de sucesso
      if (response.ok) { // 200, 201, 204, etc.
        let responseData = null;
        
        // Tentar ler dados da resposta se houver
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            console.log('📄 [FIXED] Dados da wiki addition excluída:', responseData);
          }
        } catch (parseError) {
          console.log('ℹ️ [FIXED] Resposta sem JSON (normal para 204)');
        }
        
        addNotification('Seção excluída com sucesso!', 'success');
        
        // ✅ Atualizar estado local
        setCurrentContent(prev => {
          if (!prev?.strapiData?.all_wiki_additions) {
            console.warn('⚠️ [FIXED] Nenhuma wiki addition no estado');
            return prev;
          }
          
          const before = prev.strapiData.all_wiki_additions.length;
          
          const updatedAdditions = prev.strapiData.all_wiki_additions.filter(addition => {
            // Usar múltiplas formas de comparação para garantir
            const addIdStr = String(addition.id);
            const addDocId = addition.documentId;
            const targetIdStr = String(additionId);
            
            const shouldKeep = addIdStr !== targetIdStr && addDocId !== additionId;
            
            if (!shouldKeep) {
              console.log('🗑️ [FIXED] Removendo wiki addition do estado:', {
                addId: addition.id,
                addDocId: addition.documentId,
                targetId: additionId,
                title: addition.title
              });
            }
            
            return shouldKeep;
          });
          
          const after = updatedAdditions.length;
          console.log('🔄 [FIXED] Estado atualizado:', { before, after, removed: before - after });
          
          return {
            ...prev,
            strapiData: {
              ...prev.strapiData,
              all_wiki_additions: updatedAdditions,
            },
          };
        });
        
        onDeleteAdditionSuccess?.(additionId);
        
      } else {
        // Tratar erros específicos
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.log('❌ [FIXED] Erro detalhado:', errorText);
          
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
            } catch {
              errorMessage = errorText.substring(0, 200); // Limitar tamanho
            }
          }
        } catch {
          // Manter erro padrão
        }
        
        // Mensagens específicas por status
        if (response.status === 404) {
          errorMessage = 'Seção não encontrada. Pode já ter sido excluída.';
        } else if (response.status === 403) {
          errorMessage = 'Sem permissão para excluir seção.';
        } else if (response.status === 401) {
          errorMessage = 'Não autenticado. Token expirado?';
        }
        
        addNotification(errorMessage, 'error');
      }
      
    } catch (networkError: any) {
      console.error('❌ [FIXED] Erro de rede:', networkError);
      
      let errorMessage = 'Erro de conexão ao excluir seção.';
      
      if (networkError.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e se o Strapi está rodando.';
      } else if (networkError.message.includes('NetworkError')) {
        errorMessage = 'Erro de rede. Tente novamente.';
      } else if (networkError.message.includes('CORS')) {
        errorMessage = 'Erro de CORS. Verifique configuração do servidor.';
      }
      
      addNotification(errorMessage, 'error');
    } finally {
      setDeletingAddition(null);
    }
  };

  // 🔧 FUNÇÃO CORRIGIDA PARA EXCLUSÃO DE ATTACHMENT
  const handleDeleteAttachment = async (attachmentId: string) => {
    console.log('🗑️ [FIXED] Iniciando exclusão de anexo:', attachmentId);

    if (!attachmentId?.toString().trim()) {
      addNotification('ID do anexo inválido.', 'error');
      return;
    }

    setDeletingAttachment(attachmentId);
    
    try {
      // ✅ URL testada e funcionando
      const deleteUrl = `${API_BASE_URL}/api/upload/files/${attachmentId}`;
      console.log('🌐 [FIXED] URL de anexo:', deleteUrl);

      const response = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('📥 [FIXED] Resposta do anexo:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      // ✅ CORREÇÃO PRINCIPAL: Aceitar qualquer resposta de sucesso
      if (response.ok) { // 200, 201, 204, etc.
        let responseData = null;
        
        // Tentar ler dados da resposta se houver
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
            console.log('📄 [FIXED] Dados do anexo excluído:', responseData);
          }
        } catch (parseError) {
          console.log('ℹ️ [FIXED] Resposta sem JSON para anexo (normal para 204)');
        }
        
        addNotification('Anexo excluído com sucesso!', 'success');
        
        // ✅ Atualizar estado local
        setCurrentContent(prev => {
          if (!prev?.strapiData?.all_wiki_additions) {
            return prev;
          }
          
          const updatedAdditions = prev.strapiData.all_wiki_additions.map(addition => {
            if (!addition.attachments || !Array.isArray(addition.attachments)) {
              return addition;
            }
            
            const updatedAttachments = addition.attachments.filter(att => {
              // Usar múltiplas formas de comparação para garantir
              const attIdStr = String(att.id);
              const attDocId = att.documentId;
              const targetIdStr = String(attachmentId);
              
              const shouldKeep = attIdStr !== targetIdStr && attDocId !== attachmentId;
              
              if (!shouldKeep) {
                console.log('🗑️ [FIXED] Removendo anexo do estado:', {
                  attId: att.id,
                  attDocId: att.documentId,
                  targetId: attachmentId,
                  name: att.name
                });
              }
              
              return shouldKeep;
            });
            
            return {
              ...addition,
              attachments: updatedAttachments
            };
          });
          
          return {
            ...prev,
            strapiData: {
              ...prev.strapiData,
              all_wiki_additions: updatedAdditions,
            },
          };
        });
        
      } else {
        // Tratar erros específicos
        let errorMessage = `Erro ${response.status}: ${response.statusText}`;
        
        try {
          const errorText = await response.text();
          console.log('❌ [FIXED] Erro do anexo:', errorText);
          
          if (errorText) {
            try {
              const errorJson = JSON.parse(errorText);
              errorMessage = errorJson.error?.message || errorJson.message || errorMessage;
            } catch {
              errorMessage = errorText.substring(0, 200);
            }
          }
        } catch {
          // Manter erro padrão
        }
        
        // Mensagens específicas por status
        if (response.status === 404) {
          errorMessage = 'Anexo não encontrado. Pode já ter sido excluído.';
        } else if (response.status === 403) {
          errorMessage = 'Sem permissão para excluir anexo.';
        } else if (response.status === 401) {
          errorMessage = 'Não autenticado. Token expirado?';
        }
        
        addNotification(errorMessage, 'error');
      }
      
    } catch (networkError: any) {
      console.error('❌ [FIXED] Erro de rede do anexo:', networkError);
      
      let errorMessage = 'Erro de conexão ao excluir anexo.';
      
      if (networkError.message.includes('Failed to fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e se o Strapi está rodando.';
      }
      
      addNotification(errorMessage, 'error');
    } finally {
      setDeletingAttachment(null);
    }
  };

  // --- Fim da Lógica de Edição Integrada ---

  if (!currentContent) {
    return null;
  }

  const safeContent: WikiContent = {
    ...currentContent,
    title: currentContent.title || 'Conteúdo sem Título',
    description: currentContent.description || '',
    category: currentContent.category || 'Geral',
    updatedAt: currentContent.updatedAt || new Date().toISOString(),
    textContent: currentContent.textContent || '',
    filePath: currentContent.filePath || '',
    strapiData: {
      all_wiki_additions: (currentContent.strapiData?.all_wiki_additions || [])
        .slice()
        .sort((a, b) => {
          const dateA = new Date(a.createdAt || '0').getTime();
          const dateB = new Date(b.createdAt || '0').getTime();
          return dateA - dateB;
        })
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div className={`
        fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4
        transition-all duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}
      `}>
        <div className={`
          bg-white rounded-3xl shadow-2xl w-full h-full sm:max-w-[95vw] sm:w-full sm:max-h-[90vh] sm:h-auto overflow-hidden flex flex-col
          transition-all duration-500 ease-out transform
          ${isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}
        `}>
      

      {/* header */}
          <div className="bg-[#f72a0b] px-3 sm:px-6 py-4 relative overflow-hidden shadow-lg flex-shrink-0">
            <div className="absolute inset-0 opacity-20">
            
            </div>

            <div className="relative flex justify-between items-start w-full">
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-1 sm:mb-2">
                  {/* <BookOpenText size={24} className="sm:w-8 sm:h-8 text-yellow-400 animate-pulse" /> */}
                  <h2 className="text-white/90 text-xl sm:text-3xl font-bold truncate tracking-tight">{safeContent.title}</h2>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mt-1 sm:mt-2 text-xs sm:text-sm text-white/90">
                  <span className="bg-white/20 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm border border-white/20 capitalize flex items-center gap-1">
                    <Tag size={12} className="inline-block" /> {safeContent.category}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="mt-1 sm:mt-0 flex items-center space-x-1">
                    <CalendarDays size={14} />
                    <span>Atualizado em {new Date(safeContent.updatedAt).toLocaleDateString('pt-BR')}</span>
                  </span>
                </div>
              </div>

              <div className="flex space-x-2 ml-2 flex-shrink-0">
                {onEdit && (isAdmin || isSuperAdmin) && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 sm:p-3 bg-white/10 hover:bg-gray-700/50 rounded-2xl transition-all duration-200 hover:scale-110 group border border-white/20 shadow-md"
                    title="Editar conteúdo principal"
                  >
                    <Edit size={18} className="sm:w-5 sm:h-5 text-gray-300 group-hover:rotate-12 transition-transform" />
                  </button>
                )}
                {isEditing && (
                    <>
                        <button
                            onClick={handleSaveEdit}
                            className="p-2 sm:p-3 bg-emerald-600/50 hover:bg-emerald-700/70 rounded-2xl transition-all duration-200 hover:scale-110 group border border-emerald-400/20 shadow-md"
                            title="Salvar edição"
                        >
                            <Save size={18} className="sm:w-5 sm:h-5 text-white" />
                        </button>
                        <button
                            onClick={handleCancelEdit}
                            className="p-2 sm:p-3 bg-red-600/50 hover:bg-red-700/70 rounded-2xl transition-all duration-200 hover:scale-110 group border border-red-400/20 shadow-md"
                            title="Cancelar edição"
                        >
                            <Ban size={18} className="sm:w-5 sm:h-5 text-white" />
                        </button>
                    </>
                )}
                {onDeleteMainContent && (isAdmin || isSuperAdmin) && !isEditing && (
                  <button
                    onClick={onDeleteMainContent}
                    className="p-2 sm:p-3 bg-red-600/50 hover:bg-red-700/70 rounded-2xl transition-all duration-200 hover:scale-110 group border border-red-400/20 shadow-md"
                    title="Excluir conteúdo principal"
                  >
                    <Trash2 size={18} className="sm:w-5 sm:h-5 text-white" />
                  </button>
                )}
                <button
                  onClick={handleClose}
                  className="p-2 sm:p-3 bg-white/10 hover:bg-gray-700/50 rounded-2xl transition-all duration-200 hover:scale-110 group border border-white/20 shadow-md"
                  title="Fechar"
                >
                  <X size={18} className="sm:w-5 sm:h-5 text-white group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          <div 
            className="flex-1 overflow-y-auto wiki-scroll p-3 sm:p-6 space-y-6 sm:space-y-10 bg-gray-50 text-gray-900"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {isEditing && (
                <div className="wiki-editor-area bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-red-400/20 mb-6">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 pb-3 border-b border-gray-200 flex items-center gap-2">
                        <Edit size={20} className="text-red-600" />
                        Editando Conteúdo Principal
                    </h3>
                    <div
                        className="drop-zone border-2 border-dashed border-red-400 p-8 text-center text-gray-600 rounded-lg mb-6 hover:border-red-600 transition-colors cursor-pointer"
                    >
                        Arraste e solte **imagens** aqui para adicioná-las ao conteúdo!
                        <p className="text-xs mt-1">(Será inserido como sintaxe Markdown)</p>
                    </div>
                    <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={15}
                        className="w-full p-4 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm resize-y"
                        placeholder="Escreva seu conteúdo em Markdown aqui..."
                    ></textarea>
                </div>
            )}

            {!isEditing && (
                <>
                    {safeContent.description && (
                        <section className="bg-gray-100 border-l-4 border-gray-500 rounded-2xl p-4 sm:p-6 shadow-md hover:shadow-lg transition-shadow duration-300">
                            <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <Info size={20} className="text-gray-600" />
                                Visão Geral
                            </h3>
                            <p className="text-gray-700 leading-relaxed text-sm sm:text-base">{safeContent.description}</p>
                        </section>
                    )}

                    {safeContent.filePath && (
                        <section className="relative group">
                            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-lg hover:shadow-2xl transition-all duration-500">
                                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    <FileImage size={20} className="text-red-600" />
                                    Imagem Destacada
                                </h3>
                                <img
                                    src={safeContent.filePath.startsWith('http') ? safeContent.filePath : `${API_BASE_URL}${safeContent.filePath}`}
                                    alt={safeContent.title}
                                    className="w-full rounded-xl cursor-pointer transition-transform hover:scale-105 shadow-md border border-gray-200"
                                    style={{ maxHeight: 'min(60vh, 500px)', objectFit: 'contain' }}
                                    onClick={() => setMainImageModalOpen(true)}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                      addNotification('Não foi possível carregar a imagem principal.', 'error');
                                    }}
                                    loading="lazy"
                                />
                                <div className="absolute inset-3 sm:inset-4 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center rounded-xl">
                                    <button
                                        onClick={() => setMainImageModalOpen(true)}
                                        className="bg-white/95 hover:bg-white text-gray-800 rounded-full p-3 sm:p-4 shadow-2xl backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-transform"
                                        title="Ver com zoom avançado"
                                    >
                                        <ZoomIn size={20} className="sm:w-6 sm:h-6" />
                                    </button>
                                </div>
                            </div>
                            <AdvancedImageModal
                                src={safeContent.filePath.startsWith('http') ? safeContent.filePath : `${API_BASE_URL}${safeContent.filePath}`}
                                alt={safeContent.title}
                                isOpen={mainImageModalOpen}
                                onClose={() => setMainImageModalOpen(false)}
                            />
                        </section>
                    )}

                    {safeContent.textContent && (
                        <section className="bg-white rounded-2xl p-4 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-gray-200 flex items-center gap-2">
                                <BookOpenText size={20} className="text-red-600" />
                                Detalhes do Conteúdo
                            </h3>
                            <article>
                                {formatTextContent(safeContent.textContent)}
                            </article>
                        </section>
                    )}
                </>
            )}

            {safeContent.strapiData?.all_wiki_additions && safeContent.strapiData.all_wiki_additions.length > 0 && (
                <section className="space-y-6 sm:space-y-8">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3 border-b-2 pb-2 border-red-300">
                        {/* <Sparkles size={24} className="text-yellow-500" /> */}
                        Seções Suplementares
                    </h3>

                    {safeContent.strapiData.all_wiki_additions.map((wikiAddition: WikiAddition, index: number) => (
                        <div key={wikiAddition.id || `wiki-addition-${index}`} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 group">

                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 border-b border-gray-200 relative">
                                <div className="flex justify-between items-start">
                                    <h4 className="text-lg sm:text-xl font-bold text-gray-800 pr-4 sm:pr-16 flex items-center gap-2">
                                        <LinkIcon size={18} className="text-red-600" />
                                        {wikiAddition.title || `Seção Adicional ${index + 1}`}
                                    </h4>
                                    <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        {onEditAddition && (isAdmin || isSuperAdmin) && (
                                            <button
                                                onClick={() => onEditAddition(getCorrectId(wikiAddition))}
                                                className="p-2 bg-white hover:bg-gray-100 text-gray-600 rounded-xl shadow-sm border border-gray-200"
                                                title="Editar esta seção"
                                            >
                                                <Edit size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>
                                        )}
                                        {wikiAddition.id && (isAdmin || isSuperAdmin) && (
                                            <button
                                                onClick={() => handleDeleteAddition(getCorrectId(wikiAddition))}
                                                disabled={deletingAddition === getCorrectId(wikiAddition)}
                                                className="p-2 bg-white hover:bg-red-100 text-red-600 rounded-xl shadow-sm border border-red-200 disabled:opacity-50"
                                                title={`Excluir: ${wikiAddition.title || 'Esta seção'}`}
                                            >
                                                {deletingAddition === getCorrectId(wikiAddition) ? (
                                                    <RefreshCw size={16} className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                                ) : (
                                                    <Trash2 size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 sm:p-6">
                                {wikiAddition.content && Array.isArray(wikiAddition.content) && (
                                    <div className="text-gray-800 mb-3 sm:mb-4 space-y-3">
                                        {wikiAddition.content.map((block: WikiAdditionContentBlock, blockIndex: number) => {
                                            const blockText = block.children && Array.isArray(block.children)
                                                ? block.children.map((child) => child?.text || '').join('')
                                                : '';
                                            if (!blockText.trim()) return null;
                                            return (
                                                <div key={`addition-block-${index}-${blockIndex}`} className="bg-white/50 p-3 rounded-lg border-l-4 border-gray-300 shadow-inner">
                                                    {formatTextContent(blockText)}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {wikiAddition.attachments && wikiAddition.attachments.length > 0 && (
                                    <div className="mt-4 sm:mt-5 pt-4 border-t border-gray-100">
                                        <h4 className="text-base font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                            <FileImage size={18} className="text-red-600" />
                                            Anexos da Seção ({wikiAddition.attachments.length})
                                        </h4>
                                        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                                            {wikiAddition.attachments.map((attachment: Attachment, attachIndex: number) => (
                                                <AttachmentItem
                                                    key={attachment.id || `attachment-${attachIndex}`}
                                                    attachment={attachment}
                                                    index={attachIndex}
                                                    onDelete={(isAdmin || isSuperAdmin) ? handleDeleteAttachment : undefined}
                                                    isDeleting={deletingAttachment === getCorrectId(attachment)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-1 sm:space-y-0 text-xs sm:text-sm text-gray-600">
                                    <p className="flex items-center space-x-1">
                                        <User size={14} className="text-red-500" />
                                        <span className="font-medium">{wikiAddition.author || 'Sistema'}</span>
                                    </p>
                                    <p className="flex items-center space-x-1">
                                        <Clock size={14} className="text-red-500" />
                                        <span>
                                            Criado em {wikiAddition.createdAt
                                                ? new Date(wikiAddition.createdAt).toLocaleString('pt-BR', {
                                                    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })
                                                : 'Data não disponível'
                                            }
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            )}

            {!isEditing && onAddContent && (isAdmin || isSuperAdmin) && (
                <button
                    onClick={onAddContent}
                    className="fixed bottom-6 right-6 p-4 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center"
                    title="Adicionar Nova Seção"
                    aria-label="Adicionar nova seção à wiki"
                >
                    <Plus size={28} />
                </button>
            )}

            {!isEditing && !safeContent.textContent &&
              !safeContent.filePath &&
              (!safeContent.strapiData?.all_wiki_additions || safeContent.strapiData.all_wiki_additions.length === 0) && (
                <div className="text-center p-6 sm:p-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300 text-gray-600 shadow-inner">
                  <Info size={36} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-sm sm:text-base font-medium mb-2">Este artigo da wiki ainda está vazio.</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-6">Comece adicionando conteúdo para enriquecer esta página de conhecimento.</p>
                  {onAddContent && (isAdmin || isSuperAdmin) && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md"
                    >
                      Criar a primeira seção
                    </button>
                  )}
                </div>
            )}
          </div>
        </div>
      </div>
      <GlobalNotifications />
    </>
  );
};

export default ContentViewer;