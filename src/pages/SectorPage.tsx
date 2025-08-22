// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import ContentCard from '../components/ContentCard';
// import { useAuth } from '../contexts/AuthContext';
// import { Plus } from 'lucide-react';

// interface SectorPageProps {
//   sector: string;
// }

// const SectorPage: React.FC<SectorPageProps> = ({ sector }) => {
//   const navigate = useNavigate();
//   const { authState } = useAuth();
//   const { user } = authState;
  
//   const [contents, setContents] = useState<any[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [activeFilter, setActiveFilter] = useState('todos');
  
//   // Verificar se o usuário pode editar conteúdo neste setor
//   const canEdit = user?.isMaster || 
//     (user?.permissions?.includes('edit') && user?.sector === sector);
  
//   useEffect(() => {
//     const fetchContents = async () => {
//       try {
//         const response = await fetch(`/api/contents/sector/${sector}`, {
//           credentials: 'include'
//         });
        
//         if (!response.ok) {
//           throw new Error('Falha ao carregar conteúdos');
//         }
        
//         const data = await response.json();
//         setContents(data);
//       } catch (err) {
//         console.error('Erro ao carregar conteúdos:', err);
//         setError('Não foi possível carregar os conteúdos. Tente novamente mais tarde.');
//       } finally {
//         setLoading(false);
//       }
//     };
    
//     fetchContents();
//   }, [sector]);
  
//   // Filtrar conteúdos com base no tipo selecionado
//   const filteredContents = activeFilter === 'todos'
//     ? contents
//     : contents.filter(content => content.type.toLowerCase() === activeFilter);
  
//   // Obter nome formatado do setor
//   const getSectorName = () => {
//     const sectorNames: Record<string, string> = {
//       suporte: 'Suporte',
//       comercial: 'Comercial',
//       financeiro: 'Financeiro',
//       operacional: 'Operacional',
//       rh: 'RH'
//     };
    
//     return sectorNames[sector] || sector.charAt(0).toUpperCase() + sector.slice(1);
//   };
  
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="mb-8">
//         <h1 className="text-2xl font-bold text-gray-800 mb-2">
//           Setor de {getSectorName()} - Wiki de Treinamento
//         </h1>
//         <p className="text-gray-600">
//           Dashboard / {getSectorName()} / Tutoriais
//         </p>
//       </div>
      
//       {/* Filtros */}
//       <div className="mb-8">
//         <div className="flex flex-wrap gap-2">
//           <button
//             onClick={() => setActiveFilter('todos')}
//             className={`px-4 py-2 rounded-md ${
//               activeFilter === 'todos' 
//                 ? 'bg-blue-600 text-white' 
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Todos
//           </button>
//           <button
//             onClick={() => setActiveFilter('tutorial')}
//             className={`px-4 py-2 rounded-md ${
//               activeFilter === 'tutorial' 
//                 ? 'bg-blue-600 text-white' 
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Tutoriais
//           </button>
//           <button
//             onClick={() => setActiveFilter('procedimento')}
//             className={`px-4 py-2 rounded-md ${
//               activeFilter === 'procedimento' 
//                 ? 'bg-blue-600 text-white' 
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Procedimentos
//           </button>
//           <button
//             onClick={() => setActiveFilter('documentação')}
//             className={`px-4 py-2 rounded-md ${
//               activeFilter === 'documentação' 
//                 ? 'bg-blue-600 text-white' 
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Documentação
//           </button>
//           <button
//             onClick={() => setActiveFilter('equipamento')}
//             className={`px-4 py-2 rounded-md ${
//               activeFilter === 'equipamento' 
//                 ? 'bg-blue-600 text-white' 
//                 : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//             }`}
//           >
//             Equipamentos
//           </button>
//         </div>
//       </div>
      
//       {/* Título da seção */}
//       <h2 className="text-xl font-bold text-gray-800 mb-6">
//         {activeFilter === 'todos' ? 'Tutoriais Populares' : 
//          activeFilter === 'tutorial' ? 'Tutoriais' : 
//          activeFilter === 'procedimento' ? 'Procedimentos' : 
//          activeFilter === 'documentação' ? 'Documentação' : 'Equipamentos'}
//       </h2>
      
//       {loading ? (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//           {[1, 2, 3].map(i => (
//             <div key={i} className="animate-pulse">
//               <div className="bg-gray-200 h-32 rounded-t-lg"></div>
//               <div className="bg-white p-4 rounded-b-lg border border-gray-200">
//                 <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
//                 <div className="h-4 bg-gray-200 rounded w-1/2"></div>
//               </div>
//             </div>
//           ))}
//         </div>
//       ) : error ? (
//         <div className="bg-red-100 text-red-700 p-4 rounded-md">
//           {error}
//         </div>
//       ) : filteredContents.length === 0 ? (
//         <div className="text-center py-12 bg-gray-50 rounded-lg">
//           <p className="text-gray-500 mb-4">Nenhum conteúdo encontrado para este filtro.</p>
//           {canEdit && (
//             <button
//               onClick={() => navigate(`/content/new?sector=${sector}`)}
//               className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 mx-auto"
//             >
//               <Plus size={16} className="mr-2" /> Adicionar Conteúdo
//             </button>
//           )}
//         </div>
//       ) : (
//         <>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
//             {filteredContents.map(content => (
//               <ContentCard
//                 key={content.id}
//                 id={content.id}
//                 title={content.title}
//                 description={content.description || ''}
//                 type={content.type}
//                 priority={content.priority || 1}
//                 updatedAt={content.updatedAt}
//                 author={content.creator?.name || 'Desconhecido'}
//                 sector={content.sector}
//                 canEdit={canEdit}
//               />
//             ))}
//           </div>
          
//           {canEdit && (
//             <div className="mt-8">
//               <button
//                 onClick={() => navigate(`/content/new?sector=${sector}`)}
//                 className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 <Plus size={16} className="mr-2" /> Adicionar Conteúdo
//               </button>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// };

// export default SectorPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ContentCard from '../components/content/ContentCard';
import { useAuth } from '../contexts/AuthContext';
import { contentService } from '../services/content.service';
import { Plus } from 'lucide-react';
import type { ContentItem } from '../types/content.types';
import type { SectorType } from '../types/common.types';

interface SectorPageProps {
  sector: string;
}

const SectorPage: React.FC<SectorPageProps> = ({ sector }) => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;
  
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState('todos');
  
  // Verificar se o usuário pode editar conteúdo neste setor
  const canEdit = user?.role === 'admin' || user?.role === 'super_admin';
  
  useEffect(() => {
    const fetchContents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log(`📂 Carregando conteúdos para setor: ${sector}`);
        
        // Usar o contentService que já tem a lógica de autenticação
        let data: ContentItem[];
        
        if (sector === 'admin' || user?.role === 'super_admin') {
          // Admin ou super_admin vê todos os conteúdos
          data = await contentService.getAllContents();
        } else {
          // Usuários normais veem apenas do seu setor
          data = await contentService.getContentBySector(sector as SectorType);
        }
        
        setContents(data);
        console.log(`✅ ${data.length} conteúdos carregados para ${sector}`);
      } catch (err) {
        console.error('❌ Erro ao carregar conteúdos:', err);
        setError('Não foi possível carregar os conteúdos. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    // Só buscar se estiver autenticado
    if (user && authState.isAuthenticated) {
      fetchContents();
    }
  }, [sector, user, authState.isAuthenticated]);
  
  // Filtrar conteúdos com base no tipo selecionado
  const filteredContents = activeFilter === 'todos'
    ? contents
    : contents.filter(content => {
        const contentType = typeof content.type === 'string' ? content.type.toLowerCase() : '';
        return contentType === activeFilter;
      });
  
  // Obter nome formatado do setor
  const getSectorName = () => {
    const sectorNames: Record<string, string> = {
      suporte: 'Suporte',
      comercial: 'Comercial',
      financeiro: 'Financeiro',
      operacional: 'Operacional',
      rh: 'RH',
      adm: 'Administração',
      tecnico: 'Técnico',
      noc: 'NOC'
    };
    
    return sectorNames[sector] || sector.charAt(0).toUpperCase() + sector.slice(1);
  };
  
  // Se não estiver autenticado, mostrar loading
  if (!authState.isAuthenticated) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Setor de {getSectorName()} - Wiki de Treinamento
        </h1>
        <p className="text-gray-600">
          Dashboard / {getSectorName()} / Tutoriais
        </p>
      </div>
      
      {/* Debug info apenas em desenvolvimento */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-2 bg-yellow-100 text-yellow-800 text-xs rounded">
          Debug: Sector={sector}, Contents={contents.length}, User={user?.name}, Role={user?.role}
        </div>
      )}
      
      {/* Filtros */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveFilter('todos')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeFilter === 'todos' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos ({contents.length})
          </button>
          <button
            onClick={() => setActiveFilter('tutorial')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeFilter === 'tutorial' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Tutoriais ({contents.filter(c => c.type === 'tutorial').length})
          </button>
          <button
            onClick={() => setActiveFilter('text')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeFilter === 'text' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Documentos ({contents.filter(c => c.type === 'text').length})
          </button>
          <button
            onClick={() => setActiveFilter('photo')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeFilter === 'photo' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Imagens ({contents.filter(c => c.type === 'photo').length})
          </button>
          <button
            onClick={() => setActiveFilter('video')}
            className={`px-4 py-2 rounded-md transition-colors ${
              activeFilter === 'video' 
                ? 'bg-red-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Vídeos ({contents.filter(c => c.type === 'video').length})
          </button>
        </div>
      </div>
      
      {/* Título da seção */}
      <h2 className="text-xl font-bold text-gray-800 mb-6">
        {activeFilter === 'todos' ? 'Todos os Conteúdos' : 
         activeFilter === 'tutorial' ? 'Tutoriais' : 
         activeFilter === 'text' ? 'Documentos' : 
         activeFilter === 'photo' ? 'Imagens' : 'Vídeos'}
      </h2>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-32 rounded-t-lg"></div>
              <div className="bg-white p-4 rounded-b-lg border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <div className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        </div>
      ) : filteredContents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="mb-4">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500 mb-4">
            {activeFilter === 'todos' 
              ? 'Nenhum conteúdo encontrado neste setor.' 
              : `Nenhum conteúdo do tipo "${activeFilter}" encontrado.`
            }
          </p>
          {canEdit && (
            <button
              onClick={() => navigate(`/content/new?sector=${sector}`)}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <Plus size={16} className="mr-2" /> 
              Adicionar Primeiro Conteúdo
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredContents.map(content => (
              <ContentCard
                key={content.id}
                id={typeof content.id === 'string' ? parseInt(content.id) : content.id as number}
                title={content.title}
                description={content.description || ''}
                type={content.type}
                priority={content.priority || 1}
                updatedAt={content.updatedAt}
                author={content.creator?.name || 'Desconhecido'}
                sector={content.sector}
                canEdit={canEdit}
              />
            ))}
          </div>
          
          {canEdit && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={() => navigate(`/content/new?sector=${sector}`)}
                className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md"
              >
                <Plus size={18} className="mr-2" /> 
                Adicionar Novo Conteúdo
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SectorPage;