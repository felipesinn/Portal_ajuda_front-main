



// import React, { useState, useMemo, useEffect, useCallback, memo, type JSX } from 'react';
// import { FileText, Upload, Type, Image, Edit, Trash2, Plus, Clock, ChevronDown, ChevronUp } from 'lucide-react';
// import { type ContentItem, ContentType } from '../../types/content.types';
// import { Badge } from '../ui/Badge';

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

// // ✅ Verificação de ambiente sem process.env
// const isDevelopment = () => {
//   return window.location.hostname === 'localhost' || 
//          window.location.hostname === '127.0.0.1';
// };

// interface ContentCardProps {
//   content: ContentItem;
//   onView: (content: ContentItem) => void;
//   onEdit?: (content: ContentItem) => void;
//   onDelete?: (id: string) => void;
//   onAddContent?: (content: ContentItem) => void;
//   canEdit: boolean;
// }

// // ===== 🛠️ UTILITÁRIOS CENTRALIZADOS =====
// class ContentUtils {
//   static extractTextFromStrapiContent(strapiContent: any[]): string {
//     if (!strapiContent || !Array.isArray(strapiContent)) return '';
    
//     return strapiContent.map(block => {
//       if (block.children && Array.isArray(block.children)) {
//         return block.children.map((child: any) => child.text || '').join('');
//       }
//       return '';
//     }).join(' ').trim();
//   }

//   static formatDateRelative(dateString: string): string {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffInMs = now.getTime() - date.getTime();
//     const diffInHours = diffInMs / (1000 * 60 * 60);
//     const diffInDays = diffInHours / 24;

//     if (diffInHours < 1) return 'Há poucos minutos';
//     if (diffInHours < 24) return `Há ${Math.floor(diffInHours)} horas`;
//     if (diffInDays < 7) return `Há ${Math.floor(diffInDays)} dias`;
//     return date.toLocaleDateString('pt-BR');
//   }

//   static truncateText(text: string, maxLength: number = 100): string {
//     if (!text) return '';
//     if (text.length <= maxLength) return text;
//     return text.substring(0, maxLength).trim() + '...';
//   }

//   static buildImageUrl(url?: string): string {
//     if (!url) {
//       if (isDevelopment()) {
//         console.warn('⚠️ buildImageUrl: URL está vazia', { url });
//       }
//       return '';
//     }
    
//     const finalUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    
//     if (isDevelopment()) {
//       console.log('🔗 buildImageUrl:', { original: url, final: finalUrl, apiBase: API_BASE_URL });
//     }
    
//     return finalUrl;
//   }
// }

// // ===== 🎯 HOOK DE ESTADO DO CARD =====
// const useContentCardState = (content: ContentItem) => {
//   const [isExpanded, setIsExpanded] = useState(false);

//   // Memoizar dados das wiki additions para evitar re-cálculos
//   const wikiAdditionsData = useMemo(() => {
//     const strapiData = content.strapiData;
//     const hasWikiAdditions = !!(strapiData?.all_wiki_additions?.length > 0);
//     const wikiAdditionsCount = strapiData?.all_wiki_additions?.length || 0;
    
//     // Debug apenas em desenvolvimento
//     if (isDevelopment() && hasWikiAdditions) {
//       console.log(`📊 Content ${content.id} tem ${wikiAdditionsCount} wiki-additions`);
//     }
    
//     return {
//       hasWikiAdditions,
//       wikiAdditionsCount,
//       allWikiAdditions: strapiData?.all_wiki_additions || []
//     };
//   }, [content.id, content.strapiData?.all_wiki_additions?.length]);

//   // Memoizar configuração do tipo
//   const typeConfig = useMemo(() => {
//     const configs: Record<ContentType, { icon: JSX.Element; color: string; label: string }> = {
//       [ContentType.PHOTO]: {
//         icon: <Image size={16} className="text-purple-600" />,
//         color: 'bg-purple-100 text-purple-800 border-purple-200',
//         label: 'FOTO'
//       },
//       [ContentType.VIDEO]: {
//         icon: <Upload size={16} className="text-green-600" />,
//         color: 'bg-green-100 text-green-800 border-green-200',
//         label: 'VÍDEO'
//       },
//       [ContentType.TEXT]: {
//         icon: <FileText size={16} className="text-blue-600" />,
//         color: 'bg-blue-100 text-blue-800 border-blue-200',
//         label: 'TEXTO'
//       },
//       [ContentType.TITLE]: {
//         icon: <Type size={16} className="text-yellow-600" />,
//         color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
//         label: 'TÍTULO'
//       },
//       [ContentType.TUTORIAL]: {
//         icon: <FileText size={16} className="text-green-600" />,
//         color: 'bg-green-100 text-green-800 border-green-200',
//         label: 'TUTORIAL'
//       }
//     };
//     return configs[content.type] || configs[ContentType.TEXT];
//   }, [content.type]);

//   // Memoizar badge de categoria
//   const categoryBadge = useMemo(() => {
//     const badges: Record<string, { variant: 'blue' | 'green' | 'purple' | 'gray'; label: string }> = {
//       'tutorial': { variant: 'blue', label: 'Tutorial' },
//       'procedure': { variant: 'green', label: 'Procedimento' },
//       'configuration': { variant: 'purple', label: 'Configuração' }
//     };
//     return badges[content.category || 'configuration'] || { variant: 'gray', label: 'Documento' };
//   }, [content.category]);

//   const toggleExpanded = useCallback(() => {
//     setIsExpanded(prev => !prev);
//   }, []);

//   return {
//     isExpanded,
//     toggleExpanded,
//     wikiAdditionsData,
//     typeConfig,
//     categoryBadge
//   };
// };

// // ===== 📎 COMPONENTE ATTACHMENT PREVIEW =====
// interface AttachmentPreviewProps {
//   attachment: any;
//   index: number;
//   compact?: boolean;
// }

// const AttachmentPreview = memo<AttachmentPreviewProps>(({ attachment, index, compact = false }) => {
//   const [imageError, setImageError] = useState(false);
  
//   const imageUrl = ContentUtils.buildImageUrl(attachment?.url);
//   const imageName = attachment?.name || attachment?.alt || `Imagem ${index + 1}`;
//   // ✅ Aumentando altura dos attachments
//   const heightClass = compact ? 'h-24' : 'h-32 sm:h-40 md:h-48';

//   const handleImageClick = useCallback(() => {
//     if (!imageUrl) {
//       if (isDevelopment()) {
//         console.error('❌ handleImageClick: imageUrl está vazio', { attachment, imageUrl });
//       }
//       return;
//     }
    
//     // Verificar se já existe uma modal aberta
//     const existingModal = document.querySelector('[role="dialog"]');
//     if (existingModal) {
//       if (isDevelopment()) {
//         console.warn('⚠️ Modal já existe, removendo anterior');
//       }
//       existingModal.remove();
//       document.body.style.overflow = 'auto';
//     }
    
//     if (isDevelopment()) {
//       console.log('🖼️ Abrindo modal para imagem:', { 
//         imageUrl, 
//         imageName,
//         bodyExists: !!document.body,
//         currentModals: document.querySelectorAll('[role="dialog"]').length
//       });
//     }
    
//     // Modal otimizado para visualização
//     const modal = document.createElement('div');
//     modal.setAttribute('role', 'dialog');
//     modal.setAttribute('aria-label', 'Visualizar imagem em tamanho completo');
    
//     // CSS inline para garantir que funcione
//     modal.style.cssText = `
//       position: fixed;
//       top: 0;
//       left: 0;
//       width: 100vw;
//       height: 100vh;
//       background-color: rgba(0, 0, 0, 0.95);
//       display: flex;
//       align-items: center;
//       justify-content: center;
//       z-index: 999999;
//       padding: 16px;
//       box-sizing: border-box;
//     `;
    
//     const closeModal = () => {
//       if (document.body.contains(modal)) {
//         document.body.removeChild(modal);
//         document.body.style.overflow = 'auto';
//         if (isDevelopment()) {
//           console.log('✅ Modal removida com sucesso');
//         }
//       } else if (isDevelopment()) {
//         console.warn('⚠️ Modal não encontrada para remoção');
//       }
//     };
    
//     // Fechar com clique no overlay ou ESC
//     modal.addEventListener('click', closeModal);
//     const handleEscape = (e: KeyboardEvent) => {
//       if (e.key === 'Escape') closeModal();
//     };
//     document.addEventListener('keydown', handleEscape);
    
//     // Botão de fechar
//     const closeButton = document.createElement('button');
//     closeButton.innerHTML = '✕';
//     closeButton.setAttribute('aria-label', 'Fechar imagem');
//     closeButton.style.cssText = `
//       position: absolute;
//       top: 16px;
//       right: 16px;
//       background-color: rgba(255, 255, 255, 0.2);
//       color: white;
//       border: none;
//       border-radius: 50%;
//       padding: 8px;
//       font-size: 18px;
//       font-weight: bold;
//       cursor: pointer;
//       z-index: 1;
//       width: 40px;
//       height: 40px;
//       display: flex;
//       align-items: center;
//       justify-content: center;
//     `;
//     closeButton.addEventListener('mouseenter', () => {
//       closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
//     });
//     closeButton.addEventListener('mouseleave', () => {
//       closeButton.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
//     });
//     closeButton.addEventListener('click', (e) => {
//       e.stopPropagation();
//       closeModal();
//     });
    
//     // Loading indicator simples
//     const loadingDiv = document.createElement('div');
//     loadingDiv.style.cssText = `
//       color: white;
//       text-align: center;
//       font-size: 16px;
//     `;
//     loadingDiv.innerHTML = `
//       <div style="
//         width: 32px;
//         height: 32px;
//         border: 3px solid rgba(255,255,255,0.3);
//         border-radius: 50%;
//         border-top: 3px solid white;
//         margin: 0 auto 16px auto;
//       " class="modal-spinner"></div>
//       <p>Carregando imagem...</p>
//     `;
    
//     // Imagem
//     const img = document.createElement('img');
//     img.src = imageUrl;
//     img.alt = imageName;
//     img.style.cssText = `
//       max-width: 100%;
//       max-height: 100%;
//       object-fit: contain;
//       border-radius: 8px;
//       box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
//       display: none;
//     `;
//     img.addEventListener('click', (e) => e.stopPropagation());
    
//     // Event listeners da imagem
//     img.addEventListener('load', () => {
//       if (isDevelopment()) {
//         console.log('✅ Imagem carregada com sucesso');
//       }
//       loadingDiv.style.display = 'none';
//       img.style.display = 'block';
//     });
    
//     img.addEventListener('error', (e) => {
//       console.error('❌ Erro ao carregar imagem:', imageUrl, e);
//       loadingDiv.innerHTML = `
//         <div style="color: white; text-align: center;">
//           <p style="margin-bottom: 8px;">❌ Erro ao carregar imagem</p>
//           <p style="font-size: 14px; opacity: 0.75; margin-bottom: 16px;">${imageUrl}</p>
//           <button onclick="window.open('${imageUrl}', '_blank')" style="
//             padding: 8px 16px;
//             background-color: rgba(255, 255, 255, 0.2);
//             color: white;
//             border: none;
//             border-radius: 4px;
//             font-size: 14px;
//             cursor: pointer;
//           " onmouseover="this.style.backgroundColor='rgba(255, 255, 255, 0.3)'" onmouseout="this.style.backgroundColor='rgba(255, 255, 255, 0.2)'">
//             Abrir em nova aba
//           </button>
//         </div>
//       `;
//     });
    
//     // Adicionar elementos ao modal
//     modal.appendChild(closeButton);
//     modal.appendChild(loadingDiv);
//     modal.appendChild(img);
    
//     // Adicionar modal ao DOM
//     document.body.appendChild(modal);
//     document.body.style.overflow = 'hidden';
    
//     // Verificar se modal foi adicionada corretamente
//     setTimeout(() => {
//       const modalInDOM = document.body.contains(modal);
//       if (isDevelopment()) {
//         console.log('🔍 Modal status após 100ms:', {
//           modalInDOM,
//           modalDisplay: modal.style.display,
//           modalZIndex: modal.style.zIndex,
//           bodyOverflow: document.body.style.overflow,
//           modalRect: modal.getBoundingClientRect()
//         });
//       }
      
//       if (!modalInDOM) {
//         console.error('❌ Modal não foi adicionada ao DOM corretamente');
//         // Fallback: abrir em nova aba
//         window.open(imageUrl, '_blank');
//       }
//     }, 100);
    
//     // Aplicar animação ao spinner após adicionar ao DOM
//     const spinner = loadingDiv.querySelector('.modal-spinner') as HTMLElement;
//     if (spinner) {
//       let rotation = 0;
//       const animate = () => {
//         rotation += 5;
//         spinner.style.transform = `rotate(${rotation}deg)`;
//         if (document.body.contains(spinner)) {
//           requestAnimationFrame(animate);
//         }
//       };
//       animate();
//     }
    
//     if (isDevelopment()) {
//       console.log('🚀 Modal adicionada ao DOM');
//     }
    
//     // Cleanup quando modal fechar
//     const originalCloseModal = closeModal;
//     const newCloseModal = () => {
//       document.removeEventListener('keydown', handleEscape);
//       originalCloseModal();
//     };
    
//     // Atualizar event listeners para usar a nova função de close
//     modal.removeEventListener('click', closeModal);
//     modal.addEventListener('click', newCloseModal);
//     closeButton.removeEventListener('click', closeModal);
//     closeButton.addEventListener('click', (e) => {
//       e.stopPropagation();
//       newCloseModal();
//     });
//   }, [imageUrl, imageName, attachment]);

//   if (!imageUrl || imageError) {
//     return (
//       <div className={`${heightClass} bg-gray-100 rounded border flex flex-col items-center justify-center text-center p-2`}>
//         <span className="text-gray-400 text-sm" aria-hidden="true">📎</span>
//         <span className="text-xs text-gray-500 truncate w-full" title={imageName}>
//           {imageName}
//         </span>
//         {isDevelopment() && (
//           <span className="text-xs text-red-500 mt-1">URL: {imageUrl || 'vazia'}</span>
//         )}
//       </div>
//     );
//   }

//   return (
//     <div className="relative group">
//       <img
//         src={imageUrl}
//         alt={imageName}
//         className={`w-full ${heightClass} object-cover rounded border cursor-pointer hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500`}
//         onClick={handleImageClick}
//         onError={() => {
//           if (isDevelopment()) {
//             console.error('❌ Erro ao carregar imagem preview:', imageUrl);
//           }
//           setImageError(true);
//         }}
//         loading="lazy"
//         tabIndex={0}
//         onKeyDown={(e) => {
//           if (e.key === 'Enter' || e.key === ' ') {
//             e.preventDefault();
//             handleImageClick();
//           }
//         }}
//         onDoubleClick={() => {
//           // Fallback: abrir em nova aba se modal falhar
//           if (isDevelopment()) {
//             console.log('🔄 Fallback: abrindo imagem em nova aba');
//           }
//           window.open(imageUrl, '_blank');
//         }}
//         role="button"
//         aria-label={`Visualizar ${imageName} em tamanho completo`}
//         title={`Clique para ampliar. Duplo-clique para abrir em nova aba.`}
//       />
      
//       {!compact && (
//         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-1 rounded-b opacity-0 group-hover:opacity-100 transition-opacity">
//           <p className="text-white text-xs truncate" title={imageName}>
//             {imageName}
//           </p>
//         </div>
//       )}
      
//       {/* Debug info em desenvolvimento */}
//       {isDevelopment() && (
//         <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded opacity-0 group-hover:opacity-100">
//           {index + 1}
//         </div>
//       )}
//     </div>
//   );
// });

// AttachmentPreview.displayName = 'AttachmentPreview';

// // ===== 📋 COMPONENTE GRID DE ATTACHMENTS =====
// interface AttachmentGridProps {
//   attachments: any[];
//   compact?: boolean;
//   maxVisible?: number;
// }

// const AttachmentGrid = memo<AttachmentGridProps>(({ attachments, compact = false, maxVisible = 6 }) => {
//   const visibleAttachments = attachments.slice(0, maxVisible);
//   const remainingCount = attachments.length - maxVisible;

//   if (attachments.length === 0) return null;

//   return (
//     <div className="mt-2">
//       <p className="text-xs text-gray-500 mb-2">
//         📎 {attachments.length} anexo{attachments.length !== 1 ? 's' : ''}
//       </p>
//       <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3'}`}>
//         {visibleAttachments.map((attachment, index) => (
//           <AttachmentPreview 
//             key={attachment?.id || index}
//             attachment={attachment}
//             index={index}
//             compact={compact}
//           />
//         ))}
//       </div>
//       {remainingCount > 0 && (
//         <p className="text-xs text-gray-500 mt-1">
//           + {remainingCount} anexo{remainingCount !== 1 ? 's' : ''} adiciona{remainingCount !== 1 ? 'is' : 'l'}
//         </p>
//       )}
//     </div>
//   );
// });

// AttachmentGrid.displayName = 'AttachmentGrid';

// // ===== 📝 COMPONENTE WIKI ADDITION ITEM =====
// interface WikiAdditionItemProps {
//   wikiAddition: any;
//   compact?: boolean;
// }

// const WikiAdditionItem = memo<WikiAdditionItemProps>(({ wikiAddition, compact = false }) => {
//   const getTypeConfig = useCallback((type: string) => {
//     const configs: Record<string, { bg: string; border: string; text: string; icon: string }> = {
//       'image': { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', icon: '📸' },
//       'text': { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '📄' },
//       'troubleshooting': { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800', icon: '⚠️' },
//       'file': { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', icon: '📎' }
//     };
//     return configs[type] || configs['text'];
//   }, []);

//   const config = getTypeConfig(wikiAddition.additionType);
//   const content = ContentUtils.extractTextFromStrapiContent(wikiAddition.content);
  
//   // Buscar attachments com múltiplas tentativas
//   const attachments = useMemo(() => {
//     const possibleFields = ['attachments', 'files', 'media', 'images'];
    
//     for (const field of possibleFields) {
//       const fieldValue = wikiAddition[field];
//       if (fieldValue) {
//         if (Array.isArray(fieldValue) && fieldValue.length > 0) {
//           return fieldValue;
//         }
//         if (typeof fieldValue === 'object' && fieldValue.url) {
//           return [fieldValue];
//         }
//       }
//     }
//     return [];
//   }, [wikiAddition]);

//   return (
//     <div className={`p-3 rounded-lg border ${config.bg} ${config.border} mb-3`}>
//       <div className="flex justify-between items-start mb-2">
//         <h5 className={`font-medium text-sm ${config.text}`}>
//           <span aria-hidden="true">{config.icon}</span> {wikiAddition.title}
//         </h5>
//         <time className="text-xs text-gray-500" dateTime={wikiAddition.createdAt}>
//           {ContentUtils.formatDateRelative(wikiAddition.createdAt)}
//         </time>
//       </div>
      
//       {content && (
//         <div className={`text-sm mb-2 ${config.text}`}>
//           {compact ? ContentUtils.truncateText(content, 80) : content}
//         </div>
//       )}
      
//       <AttachmentGrid 
//         attachments={attachments} 
//         compact={compact}
//         maxVisible={compact ? 2 : 6}
//       />
      
//       <p className="text-xs text-gray-500 mt-2">
//         Por: <span className="font-medium">{wikiAddition.author}</span>
//       </p>
//     </div>
//   );
// });

// WikiAdditionItem.displayName = 'WikiAdditionItem';

// // ===== ⏱️ COMPONENTE TIMELINE =====
// interface ContentTimelineProps {
//   content: ContentItem;
//   maxEvents?: number;
// }

// const ContentTimeline = memo<ContentTimelineProps>(({ content, maxEvents = 3 }) => {
//   const events = useMemo(() => {
//     const eventList: any[] = [
//       {
//         id: 'created',
//         type: 'creation',
//         title: 'Conteúdo criado',
//         date: content.createdAt,
//         user: content.createdBy?.username || content.createdBy?.firstname + ' ' + content.createdBy?.lastname || 'Sistema'
//       }
//     ];

//     // Adicionar wiki additions
//     if (content.strapiData?.all_wiki_additions?.length > 0) {
//       content.strapiData.all_wiki_additions.forEach((addition: any) => {
//         eventList.push({
//           id: addition.id.toString(),
//           type: 'addition',
//           title: addition.title,
//           date: addition.createdAt,
//           user: addition.author || 'Sistema'
//         });
//       });
//     }

//     // Adicionar update se diferente de created
//     if (content.updatedAt && content.updatedAt !== content.createdAt) {
//       eventList.push({
//         id: 'updated',
//         type: 'update',
//         title: 'Conteúdo atualizado',
//         date: content.updatedAt,
//         user: 'Sistema'
//       });
//     }

//     return eventList
//       .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
//       .slice(0, maxEvents);
//   }, [content, maxEvents]);

//   const getEventColor = useCallback((type: string) => {
//     const colors: Record<string, string> = {
//       'creation': 'bg-green-500',
//       'addition': 'bg-blue-500',
//       'update': 'bg-yellow-500'
//     };
//     return colors[type] || 'bg-gray-500';
//   }, []);

//   return (
//     <div className="space-y-2">
//       {events.map((event) => (
//         <div key={event.id} className="flex items-start space-x-2">
//           <div 
//             className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 ${getEventColor(event.type)}`}
//             aria-hidden="true"
//           />
//           <div className="flex-1 min-w-0">
//             <p className="text-xs text-gray-600 leading-relaxed">
//               <span className="font-medium">{event.title}</span>
//               <span className="text-gray-400"> • </span>
//               <time dateTime={event.date}>
//                 {ContentUtils.formatDateRelative(event.date)}
//               </time>
//             </p>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// });

// ContentTimeline.displayName = 'ContentTimeline';

// // ===== 🏗️ CONTENTCARD PRINCIPAL OTIMIZADO =====
// const ContentCard = memo<ContentCardProps>(({
//   content,
//   onView,
//   onEdit,
//   onDelete,
//   onAddContent,
//   canEdit
// }) => {
//   const {
//     isExpanded,
//     toggleExpanded,
//     wikiAdditionsData,
//     typeConfig,
//     categoryBadge
//   } = useContentCardState(content);

//   const { hasWikiAdditions, wikiAdditionsCount, allWikiAdditions } = wikiAdditionsData;

//   // Forçar re-renderização quando dados mudarem (compatibilidade com código existente)
//   useEffect(() => {
//     if (isDevelopment()) {
//       console.log('🔄 ContentCard re-renderizado:', {
//         contentId: content.id,
//         wikiAdditionsCount,
//         hasWikiAdditions,
//         timestamp: new Date().toLocaleTimeString()
//       });
//     }
//   }, [content.id, wikiAdditionsCount, hasWikiAdditions]);

//   // Handlers memoizados
//   const handleEdit = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation();
//     onEdit?.(content);
//   }, [onEdit, content]);

//   const handleDelete = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation();
//     onDelete?.(content.id.toString());
//   }, [onDelete, content.id]);

//   const handleAddContent = useCallback((e: React.MouseEvent) => {
//     e.stopPropagation();
//     onAddContent?.(content);
//   }, [onAddContent, content]);

//   const handleView = useCallback(() => {
//     onView(content);
//   }, [onView, content]);

//   const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
//     if (e.key === 'Enter' || e.key === ' ') {
//       e.preventDefault();
//       handleView();
//     }
//   }, [handleView]);

//   return (
//     <article 
//       className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
//       onClick={handleView}
//       onKeyDown={handleKeyDown}
//       tabIndex={0}
//       role="button"
//       aria-label={`Visualizar detalhes de ${content.title}`}
//     >
//       {/* Header com título e ações */}
//       <header className="flex items-start justify-between mb-3">
//         <h3 className="font-semibold text-gray-900 text-base leading-tight pr-2 flex-1">
//           {content.title}
//         </h3>
        
//         {/* Botões de ação - SEMPRE VISÍVEIS (melhor UX mobile) */}
//         {canEdit && (
//           <div className="flex space-x-1 flex-shrink-0" role="group" aria-label="Ações do conteúdo">
//             {onEdit && (
//               <button
//                 onClick={handleEdit}
//                 className="w-8 h-8 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 title="Editar conteúdo"
//                 aria-label={`Editar ${content.title}`}
//               >
//                 <Edit size={16} />
//               </button>
//             )}
//             {onAddContent && (
//               <button
//                 onClick={handleAddContent}
//                 className="w-8 h-8 bg-green-50 hover:bg-green-100 text-green-600 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
//                 title="Adicionar conteúdo"
//                 aria-label={`Adicionar conteúdo a ${content.title}`}
//               >
//                 <Plus size={16} />
//               </button>
//             )}
//             {onDelete && (
//               <button
//                 onClick={handleDelete}
//                 className="w-8 h-8 bg-red-50 hover:bg-red-100 text-red-600 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
//                 title="Excluir conteúdo"
//                 aria-label={`Excluir ${content.title}`}
//               >
//                 <Trash2 size={16} />
//               </button>
//             )}
//           </div>
//         )}
//       </header>

//       {/* Badges informativos */}
//       <div className="flex items-center flex-wrap gap-2 mb-3">
//         <Badge variant={categoryBadge.variant} label={categoryBadge.label} />
//         <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${typeConfig.color}`}>
//           {typeConfig.icon}
//           <span className="ml-1 uppercase">{content.type}</span>
//         </span>
//         {content.priority && content.priority > 0 && (
//           <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
//             Prioridade {content.priority}
//           </span>
//         )}
//       </div>

//       {/* Preview de imagem com lazy loading melhorado */}
//       {content.type === ContentType.PHOTO && content.filePath && (
//         <div className="mb-3">
//           <div className="w-full h-48 sm:h-56 md:h-64 rounded-md border border-gray-200 overflow-hidden bg-gray-50">
//             <img
//               src={content.filePath}
//               alt={`Preview de ${content.title}`}
//               className="w-full h-full object-cover hover:scale-105 transition-transform"
//               loading="lazy"
//               onError={(e) => {
//                 const target = e.currentTarget;
//                 target.onerror = null;
//                 target.src = 'https://via.placeholder.com/300x200?text=Imagem+Nao+Encontrada';
//               }}
//             />
//           </div>
//         </div>
//       )}

//       {/* Descrição com truncamento inteligente */}
//       {content.description && (
//         <div className="mb-3">
//           <p className="text-gray-600 text-sm leading-relaxed">
//             {isExpanded 
//               ? content.description 
//               : ContentUtils.truncateText(content.description, 150)
//             }
//           </p>
//         </div>
//       )}

//       {/* Debug info apenas em desenvolvimento e quando expandido */}
//       {isDevelopment() && isExpanded && hasWikiAdditions && (
//         <div className="mb-3 p-2 bg-blue-100 rounded text-xs border">
//           <strong>🔍 CONTENTCARD DEBUG:</strong><br/>
//           Wiki Additions Count: {wikiAdditionsCount}<br/>
//           Has Strapi Data: {!!content.strapiData ? 'YES' : 'NO'}<br/>
//           Expanded: {isExpanded ? 'YES' : 'NO'}<br/>
//           API Base URL: {API_BASE_URL}<br/>
//           Timestamp: {new Date().toLocaleTimeString()}
//         </div>
//       )}

//       {/* Conteúdo expandido */}
//       {isExpanded && (
//         <section className="mb-4" aria-label="Conteúdo detalhado">
//           {/* Conteúdo principal */}
//           <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3">
//             <h4 className="font-medium text-sm text-orange-800 mb-2">📄 Conteúdo Principal</h4>
//             <div className="text-sm text-orange-700 whitespace-pre-wrap">
//               {content.textContent || 'Sem conteúdo textual disponível'}
//             </div>
//             <time className="text-xs text-orange-600 mt-2 block" dateTime={content.createdAt}>
//               Criado em {ContentUtils.formatDateRelative(content.createdAt)}
//             </time>
//           </div>

//           {/* Wiki additions com timeline */}
//           {hasWikiAdditions && (
//             <div className="relative" role="region" aria-label="Adições ao conteúdo">
//               <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300" aria-hidden="true"></div>
              
//               {allWikiAdditions.map((wikiAddition: any, index: number) => (
//                 <div key={wikiAddition.id || index} className="relative mb-3">
//                   <div className="absolute left-3 top-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-white" aria-hidden="true"></div>
//                   <div className="ml-8">
//                     <WikiAdditionItem wikiAddition={wikiAddition} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       )}

//       {/* Timeline compacta quando não expandido */}
//       {!isExpanded && (
//         <div className="mb-3">
//           <div className="bg-gray-50 rounded-md p-3">
//             <div className="flex items-center mb-2">
//               <Clock size={14} className="text-gray-400 mr-1" aria-hidden="true" />
//               <span className="text-xs font-medium text-gray-700">Histórico</span>
//             </div>
//             <ContentTimeline content={content} maxEvents={3} />
//           </div>
//         </div>
//       )}

//       {/* Indicador de wiki additions quando não expandido */}
//       {!isExpanded && hasWikiAdditions && (
//         <div className="mb-3">
//           <div className="bg-blue-50 border border-blue-200 rounded-md p-2">
//             <div className="flex items-center justify-between mb-1">
//               <p className="text-xs text-blue-700 font-medium">
//                 📋 {wikiAdditionsCount} adição{wikiAdditionsCount !== 1 ? 'ões' : ''} disponível{wikiAdditionsCount !== 1 ? 'eis' : ''}
//               </p>
//               {/* Timestamp para debug quando necessário */}
//               {isDevelopment() && (
//                 <span className="text-xs text-blue-500">
//                   {new Date().toLocaleTimeString()}
//                 </span>
//               )}
//             </div>
//             <div className="text-xs text-blue-600 space-y-1">
//               {allWikiAdditions.slice(0, 2).map((addition: any, index: number) => (
//                 <div key={addition.id || index}>
//                   <span className="font-medium">• {addition.title || `Adição ${index + 1}`}</span>
//                   <span className="text-blue-500 ml-1">
//                     - {ContentUtils.truncateText(ContentUtils.extractTextFromStrapiContent(addition.content), 50)}
//                   </span>
//                   {addition.attachments?.length > 0 && (
//                     <span 
//                       className="text-purple-600 ml-1" 
//                       title={`${addition.attachments.length} anexo${addition.attachments.length !== 1 ? 's' : ''}`}
//                       aria-label={`${addition.attachments.length} anexo${addition.attachments.length !== 1 ? 's' : ''}`}
//                     >
//                       📎
//                     </span>
//                   )}
//                 </div>
//               ))}
//               {wikiAdditionsCount > 2 && (
//                 <p className="text-blue-500 font-medium">+ {wikiAdditionsCount - 2} mais...</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Botão expandir/recolher */}
//       {hasWikiAdditions && (
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             toggleExpanded();
//           }}
//           className="w-full px-3 py-2 mb-2 bg-gray-100 text-gray-700 font-medium rounded-md hover:bg-gray-200 transition-colors text-sm flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-gray-500"
//           aria-label={isExpanded ? 'Recolher conteúdo detalhado' : `Expandir para ver ${wikiAdditionsCount} adições`}
//           aria-expanded={isExpanded}
//         >
//           {isExpanded ? (
//             <>
//               <ChevronUp size={16} className="mr-1" aria-hidden="true" />
//               Recolher conteúdo
//             </>
//           ) : (
//             <>
//               <ChevronDown size={16} className="mr-1" aria-hidden="true" />
//               Expandir para ver todo conteúdo ({wikiAdditionsCount})
//             </>
//           )}
//         </button>
//       )}

//       {/* Botão principal de visualização */}
//       <button
//         onClick={handleView}
//         className="w-full px-3 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
//         aria-label={`Ver detalhes completos de ${content.title}`}
//       >
//         Ver detalhes
//       </button>
//     </article>
//   );
// });

// ContentCard.displayName = 'ContentCard';

// export default ContentCard;



import React, { useState, useMemo, useEffect, useCallback, memo, type JSX } from 'react';
import { FileText, Upload, Type, Image, Edit, Trash2, Plus, Clock, ChevronDown, ChevronUp, ImageOff, Paperclip, Layers, History, File as FileIcon } from 'lucide-react';
import { type ContentItem, ContentType } from '../../types/content.types';
import { Badge } from '../ui/Badge'; // Assumindo que você tem um componente Badge

// ✅ Configuração centralizada da API
const getApiBaseUrl = () => {
  const isProduction = window.location.hostname !== 'localhost' &&
                       window.location.hostname !== '127.0.0.1';
  return isProduction
    ? 'https://strapi.cznet.net.br'
    : 'http://localhost:1337';
};

const API_BASE_URL = getApiBaseUrl();

// ✅ Verificação de ambiente (para debug logs, não para UI)
const isDevelopment = () => {
  return window.location.hostname === 'localhost' ||
         window.location.hostname === '127.0.0.1';
};

interface ContentCardProps {
  content: ContentItem;
  onView: (content: ContentItem) => void;
  onEdit?: (content: ContentItem) => void;
  onDelete?: (id: string) => void;
  onAddContent?: (content: ContentItem) => void;
  canEdit: boolean;
}

// ===== 🛠️ UTILITÁRIOS CENTRALIZADOS =====
class ContentUtils {
  static extractTextFromStrapiContent(strapiContent: any[]): string {
    if (!strapiContent || !Array.isArray(strapiContent)) return '';

    return strapiContent.map(block => {
      if (block.children && Array.isArray(block.children)) {
        return block.children.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join(' ').trim();
  }

  static formatDateRelative(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) return 'Há poucos minutos';
    if (diffInHours < 24) return `Há ${Math.floor(diffInHours)} horas`;
    if (diffInDays < 7) return `Há ${Math.floor(diffInDays)} dias`;
    return date.toLocaleDateString('pt-BR');
  }

  static truncateText(text: string, maxLength: number = 100): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }

  static buildImageUrl(url?: string): string {
    if (!url) {
      if (isDevelopment()) {
        console.warn('⚠️ buildImageUrl: URL está vazia', { url });
      }
      return '';
    }

    const finalUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    if (isDevelopment()) {
      console.log('🔗 buildImageUrl:', { original: url, final: finalUrl, apiBase: API_BASE_URL });
    }

    return finalUrl;
  }
}

// ===== 🎯 HOOK DE ESTADO DO CARD (para o "cartão postal") =====
const useContentCardState = (content: ContentItem) => {
  const wikiData = useMemo(() => {
    const allAdditions = content.strapiData?.all_wiki_additions || [];
    const totalAdditions = allAdditions.length;
    const hasAdditions = totalAdditions > 0;

    const allAttachmentsInAdditions = allAdditions.flatMap((add: { attachments: any; }) => add.attachments || []);
    const totalAttachments = allAttachmentsInAdditions.length;
    const hasAttachments = totalAttachments > 0;

    return {
      totalAdditions,
      hasAdditions,
      totalAttachments,
      hasAttachments,
      allAttachmentsInAdditions
    };
  }, [content.strapiData?.all_wiki_additions]);

  const typeConfig = useMemo(() => {
    const configs: Record<ContentType, { icon: JSX.Element; color: string; label: string }> = {
      [ContentType.PHOTO]: { icon: <Image size={14} className="text-purple-600" />, color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'FOTO' },
      [ContentType.VIDEO]: { icon: <Upload size={14} className="text-green-600" />, color: 'bg-green-100 text-green-800 border-green-200', label: 'VÍDEO' },
      [ContentType.TEXT]: { icon: <FileText size={14} className="text-gray-600" />, color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'TEXTO' },
      [ContentType.TITLE]: { icon: <Type size={14} className="text-yellow-600" />, color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'TÍTULO' },
      [ContentType.TUTORIAL]: { icon: <FileText size={14} className="text-red-600" />, color: 'bg-red-100 text-red-800 border-red-200', label: 'TUTORIAL' }
    };
    return configs[content.type] || configs[ContentType.TEXT];
  }, [content.type]);

  const categoryBadge = useMemo(() => {
    // CORREÇÃO: Usar um fallback para content.category para garantir que nunca seja undefined.
    const categoryKey = content.category || 'documento_generico'; // Usar uma chave fallback
    
    const badges: Record<string, { variant: 'default' | 'outline' | 'secondary' | 'destructive'; label: string }> = {
      'tutorial': { variant: 'default', label: 'Tutorial' },
      'procedure': { variant: 'secondary', label: 'Procedimento' },
      'configuration': { variant: 'destructive', label: 'Configuração' },
      'documento_generico': { variant: 'outline', label: 'Documento' } // Adicionar o fallback aqui
    };
    return badges[categoryKey]; // Agora categoryKey é garantido como string
  }, [content.category]);

  return {
    wikiData,
    typeConfig,
    categoryBadge
  };
};

// ===== 📎 COMPONENTE ATTACHMENT INDICATOR PARA CONTENTCARD (ULTRA COMPACTA) =====
// Esta versão é puramente indicativa (ícone + contagem), sem pré-visualização de imagem.
interface AttachmentIndicatorProps {
  count: number;
}

const AttachmentIndicator = memo<AttachmentIndicatorProps>(({ count }) => {
  if (count === 0) return null;

  return (
    <div className="flex items-center text-gray-500 text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
      <Paperclip size={10} className="mr-1" />
      <span>{count}</span>
    </div>
  );
});
AttachmentIndicator.displayName = 'AttachmentIndicator';


// ===== ⏱️ COMPONENTE TIMELINE COMPACTA (PARA CONTENTCARD) =====
// Mostra o evento mais recente de forma muito concisa.
interface ContentTimelineCompactProps {
  content: ContentItem;
}

const ContentTimelineCompact = memo<ContentTimelineCompactProps>(({ content }) => {
  const latestEvent = useMemo(() => {
    const events: { date: string; title: string; type: string }[] = [];

    if (content.createdAt) {
      events.push({ date: content.createdAt, title: 'Criado', type: 'creation' });
    }
    if (content.updatedAt && content.updatedAt !== content.createdAt) {
      events.push({ date: content.updatedAt, title: 'Atualizado', type: 'update' });
    }
    const latestAddition = content.strapiData?.all_wiki_additions?.length
      ? content.strapiData.all_wiki_additions.reduce((latest: { createdAt: any; }, current: { createdAt: any; }) => {
          return new Date(current.createdAt || '') > new Date(latest.createdAt || '') ? current : latest;
        })
      : null;
    
    if (latestAddition && latestAddition.createdAt) {
        events.push({
            date: latestAddition.createdAt,
            title: 'Adição',
            type: 'addition'
        });
    }

    if (events.length === 0) return null;

    return events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  }, [content.createdAt, content.updatedAt, content.strapiData?.all_wiki_additions]);

  if (!latestEvent) return null;

  const eventTypeIcon = useMemo(() => {
    switch (latestEvent.type) {
      case 'creation': return <FileIcon size={12} className="text-gray-500" />;
      case 'update': return <Edit size={12} className="text-yellow-500" />;
      case 'addition': return <Layers size={12} className="text-red-500" />;
      default: return <Clock size={12} className="text-gray-500" />;
    }
  }, [latestEvent.type]);


  return (
    <div className="flex items-center text-gray-500 text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
      {eventTypeIcon}
      <span className="ml-1">{latestEvent.title}</span>
      <span className="mx-1">•</span>
      <time dateTime={latestEvent.date} title={new Date(latestEvent.date).toLocaleString('pt-BR')}>
        {ContentUtils.formatDateRelative(latestEvent.date)}
      </time>
    </div>
  );
});
ContentTimelineCompact.displayName = 'ContentTimelineCompact';


// ===== 🏗️ CONTENTCARD PRINCIPAL: O "CARTÃO POSTAL DA WIKI" =====
const ContentCard = memo<ContentCardProps>(({
  content,
  onView,
  onEdit,
  onDelete,
  onAddContent,
  canEdit
}) => {
  const {
    wikiData,
    typeConfig,
    categoryBadge
  } = useContentCardState(content);

  const { totalAdditions, hasAttachments, totalAttachments } = wikiData;

  useEffect(() => {
    if (isDevelopment()) {
      console.log('🔄 ContentCard re-renderizado:', {
        contentId: content.id,
        totalAdditions,
        hasAttachments,
        timestamp: new Date().toLocaleTimeString()
      });
    }
  }, [content.id, totalAdditions, hasAttachments]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(content);
  }, [onEdit, content]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(content.id.toString());
  }, [onDelete, content.id]);

  const handleAddContent = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onAddContent?.(content);
  }, [onAddContent, content]);

  const handleView = useCallback(() => {
    onView(content);
  }, [onView, content]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleView();
    }
  }, [handleView]);

  return (
    <article
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 p-3 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 flex flex-col justify-between h-full"
      onClick={handleView}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Visualizar detalhes de ${content.title}`}
    >
      {/* Header com título e ações */}
      <header className="flex items-start justify-between mb-2">
        <h3 className="font-semibold text-gray-900 text-base leading-tight pr-2 flex-1 truncate" title={content.title}>
          {content.title}
        </h3>

        {/* Botões de ação (Editar, Adicionar, Excluir) */}
        {canEdit && (
          <div className="flex space-x-0.5 flex-shrink-0" role="group" aria-label="Ações do conteúdo">
            {onEdit && (
              <button
                onClick={handleEdit}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                title="Editar conteúdo"
                aria-label={`Editar ${content.title}`}
              >
                <Edit size={14} />
              </button>
            )}
            {onAddContent && (
              <button
                onClick={handleAddContent}
                className="w-7 h-7 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
                title="Adicionar conteúdo"
                aria-label={`Adicionar conteúdo a ${content.title}`}
              >
                <Plus size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={handleDelete}
                className="w-7 h-7 bg-gray-50 hover:bg-red-100 text-red-600 rounded-md flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
                title="Excluir conteúdo"
                aria-label={`Excluir ${content.title}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </header>

      {/* Badges informativos (Tipo e Categoria) */}
      <div className="flex items-center flex-wrap gap-1 mb-2">
        {/* CORREÇÃO: Passar o label como prop 'label' para o componente Badge */}
        <Badge variant={categoryBadge.variant} label={categoryBadge.label} />
        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium border ${typeConfig.color}`}>
          {typeConfig.icon}
          <span className="ml-1 uppercase">{content.type}</span>
        </span>
        {content.priority && content.priority > 0 && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
            Prioridade {content.priority}
          </span>
        )}
      </div>

      {/* Preview de imagem principal (REMOVIDO para o "cartão postal") */}
      {/* {content.type === ContentType.PHOTO && content.filePath && (
        <div className="mb-3">
          <div className="w-full h-48 sm:h-56 md:h-64 rounded-md border border-gray-200 overflow-hidden bg-gray-50">
            <img
              src={ContentUtils.buildImageUrl(content.filePath)}
              alt={`Preview de ${content.title}`}
              className="w-full h-full object-cover hover:scale-105 transition-transform"
              loading="lazy"
              onError={(e) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = 'https://via.placeholder.com/300x200?text=Imagem+Nao+Encontrada';
              }}
            />
          </div>
        </div>
      )} */}

      {/* Descrição truncada */}
      {content.description && (
        <div className="mb-2">
          <p className="text-gray-600 text-sm leading-snug">
            {ContentUtils.truncateText(content.description, 100)}
          </p>
        </div>
      )}

      {/* Indicadores de conteúdo auxiliar (Anexos, Adições, Histórico) */}
      <div className="mt-auto pt-3 border-t border-gray-100 flex items-center flex-wrap gap-2">
        {hasAttachments && <AttachmentIndicator count={totalAttachments} />}
        {totalAdditions > 0 && (
          <div className="flex items-center text-gray-500 text-xs px-2 py-1 rounded-full bg-gray-100 border border-gray-200">
            <Layers size={10} className="mr-1" />
            <span>{totalAdditions}</span>
          </div>
        )}
        <ContentTimelineCompact content={content} />
      </div>
    </article>
  );
});

ContentCard.displayName = 'ContentCard';

export default ContentCard;