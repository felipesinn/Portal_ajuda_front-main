import React from 'react';
import { Edit } from 'lucide-react';

interface Section {
  id: number;
  title: string;
  content: string;
  order: number;
}

interface SectionViewerProps {
  section: Section;
  onEdit?: () => void;
}

const SectionViewer: React.FC<SectionViewerProps> = ({ section, onEdit }) => {
  // Função para renderizar o conteúdo Markdown como HTML
  const renderMarkdown = (content: string) => {
    // Aqui seria ideal usar uma biblioteca como marked ou react-markdown
    // Para simplificar, vamos fazer uma renderização básica
    
    // Substituir links de imagens por elementos img
    const imgRegex = /!\[(.*?)\]\((.*?)\)/g;
    const contentWithImages = content.replace(imgRegex, '<img src="$2" alt="$1" class="max-w-full h-auto my-2 rounded" />');
    
    // Substituir quebras de linha por <br>
    const withLineBreaks = contentWithImages.replace(/\n/g, '<br />');
    
    return { __html: withLineBreaks };
  };

  return (
    <div className="py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xl font-semibold text-gray-800">
          {section.order}. {section.title}
        </h3>
        
        {onEdit && (
          <button
            onClick={onEdit}
            className="flex items-center px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            <Edit size={16} className="mr-1" /> Editar
          </button>
        )}
      </div>
      
      <div 
        className="prose max-w-none text-gray-700"
        dangerouslySetInnerHTML={renderMarkdown(section.content)}
      />
    </div>
  );
};

export default SectionViewer;
