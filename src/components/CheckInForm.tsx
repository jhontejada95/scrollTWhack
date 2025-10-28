import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, EmotionType, CheckIn } from '../lib/supabase';
import { generateBlockchainHash, getEmotionScore } from '../lib/blockchain';
import { registerCheckInOnChain } from '../lib/web3';
import { BlockchainVerification } from './BlockchainVerification';
import { Smile, Meh, Frown, AlertTriangle, TrendingDown, CheckCircle, AlertCircle } from 'lucide-react';

const emotions: { value: EmotionType; label: string; icon: any; color: string }[] = [
  { value: 'great', label: 'Excelente', icon: Smile, color: 'bg-green-500' },
  { value: 'good', label: 'Bien', icon: Smile, color: 'bg-[#4CC9A0]' },
  { value: 'okay', label: 'Normal', icon: Meh, color: 'bg-yellow-500' },
  { value: 'stressed', label: 'Estresado', icon: AlertTriangle, color: 'bg-orange-500' },
  { value: 'exhausted', label: 'Agotado', icon: TrendingDown, color: 'bg-red-500' },
];

export function CheckInForm() {
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionType | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<CheckIn | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    checkTodayCheckIn();
  }, [user]);

  const checkTodayCheckIn = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('check_ins')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .maybeSingle();

    if (data) {
      setHasCheckedInToday(true);
      setTodayCheckIn(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmotion || !user) return;

    setLoading(true);
    setError('');

    try {
      const score = getEmotionScore(selectedEmotion);
      const timestamp = new Date().toISOString();

      const blockchainHash = await generateBlockchainHash({
        userId: user.id,
        emotion: selectedEmotion,
        score,
        timestamp,
      });

      const { data: checkInData, error: insertError } = await supabase
        .from('check_ins')
        .insert({
          user_id: user.id,
          company_id: user.company_id,
          emotion: selectedEmotion,
          score,
          comment: comment.trim(),
          blockchain_hash: blockchainHash,
          date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          setError('Ya has realizado tu check-in de hoy');
        } else {
          throw insertError;
        }
        return;
      }

      const blockchainResult = await registerCheckInOnChain(blockchainHash, score);

      if (blockchainResult.success && checkInData) {
        await supabase
          .from('check_ins')
          .update({ blockchain_tx_hash: blockchainResult.txHash })
          .eq('id', checkInData.id);
      }

      setSuccess(true);
      setHasCheckedInToday(true);
      await checkTodayCheckIn();

      setTimeout(() => {
        setSuccess(false);
        setSelectedEmotion(null);
        setComment('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Error al registrar check-in');
    } finally {
      setLoading(false);
    }
  };

  if (hasCheckedInToday && !success && todayCheckIn) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#4CC9A0] to-[#9B6BFF] rounded-full mx-auto mb-4 flex items-center justify-center">
            <CheckCircle className="text-white w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check-in completado</h2>
          <p className="text-[#6C757D]">Ya has registrado tu estado emocional hoy. Vuelve mañana para tu próximo check-in.</p>
          {todayCheckIn.blockchain_hash && (
            <BlockchainVerification
              hash={todayCheckIn.blockchain_hash}
              timestamp={todayCheckIn.created_at}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cómo te sientes hoy?</h2>
          <p className="text-[#6C757D]">Tu bienestar es importante. Comparte cómo te sientes de forma anónima.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {emotions.map(({ value, label, icon: Icon, color }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedEmotion(value)}
                className={`p-4 rounded-xl border-2 transition-all hover:scale-105 ${
                  selectedEmotion === value
                    ? 'border-[#9B6BFF] bg-[#9B6BFF]/5 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className={`w-12 h-12 ${color} rounded-full mx-auto mb-2 flex items-center justify-center`}>
                  <Icon className="text-white w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-gray-700">{label}</p>
              </button>
            ))}
          </div>

          {selectedEmotion && (
            <div className="animate-fadeIn">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Comentario opcional
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9B6BFF] focus:border-transparent outline-none transition resize-none"
                rows={3}
                maxLength={200}
                placeholder="¿Algo que quieras compartir? (opcional, máx. 200 caracteres)"
              />
              <p className="text-xs text-[#6C757D] mt-1">{comment.length}/200 caracteres</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm">Check-in registrado exitosamente en blockchain</p>
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedEmotion || loading}
            className="w-full bg-gradient-to-r from-[#9B6BFF] to-[#4CC9A0] text-white py-3 rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registrando...' : 'Enviar Check-in'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#6C757D]">
          <p>Tu información está protegida y se registra de forma anónima en blockchain</p>
        </div>
      </div>
    </div>
  );
}
