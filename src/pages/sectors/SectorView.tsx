import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus } from 'lucide-react';

// Componentes
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import ContentForm from '../../components/content/ContentForm';
import ContentAdditionForm from '../../components/content/ContentAdditionForm';
import ContentViewer from '../../components/content/ContentViewer';
import ContentCard from '../../components/content/ContentCard';
import SearchBar from '../../components/ui/SearchBar';
import FilterButtons from '../../components/ui/FilterButtons';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

// Hooks e tipos
import { useContent } from '../../hooks/useContent';
import { usePermissions } from '../../hooks/usePermissions';
import { type ContentItem, ContentType, ContentCategory } from '../../types/content.types';
import { type SectorType } from '../../types/common.types';

// Constantes
const FILTER_OPTIONS = [
  { id: 'all', label: 'Todos' },
  { id: ContentCategory.TUTORIAL, label: 'Tutoriais' },
  { id: ContentCategory.PROCEDURE, label: 'Procedimentos' },
  { id: ContentCategory.CONFIGURATION, label: 'Configurações' }
];

type FilterType = ContentCategory | 'all';

interface SubmissionData {
  articleId?: string;
  title: string;
  textContent?: string;
  type: ContentType;
  sector: string;
  file?: File;
  createdBy?: number;
}

// Utilitário para conversão segura de setor
const convertToSectorType = (sector: string | undefined): SectorType => {
  if (!sector) return 'suporte' as SectorType;

  const validSectors: SectorType[] = ['suporte', 'tecnico', 'noc', 'comercial', 'adm'];
  return validSectors.includes(sector as SectorType) ? sector as SectorType : 'suporte' as SectorType;
};

// Utilitário para extrair dados do FormData
const extractFormData = (formData: FormData) => {
  try {
    const dataString = formData.get('data') as string;
    const parsedData = dataString ? JSON.parse(dataString) : {};
    const file = formData.get('files.media') as File | null;

    return { parsedData, file };
  } catch (error) {
    throw new Error('Formato de dados inválido');
  }
};

const SectorView: React.FC = () => {
  const { canEditContent, isSuperAdmin, currentSector } = usePermissions();

  // Conversão segura do setor
  const typedCurrentSector = convertToSectorType(currentSector);

  // Hook unificado para conteúdos
  const {
    contents,
    loading,
    error,
    refreshContents,
    createContent,
    updateContent,
    deleteContent,
    createWikiAddition,
    deleteWikiAddition,
    clearError
  } = useContent({
    sector: typedCurrentSector,
    autoLoad: true
  });

  // Estados da UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [isAddingContent, setIsAddingContent] = useState(false);
  const [isAddingToArticle, setIsAddingToArticle] = useState(false);
  const [isEditingContent, setIsEditingContent] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Filtros
  const filteredContents = useMemo(() => {
    let filtered = contents;

    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedFilter !== 'all') {
      filtered = filtered.filter(content => content.category === selectedFilter);
    }

    return filtered;
  }, [contents, searchTerm, selectedFilter]);

  // Reset de estados
  const resetStates = useCallback(() => {
    setIsAddingContent(false);
    setIsEditingContent(false);
    setIsAddingToArticle(false);
    setIsConfirmingDelete(false);
    setSelectedContent(null);
    setDeleting(false);
  }, []);

  // Handlers de conteúdo
  const handleViewContent = useCallback((content: ContentItem) => {
    setSelectedContent(content);
  }, []);

  const handleEditContent = useCallback((content: ContentItem) => {
    setSelectedContent(content);
    setIsEditingContent(true);
  }, []);

  const handleDeleteContent = useCallback((id: string) => {
    const content = contents.find(c => c.id.toString() === id);
    if (content) {
      setSelectedContent(content);
      setIsConfirmingDelete(true);
    }
  }, [contents]);

  const handleAddToContent = useCallback((content: ContentItem) => {
    setSelectedContent(content);
    setIsAddingToArticle(true);
  }, []);

  // Submit de formulários - CRIAÇÃO/EDIÇÃO DE CONTENT PRINCIPAL
  const handleSubmitContent = useCallback(async (formData: FormData) => {
    try {
      // Extrair dados do FormData
      const { parsedData, file } = extractFormData(formData);

      // Validar dados básicos
      if (!parsedData.title?.trim()) {
        throw new Error('Título é obrigatório');
      }

      if (isEditingContent && selectedContent) {
        // ===== ATUALIZAÇÃO DE CONTEÚDO EXISTENTE =====
        // Testar ambos os IDs para garantir que funcione
        const numericId = selectedContent.id.toString();
        const documentId = (selectedContent as any)?.strapiData?.documentId;

        // Preparar dados para update
        const updateData = {
          title: parsedData.title.trim(),
          description: parsedData.description?.trim() || '',
          sector: parsedData.sector || typedCurrentSector,
          type: parsedData.type || ContentType.TEXT,
          category: parsedData.category || 'configuration',
          priority: parsedData.priority || 0,
          complexity: parsedData.complexity || 0,
          textContent: parsedData.textContent || undefined
        };

        // Tentar primeiro com documentId, depois com numericId
        let success = false;
        let updateId = documentId || numericId;

        try {
          const result = await updateContent(updateId, updateData);
          success = !!result;

          if (!success && documentId && updateId === documentId) {
            updateId = numericId;
            const secondResult = await updateContent(numericId, updateData);
            success = !!secondResult;
          }
        } catch (error) {
          if (documentId && updateId !== numericId) {
            try {
              const fallbackResult = await updateContent(numericId, updateData);
              success = !!fallbackResult;
            } catch (secondError) {
              throw error;
            }
          } else {
            throw error;
          }
        }

        if (success) {
          await refreshContents();
          resetStates();
        } else {
          throw new Error(`Falha na atualização do conteúdo com ambos os IDs: ${numericId}, ${documentId}`);
        }

      } else {
        // ===== CRIAÇÃO DE NOVO CONTEÚDO =====
        // Preparar dados para criação
        const createData = {
          title: parsedData.title.trim(),
          description: parsedData.description?.trim() || '',
          sector: parsedData.sector || typedCurrentSector,
          type: parsedData.type || ContentType.TEXT,
          category: parsedData.category || 'configuration',
          priority: parsedData.priority || 0,
          complexity: parsedData.complexity || 0,
          textContent: parsedData.textContent || undefined 
        };

        const result = await createContent(createData);
        const success = !!result;

        if (success) {
          await refreshContents();
          resetStates();
        } else {
          throw new Error('Falha na criação do conteúdo');
        }
      }

    } catch (error: any) {
      let errorMessage = 'Erro ao salvar conteúdo.';

      if (error.message) {
        if (error.message.includes('Título é obrigatório')) {
          errorMessage = 'O título é obrigatório para salvar o conteúdo.';
        } else if (error.message.includes('ValidationError')) {
          errorMessage = 'Erro de validação: Verifique se todos os campos obrigatórios estão preenchidos.';
        } else if (error.message.includes('403')) {
          errorMessage = 'Você não tem permissão para realizar esta ação.';
        } else if (error.message.includes('404')) {
          errorMessage = 'Conteúdo não encontrado. Tente recarregar a página.';
        } else if (error.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
      throw error;
    }
  }, [isEditingContent, selectedContent, typedCurrentSector, createContent, updateContent, refreshContents, resetStates]);

  // Submit de adição - CRIAÇÃO DE WIKI ADDITIONS
  const handleSubmitAddition = useCallback(async (data: SubmissionData) => {
    if (!selectedContent) {
      return;
    }

    try {
      // Usar o ID simples que sabemos que funciona para wiki additions
      const result = await createWikiAddition({
        contentId: selectedContent.id.toString(),
        title: data.title,
        textContent: data.textContent || '',
        type: data.type,
        file: data.file,
        author: 'author'
      });
      const success = !!result;

      if (success) {
        await refreshContents();
        resetStates();
      } else {
        throw new Error('Falha ao criar wiki addition');
      }
    } catch (error) {
      alert(`Erro ao adicionar conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }, [selectedContent, createWikiAddition, refreshContents, resetStates]);

  // Confirmar exclusão - EXCLUSÃO DE CONTENT PRINCIPAL
  const handleConfirmDelete = useCallback(async () => {
    if (!selectedContent) return;

    setDeleting(true);

    try {
      // Testar ambos os IDs para garantir que funcione
      const numericId = selectedContent.id.toString();
      const documentId = (selectedContent as any)?.strapiData?.documentId;

      let success = false;
      let deleteId = documentId || numericId;

      try {
        const result = await deleteContent(deleteId);
        success = !!result;

        if (!success && documentId && deleteId === documentId) {
          deleteId = numericId;
          const secondResult = await deleteContent(numericId);
          success = !!secondResult;
        }
      } catch (error) {
        if (documentId && deleteId !== numericId) {
          try {
            const fallbackResult = await deleteContent(numericId);
            success = !!fallbackResult;
          } catch (secondError) {
            throw error;
          }
        } else {
          throw error;
        }
      }

      if (success) {
        await refreshContents();
        resetStates();
      } else {
        throw new Error(`Falha na exclusão do conteúdo com ambos os IDs: ${numericId}, ${documentId}`);
      }
    } catch (error) {
      alert(`Erro ao excluir conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setDeleting(false);
    }
  }, [selectedContent, deleteContent, refreshContents, resetStates]);

  // Verificar permissões com conversão segura
  const canEdit = useCallback((sector?: string | SectorType) => {
    if (!canEditContent) return false;

    const typedSector = sector ? convertToSectorType(sector as string) : typedCurrentSector;
    return canEditContent(typedSector);
  }, [canEditContent, typedCurrentSector]);

  return (
    <ResponsiveLayout title={`Central de ${typedCurrentSector}`} currentSector={typedCurrentSector}>
      <div className="p-6">
        {/* Barra de pesquisa e filtros */}
        <div className="mb-8">
          <SearchBar
            placeholder="Buscar artigos, tutoriais, procedimentos..."
            value={searchTerm}
            onChange={setSearchTerm}
            className="mb-4"
          />
          <FilterButtons
            title="Filtrar por tipo"
            options={FILTER_OPTIONS}
            selectedId={selectedFilter}
            onChange={setSelectedFilter as (id: string) => void}
          />
        </div>

        {/* Mensagem de erro */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center justify-between">
            <div className="flex-1">
              <strong className="font-bold">Erro:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
            <button
              onClick={clearError}
              className="text-red-700 hover:text-red-900 ml-4"
            >
              ✕
            </button>
          </div>
        )}

        {/* Conteúdo principal */}
        {loading || deleting ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin h-8 w-8 border-2 border-red-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <>
            {/* Botão para Criar Novo Conteúdo */}
            {canEdit(typedCurrentSector) && (
              <div className="mb-6">
                <button
                  onClick={() => setIsAddingContent(true)}
                  className="w-full p-4 border-2 border-dashed border-red-300 rounded-lg text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus size={24} />
                  <span className="font-medium text-lg">Criar Novo Conteúdo</span>
                </button>
              </div>
            )}

            {/* Grid de Cards */}
            {filteredContents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContents.map((content) => (
                  <ContentCard
                    key={content.id}
                    content={content}
                    onView={handleViewContent}
                    onEdit={canEdit(content.sector) ? handleEditContent : undefined}
                    onDelete={canEdit(content.sector) ? handleDeleteContent : undefined}
                    onAddContent={canEdit(content.sector) ? handleAddToContent : undefined}
                    canEdit={canEdit(content.sector)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg shadow text-center">
                <div className="flex flex-col items-center">
                  <Search size={48} className="text-gray-300 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">Nenhum conteúdo encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Tente ajustar seus termos de busca.' : 'Ainda não há conteúdo neste setor.'}
                  </p>
                  {canEdit(typedCurrentSector) && (
                    <button
                      onClick={() => setIsAddingContent(true)}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center transition-colors"
                    >
                      <Plus size={18} className="mr-2" />
                      Adicionar Primeiro Conteúdo
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== MODAIS ===== */}

      {/* Modal Visualizar */}
      {selectedContent && !isEditingContent && !isAddingToArticle && (
        <ContentViewer
          content={selectedContent}
          onClose={() => setSelectedContent(null)}
          onEdit={canEdit(selectedContent.sector) ? () => handleEditContent(selectedContent) : undefined}
          onAddContent={canEdit(selectedContent.sector) ? () => handleAddToContent(selectedContent) : undefined}
          onEditAddition={canEdit(selectedContent.sector) ? async (additionId: string) => {
            const result = await deleteWikiAddition(additionId);
            if (result) {
              await refreshContents();
              setSelectedContent(null);
            }
          } : undefined}
          isAdmin={canEdit(selectedContent.sector)}
          isSuperAdmin={isSuperAdmin}
        />
      )}

      {/* Modal Criar/Editar Conteúdo */}
      {(isAddingContent || isEditingContent) && (
        <ContentForm
          initialData={isEditingContent && selectedContent ? selectedContent : undefined}
          userSector={typedCurrentSector}
          isSuperAdmin={isSuperAdmin}
          onSubmit={handleSubmitContent}
          onCancel={resetStates}
        />
      )}

      {/* Modal Adicionar WikiAddition */}
      {isAddingToArticle && selectedContent && (
        <ContentAdditionForm
          article={selectedContent}
          onClose={() => {
            setIsAddingToArticle(false);
            setSelectedContent(null);
          }}
          onSubmit={handleSubmitAddition}
        />
      )}

      {/* Modal Confirmar Exclusão */}
      {isConfirmingDelete && selectedContent && (
        <ConfirmDialog
          title="Confirmar Exclusão"
          message={`Tem certeza que deseja excluir "${selectedContent.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir"
          cancelLabel="Cancelar"
          isOpen={isConfirmingDelete}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setIsConfirmingDelete(false);
            setSelectedContent(null);
          }}
          variant="danger"
        />
      )}
    </ResponsiveLayout>
  );
};

export default SectorView;