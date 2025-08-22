// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import Spinner from '../../components/ui/Spinner';
// import Logo from '../../../public/assets/Logotipo CZnet.png';

// const Login: React.FC = () => {
//   const navigate = useNavigate();
//   const { authState, login } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Redirecionar se já estiver autenticado
//   useEffect(() => {
//     if (authState.isAuthenticated && !authState.loading) {
//       console.log('👤 Usuário já autenticado, redirecionando...');

//       // Verificar a role do usuário e redirecionar adequadamente
//       if (authState.user?.role === 'super_admin' || authState.user?.role === 'admin') {
//         navigate('/admin/dashboard');
//       } else {
//         navigate(`/${authState.user?.sector || 'suporte'}`);
//       }
//     }
//   }, [authState, navigate]);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError('');
//     setIsSubmitting(true);

//     try {
//       console.log('🔐 Tentando fazer login...');

//       // Usar o login do AuthContext com a interface correta
//       await login({ email, password });

//       console.log('✅ Login realizado com sucesso!');
//       // O redirecionamento será feito pelo useEffect

//     } catch (error) {
//       console.error('❌ Erro no login:', error);

//       let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       setError(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Mostrar loading se ainda estiver verificando autenticação
//   if (authState.loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-100">
//         <div className="text-center">
//           <Spinner size="lg" />
//           <p className="mt-4 text-gray-600">Verificando autenticação...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-34 h-36 flex items-center justify-center mb-8">
//         <img src={Logo} alt="CZnet Logo" className="h-20" />
//       </div>

//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             <div className="flex items-center">
//               <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//               {error}
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               placeholder="seu@email.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               required
//               disabled={isSubmitting}
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//               Senha
//             </label>
//             <input
//               type="password"
//               id="password"
//               placeholder="Sua senha"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               required
//               disabled={isSubmitting}
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="mr-2">
//                   <Spinner size="sm" />
//                 </span>
//                 Entrando...
//               </>
//             ) : (
//               "Entrar"
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center text-sm text-gray-500">
//           <p>Sistema de Documentação e Suporte CZNet</p>
//           <p className="mt-1">Entre com suas credenciais corporativas</p>
//         </div>

//         {/* Informações de desenvolvimento */}
//         {import.meta.env.NODE_ENV === 'development' && ( // <-- CORREÇÃO AQUI
//           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
//             <p><strong>Ambiente de Desenvolvimento</strong></p>
//             {/* Use VITE_API_URL, que você já tem no .env.development */}
//             <p>Usando API real em: {import.meta.env.VITE_API_URL || '/api'}</p>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../../contexts/AuthContext';
// import Spinner from '../../components/ui/Spinner';

// // ✅ CORREÇÃO AQUI: Referencie a logo como uma URL estática
// // A pasta 'public/assets' é servida como '/assets' na raiz do seu site.
// const LogoUrl = '/assets/Logotipo CZnet.png'; 

// const Login: React.FC = () => {
//   const navigate = useNavigate();
//   const { authState, login } = useAuth();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Redirecionar se já estiver autenticado
//   useEffect(() => {
//     if (authState.isAuthenticated && !authState.loading) {
//       console.log('👤 Usuário já autenticado, redirecionando...');

//       // Verificar a role do usuário e redirecionar adequadamente
//       if (authState.user?.role === 'super_admin' || authState.user?.role === 'admin') {
//         navigate('/admin/dashboard');
//       } else {
//         navigate(`/${authState.user?.sector || 'suporte'}`);
//       }
//     }
//   }, [authState, navigate]);

//   const handleSubmit = async (event: React.FormEvent) => {
//     event.preventDefault();
//     setError('');
//     setIsSubmitting(true);

//     try {
//       console.log('🔐 Tentando fazer login...');

//       // Usar o login do AuthContext com a interface correta
//       await login({ email, password });

//       console.log('✅ Login realizado com sucesso!');
//       // O redirecionamento será feito pelo useEffect

//     } catch (error) {
//       console.error('❌ Erro no login:', error);

//       let errorMessage = 'Erro ao fazer login. Verifique suas credenciais.';

//       if (error instanceof Error) {
//         errorMessage = error.message;
//       }

//       setError(errorMessage);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Mostrar loading se ainda estiver verificando autenticação
//   if (authState.loading) {
//     return (
//       <div className="flex justify-center items-center min-h-screen bg-gray-100">
//         <div className="text-center">
//           <Spinner size="lg" />
//           <p className="mt-4 text-gray-600">Verificando autenticação...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
//       <div className="w-34 h-36 flex items-center justify-center mb-8">
//         {/* ✅ Usando a URL da logo corrigida */}
//         <img src={LogoUrl} alt="CZnet Logo" className="h-20" /> 
//       </div>

//       <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Login</h1>

//         {error && (
//           <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//             <div className="flex items-center">
//               <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
//                 <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//               </svg>
//               {error}
//             </div>
//           </div>
//         )}

//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               type="email"
//               id="email"
//               placeholder="seu@email.com"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               required
//               disabled={isSubmitting}
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//               Senha
//             </label>
//             <input
//               type="password"
//               id="password"
//               placeholder="Sua senha"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
//               required
//               disabled={isSubmitting}
//             />
//           </div>

//           <button
//             type="submit"
//             className="w-full bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={isSubmitting}
//           >
//             {isSubmitting ? (
//               <>
//                 <span className="mr-2">
//                   <Spinner size="sm" />
//                 </span>
//                 Entrando...
//               </>
//             ) : (
//               "Entrar"
//             )}
//           </button>
//         </form>

//         <div className="mt-6 text-center text-sm text-gray-500">
//           <p>Sistema de Documentação e Suporte CZNet</p>
//           <p className="mt-1">Entre com suas credenciais corporativas</p>
//         </div>

//         {/* Informações de desenvolvimento */}
//         {/* ✅ CORREÇÃO AQUI: Usando import.meta.env.DEV para ambiente de desenvolvimento no Vite */}
//         {import.meta.env.DEV && ( 
//           <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
//             <p><strong>Ambiente de Desenvolvimento</strong></p>
//             {/* Use VITE_API_URL, que você já tem no .env.development */}
//             <p>Usando API em: {import.meta.env.VITE_API_URL || 'http://localhost:1337'}</p> {/* Adicionei um fallback para caso VITE_API_URL não esteja definido */}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Login;

// backup 


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

const LogoUrl = '/assets/Logotipo CZnet.png'; 

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { authState, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (authState.isAuthenticated && !authState.loading) {
      console.log('👤 Usuário já autenticado, redirecionando...');

      if (authState.user?.role === 'super_admin' || authState.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate(`/${authState.user?.sector || 'suporte'}`);
      }
    }
  }, [authState, navigate]);

  // Validação em tempo real
  const validateField = (field: string, value: string) => {
    let errorMessage = '';

    switch (field) {
      case 'email':
        if (!value) {
          errorMessage = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorMessage = 'Email inválido';
        }
        break;
      case 'password':
        if (!value) {
          errorMessage = 'Senha é obrigatória';
        } else if (value.length < 3) {
          errorMessage = 'Senha deve ter pelo menos 3 caracteres';
        }
        break;
    }

    setFieldErrors(prev => ({
      ...prev,
      [field]: errorMessage
    }));

    return errorMessage === '';
  };

  const handleFieldChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
    } else if (field === 'password') {
      setPassword(value);
    }

    // Limpar erro geral ao digitar
    if (error) {
      setError('');
    }

    // Validar campo após um pequeno delay
    setTimeout(() => validateField(field, value), 300);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validar todos os campos antes do envio
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);

    if (!isEmailValid || !isPasswordValid) {
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔐 Tentando fazer login...');
      await login({ email, password });
      console.log('✅ Login realizado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no login:', error);

      let errorMessage = 'Erro inesperado. Tente novamente.';

      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        
        // Tratar diferentes tipos de erro de forma mais específica
        if (message.includes('invalid credentials') || 
            message.includes('credenciais inválidas') ||
            message.includes('email ou senha incorretos') ||
            message.includes('unauthorized') ||
            message.includes('401')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
          // Destacar os campos com erro
          setFieldErrors({
            email: 'Verifique suas credenciais',
            password: 'Verifique suas credenciais'
          });
        } else if (message.includes('network') || message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (message.includes('server') || message.includes('500')) {
          errorMessage = 'Erro no servidor. Tente novamente em alguns instantes.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mostrar loading se ainda estiver verificando autenticação
  if (authState.loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      {/* Logo */}
      <div className="w-34 h-36 flex items-center justify-center mb-8">
        <img src={LogoUrl} alt="CZnet Logo" className="h-20 filter drop-shadow-lg" />
      </div>

      {/* Card de Login */}
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md border border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center">
          Bem-vindo de volta
        </h1>
        <p className="text-gray-600 text-center mb-6">
          Entre com suas credenciais para acessar o sistema
        </p>

        {/* Erro geral melhorado */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <div>
                <h4 className="text-red-800 font-medium">Erro no login</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Campo Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full p-3 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.email 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : email && !fieldErrors.email
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                    : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                }`}
                required
                disabled={isSubmitting}
              />
              {/* Ícone de validação */}
              {email && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {fieldErrors.email ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
              )}
            </div>
            {/* Mensagem de erro do campo */}
            {fieldErrors.email && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Campo Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => handleFieldChange('password', e.target.value)}
                className={`w-full p-3 pr-20 border rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  fieldErrors.password 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50' 
                    : password && !fieldErrors.password
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500 bg-green-50'
                    : 'border-gray-300 focus:ring-red-500 focus:border-red-500'
                }`}
                required
                disabled={isSubmitting}
              />
              {/* Botões de visualização e validação */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 space-x-2">
                {/* Ícone de validação */}
                {password && (
                  fieldErrors.password ? (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )
                )}
                {/* Botão de visualizar senha */}
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  disabled={isSubmitting}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            {/* Mensagem de erro do campo */}
            {fieldErrors.password && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Botão de Submit */}
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-300 flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
            disabled={isSubmitting || !!fieldErrors.email || !!fieldErrors.password}
          >
            {isSubmitting ? (
              <>
                <Spinner size="sm" />
                <span className="ml-2">Entrando...</span>
              </>
            ) : (
              "Entrar no Sistema"
            )}
          </button>
        </form>

        {/* Informações do sistema */}
        <div className="mt-8 text-center">
          <div className="border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 font-medium">
              Sistema de Documentação e Suporte
            </p>
            <p className="text-xs text-gray-500 mt-1">
              CZNet - Entre com suas credenciais corporativas
            </p>
          </div>
        </div>


      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>&copy; 2025 CZNet. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default Login;