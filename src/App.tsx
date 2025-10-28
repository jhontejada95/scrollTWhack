import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForm } from './components/AuthForm';
import { ActivationFlow } from './components/ActivationFlow';
import { CheckInForm } from './components/CheckInForm';
import { Dashboard } from './components/Dashboard';
import { Navigation } from './components/Navigation';

function AppContent() {
  const { session, user, loading } = useAuth();
  const [currentView, setCurrentView] = useState<'checkin' | 'dashboard'>('checkin');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8E9EB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-[#9B6BFF] to-[#4CC9A0] rounded-2xl mx-auto mb-4 flex items-center justify-center animate-pulse">
            <span className="text-white text-2xl font-bold">TW</span>
          </div>
          <p className="text-[#6C757D]">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <AuthForm />;
  }

  if (!user?.company_id) {
    return <ActivationFlow />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F9FB] to-[#E8E9EB]">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <div className="py-8">
        {currentView === 'checkin' ? <CheckInForm /> : <Dashboard />}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
