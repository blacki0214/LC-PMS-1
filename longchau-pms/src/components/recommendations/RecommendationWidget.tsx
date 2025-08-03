import React, { useState, useEffect } from 'react';
import { RecommendationService, ProductRecommendation } from '../../services/RecommendationService';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { DatabaseMigrationService } from '../../services/DatabaseMigrationService';

const RecommendationWidget: React.FC = () => {
  const { user } = useAuth();
  const { products, addCustomer } = useData();
  const [recommendations, setRecommendations] = useState<ProductRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerExists, setCustomerExists] = useState<boolean | null>(null);
  const [creatingData, setCreatingData] = useState(false);

  const recommendationService = new RecommendationService();

  useEffect(() => {
    if (user?.id && user.role === 'customer') {
      loadRecommendations();
    }
  }, [user]);

  const createCustomerForUser = async () => {
    if (!user) return;
    
    try {
      const customerData = {
        name: user.name,
        email: user.email,
        phone: '+84 123 456 789', // Default phone
        address: 'Ho Chi Minh City, Vietnam', // Default address
        dateOfBirth: '1990-01-01', // Default DOB
        joinDate: new Date().toISOString(),
        allergies: [],
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          bloodType: 'A+',
          height: 170,
          weight: 70,
          chronicConditions: [],
          emergencyContact: {
            name: 'Emergency Contact',
            phone: '+84 123 456 789',
            relationship: 'family'
          }
        },
        membershipTier: 'bronze' as const,
        totalSpent: 0
      };
      
      await addCustomer(customerData);
      console.log('✅ Customer record created for user:', user.email);
      
      // Reload recommendations
      await loadRecommendations();
    } catch (error) {
      console.error('❌ Failed to create customer record:', error);
    }
  };

  const createSampleDataForUser = async () => {
    if (!user) return;
    
    setCreatingData(true);
    try {
      console.log('🔄 Creating sample health and order data for user...');
      
      // First create customer record if it doesn't exist
      let customer = await RecommendationService.getCustomerByEmail(user.email);
      if (!customer) {
        await createCustomerForUser();
        customer = await RecommendationService.getCustomerByEmail(user.email);
      }
      
      if (customer) {
        // Create sample health and order data
        await DatabaseMigrationService.createSampleDataForCustomer(user.email);
        console.log('✅ Sample data created successfully');
        
        // Reload recommendations
        await loadRecommendations();
      }
    } catch (error) {
      console.error('❌ Failed to create sample data:', error);
    } finally {
      setCreatingData(false);
    }
  };

  useEffect(() => {
    if (user?.id && user.role === 'customer') {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Loading recommendations for user:', {
        id: user!.id,
        email: user!.email,
        name: user!.name,
        role: user!.role
      });
      
      // First, find the customer by email
      let customer = await RecommendationService.getCustomerByEmail(user!.email);
      
      if (!customer) {
        console.log('❌ No customer record found for user email:', user!.email);
        console.log('💡 This means the user exists in the users table but not in the customers table');
        console.log('🔧 For testing, you can create a customer record manually or through the admin interface');
        setCustomerExists(false);
        setRecommendations([]);
        return;
      }

      console.log('✅ Found customer:', customer);
      setCustomerExists(true);
      console.log('📊 Available products for recommendations:', products.length);
      
      if (products.length === 0) {
        console.log('⚠️ No products available for recommendations. Please seed the product database.');
        setRecommendations([]);
        return;
      }
      
      // Now get recommendations using the customer ID
      const recs = await recommendationService.getPersonalizedRecommendations(customer.id, products);
      console.log('🎯 Generated recommendations:', recs.length);
      setRecommendations(recs.slice(0, 3)); // Show only top 3 for widget
    } catch (error) {
      console.error('❌ Failed to load recommendations:', error);
      setCustomerExists(false);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'customer') {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
        <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">View All</span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : recommendations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-2xl mb-2">🛍️</div>
          <p className="text-gray-500 text-sm mb-3">
            {customerExists === false 
              ? "No customer record found for your account" 
              : "Complete a few orders to get personalized recommendations"
            }
          </p>
          
          {customerExists === false && (
            <div className="space-y-2">
              <button
                onClick={createCustomerForUser}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                Create Customer Record
              </button>
              <button
                onClick={createSampleDataForUser}
                disabled={creatingData}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
              >
                {creatingData ? 'Creating Sample Data...' : 'Create Sample Health & Order Data'}
              </button>
            </div>
          )}
          
          {customerExists === true && recommendations.length === 0 && (
            <button
              onClick={createSampleDataForUser}
              disabled={creatingData}
              className="mb-3 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
            >
              {creatingData ? 'Creating Sample Data...' : 'Add Sample Health & Order Data'}
            </button>
          )}
          
          <div className="text-xs text-gray-400 space-y-1">
            <p>Debug Info:</p>
            <p>• User Email: {user?.email}</p>
            <p>• User Role: {user?.role}</p>
            <p>• Customer Exists: {customerExists === null ? 'Checking...' : customerExists ? 'Yes' : 'No'}</p>
            <p>• Available Products: {products.length}</p>
            <p>• Check browser console for detailed logs</p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-sm">{rec.score}%</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 text-sm">{rec.product.name}</h4>
                <p className="text-gray-500 text-xs">{rec.reasons[0]}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-blue-600 font-semibold">${rec.product.price}</span>
                  <button className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationWidget;
