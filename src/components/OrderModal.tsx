import { useState } from 'react';
import { X, ShoppingCart, Leaf, Cloud, MapPin, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Database } from '../types/database.types';

type Basket = Database['public']['Tables']['baskets']['Row'];

interface OrderModalProps {
  basket: Basket;
  onClose: () => void;
  onSuccess: () => void;
  onOpenDashboard: () => void;
}

export default function OrderModal({ basket, onClose, onSuccess, onOpenDashboard }: OrderModalProps) {
  const { user, refreshProfile } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [pickupMethod, setPickupMethod] = useState<'click_collect' | 'delivery'>('click_collect');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<{ orderId: string; points: number } | null>(null);

  const totalPrice = basket.discounted_price * quantity;
  const totalCo2Saved = basket.co2_saved * quantity;
  const totalFoodSaved = basket.food_saved * quantity;
  const pointsToEarn = Math.floor(totalPrice * 10);

  const handleOrder = async () => {
    if (!user) {
      setError('Vous devez être connecté pour commander');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('points')
        .eq('id', user.id)
        .single();

      const orderCount = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'confirmed');

      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          basket_id: basket.id,
          quantity,
          total_price: totalPrice,
          pickup_method: pickupMethod,
          points_earned: pointsToEarn,
          co2_saved: totalCo2Saved,
          food_saved: totalFoodSaved,
          status: 'confirmed',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      const newPoints = (currentProfile?.points || 0) + pointsToEarn;
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ points: newPoints })
        .eq('id', user.id);

      if (profileError) throw profileError;

      if ((orderCount.count || 0) === 0) {
        const { data: firstBadge } = await supabase
          .from('badges')
          .select('id')
          .eq('name', 'Premier Pas')
          .maybeSingle();

        if (firstBadge) {
          await supabase
            .from('user_badges')
            .insert({
              user_id: user.id,
              badge_id: firstBadge.id,
            });
        }
      }

      const { data: activeChallenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('active', true);

      if (activeChallenges && activeChallenges.length > 0) {
        for (const challenge of activeChallenges) {
          const { data: userChallenge } = await supabase
            .from('user_challenges')
            .select('*')
            .eq('user_id', user.id)
            .eq('challenge_id', challenge.id)
            .maybeSingle();

          const newProgress = (userChallenge?.progress || 0) + 1;
          const isCompleted = newProgress >= challenge.goal_value;

          if (userChallenge) {
            await supabase
              .from('user_challenges')
              .update({
                progress: newProgress,
                completed: isCompleted,
                completed_at: isCompleted ? new Date().toISOString() : null,
              })
              .eq('id', userChallenge.id);
          } else {
            await supabase
              .from('user_challenges')
              .insert({
                user_id: user.id,
                challenge_id: challenge.id,
                progress: 1,
                completed: 1 >= challenge.goal_value,
              });
          }
        }
      }

      await refreshProfile();
      setOrderSuccess({ orderId: newOrder!.id, points: pointsToEarn });
    } catch (err) {
      setError('Erreur lors de la commande. Veuillez réessayer.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-md w-full">
          <div className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-emerald-600" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Commande enregistrée !</h2>
            <p className="text-gray-600 mb-6">
              Votre commande a été confirmée avec succès.
            </p>

            <div className="bg-emerald-50 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-2 mb-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span className="font-semibold text-emerald-900">
                  Vous avez gagné {orderSuccess.points} points !
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                onSuccess();
                onClose();
                onOpenDashboard();
              }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              Voir ma commande
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Commander votre panier</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="flex gap-4">
              <img
                src={basket.image_url || ''}
                alt={basket.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">{basket.title}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{basket.store_name}</span>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 text-red-800 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantité
              </label>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  -
                </button>
                <span className="text-xl font-bold text-gray-900 w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(basket.stock, quantity + 1))}
                  className="w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  +
                </button>
                <span className="text-sm text-gray-500">({basket.stock} disponibles)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mode de récupération
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPickupMethod('click_collect')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    pickupMethod === 'click_collect'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Click & Collect</div>
                  <div className="text-sm text-gray-600 mt-1">Retrait en magasin</div>
                </button>
                <button
                  onClick={() => setPickupMethod('delivery')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    pickupMethod === 'delivery'
                      ? 'border-emerald-600 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900">Livraison</div>
                  <div className="text-sm text-gray-600 mt-1">A domicile</div>
                </button>
              </div>
            </div>

            <div className="bg-emerald-50 rounded-xl p-4">
              <h4 className="font-semibold text-emerald-900 mb-3">Impact écologique</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                  <div>
                    <div className="text-sm text-emerald-700">Nourriture sauvée</div>
                    <div className="font-bold text-emerald-900">{totalFoodSaved.toFixed(1)}kg</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-sm text-blue-700">CO₂ évité</div>
                    <div className="font-bold text-blue-900">{totalCo2Saved.toFixed(1)}kg</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-amber-600" />
                  <span className="font-medium text-amber-900">Points à gagner</span>
                </div>
                <span className="text-xl font-bold text-amber-900">+{pointsToEarn} pts</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-lg font-medium text-gray-700">Total</span>
                <div className="text-right">
                  <div className="text-3xl font-bold text-emerald-600">{totalPrice.toFixed(2)}€</div>
                  <div className="text-sm text-gray-500 line-through">
                    {(basket.original_price * quantity).toFixed(2)}€
                  </div>
                </div>
              </div>

              <button
                onClick={handleOrder}
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Commande en cours...' : 'Confirmer la commande'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
