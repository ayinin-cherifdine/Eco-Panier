import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import BasketCard from './components/BasketCard';
import AuthModal from './components/Auth/AuthModal';
import OrderModal from './components/OrderModal';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/Admin/AdminDashboard';
import { supabase } from './lib/supabase';
import { Leaf, Filter } from 'lucide-react';
import type { Database } from './types/database.types';

type Basket = Database['public']['Tables']['baskets']['Row'];

function AppContent() {
  const { user, profile } = useAuth();
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [filteredBaskets, setFilteredBaskets] = useState<Basket[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'impact' | 'badges' | 'challenges' | 'orders'>('impact');
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [selectedBasket, setSelectedBasket] = useState<Basket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBaskets();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredBaskets(baskets);
    } else {
      setFilteredBaskets(baskets.filter(b => b.category === selectedCategory));
    }
  }, [selectedCategory, baskets]);

  const loadBaskets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('baskets')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading baskets:', error);
    } else if (data) {
      setBaskets(data);
      setFilteredBaskets(data);
    }
    setLoading(false);
  };

  const handleBasketSelect = (basket: Basket) => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setSelectedBasket(basket);
  };

  const handleOrderSuccess = () => {
    setSelectedBasket(null);
    loadBaskets();
  };

  const categories = [
    { id: 'all', label: 'Tous' },
    { id: 'alimentaire', label: 'Alimentaire' },
    { id: 'hygiène', label: 'Hygiène' },
    { id: 'fournitures', label: 'Fournitures' },
    { id: 'mixte', label: 'Mixte' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => setShowAuthModal(true)}
        onProfileClick={() => {
          if (profile?.is_admin || profile?.user_type === 'admin') {
            setShowAdminDashboard(true);
          } else {
            setDashboardTab('impact');
            setShowDashboard(true);
          }
        }}
        onAdminClick={() => setShowAdminDashboard(true)}
      />

      <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="w-12 h-12" />
            <h1 className="text-4xl md:text-5xl font-bold">Sauvez la planète, économisez</h1>
          </div>
          <p className="text-xl text-emerald-50 max-w-2xl mx-auto">
            Transformez les invendus en opportunités. Des paniers anti-gaspillage adaptés aux étudiants.
          </p>
          <div className="mt-6 flex items-center justify-center gap-6 text-emerald-50">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">-70%</span>
              <span>en moyenne</span>
            </div>
            <div className="w-px h-8 bg-emerald-400" />
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">10pts</span>
              <span>par euro dépensé</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 text-gray-700 font-medium whitespace-nowrap">
            <Filter className="w-5 h-5" />
            Catégories:
          </div>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600" />
          </div>
        ) : filteredBaskets.length === 0 ? (
          <div className="text-center py-20">
            <Leaf className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Aucun panier disponible</h3>
            <p className="text-gray-600">Revenez plus tard pour découvrir de nouvelles offres</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBaskets.map((basket) => (
              <BasketCard
                key={basket.id}
                basket={basket}
                onSelect={handleBasketSelect}
              />
            ))}
          </div>
        )}
      </div>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}

      {showDashboard && !profile?.is_admin && profile?.user_type !== 'admin' && (
        <UserDashboard
          onClose={() => setShowDashboard(false)}
          initialTab={dashboardTab}
        />
      )}

      {showAdminDashboard && (profile?.is_admin || profile?.user_type === 'admin') && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}

      {selectedBasket && (
        <OrderModal
          basket={selectedBasket}
          onClose={() => setSelectedBasket(null)}
          onSuccess={handleOrderSuccess}
          onOpenDashboard={() => {
            setDashboardTab('orders');
            setShowDashboard(true);
          }}
        />
      )}
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
