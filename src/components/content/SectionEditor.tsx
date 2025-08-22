// import React, { useState } from 'react';
// import { Trash2, Save, Upload } from 'lucide-react';

// interface SectionEditorProps {
//   sectionId?: number;
//   contentId: number;
//   title: string;
//   content: string;
//   order: number;
//   onSave: (data: { title: string; content: string; order: number }) => Promise<void>;
//   onDelete?: () => Promise<void>;
//   onCancel: () => void;
// }

// const SectionEditor: React.FC<SectionEditorProps> = ({
//   sectionId,
//   contentId,
//   title: initialTitle,
//   content: initialContent,
//   order,
//   onSave,
//   onDelete,
//   onCancel
// }) => {
//   const [title, setTitle] = useState(initialTitle);
//   const [content, setContent] = useState(initialContent);
//   const [isUploading, setIsUploading] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isDeleting, setIsDeleting] = useState(false);
//   const [error, setError] = useState<string | null>(null);

//   const isNewSection = !sectionId;

//   const handleSave = async () => {
//     if (!title.trim()) {
//       setError('O título é obrigatório');
//       return;
//     }

//     if (!content.trim()) {
//       setError('O conteúdo é obrigatório');
//       return;
//     }

//     setError(null);
//     setIsSaving(true);

//     try {
//       await onSave({ title, content, order });
//     } catch (err) {
//       setError('Erro ao salvar seção. Tente novamente.');
//       console.error('Erro ao salvar seção:', err);
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!onDelete) return;
    
//     if (window.confirm('Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita.')) {
//       setIsDeleting(true);
//       try {
//         await onDelete();
//       } catch (err) {
//         setError('Erro ao excluir seção. Tente novamente.');
//         console.error('Erro ao excluir seção:', err);
//         setIsDeleting(false);
//       }
//     }
//   };

//   const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setIsUploading(true);
//     setError(null);

//     const formData = new FormData();
//     formData.append('file', file);

//     try {
//       const response = await fetch(`/api/uploads/section/${sectionId}`, {
//         method: 'POST',
//         body: formData,
//         credentials: 'include'
//       });

//       if (!response.ok) {
//         throw new Error('Falha no upload do arquivo');
//       }

//       const data = await response.json();
      
//       // Adicionar referência do arquivo ao conteúdo
//       const fileReference = `\n\n![${file.name}](${data.filePath})`;
//       setContent(prevContent => prevContent + fileReference);
      
//     } catch (err) {
//       setError('Erro ao fazer upload do arquivo. Tente novamente.');
//       console.error('Erro no upload:', err);
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//       <div className="mb-4">
//         <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 mb-1">
//           Título da Seção
//         </label>
//         <input
//           id="section-title"
//           type="text"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//           placeholder="Digite o título da seção"
//           disabled={isSaving || isDeleting}
//         />
//       </div>

//       <div className="mb-4">
//         <label htmlFor="section-content" className="block text-sm font-medium text-gray-700 mb-1">
//           Conteúdo
//         </label>
//         <textarea
//           id="section-content"
//           value={content}
//           onChange={(e) => setContent(e.target.value)}
//           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
//           placeholder="Digite o conteúdo da seção (suporta formatação Markdown)"
//           disabled={isSaving || isDeleting}
//         />
//       </div>

//       {!isNewSection && (
//         <div className="mb-4">
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Anexar Arquivo
//           </label>
//           <div className="flex items-center">
//             <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer">
//               <Upload size={16} className="mr-2" />
//               <span>Selecionar Arquivo</span>
//               <input
//                 type="file"
//                 className="hidden"
//                 onChange={handleFileUpload}
//                 disabled={isUploading || isSaving || isDeleting}
//               />
//             </label>
//             {isUploading && <span className="ml-3 text-sm text-gray-500">Enviando arquivo...</span>}
//           </div>
//         </div>
//       )}

//       {error && (
//         <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//           {error}
//         </div>
//       )}

//       <div className="flex justify-between">
//         <div>
//           <button
//             type="button"
//             onClick={handleSave}
//             disabled={isSaving || isDeleting}
//             className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2"
//           >
//             <Save size={16} className="mr-2" />
//             {isSaving ? 'Salvando...' : 'Salvar'}
//           </button>
//           <button
//             type="button"
//             onClick={onCancel}
//             disabled={isSaving || isDeleting}
//             className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
//           >
//             Cancelar
//           </button>
//         </div>

//         {!isNewSection && onDelete && (
//           <button
//             type="button"
//             onClick={handleDelete}
//             disabled={isSaving || isDeleting}
//             className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
//           >
//             <Trash2 size={16} className="mr-2" />
//             {isDeleting ? 'Excluindo...' : 'Excluir'}
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// export default SectionEditor;

import React, { useState, useEffect } from 'react';
import { Trash2, Save, Upload, X, Eye, AlertCircle } from 'lucide-react';

interface SectionEditorProps {
  sectionId?: number;
  contentId: number;
  title: string;
  content: string;
  order: number;
  onSave: (data: { title: string; content: string; order: number }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
}

interface UploadedImage {
  name: string;
  path: string;
}

const SectionEditor: React.FC<SectionEditorProps> = ({
  sectionId,
  contentId,
  title: initialTitle,
  content: initialContent,
  order,
  onSave,
  onDelete,
  onCancel
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [content, setContent] = useState(initialContent);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [previewMode, setPreviewMode] = useState(false);

  const isNewSection = !sectionId;

  // Extrair imagens do conteúdo ao carregar
  useEffect(() => {
    const extractImages = () => {
      const regex = /!\[(.*?)\]\((.*?)\)/g;
      const images: UploadedImage[] = [];
      let match;
      
      while ((match = regex.exec(initialContent)) !== null) {
        images.push({
          name: match[1] || 'Imagem',
          path: match[2]
        });
      }
      
      setUploadedImages(images);
    };
    
    if (initialContent) {
      extractImages();
    }
  }, [initialContent]);

  const handleSave = async () => {
    if (!title.trim()) {
      setError('O título é obrigatório');
      return;
    }

    if (!content.trim()) {
      setError('O conteúdo é obrigatório');
      return;
    }

    setError(null);
    setIsSaving(true);

    try {
      console.log('Salvando seção:', { title, content, order });
      await onSave({ title, content, order });
      setSuccessMessage('Seção salva com sucesso!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Erro detalhado ao salvar seção:', err);
      setError('Erro ao salvar seção. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    if (window.confirm('Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita.')) {
      setIsDeleting(true);
      setError(null);
      
      try {
        console.log('Iniciando exclusão da seção:', sectionId);
        await onDelete();
        console.log('Seção excluída com sucesso');
      } catch (err) {
        console.error('Erro detalhado ao excluir seção:', err);
        setError('Erro ao excluir seção. Tente novamente.');
        setIsDeleting(false);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo (apenas imagens)
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Tipo de arquivo não suportado. Por favor, use JPG, PNG ou GIF.');
      return;
    }

    // Validar tamanho do arquivo (ex: 5MB)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB em bytes
    if (file.size > MAX_SIZE) {
      setError(`Arquivo muito grande. O tamanho máximo é ${MAX_SIZE / (1024 * 1024)}MB.`);
      return;
    }

    setIsUploading(true);
    setError(null);
    setUploadProgress(0);
    
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);
    
    // Log do que está sendo enviado
    console.log('Enviando arquivo:', {
      nome: file.name,
      tipo: file.type,
      tamanho: `${(file.size / 1024).toFixed(2)} KB`,
      sectionId: sectionId || 'nova seção'
    });
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(percentComplete);
        console.log(`Progresso do upload: ${percentComplete}%`);
      }
    });
    
    xhr.addEventListener('load', () => {
      console.log('Resposta do servidor:', xhr.status, xhr.statusText);
      
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          console.log('Dados da resposta:', response);
          
          // Adicionar à lista de imagens carregadas
          const newImage = {
            name: file.name,
            path: response.filePath
          };
          
          setUploadedImages(prev => [...prev, newImage]);
          
          // Adicionar referência do arquivo ao conteúdo
          const fileReference = `\n\n![${file.name}](${response.filePath})`;
          setContent(prevContent => prevContent + fileReference);
          
          setSuccessMessage(`Arquivo "${file.name}" enviado com sucesso!`);
          setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
          console.error('Erro ao processar resposta JSON:', err);
          setError('Erro ao processar resposta do servidor.');
        }
      } else {
        let errorMsg = 'Erro ao fazer upload do arquivo.';
        
        try {
          const errorData = JSON.parse(xhr.responseText);
          errorMsg = errorData.message || errorMsg;
        } catch (e) {
          // Ignorar erro de parsing
        }
        
        setError(errorMsg);
        console.error('Erro no upload:', xhr.status, xhr.statusText);
      }
      
      setIsUploading(false);
      // Limpar o input de arquivo para permitir o mesmo arquivo novamente
      e.target.value = '';
    });
    
    xhr.addEventListener('error', () => {
      console.error('Erro na conexão durante o upload');
      setError('Erro na conexão ao fazer upload.');
      setIsUploading(false);
      // Limpar o input de arquivo
      e.target.value = '';
    });
    
    xhr.addEventListener('abort', () => {
      console.log('Upload abortado');
      setIsUploading(false);
      // Limpar o input de arquivo
      e.target.value = '';
    });
    
    // URL correta que lida com nova seção
    const uploadUrl = `/api/uploads/section/${sectionId || 'new'}?contentId=${contentId}`;
    console.log('URL de upload:', uploadUrl);
    
    xhr.open('POST', uploadUrl);
    xhr.withCredentials = true;
    xhr.send(formData);
  };

  const removeImage = (index: number) => {
    const image = uploadedImages[index];
    
    // Remover a referência da imagem do conteúdo
    const imageMarkdown = `![${image.name}](${image.path})`;
    setContent(prevContent => prevContent.replace(imageMarkdown, ''));
    
    // Remover da lista de imagens
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    
    setSuccessMessage('Imagem removida do conteúdo.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Renderizar conteúdo em markdown para preview
  const renderMarkdownPreview = () => {
    // Implementação simples - em produção, use uma biblioteca como marked ou remark
    let html = content
      // Headers
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      // Bold
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      // Italic
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      // Lists
      .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
      // Links
      .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2" target="_blank">$1</a>')
      // Images
      .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img src="$2" alt="$1" class="max-w-full h-auto rounded my-2" />')
      // Line breaks
      .replace(/\n/gm, '<br />');
    
    return html;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="mb-4">
        <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 mb-1">
          Título da Seção
        </label>
        <input
          id="section-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Digite o título da seção"
          disabled={isSaving || isDeleting}
        />
      </div>

      {/* Toggle para modo de preview */}
      <div className="flex justify-end mb-2">
        <button
          type="button"
          onClick={() => setPreviewMode(!previewMode)}
          className={`flex items-center px-3 py-1 text-sm rounded-md ${
            previewMode 
              ? 'bg-blue-100 text-blue-700' 
              : 'bg-gray-100 text-gray-700'
          }`}
        >
          <Eye size={14} className="mr-1" />
          {previewMode ? 'Editar' : 'Visualizar'}
        </button>
      </div>

      <div className="mb-4">
        <label htmlFor="section-content" className="block text-sm font-medium text-gray-700 mb-1">
          Conteúdo
        </label>
        
        {previewMode ? (
          <div 
            className="w-full px-3 py-2 border border-gray-300 rounded-md min-h-[200px] prose max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview() }}
          />
        ) : (
          <textarea
            id="section-content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
            placeholder="Digite o conteúdo da seção (suporta formatação Markdown)"
            disabled={isSaving || isDeleting}
          />
        )}
        
        <p className="text-xs text-gray-500 mt-1">
          Suporta formatação Markdown: <code>**negrito**</code>, <code>*itálico*</code>, 
          listas com <code>1. Item</code>, e links com <code>[texto](url)</code>
        </p>
      </div>

      {/* Imagens carregadas */}
      {uploadedImages.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Imagens incluídas:</h4>
          <div className="flex flex-wrap gap-2">
            {uploadedImages.map((img, index) => (
              <div key={index} className="relative">
                <img 
                  src={img.path} 
                  alt={img.name} 
                  className="w-16 h-16 object-cover rounded border border-gray-200" 
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  title="Remover imagem"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload de arquivo */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Anexar Imagem
        </label>
        <div className="flex items-center">
          <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer">
            <Upload size={16} className="mr-2" />
            <span>Selecionar Imagem</span>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*"
              disabled={isUploading || isSaving || isDeleting}
            />
          </label>
          {isUploading && <span className="ml-3 text-sm text-gray-500">Enviando...</span>}
        </div>
        
        {/* Barra de progresso */}
        {isUploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Enviando: {uploadProgress}%</p>
          </div>
        )}
      </div>

      {/* Mensagens */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-start">
          <AlertCircle size={18} className="mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {successMessage}
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex justify-between">
        <div>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isDeleting}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mr-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            <Save size={16} className="mr-2" />
            {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving || isDeleting}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>

        {!isNewSection && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSaving || isDeleting}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} className="mr-2" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </button>
        )}
      </div>
    </div>
  );
};

export default SectionEditor;