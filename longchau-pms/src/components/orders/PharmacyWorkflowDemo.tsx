import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { useAuth } from '../../contexts/AuthContext';
import { nanoid } from 'nanoid';

export const PharmacyWorkflowDemo: React.FC = () => {
  const { addOrder } = useData();
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);

  const sampleProducts = [
    {
      productId: 'med-001',
      productName: 'Paracetamol 500mg',
      quantity: 2,
      price: 15000,
      prescription: false
    },
    {
      productId: 'med-002', 
      productName: 'Amoxicillin 250mg',
      quantity: 1,
      price: 45000,
      prescription: true
    },
    {
      productId: 'med-003',
      productName: 'Vitamin D3',
      quantity: 1,
      price: 25000,
      prescription: false
    }
  ];

  const createSampleOrder = async () => {
    if (!user) {
      alert('Please log in to create an order');
      return;
    }

    setIsCreating(true);
    try {
      const orderId = nanoid();
      const total = sampleProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const newOrder = {
        id: orderId,
        customerId: user.id || nanoid(),
        customerName: user.name || 'Demo Customer',
        items: sampleProducts,
        total: total,
        status: 'pending' as const,
        orderDate: new Date().toISOString(),
        shippingAddress: '123 Demo Street, Ho Chi Minh City, Vietnam',
        paymentMethod: 'cod' as const,
        paymentStatus: 'pending' as const
      };

      await addOrder(newOrder);
      alert('🎉 Sample order created! Check the Pharmacist View to confirm it, then Customer View to pay.');
    } catch (error) {
      console.error('Error creating sample order:', error);
      alert('❌ Failed to create order');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">🧪 Pharmacy Workflow Demo</h2>
        <p className="text-gray-600">
          Test the complete pharmacy workflow: Order → Pharmacist Review → Customer Payment
        </p>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Sample Order Items:</h3>
        <div className="space-y-2">
          {sampleProducts.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="font-medium">{item.productName}</span>
                {item.prescription && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                    Prescription Required
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">₫{(item.price * item.quantity).toLocaleString('vi-VN')}</div>
                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between items-center font-bold text-lg">
            <span>Total:</span>
            <span>₫{sampleProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Workflow Steps:</h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <span className="w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">1</span>
            <span>Customer places order (status: pending)</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">2</span>
            <span>Pharmacist reviews and confirms order</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">3</span>
            <span>Customer can now pay for confirmed order</span>
          </div>
          <div className="flex items-center">
            <span className="w-6 h-6 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-bold mr-3">4</span>
            <span>Receipt is generated after payment</span>
          </div>
        </div>
      </div>

      <button
        onClick={createSampleOrder}
        disabled={isCreating}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium flex items-center justify-center space-x-2"
      >
        {isCreating ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Creating Order...</span>
          </>
        ) : (
          <>
            <span>🛒</span>
            <span>Create Sample Order</span>
          </>
        )}
      </button>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800 text-sm">
          <strong>💡 Tip:</strong> After creating the order, switch between views to test:
          <br />• <strong>Pharmacist View:</strong> Review and confirm the order
          <br />• <strong>Customer View:</strong> Pay for confirmed orders
          <br />• <strong>Admin View:</strong> Overall order management
        </p>
      </div>
    </div>
  );
};

export default PharmacyWorkflowDemo;
