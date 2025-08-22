// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';

// const LoginPage: React.FC = () => {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(false);
  
//   const { login } = useAuth();
//   const navigate = useNavigate();
  
//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (!email || !password) {
//       setError('Por favor, preencha todos os campos');
//       return;
//     }
    
//     setError(null);
//     setLoading(true);
    
//     try {
//       await login(email, password);
//       navigate('/');
//     } catch (err) {
//       console.error('Erro no login:', err);
//       setError('Credenciais inválidas. Por favor, tente novamente.');
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md">
//         <div className="text-center mb-8">
//           <h1 className="text-3xl font-bold text-blue-600">CZNet Wiki</h1>
//           <p className="text-gray-600 mt-2">Portal de Conhecimento Interno</p>
//         </div>
        
//         {error && (
//           <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
//             {error}
//           </div>
//         )}
        
//         <form onSubmit={handleSubmit}>
//           <div className="mb-4">
//             <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="seu.email@cznet.br"
//               disabled={loading}
//             />
//           </div>
          
//           <div className="mb-6">
//             <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//               Senha
//             </label>
//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder="••••••••"
//               disabled={loading}
//             />
//           </div>
          
//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//           >
//             {loading ? 'Entrando...' : 'Entrar'}
//           </button>
//         </form>
        
//         <div className="mt-6 text-center text-sm text-gray-500">
//           <p>Acesso restrito a colaboradores da CZNet</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoginPage;

