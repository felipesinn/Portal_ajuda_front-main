import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import SectionEditor from './SectionEditor';
import SectionViewer from './SectionViewer';
import { sectionsService, type Section } from '../../services/sections.service';

interface ContentSectionsProps {
  contentId: number;
  canEdit: boolean;
  initialSections?: Section[];
}

const ContentSections: React.FC<ContentSectionsProps> = ({
  contentId,
  canEdit,
  initialSections = []
}) => {
  const [sections, setSections] = useState<Section[]>(initialSections);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<number | null>(null);
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialSections.length > 0) {
      setSections(initialSections);
      setLoading(false);
      return;
    }

    const fetchSections = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await sectionsService.getSectionsByContentId(contentId);
        setSections(data);
      } catch (err) {
        console.error('Erro ao carregar seções:', err);
        setError('Não foi possível carregar as seções. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchSections();
  }, [contentId, initialSections]);

  const handleSaveSection = async (sectionId: number | undefined, data: { title: string; content: string; order: number }) => {
    try {
      setSaving(true);
      setError(null);
      let updatedSection: Section;

      if (sectionId) {
        // Atualizar seção existente
        updatedSection = await sectionsService.updateSection(sectionId, data);
        setSections(prevSections =>
          prevSections.map(section =>
            section.id === sectionId ? updatedSection : section
          )
        );
      } else {
        // Criar nova seção
        updatedSection = await sectionsService.createSection({
          ...data,
          contentId
        });
        setSections(prevSections => [...prevSections, updatedSection].sort((a, b) => a.order - b.order));
      }

      setEditingSectionId(null);
      setIsAddingSection(false);
    } catch (err) {
      console.error('Erro ao salvar seção:', err);
      setError('Erro ao salvar seção. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: number) => {
    try {
      setError(null);
      await sectionsService.deleteSection(sectionId);
      setSections(prevSections =>
        prevSections.filter(section => section.id !== sectionId)
      );
      setEditingSectionId(null);
    } catch (err) {
      console.error('Erro ao excluir seção:', err);
      setError('Erro ao excluir seção. Tente novamente.');
    }
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-gray-500">
        <RefreshCw className="animate-spin mx-auto mb-2" size={20} />
        Carregando seções...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-md mb-4">
        <div className="flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-6">
      {sortedSections.length === 0 && !isAddingSection && (
        <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg">
          Nenhuma seção encontrada para este conteúdo.
          {canEdit && (
            <div className="mt-2">
              <button
                onClick={() => setIsAddingSection(true)}
                className="text-blue-600 hover:text-blue-800"
              >
                Adicionar a primeira seção
              </button>
            </div>
          )}
        </div>
      )}

      {sortedSections.map((section) => (
        <div key={section.id} className="border-b border-gray-200 pb-6 last:border-0">
          {editingSectionId === section.id ? (
            <SectionEditor
              sectionId={section.id}
              contentId={contentId}
              title={section.title}
              content={section.content}
              order={section.order}
              onSave={(data) => handleSaveSection(section.id, data)}
              onDelete={() => handleDeleteSection(section.id)}
              onCancel={() => setEditingSectionId(null)}
            />
          ) : (
            <SectionViewer
              section={section}
              onEdit={canEdit ? () => setEditingSectionId(section.id) : undefined}
            />
          )}
        </div>
      ))}

      {isAddingSection && (
        <SectionEditor
          contentId={contentId}
          title=""
          content=""
          order={sections.length > 0 ? Math.max(...sections.map(s => s.order)) + 1 : 1}
          onSave={(data) => handleSaveSection(undefined, data)}
          onCancel={() => setIsAddingSection(false)}
        />
      )}

      {canEdit && !isAddingSection && sections.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setIsAddingSection(true)}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
              saving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={saving}
          >
            {saving ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Plus size={16} className="mr-2" />
                Adicionar Seção
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentSections;