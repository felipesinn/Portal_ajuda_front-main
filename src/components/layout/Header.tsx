import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, ChevronDown, X, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

import { useNavigate } from 'react-router-dom';
import Logo from "../../../public/assets/Logotipo CZnet.png";

interface HeaderProps {
  title?: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  isMobileView: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  toggleSidebar, 
  isSidebarOpen, 
  isMobileView 
}) => {
  const { authState, logout } = useAuth();
  const { user } = authState;
  const navigate = useNavigate();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref para o dropdown

  // Função para fechar o dropdown ao clicar fora
  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setProfileDropdownOpen(false);
    }
  }, []);

  // Adiciona e remove o event listener para cliques fora do dropdown
  useEffect(() => {
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [profileDropdownOpen, handleClickOutside]);
  
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
    setProfileDropdownOpen(false);
  }, [logout, navigate]);

  const handleDashboardNavigation = useCallback(() => {
    navigate('/admin/dashboard');
    setProfileDropdownOpen(false);
  }, [navigate]);
  
  return (
    <header className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50"> {/* Z-index aumentado */}
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3"> {/* Padding ajustado */}
          
          <div className="flex items-center">
            {/* Botão para alternar a sidebar (visível apenas em mobile) */}
            {isMobileView && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 mr-4 transition-colors duration-200" // Estilo aprimorado
                aria-label={isSidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
              >
                {isSidebarOpen ? <X size={22} /> : <Menu size={22} />} {/* Ícone ajustado */}
              </button>
            )}
            
            {/* Logo da empresa */}
            <div className="flex-shrink-0 mr-4">
              <img src={Logo} alt="CZNet Logo" className="h-10 w-auto object-contain" /> 
            </div>
            
            {/* Título do portal (visível em desktop) */}
            <h1 className="text-3xl font-extrabold text-gray-900 hidden sm:block"> {/* Fonte mais forte */}
              {title || 'CZNet Portal'}
            </h1>
            
            {/* Título do portal (visível em mobile, truncado) */}
            <h1 className="text-xl font-bold text-gray-900 sm:hidden truncate max-w-[150px]"> {/* Truncate para títulos longos */}
              {title || 'CZNet'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-3"> {/* Espaçamento ajustado */}
            
            {/* Dropdown do Perfil do Usuário */}
            <div className="relative" ref={dropdownRef}> {/* Adicionado ref aqui */}
              <button 
                onClick={() => setProfileDropdownOpen(prev => !prev)} // Alterna o estado
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors duration-200" // Estilo aprimorado
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
                aria-label="Menu do perfil do usuário"
              >
                <div className="w-9 h-9 rounded-full bg-red-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0"> {/* Cor e tamanho ajustados */}
                  {user?.name?.charAt(0).toUpperCase() || 'U'} {/* Garante letra maiúscula */}
                </div>
                <span className="font-medium text-gray-800 hidden md:block whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px]"> {/* Esconde em mobile, truncado */}
                  {user?.name || 'Usuário'}
                </span>
                <ChevronDown size={18} className={`text-gray-500 hidden md:block transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} /> {/* Animação de rotação */}
              </button>
              
              {profileDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-1 z-50 border border-gray-200 transform origin-top-right animate-fade-in-down" // Animação e tamanho ajustados
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user?.name}</p> {/* Truncar nome */}
                    <p className="text-xs text-gray-500 truncate">{user?.email || 'Email não disponível'}</p> {/* Truncar email */}
                  </div>
                  
                  {(user?.role === 'super_admin' || user?.role === 'admin') && (
                    <button
                      onClick={handleDashboardNavigation}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-150 rounded-b-md" // Estilo aprimorado
                      role="menuitem"
                    >
                      <LayoutDashboard size={18} className="mr-2 text-gray-500" /> Dashboard Admin
                    </button>
                  )}
                {/* Sair */}
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 rounded-b-md" // Estilo aprimorado
                    role="menuitem"
                  >
                    <LogOut size={18} className="mr-2 text-red-500" /> Sair
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
