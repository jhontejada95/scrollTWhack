import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Key, AlertCircle, CheckCircle } from 'lucide-react';

export function ActivationFlow() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { session, refreshUser } = useAuth();

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: activationCode, error: fetchError } = await supabase
        .from('activation_codes')
        .select('*, companies(*)')
        .eq('code', code.toUpperCase())
        .eq('used', false)
        .maybeSingle();

      if (fetchError || !activationCode) {
        setError('Código inválido o ya utilizado');
        setLoading(false);
        return;
      }

      const { error: userError } = await supabase
        .from('users')
        .upsert({
          id: session?.user.id,
          email: session?.user.email,
          company_id: activationCode.company_id,
          role: 'employee',
        });

      if (userError) throw userError;

      const { error: updateCodeError } = await supabase
        .from('activation_codes')
        .update({ used: true, used_by: session?.user.id })
        .eq('id', activationCode.id);

      if (updateCodeError) throw updateCodeError;

      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Error al activar el código');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8E9EB] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#9B6BFF] to-[#4CC9A0] rounded-2xl mx-auto mb-4 flex items-center justify-center">
            <Key className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Activa tu cuenta</h2>
          <p className="text-[#6C757D]">Ingresa el código proporcionado por tu empresa</p>
        </div>

        <form onSubmit={handleActivate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Código de activación
            </label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent outline-none transition text-center text-lg font-semibold tracking-wider"
              placeholder="DEMO2025"
              required
            />
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
            {loading ? 'Validando...' : 'Validar Código'}
          </button>
        </form>

        <div className="mt-6 bg-gradient-to-r from-[#9B6BFF]/10 to-[#4CC9A0]/10 p-4 rounded-lg">
          <div className="flex items-start gap-2">
            <CheckCircle className="text-[#4CC9A0] w-5 h-5 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">Códigos de demo disponibles:</p>
              <p className="text-[#6C757D]">DEMO2025, TALENT01, WELLNESS99</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
