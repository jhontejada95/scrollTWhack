import { useAuth } from '../contexts/AuthContext';
import { LogOut, Heart, LayoutDashboard } from 'lucide-react';

interface NavigationProps {
  currentView: 'checkin' | 'dashboard';
  onViewChange: (view: 'checkin' | 'dashboard') => void;
}

export function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user, signOut } = useAuth();

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#9B6BFF] to-[#4CC9A0] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">TW</span>
              </div>
              <span className="text-xl font-bold text-gray-900">TalentWell</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onViewChange('checkin')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                  currentView === 'checkin'
                    ? 'bg-[#9B6BFF] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Heart className="w-5 h-5" />
                <span className="hidden sm:inline">Check-in</span>
              </button>

              {user?.role === 'manager' && (
                <button
                  onClick={() => onViewChange('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    currentView === 'dashboard'
                      ? 'bg-[#9B6BFF] text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-[#6C757D] capitalize">{user?.role}</p>
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
