import { useState, useEffect } from 'react';
import { X, Trophy, Leaf, Cloud, Target, Award, TrendingUp, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database.types';

type Badge = Database['public']['Tables']['badges']['Row'];
type Challenge = Database['public']['Tables']['challenges']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];
type UserChallenge = Database['public']['Tables']['user_challenges']['Row'];

interface UserDashboardProps {
  onClose: () => void;
  initialTab?: 'impact' | 'badges' | 'challenges' | 'orders';
}

export default function UserDashboard({ onClose, initialTab = 'impact' }: UserDashboardProps) {
  const { profile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [userBadges, setUserBadges] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [userChallenges, setUserChallenges] = useState<UserChallenge[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeTab, setActiveTab] = useState<'impact' | 'badges' | 'challenges' | 'orders'>(initialTab);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    if (!profile) return;

    const [badgesRes, userBadgesRes, challengesRes, userChallengesRes, ordersRes] = await Promise.all([
      supabase.from('badges').select('*'),
      supabase.from('user_badges').select('badge_id').eq('user_id', profile.id),
      supabase.from('challenges').select('*').eq('active', true),
      supabase.from('user_challenges').select('*').eq('user_id', profile.id),
      supabase.from('orders').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }),
    ]);

    if (badgesRes.data) setBadges(badgesRes.data);
    if (userBadgesRes.data) setUserBadges(userBadgesRes.data.map(ub => ub.badge_id));
    if (challengesRes.data) setChallenges(challengesRes.data);
    if (userChallengesRes.data) setUserChallenges(userChallengesRes.data);
    if (ordersRes.data) setOrders(ordersRes.data);
  };

  const totalImpact = orders.reduce(
    (acc, order) => ({
      co2: acc.co2 + (order.co2_saved || 0),
      food: acc.food + (order.food_saved || 0),
    }),
    { co2: 0, food: 0 }
  );

  const tabs = [
    { id: 'impact', label: 'Impact', icon: TrendingUp },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'challenges', label: 'Défis', icon: Target },
    { id: 'orders', label: 'Commandes', icon: ShoppingBag },
  ] as const;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Mon Tableau de Bord</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-emerald-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {profile && (
            <div className="flex items-center gap-6">
              <div>
                <div className="text-emerald-100 text-sm mb-1">Niveau {profile.level}</div>
                <div className="text-3xl font-bold">{profile.full_name}</div>
              </div>
              <div className="ml-auto text-right">
                <div className="text-emerald-100 text-sm mb-1">Points totaux</div>
                <div className="flex items-center gap-2 text-3xl font-bold">
                  <Trophy className="w-8 h-8" />
                  {profile.points}
                </div>
              </div>
            </div>
          )}
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
                      ? 'border-emerald-600 text-emerald-600'
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
          {activeTab === 'impact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Leaf className="w-8 h-8 text-emerald-600" />
                    <div>
                      <div className="text-sm text-emerald-700">Nourriture sauvée</div>
                      <div className="text-3xl font-bold text-emerald-900">{totalImpact.food.toFixed(1)}kg</div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Cloud className="w-8 h-8 text-blue-600" />
                    <div>
                      <div className="text-sm text-blue-700">CO₂ évité</div>
                      <div className="text-3xl font-bold text-blue-900">{totalImpact.co2.toFixed(1)}kg</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Statistiques</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Commandes effectuées</span>
                    <span className="font-bold text-gray-900">{orders.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Économies réalisées</span>
                    <span className="font-bold text-emerald-600">
                      {orders.reduce((acc, o) => acc + o.total_price, 0).toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">Badges débloqués</span>
                    <span className="font-bold text-gray-900">{userBadges.length}/{badges.length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge) => {
                const isEarned = userBadges.includes(badge.id);
                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      isEarned
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 bg-gray-50 opacity-60'
                    }`}
                  >
                    <div className="text-4xl mb-2 text-center">{isEarned ? '🏆' : '🔒'}</div>
                    <h4 className="font-bold text-gray-900 text-center mb-1">{badge.name}</h4>
                    <p className="text-xs text-gray-600 text-center mb-2">{badge.description}</p>
                    {isEarned && (
                      <div className="text-center text-xs text-emerald-600 font-medium">
                        +{badge.points_reward} points
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {challenges.map((challenge) => {
                const userChallenge = userChallenges.find(uc => uc.challenge_id === challenge.id);
                const progress = userChallenge?.progress || 0;
                const progressPercent = Math.min((progress / challenge.goal_value) * 100, 100);
                const isCompleted = userChallenge?.completed || false;

                return (
                  <div key={challenge.id} className={`bg-white border-2 rounded-xl p-6 ${
                    isCompleted ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{challenge.title}</h4>
                          {isCompleted && <span className="text-xl">✅</span>}
                        </div>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        isCompleted ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        +{challenge.points_reward} pts
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
                      <span>Se termine le {new Date(challenge.end_date).toLocaleDateString('fr-FR')}</span>
                      <span className="font-medium text-gray-900">{progress} / {challenge.goal_value}</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-600' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">Aucune commande pour le moment</p>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-blue-800">
                      <span className="font-semibold">Note :</span> Le code de commande ci-dessous sera utilisé pour retirer votre panier.
                    </p>
                  </div>
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm text-gray-600 mb-1">
                            {order.quantity} panier(s) • {order.pickup_method === 'click_collect' ? 'Click & Collect' : 'Livraison'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-600">{order.total_price.toFixed(2)}€</div>
                          <div className="text-xs text-gray-600 mt-1">+{order.points_earned} pts</div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-1">Code de commande :</div>
                        <div className="font-mono text-sm text-gray-900 font-semibold">#{order.id.slice(0, 8).toUpperCase()}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
