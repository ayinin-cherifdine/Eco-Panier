import { User, LogOut, Trophy, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onAuthClick: () => void;
  onProfileClick: () => void;
  onAdminClick?: () => void;
}

export default function Header({ onAuthClick, onProfileClick, onAdminClick }: HeaderProps) {
  const { user, profile, signOut } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-28">
          <div className="flex items-center">
            <img src="/ecopanier_logo.png" alt="EcoPanier" className="h-24 w-auto" />
          </div>

          {user && profile ? (
            <div className="flex items-center gap-4">
              {(profile.is_admin || profile.user_type === 'admin') && (
                <button
                  onClick={onAdminClick}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                  title="Gestion hypermarché"
                >
                  <Settings className="w-5 h-5 text-blue-600" />
                  <span className="text-blue-700 font-medium hidden sm:block">Admin</span>
                </button>
              )}

              {!profile.is_admin && profile.user_type !== 'admin' && (
                <button
                  onClick={onProfileClick}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                >
                  <Trophy className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-900">{profile.points} pts</span>
                </button>
              )}

              <button
                onClick={onProfileClick}
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <User className="w-5 h-5 text-gray-700" />
                <span className="text-gray-700 font-medium hidden sm:block">{profile.full_name}</span>
              </button>

              <button
                onClick={signOut}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
                title="Déconnexion"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onAuthClick}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors"
            >
              Connexion
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
