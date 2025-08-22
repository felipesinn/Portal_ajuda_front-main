import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Database,
  ArrowRight,
  FileText,
  Video,
  Image,
  Type,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  Shield,
  Layers,
  Monitor,
  HeadphonesIcon,
  Wrench,
  Building,
  DollarSign
} from 'lucide-react';
// ✅ IMPORTAÇÃO DOS COMPONENTES DO RECHARTS
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';

import { useAuth } from '../../contexts/AuthContext';
import ResponsiveLayout from '../../components/layout/ResponsiveLayout';
import * as contentService from '../../services/content.service';
import { api } from '../../services/api';
import { safeLog, safeWarn, safeError, safeTime, safeTimeEnd } from '../../utils/envUtils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const { user } = authState;

  const [stats, setStats] = useState({
    users: 0,
    content: {
      total: 0,
      byType: {} as Record<string, number>,
      bySector: {} as Record<string, number>
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = isSuperAdmin || user?.role === 'admin';

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      setError(null);
      safeTime('Dashboard Load Stats');

      try {
        safeLog('📊 Carregando estatísticas do dashboard...');

        let userStats = 0;
        if (isSuperAdmin) {
          try {
            safeLog('👥 Carregando estatísticas de usuários (super_admin)...');
            const usersResponse = await api.get('/users');
            userStats = Array.isArray(usersResponse.data) ? usersResponse.data.length : 0;
            safeLog(`👥 ${userStats} usuários encontrados`);
          } catch (err) {
            safeWarn('⚠️ Não foi possível carregar usuários:', err);
            userStats = 0;
          }
        } else {
          safeLog('👤 Usuário não é super_admin, pulando estatísticas de usuários');
        }

        let contentStatsData = {
          total: 0,
          byType: {} as Record<string, number>,
          bySector: {} as Record<string, number>
        };

        try {
          safeLog('📈 Carregando estatísticas de conteúdo...');
          const sector = isSuperAdmin ? undefined : user?.sector;
          safeLog(`📂 Setor para estatísticas: ${sector || 'TODOS'}`);

          contentStatsData = await contentService.getContentStats(sector);
          safeLog('📈 Estatísticas de conteúdo carregadas:', {
            total: contentStatsData.total,
            tiposCount: Object.keys(contentStatsData.byType).length,
            setoresCount: Object.keys(contentStatsData.bySector).length
          });
        } catch (err) {
          safeWarn('⚠️ Não foi possível carregar estatísticas de conteúdo:', err);
        }

        setStats({
          users: userStats,
          content: contentStatsData
        });

        safeLog('✅ Dashboard carregado com sucesso');
      } catch (err) {
        safeError('❌ Erro geral ao carregar dashboard:', err);
        setError('Erro ao carregar dados do dashboard. Alguns dados podem estar indisponíveis.');
      } finally {
        setLoading(false);
        safeTimeEnd('Dashboard Load Stats');
      }
    };

    if (authState.isAuthenticated && user) {
      safeLog('🚀 Iniciando carregamento do dashboard para usuário:', {
        userId: user.id,
        role: user.role,
        sector: user.sector,
        isSuperAdmin,
        isAdmin
      });
      loadStats();
    } else {
      safeLog('⏳ Aguardando autenticação para carregar dashboard...');
    }
  }, [isSuperAdmin, user?.sector, authState.isAuthenticated, user]);

  useEffect(() => {
    if (!loading && !isAdmin) {
      safeLog('🔀 Usuário não é admin, redirecionando para setor:', user?.sector || 'suporte');
      navigate(`/${user?.sector || 'suporte'}`);
    }
  }, [loading, isAdmin, navigate, user?.sector]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
      case 'document':
        return <FileText size={16} className="text-blue-500" />;
      case 'tutorial':
        return <Type size={16} className="text-green-500" />;
      case 'photo':
      case 'image':
        return <Image size={16} className="text-purple-500" />;
      case 'video':
        return <Video size={16} className="text-red-500" />;
      case 'title':
        return <Type size={16} className="text-yellow-500" />;
      case 'procedure':
        return <FileText size={16} className="text-indigo-500" />;
      case 'troubleshooting':
        return <AlertCircle size={16} className="text-orange-500" />;
      case 'equipment':
        return <Database size={16} className="text-gray-500" />;
      default:
        return <FileText size={16} className="text-gray-500" />;
    }
  };

  // ✅ NOVO: 'gestion' adicionado ao objeto sectorNames
  const formatSectorName = (sector: string) => {
    const sectorNames: Record<string, string> = {
      'suporte': 'Suporte',
      'tecnico': 'Técnico',
      'noc': 'NOC',
      'comercial': 'Comercial',
      'adm': 'ADM',
      'gestion': 'Gestão',
    };
    return sectorNames[sector] || sector.charAt(0).toUpperCase() + sector.slice(1);
  };

  const formatTypeName = (type: string) => {
    const typeNames: Record<string, string> = {
      'text': 'Documentos',
      'tutorial': 'Tutoriais',
      'photo': 'Imagens',
      'video': 'Vídeos',
      'title': 'Títulos',
      'procedure': 'Procedimentos',
      'troubleshooting': 'Resolução de Problemas',
      'equipment': 'Equipamentos'
    };
    return typeNames[type] || type.charAt(0).toUpperCase() + type.slice(1);
  };

  const handleNavigate = (path: string, description: string) => {
    safeLog(`🔀 Navegando para: ${path} (${description})`);
    navigate(path);
  };

  if (!loading && !isAdmin) {
    return null;
  }

  const chartDataByType = Object.entries(stats.content.byType).map(([name, value]) => ({
    name: formatTypeName(name),
    value
  }));
  const chartDataBySector = Object.entries(stats.content.bySector).map(([name, value]) => ({
    name: formatSectorName(name),
    value
  }));
  const chartColors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#83A6ED', '#8DD1E1', '#E84545'];

  return (
    <ResponsiveLayout title="Dashboard Administrativo">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            {isSuperAdmin ? 'Dashboard Super Administrador' : `Dashboard ${formatSectorName(user?.sector || '')}`}
          </h1>
          <p className="text-gray-600">
            Bem-vindo de volta, {user?.name}!
            {isSuperAdmin ? ' Você tem acesso total a todas as funcionalidades do sistema.' : ' Aqui está um resumo das atividades do seu setor.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        ) : (
          <>
            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isSuperAdmin && (
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm font-medium">Total de Usuários</p>
                      <p className="text-3xl font-bold">{stats.users}</p>
                    </div>
                    <div className="bg-blue-400 bg-opacity-30 rounded-full p-3">
                      <Users size={24} />
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={() => handleNavigate('/admin/users', 'Gerenciar Usuários')}
                      className="flex items-center text-blue-100 hover:text-white transition-colors"
                    >
                      <span className="text-sm">Gerenciar Usuários</span>
                      <ArrowRight size={16} className="ml-1" />
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm font-medium">Total de Conteúdo</p>
                    <p className="text-3xl font-bold">{stats.content.total}</p>
                  </div>
                  <div className="bg-green-400 bg-opacity-30 rounded-full p-3">
                    <Database size={24} />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => handleNavigate(
                      isSuperAdmin ? '/admin/content' : `/${user?.sector || 'suporte'}`,
                      isSuperAdmin ? 'Ver Todo Conteúdo' : 'Ver Conteúdo do Setor'
                    )}
                    className="flex items-center text-green-100 hover:text-white transition-colors"
                  >
                    <span className="text-sm">{isSuperAdmin ? 'Ver Todo Conteúdo' : 'Ver Conteúdo'}</span>
                    <ArrowRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium">Tutoriais</p>
                    <p className="text-3xl font-bold">{stats.content.byType.tutorial || 0}</p>
                  </div>
                  <div className="bg-purple-400 bg-opacity-30 rounded-full p-3">
                    <Type size={24} />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium">Documentos</p>
                    <p className="text-3xl font-bold">{stats.content.byType.text || 0}</p>
                  </div>
                  <div className="bg-orange-400 bg-opacity-30 rounded-full p-3">
                    <FileText size={24} />
                  </div>
                </div>
              </div>
            </div>

            {/* Seção de Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Gráfico de Conteúdo por Tipo */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Conteúdo por Tipo</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={chartDataByType}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {chartDataByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                {Object.keys(stats.content.byType).length === 0 && (
                  <p className="text-gray-500 text-center py-4">Nenhum conteúdo para exibir no gráfico.</p>
                )}
              </div>

              {/* Gráfico de Conteúdo por Setor (apenas para super_admin) */}
              {isSuperAdmin && (
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Conteúdo por Setor</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={chartDataBySector}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#82ca9d" name="Total de Conteúdo" />
                    </BarChart>
                  </ResponsiveContainer>
                  {Object.keys(stats.content.bySector).length === 0 && (
                    <p className="text-gray-500 text-center py-4">Nenhum conteúdo por setor para exibir no gráfico.</p>
                  )}
                </div>
              )}
            </div>

            {/* Ações rápidas - ACESSO TOTAL PARA SUPERADMIN */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {isSuperAdmin ? 'Controle Total do Sistema' : 'Ações Rápidas'}
              </h2>

              {/* Ações para Super Admin - ACESSO A TUDO */}
              {isSuperAdmin ? (
                <>
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-blue-600" />
                      Gerenciamento de Usuários
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleNavigate('/admin/users', 'Gerenciar Usuários')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                          <Users size={20} className="text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Gerenciar Usuários</h4>
                          <p className="text-sm text-gray-500">Visualizar, editar e excluir</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/admin/users/register', 'Registrar Usuário')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                          <Plus size={20} className="text-green-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Registrar Usuário</h4>
                          <p className="text-sm text-gray-500">Criar em qualquer setor</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/admin/users/permissions', 'Gerenciar Permissões')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                          <Shield size={20} className="text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Gerenciar Permissões</h4>
                          <p className="text-sm text-gray-500">Controlar acessos</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                      <Layers className="w-5 h-5 mr-2 text-indigo-600" />
                      Acesso a Todos os Setores
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                      {/* Botão para o setor de Gestão */}
                      <button
                        onClick={() => handleNavigate('/gestion', 'Setor Gestão')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-cyan-300 hover:bg-cyan-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-cyan-200 transition-colors">
                          <Monitor size={20} className="text-cyan-600" /> {/* Ícone para Gestão */}
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Gestão</h4>
                          <p className="text-sm text-gray-500">Análise e estratégia</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/suporte', 'Setor Suporte')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                          <HeadphonesIcon size={20} className="text-red-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Suporte</h4>
                          <p className="text-sm text-gray-500">Base de conhecimento</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/tecnico', 'Setor Técnico')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                          <Wrench size={20} className="text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Técnico</h4>
                          <p className="text-sm text-gray-500">Documentação técnica</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/noc', 'Setor NOC')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                          <Monitor size={20} className="text-green-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">NOC</h4>
                          <p className="text-sm text-gray-500">Centro de operações</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/comercial', 'Setor Comercial')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-yellow-200 transition-colors">
                          <DollarSign size={20} className="text-yellow-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Comercial</h4>
                          <p className="text-sm text-gray-500">Vendas e clientes</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/adm', 'Setor ADM')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors">
                          <Building size={20} className="text-gray-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">ADM</h4>
                          <p className="text-sm text-gray-500">Administrativo</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
                      <Settings className="w-5 h-5 mr-2 text-gray-600" />
                      Sistema e Configurações
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button
                        onClick={() => handleNavigate('/admin/analytics', 'Relatórios Avançados')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-indigo-200 transition-colors">
                          <BarChart3 size={20} className="text-indigo-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Relatórios Avançados</h4>
                          <p className="text-sm text-gray-500">Análises e estatísticas</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/admin/settings', 'Configurações')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-gray-200 transition-colors">
                          <Settings size={20} className="text-gray-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Configurações</h4>
                          <p className="text-sm text-gray-500">Sistema e preferências</p>
                        </div>
                      </button>
                      <button
                        onClick={() => handleNavigate('/admin/logs', 'Logs do Sistema')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 flex items-center group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-orange-200 transition-colors">
                          <FileText size={20} className="text-orange-600" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-medium text-gray-800">Logs do Sistema</h4>
                          <p className="text-sm text-gray-500">Auditoria e monitoramento</p>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Ações para Admin Regular - LIMITADAS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleNavigate(`/${user?.sector || 'suporte'}`, 'Gerenciar Conteúdo do Setor')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all duration-200 flex items-center group"
                  >
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-red-200 transition-colors">
                      <Database size={20} className="text-red-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-800">Gerenciar Conteúdo</h3>
                      <p className="text-sm text-gray-500">Setor {formatSectorName(user?.sector || '')}</p>
                    </div>
                  </button>
                  <button
                    onClick={() => handleNavigate(`/${user?.sector || 'suporte'}/create`, 'Criar Conteúdo')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all duration-200 flex items-center group"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-green-200 transition-colors">
                      <Plus size={20} className="text-green-600" />
                    </div>
                    <div className="text-left">
                      <h3 className="font-medium text-gray-800">Criar Conteúdo</h3>
                      <p className="text-sm text-gray-500">Adicionar novo conteúdo ao setor</p>
                    </div>
                  </button>
                </div>
              )}

              {!isSuperAdmin && (
                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <p className="text-sm text-yellow-800">
                      <strong>Administrador do Setor {formatSectorName(user?.sector || '')}</strong> -
                      Você tem permissões limitadas ao seu setor. Para acesso completo, entre em contato com o Super Administrador.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </ResponsiveLayout>
  );
};

export default Dashboard;
