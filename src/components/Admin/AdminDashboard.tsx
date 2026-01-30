import { useState, useEffect } from 'react';
import { X, Package, BarChart3, Users, ShoppingCart, TrendingUp, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';

type Basket = Database['public']['Tables']['baskets']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

type OrderWithDetails = Order & {
  profiles: Pick<Profile, 'full_name' | 'email'> | null;
  baskets: Pick<Basket, 'title'> | null;
};

interface AdminDashboardProps {
  onClose: () => void;
}

export default function AdminDashboard({ onClose }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'stats' | 'baskets' | 'orders' | 'students'>('stats');
  const [baskets, setBaskets] = useState<Basket[]>([]);
  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminData();

    const interval = setInterval(() => {
      loadAdminData();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadAdminData = async () => {
    setLoading(true);
    const [basketsRes, ordersRes, studentsRes] = await Promise.all([
      supabase.from('baskets').select('*').order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select(`
          *,
          profiles:user_id(full_name, email),
          baskets:basket_id(title)
        `)
        .order('created_at', { ascending: false }),
      supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('created_at', { ascending: false }),
    ]);

    if (basketsRes.data) setBaskets(basketsRes.data);
    if (ordersRes.data) setOrders(ordersRes.data as OrderWithDetails[]);
    if (studentsRes.data) setStudents(studentsRes.data);
    setLoading(false);
  };

  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_price || 0), 0);
  const totalFood = orders.reduce((acc, o) => acc + (o.food_saved || 0), 0);
  const totalCo2 = orders.reduce((acc, o) => acc + (o.co2_saved || 0), 0);
  const totalStock = baskets.reduce((acc, b) => acc + b.stock, 0);

  const tabs = [
    { id: 'stats', label: 'Statistiques', icon: BarChart3 },
    { id: 'baskets', label: 'Paniers', icon: Package },
    { id: 'orders', label: 'Commandes', icon: ShoppingCart },
    { id: 'students', label: 'Étudiants', icon: Users },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Gestion Hypermarché</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={loadAdminData}
                disabled={loading}
                className="text-white hover:text-blue-100 transition-colors disabled:opacity-50"
                title="Actualiser les données"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-blue-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
            </div>
          ) : (
            <>
              {activeTab === 'stats' && (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-900">Vue d'ensemble</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-blue-600 text-sm font-medium mb-1">Revenus totaux</div>
                          <div className="text-3xl font-bold text-blue-900">{totalRevenue.toFixed(2)}€</div>
                        </div>
                        <TrendingUp className="w-8 h-8 text-blue-300" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
                      <div>
                        <div className="text-green-600 text-sm font-medium mb-1">Nourriture sauvée</div>
                        <div className="text-3xl font-bold text-green-900">{totalFood.toFixed(1)}kg</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg p-6 border border-cyan-200">
                      <div>
                        <div className="text-cyan-600 text-sm font-medium mb-1">CO₂ évité</div>
                        <div className="text-3xl font-bold text-cyan-900">{totalCo2.toFixed(1)}kg</div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
                      <div>
                        <div className="text-purple-600 text-sm font-medium mb-1">Stock actuel</div>
                        <div className="text-3xl font-bold text-purple-900">{totalStock}</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-gray-600 text-sm font-medium mb-3">Commandes par statut</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Confirmées</span>
                          <span className="font-bold text-gray-900">{orders.filter(o => o.status === 'confirmed').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Complétées</span>
                          <span className="font-bold text-gray-900">{orders.filter(o => o.status === 'completed').length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Annulées</span>
                          <span className="font-bold text-gray-900">{orders.filter(o => o.status === 'cancelled').length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-6">
                      <div className="text-gray-600 text-sm font-medium mb-3">Résumé</div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Total commandes</span>
                          <span className="font-bold text-gray-900">{orders.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Étudiants actifs</span>
                          <span className="font-bold text-gray-900">{students.length}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Panier moyen</span>
                          <span className="font-bold text-gray-900">{(totalRevenue / Math.max(orders.length, 1)).toFixed(2)}€</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'baskets' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Gestion des Paniers</h3>
                  <div className="bg-gray-50 rounded-lg overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Titre</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Catégorie</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Prix</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {baskets.map((basket) => (
                          <tr key={basket.id} className="hover:bg-gray-100 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{basket.title}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{basket.category}</td>
                            <td className="px-4 py-3 text-sm text-gray-900 font-medium">{basket.discounted_price.toFixed(2)}€</td>
                            <td className="px-4 py-3 text-sm text-gray-900">{basket.stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Historique des Commandes</h3>
                  {orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Aucune commande pour le moment</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Étudiant</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Panier</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Montant</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Statut</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-100 transition-colors">
                              <td className="px-4 py-3">
                                <div className="text-sm text-gray-900 font-medium">
                                  {order.profiles?.full_name || 'Utilisateur inconnu'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {order.profiles?.email || '-'}
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {order.baskets?.title || 'Panier supprimé'}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{order.total_price.toFixed(2)}€</td>
                              <td className="px-4 py-3 text-sm">
                                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  order.status === 'confirmed'
                                    ? 'bg-green-100 text-green-700'
                                    : order.status === 'completed'
                                    ? 'bg-blue-100 text-blue-700'
                                    : order.status === 'cancelled'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(order.created_at).toLocaleDateString('fr-FR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'students' && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Liste des Étudiants</h3>
                  {students.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600">Aucun étudiant inscrit pour le moment</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Nom</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Université</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Points</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Inscrit le</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {students.map((student) => (
                            <tr key={student.id} className="hover:bg-gray-100 transition-colors">
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.full_name}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{student.email}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">{student.university || '-'}</td>
                              <td className="px-4 py-3 text-sm text-gray-900 font-medium">{student.points}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {new Date(student.created_at).toLocaleDateString('fr-FR')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
