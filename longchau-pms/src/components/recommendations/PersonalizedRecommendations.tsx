import React, { useState, useEffect } from 'react';
import { RecommendationService, ProductRecommendation, HealthInsight } from '../../services/RecommendationService';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';

interface PersonalizedRecommendationsProps {
  customerId?: string;
}

const PersonalizedRecommendations: React.FC<PersonalizedRecommendationsProps> = ({ customerId }) => {
  const { user } = useAuth();
  const { products } = useData();
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [healthInsights, setHealthInsights] = useState<HealthInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'insights'>('recommendations');

  const recommendationService = new RecommendationService();
  const targetCustomerId = customerId || user?.id;

  useEffect(() => {
    if (targetCustomerId) {
      loadRecommendations();
    }
  }, [targetCustomerId]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load product recommendations
      const productRecs = await recommendationService.getPersonalizedRecommendations(targetCustomerId!, products);
      setRecommendations(productRecs);

      // Load health insights
      const insights = await recommendationService.generateHealthInsights(targetCustomerId!);
      setHealthInsights(insights);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setError('Failed to load personalized recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (productId: string) => {
    // TODO: Implement add to cart functionality
    console.log('Adding product to cart:', productId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Personalized for You</h2>
        <p className="text-blue-100">Based on your health profile and purchase history</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Recommended Products ({recommendations.length})
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'insights'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Health Insights ({healthInsights.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">🛍️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations yet</h3>
              <p className="text-gray-500">Complete a few orders to get personalized product recommendations</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-4">
                    {/* Product Info */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900 text-lg">{rec.product.name}</h3>
                      <div className="flex items-center bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                        {rec.score}% match
                      </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 overflow-hidden" style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical' as const
                    }}>{rec.product.description}</p>

                    {/* Price and Stock */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-2xl font-bold text-blue-600">${rec.product.price}</span>
                      <span className="text-sm text-gray-500">{rec.product.stockQuantity} in stock</span>
                    </div>

                    {/* Reasons */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Why recommended:</h4>
                      <ul className="space-y-1">
                        {rec.reasons.slice(0, 2).map((reason, i) => (
                          <li key={i} className="text-xs text-gray-600 flex items-center">
                            <div className="w-1 h-1 bg-blue-400 rounded-full mr-2"></div>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Actions */}
                    <button
                      onClick={() => handleAddToCart(rec.product.id)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          {healthInsights.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">🏥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No health insights available</h3>
              <p className="text-gray-500">Update your health profile to get personalized health insights</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {healthInsights.map((insight, index) => (
                <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                  {/* Header */}
                  <div className="flex items-center mb-4">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      insight.severity === 'high' ? 'bg-red-400' :
                      insight.severity === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                    }`}></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{insight.condition}</h3>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        insight.severity === 'high' ? 'bg-red-100 text-red-800' :
                        insight.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {insight.severity.charAt(0).toUpperCase() + insight.severity.slice(1)} Priority
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <p className="text-gray-600 mb-4">
                    {insight.frequency > 0 && `Based on ${insight.frequency} related purchases. `}
                    {insight.lastRelatedPurchase && `Last related purchase: ${insight.lastRelatedPurchase}`}
                  </p>

                  {/* Recommendations */}
                  {insight.recommendedActions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Recommended actions:</h4>
                      <ul className="space-y-2">
                        {insight.recommendedActions.map((action: string, i: number) => (
                          <li key={i} className="text-sm text-gray-600 flex items-start">
                            <span className="text-blue-500 mr-2">•</span>
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Suggested Products */}
                  {insight.suggestedProducts.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested products:</h4>
                      <div className="flex flex-wrap gap-2">
                        {insight.suggestedProducts.map((product: string, i: number) => (
                          <span key={i} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PersonalizedRecommendations;
