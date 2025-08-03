import React, { useState, useEffect } from 'react';
import { useData, Order } from '../../contexts/DataContextWithDB';
import { useAuth } from '../../contexts/AuthContext';
import PaymentGateway from '../payment/PaymentGateway';
import ReceiptViewer from '../payment/ReceiptViewer';

export const CustomerOrderManagement: React.FC = () => {
  const { user } = useAuth();
  const { orders, updateOrder } = useData();
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [showReceipt, setShowReceipt] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'pending' | 'confirmed' | 'paid' | 'all'>('all');

  useEffect(() => {
    if (user?.email) {
      // Filter orders for current customer
      const userOrders = orders.filter(order => 
        order.customerName === user.name || 
        order.customerId === user.id
      );
      setCustomerOrders(userOrders);
    }
  }, [orders, user]);

  const filteredOrders = customerOrders.filter(order => {
    switch (activeTab) {
      case 'pending':
        return order.status === 'pending';
      case 'confirmed':
        return order.status === 'confirmed' && order.paymentStatus === 'pending';
      case 'paid':
        return order.paymentStatus === 'paid';
      default:
        return true;
    }
  });

  const handlePaymentSuccess = async (transactionId: string, orderId: string) => {
    try {
      // Update order payment status
      const orderToUpdate = customerOrders.find(o => o.id === orderId);
      if (orderToUpdate) {
        await updateOrder({
          ...orderToUpdate,
          paymentStatus: 'paid',
          status: 'confirmed'
        });
      }
      
      setSelectedOrderForPayment(null);
      setShowReceipt(transactionId);
      alert('🎉 Payment successful! Your order is being processed.');
    } catch (error) {
      console.error('Error updating order after payment:', error);
    }
  };

  const handlePaymentError = (error: string) => {
    alert(`❌ Payment failed: ${error}`);
  };

  const getStatusColor = (status: string, paymentStatus: string) => {
    if (status === 'cancelled') return 'bg-red-100 text-red-800';
    if (paymentStatus === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'confirmed') return 'bg-blue-100 text-blue-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string, paymentStatus: string) => {
    if (status === 'cancelled') return 'Cancelled';
    if (paymentStatus === 'paid') return 'Paid';
    if (status === 'confirmed' && paymentStatus === 'pending') return 'Ready for Payment';
    if (status === 'pending') return 'Pending Pharmacist Review';
    return status;
  };

  const canPayOrder = (order: Order) => {
    return order.status === 'confirmed' && order.paymentStatus === 'pending';
  };

  const renderOrderCard = (order: Order) => (
    <div key={order.id} className="bg-white border rounded-lg p-6 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">
            Placed on {new Date(order.orderDate).toLocaleDateString('vi-VN')}
          </p>
          <p className="text-sm text-gray-600">
            Delivery to: {order.shippingAddress}
          </p>
        </div>
        <div className="text-right">
          <div className="font-semibold text-xl text-gray-900">
            ₫{order.total.toLocaleString('vi-VN')}
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status, order.paymentStatus)}`}>
            {getStatusText(order.status, order.paymentStatus)}
          </span>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-4">
        <h4 className="font-medium text-gray-700 mb-2">Items:</h4>
        <div className="bg-gray-50 rounded-lg p-3">
          {Array.isArray(order.items) ? order.items.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center py-1">
              <div className="flex items-center">
                <span className="font-medium">{item.productName || item.name}</span>
                {item.prescription && (
                  <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                    Prescription
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="font-medium">₫{(item.price * item.quantity).toLocaleString('vi-VN')}</div>
                <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
              </div>
            </div>
          )) : (
            <div className="text-sm text-gray-500">No item details available</div>
          )}
        </div>
      </div>

      {/* Status Messages */}
      {order.status === 'pending' && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 mr-2">⏳</span>
            <span className="text-yellow-800 font-medium">Waiting for pharmacist review</span>
          </div>
          <p className="text-yellow-700 text-sm mt-1">
            Our pharmacist is reviewing your order. You'll be able to pay once it's confirmed.
          </p>
        </div>
      )}

      {canPayOrder(order) && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✅</span>
            <span className="text-green-800 font-medium">Order confirmed - Ready for payment</span>
          </div>
          <p className="text-green-700 text-sm mt-1">
            Your order has been confirmed by our pharmacist. You can now proceed with payment.
          </p>
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">❌</span>
            <span className="text-red-800 font-medium">Order Cancelled</span>
          </div>
          <p className="text-red-700 text-sm mt-1">This order has been cancelled.</p>
        </div>
      )}

      {order.paymentStatus === 'paid' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">🎉</span>
            <span className="text-blue-800 font-medium">Payment completed</span>
          </div>
          <p className="text-blue-700 text-sm mt-1">
            Your order is being prepared for delivery.
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-3">
        {canPayOrder(order) && (
          <button
            onClick={() => setSelectedOrderForPayment(order)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            💳 Pay Now
          </button>
        )}
        
        {order.paymentStatus === 'paid' && (
          <button
            onClick={() => setShowReceipt(order.id)}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            🧾 View Receipt
          </button>
        )}
        
        {order.status === 'pending' && (
          <button
            disabled
            className="flex-1 px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed font-medium"
          >
            ⏳ Awaiting Review
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">My Orders</h1>
        <p className="text-gray-600">Track your orders and make payments</p>
      </div>

      {/* Order Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-xl font-bold text-yellow-800">
            {customerOrders.filter(o => o.status === 'pending').length}
          </div>
          <div className="text-yellow-700 text-sm">Pending Review</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-xl font-bold text-blue-800">
            {customerOrders.filter(o => o.status === 'confirmed' && o.paymentStatus === 'pending').length}
          </div>
          <div className="text-blue-700 text-sm">Ready to Pay</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-xl font-bold text-green-800">
            {customerOrders.filter(o => o.paymentStatus === 'paid').length}
          </div>
          <div className="text-green-700 text-sm">Paid</div>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-xl font-bold text-gray-800">{customerOrders.length}</div>
          <div className="text-gray-700 text-sm">Total Orders</div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Orders', count: customerOrders.length },
            { key: 'pending', label: 'Pending', count: customerOrders.filter(o => o.status === 'pending').length },
            { key: 'confirmed', label: 'Ready to Pay', count: customerOrders.filter(o => o.status === 'confirmed' && o.paymentStatus === 'pending').length },
            { key: 'paid', label: 'Paid', count: customerOrders.filter(o => o.paymentStatus === 'paid').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-600">
            {activeTab === 'all' 
              ? "You haven't placed any orders yet."
              : `No orders in ${activeTab} status.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOrders.map(order => renderOrderCard(order))}
        </div>
      )}

      {/* Payment Gateway Modal */}
      {selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <PaymentGateway
              orderId={selectedOrderForPayment.id}
              customerId={user?.id || ''}
              amount={selectedOrderForPayment.total}
              orderDetails={{
                items: selectedOrderForPayment.items,
                total: selectedOrderForPayment.total,
                customerInfo: {
                  name: user?.name || '',
                  email: user?.email || '',
                  phone: '+84 123 456 789'
                }
              }}
              onPaymentSuccess={(transactionId) => handlePaymentSuccess(transactionId, selectedOrderForPayment.id)}
              onPaymentError={handlePaymentError}
              onCancel={() => setSelectedOrderForPayment(null)}
            />
          </div>
        </div>
      )}

      {/* Receipt Viewer Modal */}
      {showReceipt && (
        <ReceiptViewer
          orderId={showReceipt}
          onClose={() => setShowReceipt('')}
        />
      )}
    </div>
  );
};

export default CustomerOrderManagement;
