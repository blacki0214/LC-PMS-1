import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import PaymentGateway from '../payment/PaymentGateway';
import ReceiptViewer from '../payment/ReceiptViewer';

interface OrderWithPayment {
  id: string;
  customerName: string;
  items: any[];
  total: number;
  status: string;
  paymentStatus: string;
  orderDate: string;
  shippingAddress: string;
  paymentMethod: string;
}

export const PharmacistOrderManagement: React.FC = () => {
  const { orders, updateOrder } = useData();
  const [pendingOrders, setPendingOrders] = useState<OrderWithPayment[]>([]);
  const [confirmedOrders, setConfirmedOrders] = useState<OrderWithPayment[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithPayment | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<string>('');

  useEffect(() => {
    // Filter orders by status
    const pending = orders.filter(order => order.status === 'pending');
    const confirmed = orders.filter(order => order.status === 'confirmed' && order.paymentStatus === 'pending');
    
    setPendingOrders(pending);
    setConfirmedOrders(confirmed);
  }, [orders]);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      setConfirmingOrder(orderId);
      
      // Update order status to confirmed
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (orderToUpdate) {
        await updateOrder({
          ...orderToUpdate,
          status: 'confirmed'
        });
      }
      
      alert('✅ Order confirmed! Customer can now proceed with payment.');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('❌ Failed to confirm order. Please try again.');
    } finally {
      setConfirmingOrder('');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (!reason) return;

    try {
      const orderToUpdate = orders.find(o => o.id === orderId);
      if (orderToUpdate) {
        await updateOrder({
          ...orderToUpdate,
          status: 'cancelled',
          deliveryNotes: `Rejected by pharmacist: ${reason}`
        });
      }
      
      alert('❌ Order rejected and customer has been notified.');
    } catch (error) {
      console.error('Error rejecting order:', error);
      alert('❌ Failed to reject order. Please try again.');
    }
  };

  const renderOrderCard = (order: OrderWithPayment, isPending: boolean = false) => (
    <div key={order.id} className="bg-white border rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">Order #{order.id}</h3>
          <p className="text-sm text-gray-600">Customer: {order.customerName}</p>
          <p className="text-sm text-gray-500">
            {new Date(order.orderDate).toLocaleDateString('vi-VN')}
          </p>
        </div>
        <div className="text-right">
          <div className="font-semibold text-lg">₫{order.total.toLocaleString('vi-VN')}</div>
          <div className={`text-sm px-2 py-1 rounded ${
            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {order.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="mb-3">
        <h4 className="font-medium text-gray-700 mb-2">Items:</h4>
        <div className="space-y-1">
          {Array.isArray(order.items) ? order.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>₫{(item.price * item.quantity).toLocaleString('vi-VN')}</span>
            </div>
          )) : (
            <div className="text-sm text-gray-500">No items details available</div>
          )}
        </div>
      </div>

      {/* Shipping Address */}
      <div className="mb-3">
        <p className="text-sm text-gray-600">
          <span className="font-medium">Delivery:</span> {order.shippingAddress}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2">
        {isPending && (
          <>
            <button
              onClick={() => handleConfirmOrder(order.id)}
              disabled={confirmingOrder === order.id}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {confirmingOrder === order.id ? '⏳ Confirming...' : '✅ Confirm Order'}
            </button>
            <button
              onClick={() => handleRejectOrder(order.id)}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              ❌ Reject
            </button>
          </>
        )}
        
        {!isPending && (
          <button
            onClick={() => setSelectedOrder(order)}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            📋 View Details
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pharmacist Order Management</h1>
        <p className="text-gray-600">Review and confirm customer orders before payment processing</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-800">{pendingOrders.length}</div>
          <div className="text-yellow-700">Pending Review</div>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">{confirmedOrders.length}</div>
          <div className="text-blue-700">Awaiting Payment</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-800">
            {orders.filter(o => o.paymentStatus === 'paid').length}
          </div>
          <div className="text-green-700">Paid Orders</div>
        </div>
      </div>

      {/* Pending Orders */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          🔍 Orders Pending Review ({pendingOrders.length})
        </h2>
        {pendingOrders.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">📋</div>
            <p className="text-gray-600">No orders pending review</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingOrders.map(order => renderOrderCard(order, true))}
          </div>
        )}
      </div>

      {/* Confirmed Orders Awaiting Payment */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          💳 Confirmed Orders Awaiting Payment ({confirmedOrders.length})
        </h2>
        {confirmedOrders.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
            <div className="text-gray-400 text-4xl mb-2">💳</div>
            <p className="text-gray-600">No confirmed orders awaiting payment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {confirmedOrders.map(order => renderOrderCard(order, false))}
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">Order Details #{selectedOrder.id}</h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer</label>
                  <p className="text-gray-900">{selectedOrder.customerName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Order Date</label>
                  <p className="text-gray-900">{new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    selectedOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {selectedOrder.status.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Payment Status</label>
                  <span className={`inline-block px-2 py-1 rounded text-sm ${
                    selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {selectedOrder.paymentStatus.toUpperCase()}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                  <p className="text-gray-900">{selectedOrder.shippingAddress}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Items</label>
                  <div className="bg-gray-50 rounded p-3">
                    {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-1">
                        <span>{item.name} x{item.quantity}</span>
                        <span>₫{(item.price * item.quantity).toLocaleString('vi-VN')}</span>
                      </div>
                    )) : (
                      <p className="text-gray-500">No item details available</p>
                    )}
                    <div className="border-t pt-2 mt-2 font-semibold">
                      Total: ₫{selectedOrder.total.toLocaleString('vi-VN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PharmacistOrderManagement;
