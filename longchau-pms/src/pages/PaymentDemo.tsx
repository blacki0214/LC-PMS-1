import React, { useState } from 'react';
import PaymentGateway from '../components/payment/PaymentGateway';
import ReceiptViewer, { ReceiptHistory } from '../components/payment/ReceiptViewer';
import { useAuth } from '../contexts/AuthContext';

const PaymentDemo: React.FC = () => {
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [completedTransactionId, setCompletedTransactionId] = useState<string>('');

  // Mock order data for demo
  const mockOrderDetails = {
    orderId: `order-${Date.now()}`,
    customerId: user?.id || 'customer-demo',
    amount: 125000,
    items: [
      {
        name: 'Paracetamol 500mg',
        quantity: 2,
        price: 25000,
        prescription: false
      },
      {
        name: 'Amoxicillin 250mg',
        quantity: 1,
        price: 75000,
        prescription: true
      }
    ],
    total: 125000,
    customerInfo: {
      name: user?.name || 'Demo Customer',
      email: user?.email || 'customer@demo.com',
      phone: '+84 123 456 789'
    }
  };

  const handlePaymentSuccess = (transactionId: string) => {
    setCompletedTransactionId(transactionId);
    setShowPayment(false);
    setShowReceipt(true);
    alert('🎉 Payment completed successfully!');
  };

  const handlePaymentError = (error: string) => {
    alert(`❌ Payment failed: ${error}`);
  };

  const handleCancel = () => {
    setShowPayment(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">💳 Payment System Demo</h1>
        <p className="text-gray-600">
          Comprehensive payment gateway integration with multiple Vietnamese payment methods and receipt generation.
        </p>
      </div>

      {/* Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl mb-2">💵</div>
          <h3 className="font-semibold text-gray-900 mb-1">Cash on Delivery</h3>
          <p className="text-sm text-gray-600">Pay when you receive your order</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl mb-2">🏦</div>
          <h3 className="font-semibold text-gray-900 mb-1">VNPay Integration</h3>
          <p className="text-sm text-gray-600">Vietnamese payment gateway</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl mb-2">📱</div>
          <h3 className="font-semibold text-gray-900 mb-1">E-Wallets</h3>
          <p className="text-sm text-gray-600">MoMo, ZaloPay support</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="text-2xl mb-2">🧾</div>
          <h3 className="font-semibold text-gray-900 mb-1">Digital Receipts</h3>
          <p className="text-sm text-gray-600">PDF generation & email</p>
        </div>
      </div>

      {/* Demo Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🚀 Try the Payment System</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setShowPayment(true)}
            className="p-4 border-2 border-dashed border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <div className="text-2xl mb-2">💳</div>
            <div className="font-medium text-gray-900">Process Payment</div>
            <div className="text-sm text-gray-600">Try different payment methods</div>
          </button>
          
          <button
            onClick={() => setShowReceipt(true)}
            className="p-4 border-2 border-dashed border-green-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <div className="text-2xl mb-2">🧾</div>
            <div className="font-medium text-gray-900">View Receipt</div>
            <div className="text-sm text-gray-600">See receipt formatting</div>
          </button>
          
          <button
            onClick={() => alert('Feature coming soon!')}
            className="p-4 border-2 border-dashed border-purple-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors"
          >
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium text-gray-900">Payment Analytics</div>
            <div className="text-sm text-gray-600">Transaction reports</div>
          </button>
        </div>
      </div>

      {/* Order Summary */}
      <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📦 Sample Order</h2>
        
        <div className="space-y-3">
          {mockOrderDetails.items.map((item, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <div className="flex items-center">
                <span className="font-medium">{item.name}</span>
                {item.prescription && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Prescription
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">₫{(item.price * item.quantity).toLocaleString('vi-VN')}</div>
                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
              </div>
            </div>
          ))}
          
          <div className="flex justify-between items-center pt-3 font-semibold text-lg">
            <span>Total:</span>
            <span>₫{mockOrderDetails.total.toLocaleString('vi-VN')}</span>
          </div>
        </div>
      </div>

      {/* Payment Methods Supported */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🌟 Payment Features</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">💳 Payment Methods</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Cash on Delivery (COD)
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                VNPay Gateway
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                MoMo E-Wallet
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                ZaloPay E-Wallet
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Bank Transfer
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">🧾 Receipt Features</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Professional PDF generation
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Email delivery
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Print-friendly format
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                QR code verification
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                Transaction history
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Payment Gateway Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <PaymentGateway
              orderId={mockOrderDetails.orderId}
              customerId={mockOrderDetails.customerId}
              amount={mockOrderDetails.amount}
              orderDetails={mockOrderDetails}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentError={handlePaymentError}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {showReceipt && (
        <ReceiptViewer
          orderId={mockOrderDetails.orderId}
          transactionId={completedTransactionId}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Receipt History */}
      {user && (
        <div className="mt-8">
          <ReceiptHistory customerId={user.id} />
        </div>
      )}
    </div>
  );
};

export default PaymentDemo;
