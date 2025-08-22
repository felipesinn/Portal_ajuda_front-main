import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Upload, AlertCircle } from 'lucide-react';
import { type ContentItem } from '../../types/content.types'; 
import { ContentType } from '../../types/content.types';
import { isDevelopment, safeLog, safeError } from '../../utils/envUtils';

interface ContentAdditionFormProps {
  article: ContentItem;
  onClose: () => void;
  onSubmit: (data: {
    articleId: string;
    title: string;
    textContent: string;
    type: ContentType; 
    sector: string;
    file?: File;
    createdBy?: number;
  }) => Promise<void>;
}

const ContentAdditionForm: React.FC<ContentAdditionFormProps> = ({
  article,
  onClose,
  onSubmit
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null); // ✅ CORRIGIDO: HTMLInputElement
  
  const debugInfo = isDevelopment() ? `
ID: ${article.id}
Título: ${article.title}
Setor: ${article.sector}
Strapi ID: ${(article as any)?.strapiData?.numericId || 'N/A'}
Document ID: ${(article as any)?.strapiData?.documentId || 'N/A'}
Wiki Additions: ${(article as any)?.strapiData?.all_wiki_additions?.length || 0}
  `.trim() : '';
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 10 * 1024 * 1024) {
        setError('Arquivo muito grande. Tamanho máximo: 10MB');
        return;
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
      if (!allowedTypes.includes(file.type)) {
        setError('Tipo de arquivo não suportado. Use imagens (JPG, PNG, GIF, WebP) ou vídeos (MP4, WebM).');
        return;
      }
      
      setSelectedFile(file);
      setError(null);
      
      if (file.type.startsWith('image/')) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
      }
    }
  };
  
  const clearFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null); // ✅ Limpar erro também
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'O título é obrigatório.';
    }
    
    if (title.trim().length < 3) {
      return 'O título deve ter pelo menos 3 caracteres.';
    }
    
    if (!content.trim() && !selectedFile) {
      return 'É necessário adicionar um texto ou uma imagem.';
    }
    
    if (content.trim().length > 0 && content.trim().length < 10) {
      return 'O conteúdo deve ter pelo menos 10 caracteres.';
    }
    
    return null;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      if (titleInputRef.current && !title.trim()) {
        titleInputRef.current.focus();
      }
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let contentType: ContentType;
      if (selectedFile) {
        if (selectedFile.type.startsWith('image/')) {
          contentType = ContentType.PHOTO;
        } else if (selectedFile.type.startsWith('video/')) {
          contentType = ContentType.VIDEO;
        } else {
          contentType = ContentType.TEXT;
        }
      } else {
        contentType = ContentType.TEXT;
      }

      const submissionData = {
        articleId: String(article.id), 
        title: title.trim(),
        textContent: content.trim(), 
        type: contentType,
        sector: article.sector, 
        file: selectedFile || undefined,
      };
      
      safeLog('📤 Enviando dados para adição:', {
        ...submissionData,
        file: selectedFile ? { 
          name: selectedFile.name, 
          size: selectedFile.size, 
          type: selectedFile.type 
        } : undefined
      });
      
      await onSubmit(submissionData);
      
      safeLog('✅ Adição enviada com sucesso!');
      onClose();
      
    } catch (err: any) {
      safeError('❌ Erro ao adicionar conteúdo:', err);
      
      let errorMessage = 'Ocorreu um erro ao adicionar o conteúdo.';
      
      if (err.message) {
        if (err.message.includes('ValidationError')) {
          errorMessage = 'Erro de validação: Verifique se todos os campos estão corretos.';
        } else if (err.message.includes('404')) {
          errorMessage = 'Artigo não encontrado. Tente recarregar a página.';
        } else if (err.message.includes('403')) {
          errorMessage = 'Sem permissão para adicionar conteúdo a este artigo.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // ✅ Focus automático no título quando modal abre
    if (titleInputRef.current) {
      titleInputRef.current.focus();
    }
    
    // ✅ Cleanup de URLs
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-2 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Adicionar Conteúdo: {article.title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Setor: {article.sector} • ID: {article.id}
              </p>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={isSubmitting}
            >
              <X size={20} />
            </button>
          </div>
          
          {isDevelopment() && debugInfo && (
            <div className="mb-4 p-3 bg-gray-100 rounded text-xs">
              <strong>Debug Info:</strong>
              <pre className="mt-1 whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 flex items-start">
              <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Erro:</p>
                <p className="text-sm mt-1">{error}</p>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título da Adição *
              </label>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: Novo método para consulta ONU"
                required
                disabled={isSubmitting}
                maxLength={400}
              />
              <p className="text-xs text-gray-500 mt-2">
                ✅ Obrigatório: Este título identificará sua adição. ({title.length}/100)
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conteúdo
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Adicione o novo conteúdo aqui..."
                disabled={isSubmitting}
                maxLength={2000}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Para listas numeradas, comece as linhas com "1. ", "2. ", etc.</span>
                <span>{content.length}/2000 caracteres</span>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adicionar Arquivo (opcional)
              </label>
              
              {previewUrl ? (
                <div className="relative mb-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-48 w-auto rounded-md border border-gray-200 mx-auto block"
                  />
                  <button
                    type="button"
                    onClick={clearFile}
                    className="absolute top-2 right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200"
                    disabled={isSubmitting}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => !isSubmitting && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-gray-300 rounded-md p-6 text-center transition-colors ${
                    isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'
                  }`}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="text-left">
                        <p className="font-medium text-gray-700">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">
                          {(selectedFile.size / 1024).toFixed(1)} KB • {selectedFile.type}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          clearFile();
                        }}
                        className="ml-2 text-red-600 hover:text-red-800"
                        disabled={isSubmitting}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600 mt-2">
                        <span className="font-medium text-blue-600">Clique para fazer upload</span> ou arraste e solte
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF, WebP, MP4, WebM até 10MB
                      </p>
                    </>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,video/*"
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-md mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Como funciona a adição de conteúdo:
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Esta adição será exibida <strong>abaixo</strong> do conteúdo original</li>
                      <li>Cada adição é numerada e datada automaticamente</li>
                      <li>O conteúdo original é preservado integralmente</li>
                      <li>As adições aparecem em ordem cronológica</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting || !title.trim()}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Adicionando...
                  </>
                ) : (
                  <>
                    <Plus size={18} className="mr-1" />
                    Adicionar Conteúdo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentAdditionForm;