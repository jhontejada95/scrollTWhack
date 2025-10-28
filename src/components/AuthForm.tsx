import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
        setError('');
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8E9EB] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-8">
        {/* Panel de Instrucciones */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#9B6BFF] to-[#4CC9A0] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">TW</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TalentWell</h1>
            <p className="text-[#6C757D]">Monitor de bienestar emocional con blockchain</p>
          </div>

          <div className="space-y-6">
            {/* Instrucciones */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">Cómo usar la aplicación</h2>
              <ol className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#9B6BFF] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                  <span><strong>Regístrate</strong> con tu email y usa uno de los códigos de acceso</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#9B6BFF] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                  <span><strong>Instala MetaMask</strong> y configura la red Scroll Sepolia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#9B6BFF] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                  <span><strong>Obtén ETH gratis</strong> desde el faucet de Scroll Sepolia</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-6 h-6 bg-[#9B6BFF] text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                  <span><strong>Registra tu check-in</strong> emocional diario en blockchain</span>
                </li>
              </ol>
            </div>

            {/* Códigos de Acceso */}
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-[#9B6BFF]/10 to-[#4CC9A0]/10 rounded-lg p-4">
                <h3 className="font-bold text-gray-900 mb-3">Códigos de empleado:</h3>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 font-mono text-sm text-center border-2 border-dashed border-[#9B6BFF]">
                    CARE2025
                  </div>
                  <div className="bg-white rounded-lg p-3 font-mono text-sm text-center border-2 border-dashed border-[#9B6BFF]">
                    FLOURISH24
                  </div>
                  <div className="bg-white rounded-lg p-3 font-mono text-sm text-center border-2 border-dashed border-[#9B6BFF]">
                    HAPPY2025
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-500/10 to-[#9B6BFF]/10 rounded-lg p-4 border-2 border-blue-300">
                <h3 className="font-bold text-blue-900 mb-3">Códigos de gerente (Dashboard Analytics):</h3>
                <div className="space-y-2">
                  <div className="bg-white rounded-lg p-3 font-mono text-sm text-center border-2 border-dashed border-blue-500 font-bold text-blue-700">
                    METRICS2025
                  </div>
                  <div className="bg-white rounded-lg p-3 font-mono text-sm text-center border-2 border-dashed border-blue-500 font-bold text-blue-700">
                    DASHBOARD2025
                  </div>
                  <div className="bg-white rounded-lg p-3 font-mono text-sm text-center border-2 border-dashed border-blue-500 font-bold text-blue-700">
                    REPORTS2025
                  </div>
                </div>
              </div>
            </div>

            {/* Configuración de Wallet */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-2">Configuración de Wallet</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <p><strong>Red:</strong> Scroll Sepolia Testnet</p>
                <p><strong>RPC URL:</strong> https://sepolia-rpc.scroll.io</p>
                <p><strong>Chain ID:</strong> 534351</p>
                <p><strong>Símbolo:</strong> ETH</p>
                <p><strong>Faucet:</strong> <a href="https://sepolia.scroll.io/faucet" target="_blank" rel="noopener noreferrer" className="underline">sepolia.scroll.io/faucet</a></p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel de Login/Registro */}
        <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
            </h2>
            <p className="text-[#6C757D] text-sm">
              {isSignUp ? 'Registra tu cuenta con un código de acceso' : 'Accede a tu cuenta'}
            </p>
          </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent outline-none transition"
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent outline-none transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#9B6BFF] to-[#4CC9A0] text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="text-[#9B6BFF] hover:underline text-sm"
            >
              {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
