import React, { useState, useEffect } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import {
  type ContentItem,
  ContentType,
  ContentCategory,
} from "../../types/content.types";
import { type SectorType } from "../../types/common.types";
import Spinner from "../ui/Spinner";

interface ContentFormProps {
  initialData?: ContentItem;
  userSector: SectorType;
  isSuperAdmin: boolean;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
}

// ✅ Função para converter string para Strapi Rich Text
const convertToStrapiRichText = (text: string) => {
  if (!text || text.trim() === '') return [];
  
  const paragraphs = text.split('\n').filter(line => line.trim() !== '');
  
  return paragraphs.map(paragraph => ({
    type: 'paragraph',
    children: [
      {
        type: 'text',
        text: paragraph.trim()
      }
    ]
  }));
};

const ContentForm: React.FC<ContentFormProps> = ({
  initialData,
  userSector,
  isSuperAdmin,
  onSubmit,
  onCancel,
}) => {
  // Estado do formulário
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    type: ContentType;
    category: string;
    sector: SectorType;
    textContent: string;
    priority: number;
    complexity: number;
  }>({
    title: "",
    description: "",
    type: ContentType.TEXT,
    category: "",
    sector: userSector,
    textContent: "",
    priority: 0,
    complexity: 0,
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isEditing = !!initialData;

  // ✅ Inicialização do formulário
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        type: initialData.type || ContentType.TEXT,
        category: initialData.category || "",
        sector: (initialData.sector as SectorType) || userSector,
        textContent: initialData.textContent || "",
        priority: initialData.priority || 0,
        complexity: initialData.complexity || 0,
      });

      if (initialData.filePath) {
        setPreviewUrl(initialData.filePath);
      }
    } else {
      setFormData({
        title: "",
        description: "",
        type: ContentType.TEXT,
        category: "",
        sector: userSector,
        textContent: "",
        priority: 0,
        complexity: 0,
      });
      setPreviewUrl(null);
    }

    setSelectedFile(null);
    setError(null);
    setUploadProgress(0);
  }, [initialData, userSector]);

  // ✅ Validação do formulário aprimorada
  const validateForm = (): string | null => {
    if (!formData.title.trim()) {
      return 'O título é obrigatório.';
    }

    if (formData.title.trim().length < 3) {
      return 'O título deve ter pelo menos 3 caracteres.';
    }

    if (formData.title.trim().length > 100) {
      return 'O título deve ter no máximo 100 caracteres.';
    }

    if (formData.type === ContentType.TEXT || 
        formData.type === ContentType.TITLE || 
        formData.type === ContentType.TUTORIAL) {
      
      if (!formData.textContent.trim()) {
        return 'O conteúdo de texto é obrigatório para este tipo.';
      }

      if (formData.textContent.trim().length < 10) {
        return 'O conteúdo deve ter pelo menos 10 caracteres.';
      }
    }

    if ((formData.type === ContentType.PHOTO || formData.type === ContentType.VIDEO) && 
        !selectedFile && !isEditing) {
      return 'Um arquivo é obrigatório para este tipo de conteúdo.';
    }

    if (selectedFile && selectedFile.size > 10 * 1024 * 1024) {
      return 'O arquivo deve ter no máximo 10MB.';
    }

    if (selectedFile) {
      if (formData.type === ContentType.PHOTO && !selectedFile.type.startsWith('image/')) {
        return 'Para tipo "Foto", selecione apenas arquivos de imagem.';
      }
      
      if (formData.type === ContentType.VIDEO && !selectedFile.type.startsWith('video/')) {
        return 'Para tipo "Vídeo", selecione apenas arquivos de vídeo.';
      }
    }

    if (formData.priority < 0 || formData.priority > 10) {
      return 'A prioridade deve estar entre 0 e 10.';
    }

    if (formData.complexity < 0) {
      return 'A complexidade não pode ser negativa.';
    }

    return null;
  };

  // ✅ Manipular seleção de arquivo com validação melhorada
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`Arquivo muito grande. Máximo: ${maxSize / (1024 * 1024)}MB`);
        return;
      }

      // ✅ Validação mais específica por tipo
      let allowedTypes: string[] = [];
      
      if (formData.type === ContentType.PHOTO) {
        allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      } else if (formData.type === ContentType.VIDEO) {
        allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/avi'];
      } else {
        // Para outros tipos, permitir tanto imagem quanto vídeo
        allowedTypes = ['image/', 'video/'];
      }
      
      const isAllowed = allowedTypes.some(type => 
        type.endsWith('/') ? file.type.startsWith(type) : file.type === type
      );
      
      if (!isAllowed) {
        const typeText = formData.type === ContentType.PHOTO ? 
          'imagens (JPG, PNG, GIF, WEBP)' : 
          formData.type === ContentType.VIDEO ?
          'vídeos (MP4, WebM, MOV, AVI)' :
          'imagens ou vídeos';
        setError(`Tipo de arquivo não suportado. Use ${typeText}.`);
        return;
      }
    }

    setSelectedFile(file);
    setError(null);

    // ✅ Preview apenas para imagens
    if (file && file.type.startsWith("image/")) {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  };

  // ✅ Submit do formulário com progresso aprimorado
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const baseData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
        category: formData.category || undefined,
        sector: formData.sector,
        textContent: formData.textContent.trim() 
          ? convertToStrapiRichText(formData.textContent.trim())
          : undefined,
        priority: formData.priority,
        complexity: formData.complexity,
      };

      const formDataToSend = new FormData();
      formDataToSend.append('data', JSON.stringify(baseData));
      
      if (selectedFile) {
        formDataToSend.append('files.media', selectedFile);
      }

      // ✅ Progresso simulado mais realista
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          // Progresso mais lento no início, mais rápido no meio
          if (prev < 30) return prev + 5;
          if (prev < 70) return prev + 15;
          return prev + 8;
        });
      }, 150);

      await onSubmit(formDataToSend);
      
      setUploadProgress(100);
      clearInterval(progressInterval);

      // ✅ Pequeno delay para mostrar 100% antes de fechar
      setTimeout(() => {
        // Form será fechado pelo componente pai
      }, 300);

    } catch (error: any) {
      let errorMessage = 'Ocorreu um erro inesperado ao salvar o conteúdo.';
      
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        if (error.message.includes('ValidationError')) {
          errorMessage = 'Erro de validação. Verifique se todos os campos obrigatórios estão preenchidos corretamente.';
        } else if (error.message.includes('413')) {
          errorMessage = 'Arquivo muito grande. Reduza o tamanho e tente novamente.';
        } else if (error.message.includes('415')) {
          errorMessage = 'Tipo de arquivo não suportado.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Sem permissão para realizar esta operação.';
        } else if (error.message.includes('401')) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setUploadProgress(0);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Atualizar campos do formulário
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    let processedValue: any = value;
    
    if (name === 'priority' || name === 'complexity') {
      processedValue = parseInt(value) || 0;
    }
    
    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    
    if (error) {
      setError(null);
    }
  };

  // ✅ Remover arquivo com cleanup melhorado
  const handleRemoveFile = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setError(null); // ✅ Limpar erro também
    
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // ✅ Cleanup aprimorado
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const shouldShowFileField = formData.type === ContentType.PHOTO || formData.type === ContentType.VIDEO;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6 pb-4 border-b">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                {isEditing ? "Editar Conteúdo" : "Adicionar Novo Conteúdo"}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {isEditing ? `Editando: ${initialData?.title}` : `Criando novo conteúdo no setor ${userSector}`}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
              aria-label="Fechar formulário"
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle size={20} className="text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-medium">Erro no formulário</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          )}

          {isSubmitting && uploadProgress > 0 && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {isEditing ? 'Atualizando conteúdo...' : 'Criando conteúdo...'}
                </span>
                <span className="text-sm text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Digite um título descritivo"
                required
                disabled={isSubmitting}
                maxLength={100}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.title.length}/100 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Breve descrição do conteúdo (opcional)"
                disabled={isSubmitting}
                maxLength={200}
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description.length}/200 caracteres
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo *
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isEditing || isSubmitting}
                >
                  <option value={ContentType.TEXT}>Texto</option>
                  <option value={ContentType.TITLE}>Título</option>
                  <option value={ContentType.PHOTO}>Foto</option>
                  <option value={ContentType.VIDEO}>Vídeo</option>
                  <option value={ContentType.TUTORIAL}>Tutorial</option>
                </select>
                {isEditing && (
                  <p className="text-xs text-gray-500 mt-1">
                    O tipo não pode ser alterado durante a edição
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Categoria
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Selecione uma categoria</option>
                  <option value={ContentCategory.TUTORIAL}>Tutorial</option>
                  <option value={ContentCategory.PROCEDURE}>Procedimento</option>
                  <option value={ContentCategory.CONFIGURATION}>Configuração</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                  Setor *
                </label>
                <select
                  id="sector"
                  name="sector"
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={!isSuperAdmin || isSubmitting}
                >
                  <option value="suporte">Suporte</option>
                  <option value="tecnico">Técnico</option>
                  <option value="noc">NOC</option>
                  <option value="comercial">Comercial</option>
                  <option value="adm">ADM</option>
                </select>
                {!isSuperAdmin && (
                  <p className="text-xs text-gray-500 mt-1">
                    Apenas administradores podem alterar o setor
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Prioridade (0-10)
                </label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  min="0"
                  max="10"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Valores mais altos aparecem primeiro
                </p>
              </div>
            </div>

            {formData.category === ContentCategory.PROCEDURE && (
              <div>
                <label htmlFor="complexity" className="block text-sm font-medium text-gray-700 mb-1">
                  Complexidade (Número de passos)
                </label>
                <input
                  type="number"
                  id="complexity"
                  name="complexity"
                  value={formData.complexity}
                  onChange={handleChange}
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 5 (para procedimento com 5 passos)"
                  disabled={isSubmitting}
                />
              </div>
            )}

            {(formData.type === ContentType.TEXT ||
              formData.type === ContentType.TITLE ||
              formData.type === ContentType.TUTORIAL) && (
              <div>
                <label htmlFor="textContent" className="block text-sm font-medium text-gray-700 mb-1">
                  Conteúdo de Texto *
                </label>
                <textarea
                  id="textContent"
                  name="textContent"
                  value={formData.textContent}
                  onChange={handleChange}
                  rows={8}
                  className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Digite o conteúdo aqui..."
                  required
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use formatação numérica (1., 1.1., etc.) para estruturar seu conteúdo.
                </p>
              </div>
            )}

            {shouldShowFileField && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isEditing ? "Substituir Arquivo" : "Arquivo *"}
                </label>

                {previewUrl && (
                  <div className="mb-4">
                    {formData.type === ContentType.PHOTO ? (
                      <div className="relative inline-block">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-40 rounded-md border border-gray-200 shadow-sm"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                          disabled={isSubmitting}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>📹</span>
                        <span>Vídeo selecionado: {selectedFile?.name}</span>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="text-red-500 hover:text-red-700"
                          disabled={isSubmitting}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!previewUrl && (
                  <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-gray-400 transition-colors">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <label htmlFor="file" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Selecione um {formData.type === ContentType.PHOTO ? 'arquivo de imagem' : 'arquivo de vídeo'}
                        </span>
                        <span className="mt-1 block text-xs text-gray-500">
                          {formData.type === ContentType.PHOTO 
                            ? 'PNG, JPG, GIF, WEBP até 10MB' 
                            : 'MP4, WebM, MOV, AVI até 10MB'
                          }
                        </span>
                      </label>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFileChange}
                        className="hidden"
                        accept={formData.type === ContentType.PHOTO ? "image/*" : "video/*"}
                        disabled={isSubmitting}
                        required={!isEditing}
                      />
                    </div>
                  </div>
                )}

                {isEditing && initialData?.filePath && (
                  <p className="text-sm text-gray-500 mt-2">
                    {selectedFile
                      ? "O arquivo atual será substituído pelo novo arquivo."
                      : "Deixe vazio para manter o arquivo atual."}
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span className="ml-2">
                      {isEditing ? 'Atualizando...' : 'Salvando...'}
                    </span>
                  </>
                ) : (
                  <span>{isEditing ? 'Atualizar' : 'Salvar'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContentForm;