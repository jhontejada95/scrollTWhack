import { useState } from 'react';
import { Shield, Check, X, ExternalLink, Loader } from 'lucide-react';
import { verifyCheckInOnChain } from '../lib/web3';
import { CONTRACT_ADDRESS } from '../lib/contract';

interface BlockchainVerificationProps {
  hash: string;
  timestamp: string;
}

export function BlockchainVerification({ hash, timestamp }: BlockchainVerificationProps) {
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationData, setVerificationData] = useState<any>(null);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setVerifying(true);
    setError('');

    try {
      const result = await verifyCheckInOnChain(hash);

      if (result.error) {
        setError(result.error);
      } else if (result.exists) {
        setVerified(true);
        setVerificationData(result);
      } else {
        setError('Check-in no encontrado en blockchain');
      }
    } catch (err: any) {
      setError(err.message || 'Error al verificar');
    } finally {
      setVerifying(false);
    }
  };

  const isContractDeployed = CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";

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
            {isContractDeployed && (
              <div className="flex items-center gap-2">
                <Check className="text-[#4CC9A0] w-4 h-4" />
                <span className="text-gray-700">Contrato: {CONTRACT_ADDRESS.substring(0, 10)}...</span>
              </div>
            )}
          </div>

          {!isContractDeployed ? (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                <strong>Contrato no desplegado:</strong> Sigue las instrucciones en contracts/README.md para desplegar el contrato en Remix.
              </p>
            </div>
          ) : !verified ? (
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="mt-3 flex items-center gap-2 px-4 py-2 bg-[#9B6BFF] text-white rounded-lg hover:opacity-90 transition text-sm disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <ExternalLink className="w-4 h-4" />
                  Verificar en Blockchain
                </>
              )}
            </button>
          ) : (
            <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-green-700 font-medium mb-2">
                <Check className="w-4 h-4" />
                <span>Verificado en Blockchain</span>
              </div>
              {verificationData && (
                <div className="text-xs text-green-700 space-y-1">
                  <p>Score: {verificationData.score}/100</p>
                  <p>Timestamp: {new Date(verificationData.timestamp * 1000).toLocaleString()}</p>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
              <X className="w-4 h-4 flex-shrink-0" />
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
