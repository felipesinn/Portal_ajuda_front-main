import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, RefreshCw } from 'lucide-react';
import ContentSections from '../components/content/ContentSections';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { contentService } from '../services/content.service';
import type { ContentItem } from '../types/content.types';
import type { SectorType } from '../types/common.types';

const ContentDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  useAuth();
  const { canEditContent, canDeleteContent } = usePermissions();
  
  const [content, setContent] = useState<ContentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  
  const contentId = id || '0';
  
  useEffect(() => {
    const fetchContent = async () => {
      if (!contentId || contentId === '0') {
        setError('ID do conteúdo inválido');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await contentService.getContentById(contentId);
        setContent(data);
      } catch (err: any) {
        console.error('Erro ao carregar conteúdo:', err);
        
        let errorMessage = 'Não foi possível carregar o conteúdo.';
        if (err.response?.status === 404) {
          errorMessage = 'Conteúdo não encontrado.';
        } else if (err.response?.status === 403) {
          errorMessage = 'Você não tem permissão para acessar este conteúdo.';
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContent();
  }, [contentId]);
  
  const canEdit = content ? canEditContent(content.sector as SectorType) : false;
  const canDelete = content ? canDeleteContent(content.sector as SectorType) : false;
  
  const handleDelete = async () => {
    if (!content) return;

    if (!window.confirm(`Tem certeza que deseja excluir "${content.title}"?\n\nEsta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      
      const result = await contentService.deleteContent(content.id.toString());
      
      if (result.success) {
        console.log("Conteúdo excluído com sucesso");
        navigate(content.sector ? `/${content.sector}` : '/', {
          state: { message: `"${content.title}" foi excluído com sucesso.` }
        });
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      console.error('Erro ao excluir conteúdo:', err);
      
      let errorMessage = 'Erro ao excluir conteúdo.';
      if (err.response?.status === 403) {
        errorMessage = 'Você não tem permissão para excluir este conteúdo.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Conteúdo não encontrado.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mx-auto"></div>
          </div>
          <p className="text-gray-500 mt-4">Carregando conteúdo...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </button>
        
        <div className="bg-red-100 text-red-700 p-4 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!content) {
    return (
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 flex items-center text-blue-600 hover:text-blue-800"
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </button>
        
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Conteúdo não encontrado</h2>
          <p className="text-gray-500">O conteúdo solicitado não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  const getHeaderGradient = () => {
    const contentType = content.type?.toLowerCase() || '';
    
    switch (contentType) {
      case 'tutorial':
        return 'from-blue-600 to-blue-400';
      case 'procedure':
      case 'procedimento':
        return 'from-green-600 to-green-400';
      case 'documentation':
      case 'documentação':
        return 'from-amber-600 to-amber-400';
      case 'text':
        return 'from-indigo-600 to-indigo-400';
      case 'photo':
        return 'from-purple-600 to-purple-400';
      case 'video':
        return 'from-pink-600 to-pink-400';
      default:
        return 'from-gray-600 to-gray-400';
    }
  };
  
  const formattedDate = new Date(content.updatedAt || content.createdAt).toLocaleDateString('pt-BR');
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800"
          disabled={deleting}
        >
          <ArrowLeft size={16} className="mr-1" /> Voltar
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className={`bg-gradient-to-r ${getHeaderGradient()} rounded-lg p-6 mb-6 text-white shadow-lg`}>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{content.title}</h1>
            {content.description && (
              <p className="mb-4 text-white text-opacity-90">{content.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                Tipo: {content.type}
              </span>
              {content.category && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                  Categoria: {content.category}
                </span>
              )}
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                Setor: {content.sector}
              </span>
              <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                Atualizado: {formattedDate}
              </span>
              {content.createdByName && (
                <span className="bg-white bg-opacity-20 px-2 py-1 rounded">
                  Por: {content.createdByName}
                </span>
              )}
            </div>
          </div>
          
          {(canEdit || canDelete) && (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
              {canEdit && (
                <button
                  onClick={() => navigate(`/content/edit/${content.id}`)}
                  className="flex items-center justify-center px-3 py-1.5 bg-white text-blue-600 rounded-md hover:bg-gray-100 transition-colors shadow-sm"
                  disabled={deleting}
                >
                  <Edit size={16} className="mr-1" /> Editar
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className={`flex items-center justify-center px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors shadow-sm ${
                    deleting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <RefreshCw size={16} className="mr-1 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} className="mr-1" />
                      Excluir
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        {content.textContent && (
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: content.textContent }} />
        )}
        
        {content.type === 'photo' && content.filePath && (
          <div className="mb-6">
            <img 
              src={contentService.getFileUrl(content.filePath)}
              alt={content.title}
              className="max-w-full h-auto rounded-lg shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {content.type === 'video' && content.filePath && (
          <div className="mb-6">
            <video 
              controls
              className="max-w-full h-auto rounded-lg shadow-md"
            >
              <source src={contentService.getFileUrl(content.filePath)} />
              Seu navegador não suporta vídeos.
            </video>
          </div>
        )}
        
        <ContentSections
          contentId={Number(content.id)}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
};

export default ContentDetail;