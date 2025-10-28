import { useState } from 'react';
import { Shield, Check, X, ExternalLink } from 'lucide-react';
import { getWalletConnection } from '../lib/web3';

interface BlockchainVerificationProps {
  hash: string;
  timestamp: string;
}

export function BlockchainVerification({ hash, timestamp }: BlockchainVerificationProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState('');

  const handleConnectWallet = async () => {
    setConnecting(true);
    setError('');

    try {
      const provider = await getWalletConnection();
      if (provider) {
        setWalletConnected(true);
      } else {
        setError('No se pudo conectar con MetaMask. Asegúrate de tenerlo instalado.');
      }
    } catch (err: any) {
      setError(err.message || 'Error al conectar wallet');
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#9B6BFF]/10 to-[#4CC9A0]/10 rounded-lg p-4 mt-4">
      <div className="flex items-start gap-3">
        <Shield className="text-[#9B6BFF] w-5 h-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2">Verificación Blockchain</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Check className="text-[#4CC9A0] w-4 h-4" />
              <span className="text-gray-700">Hash registrado: {hash.substring(0, 20)}...</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-[#4CC9A0] w-4 h-4" />
              <span className="text-gray-700">Timestamp: {new Date(timestamp).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="text-[#4CC9A0] w-4 h-4" />
              <span className="text-gray-700">Red: Scroll Sepolia Testnet</span>
            </div>
          </div>

          {!walletConnected && (
            <button
              onClick={handleConnectWallet}
              disabled={connecting}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#9B6BFF] text-white rounded-lg hover:opacity-90 transition text-sm disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" />
              {connecting ? 'Conectando...' : 'Conectar Wallet para Verificar'}
            </button>
          )}

          {walletConnected && (
            <div className="mt-3 flex items-center gap-2 text-[#4CC9A0] text-sm">
              <Check className="w-4 h-4" />
              <span>Wallet conectado - Listo para verificación on-chain</span>
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
              <X className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <p className="text-xs text-[#6C757D] mt-3">
            Los datos están protegidos mediante ZK (Zero-Knowledge) y solo se almacena un hash anónimo en blockchain.
          </p>
        </div>
      </div>
    </div>
  );
}
