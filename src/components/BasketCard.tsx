import { useState } from 'react';
import { Clock, MapPin, Leaf, Cloud, Info, X } from 'lucide-react';
import type { Database } from '../types/database.types';

type Basket = Database['public']['Tables']['baskets']['Row'];

interface BasketCardProps {
  basket: Basket;
  onSelect: (basket: Basket) => void;
}

export default function BasketCard({ basket, onSelect }: BasketCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const discountPercentage = Math.round(
    ((basket.original_price - basket.discounted_price) / basket.original_price) * 100
  );

  const categoryColors = {
    alimentaire: 'bg-orange-100 text-orange-700',
    hygiène: 'bg-blue-100 text-blue-700',
    fournitures: 'bg-purple-100 text-purple-700',
    mixte: 'bg-green-100 text-green-700',
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer border border-gray-200">
      <div className="relative h-48 overflow-hidden">
        <img
          src={basket.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
          alt={basket.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
          -{discountPercentage}%
        </div>
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-medium ${categoryColors[basket.category]}`}>
          {basket.category}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-lg font-bold text-gray-900 flex-1">{basket.title}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(true);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            title="Voir les détails"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{basket.description}</p>

        <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span>{basket.store_name} - {basket.store_location}</span>
        </div>

        <div className="flex items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <Leaf className="w-4 h-4" />
            <span className="font-medium">{basket.food_saved}kg</span>
          </div>
          <div className="flex items-center gap-1.5 text-blue-600">
            <Cloud className="w-4 h-4" />
            <span className="font-medium">{basket.co2_saved}kg CO₂</span>
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-emerald-600">{basket.discounted_price.toFixed(2)}€</span>
              <span className="text-sm text-gray-500 line-through">{basket.original_price.toFixed(2)}€</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 text-sm">
            <Clock className="w-4 h-4" />
            <span className="font-medium">Disponible</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(basket)}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg transition-colors"
        >
          Commander
        </button>

        <div className="mt-3 text-center text-xs text-gray-500">
          {basket.stock} paniers disponibles
        </div>
      </div>

      {showDetails && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetails(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">{basket.title}</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-white hover:text-emerald-100 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="mb-6">
                <img
                  src={basket.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg'}
                  alt={basket.title}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Description</h4>
                  <p className="text-gray-600">{basket.description}</p>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">Contenu du panier</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    {basket.products && basket.products.length > 0 ? (
                      <ul className="space-y-3">
                        {basket.products.map((product: any, index: number) => (
                          <li key={index} className="flex items-start gap-3 text-gray-700">
                            <span className="text-emerald-600 font-bold mt-0.5">•</span>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {product.name || product}
                                {product.quantity && (
                                  <span className="text-emerald-600 ml-2">({product.quantity})</span>
                                )}
                              </div>
                              {product.description && (
                                <div className="text-sm text-gray-600 mt-0.5">{product.description}</div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-500 italic">Liste des produits non disponible</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-emerald-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Leaf className="w-5 h-5 text-emerald-600" />
                      <span className="text-sm text-emerald-700 font-medium">Nourriture sauvée</span>
                    </div>
                    <div className="text-2xl font-bold text-emerald-900">{basket.food_saved}kg</div>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Cloud className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-blue-700 font-medium">CO₂ évité</span>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">{basket.co2_saved}kg</div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-600">Prix original</span>
                    <span className="text-gray-500 line-through">{basket.original_price.toFixed(2)}€</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-900 font-medium">Prix réduit</span>
                    <span className="text-2xl font-bold text-emerald-600">{basket.discounted_price.toFixed(2)}€</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDetails(false);
                    onSelect(basket);
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Commander ce panier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
