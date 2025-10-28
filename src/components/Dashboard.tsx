import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, CheckIn } from '../lib/supabase';
import { TrendingUp, TrendingDown, Users, AlertTriangle, Activity, Calendar } from 'lucide-react';

interface DashboardStats {
  totalCheckIns: number;
  averageScore: number;
  trend: number;
  lowScorePercentage: number;
  todayCheckIns: number;
  recentCheckIns: CheckIn[];
}

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.company_id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user?.company_id) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: checkIns } = await supabase
        .from('check_ins')
        .select('*')
        .eq('company_id', user.company_id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      if (!checkIns || checkIns.length === 0) {
        setStats({
          totalCheckIns: 0,
          averageScore: 0,
          trend: 0,
          lowScorePercentage: 0,
          todayCheckIns: 0,
          recentCheckIns: [],
        });
        setLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const todayCheckIns = checkIns.filter(c => c.date === today);

      const averageScore = checkIns.reduce((acc, c) => acc + c.score, 0) / checkIns.length;

      const lastWeek = checkIns.filter(c => {
        const date = new Date(c.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= weekAgo;
      });

      const previousWeek = checkIns.filter(c => {
        const date = new Date(c.created_at);
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return date >= twoWeeksAgo && date < weekAgo;
      });

      const lastWeekAvg = lastWeek.length > 0
        ? lastWeek.reduce((acc, c) => acc + c.score, 0) / lastWeek.length
        : 0;

      const previousWeekAvg = previousWeek.length > 0
        ? previousWeek.reduce((acc, c) => acc + c.score, 0) / previousWeek.length
        : 0;

      const trend = lastWeekAvg - previousWeekAvg;

      const lowScoreCount = todayCheckIns.filter(c => c.score < 40).length;
      const lowScorePercentage = todayCheckIns.length > 0
        ? (lowScoreCount / todayCheckIns.length) * 100
        : 0;

      setStats({
        totalCheckIns: checkIns.length,
        averageScore: Math.round(averageScore),
        trend: Math.round(trend),
        lowScorePercentage: Math.round(lowScorePercentage),
        todayCheckIns: todayCheckIns.length,
        recentCheckIns: checkIns.slice(0, 10),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#9B6BFF] border-t-transparent"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center text-[#6C757D]">
        No hay datos disponibles
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-green-600 bg-green-50';
    if (score >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getEmotionLabel = (emotion: string) => {
    const labels: Record<string, string> = {
      great: 'Excelente',
      good: 'Bien',
      okay: 'Normal',
      stressed: 'Estresado',
      exhausted: 'Agotado',
    };
    return labels[emotion] || emotion;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard de Bienestar</h1>
        <p className="text-[#6C757D]">Vista general del clima emocional de tu equipo</p>
      </div>

      {stats.lowScorePercentage > 20 && (
        <div className="mb-6 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="text-orange-600 w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">Alerta de Bienestar</h3>
              <p className="text-sm text-gray-700">
                Más del 20% del equipo reportó niveles bajos de bienestar hoy. Se recomienda seguimiento.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#9B6BFF]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#6C757D] text-sm font-medium">Check-ins Totales</h3>
            <Activity className="text-[#9B6BFF] w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCheckIns}</p>
          <p className="text-xs text-[#6C757D] mt-1">Últimos 30 días</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#4CC9A0]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#6C757D] text-sm font-medium">Puntuación Promedio</h3>
            <Users className="text-[#4CC9A0] w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.averageScore}</p>
          <div className="flex items-center gap-1 mt-1">
            {stats.trend > 0 ? (
              <>
                <TrendingUp className="text-green-600 w-4 h-4" />
                <p className="text-xs text-green-600">+{stats.trend} vs semana anterior</p>
              </>
            ) : stats.trend < 0 ? (
              <>
                <TrendingDown className="text-red-600 w-4 h-4" />
                <p className="text-xs text-red-600">{stats.trend} vs semana anterior</p>
              </>
            ) : (
              <p className="text-xs text-[#6C757D]">Sin cambios</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#6C757D] text-sm font-medium">Check-ins Hoy</h3>
            <Calendar className="text-yellow-600 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.todayCheckIns}</p>
          <p className="text-xs text-[#6C757D] mt-1">Registros del día</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[#6C757D] text-sm font-medium">Alertas</h3>
            <AlertTriangle className="text-red-600 w-5 h-5" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.lowScorePercentage}%</p>
          <p className="text-xs text-[#6C757D] mt-1">Puntuaciones bajas hoy</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Check-ins Recientes</h2>
        <div className="space-y-3">
          {stats.recentCheckIns.length === 0 ? (
            <p className="text-[#6C757D] text-center py-8">No hay check-ins recientes</p>
          ) : (
            stats.recentCheckIns.map((checkIn) => (
              <div
                key={checkIn.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#9B6BFF] transition"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(checkIn.score)}`}>
                      {getEmotionLabel(checkIn.emotion)}
                    </span>
                    <span className="text-sm text-[#6C757D]">
                      {new Date(checkIn.created_at).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {checkIn.comment && (
                    <p className="text-sm text-gray-700 mt-2 italic">"{checkIn.comment}"</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{checkIn.score}</p>
                  <p className="text-xs text-[#6C757D]">puntos</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
