import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { useNotifications } from '../../contexts/NotificationContext';
import { useActivity } from '../../contexts/ActivityContext';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle,
  Clock,
  XCircle,
  Package,
  Edit,
  Save,
  X,
  ArrowRight
} from 'lucide-react';

export default function OrderManagement() {
  const { user } = useAuth();
  const { orders, updateOrder } = useData();
  const { addNotification } = useNotifications();
  const { addActivity } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showOrderDetailsModal, setShowOrderDetailsModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if user can manage orders (pharmacist or manager)
  const canManageOrders = user?.role === 'pharmacist' || user?.role === 'manager';

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    const matchesRole = user?.role === 'customer' ? order.customerId === user.id : true;
    
    return matchesSearch && matchesFilter && matchesRole;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'confirmed': return <Package className="h-4 w-4 text-blue-500" />;
      case 'shipped': return <Truck className="h-4 w-4 text-purple-500" />;
      case 'delivered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openStatusModal = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setShowStatusModal(true);
  };

  const openOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderDetailsModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder || isUpdating) return;

    setIsUpdating(true);
    try {
      const updatedOrder = {
        ...selectedOrder,
        status: newStatus as any
      };

      const result = await updateOrder(updatedOrder);
      
      if (result.success) {
        // Log the activity
        addActivity(
          'order',
          'Updated order status',
          `Order #${selectedOrder.id} status changed to ${newStatus}`,
          {
            orderId: selectedOrder.id,
            status: newStatus,
            amount: selectedOrder.total
          }
        );
        
        addNotification({
          title: 'Order Status Updated',
          message: `Order ${selectedOrder.id} status changed to ${newStatus}`,
          type: 'success'
        });
        setShowStatusModal(false);
        setSelectedOrder(null);
      } else {
        addNotification({
          title: 'Update Failed',
          message: result.error || 'Failed to update order status',
          type: 'error'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Update Failed',
        message: 'An error occurred while updating the order',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      'pending': 'confirmed',
      'confirmed': 'shipped',
      'shipped': 'delivered'
    };
    return statusFlow[currentStatus as keyof typeof statusFlow];
  };

  const stats = [
    { label: 'Total Orders', value: orders.length, color: 'text-blue-600' },
    { label: 'Pending', value: orders.filter(o => o.status === 'pending').length, color: 'text-yellow-600' },
    { label: 'Confirmed', value: orders.filter(o => o.status === 'confirmed').length, color: 'text-blue-600' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'text-green-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">
            {user?.role === 'customer' 
              ? 'Track your orders and order history'
              : 'Manage customer orders and shipments'
            }
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="mb-1">
                          {item.productName} x{item.quantity}
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="text-xs text-gray-500">
                          +{order.items.length - 2} more items
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₫{order.total.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => openOrderDetails(order)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      {canManageOrders && order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <button 
                          onClick={() => openStatusModal(order)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Update Status"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                      )}
                      
                      {canManageOrders && getNextStatus(order.status) && (
                        <button 
                          onClick={async () => {
                            const nextStatus = getNextStatus(order.status);
                            setSelectedOrder(order);
                            setNewStatus(nextStatus);
                            setIsUpdating(true);
                            
                            try {
                              const updatedOrder = { ...order, status: nextStatus as any };
                              const result = await updateOrder(updatedOrder);
                              
                              if (result.success) {
                                addNotification({
                                  title: 'Order Status Updated',
                                  message: `Order ${order.id} marked as ${nextStatus}`,
                                  type: 'success'
                                });
                              } else {
                                addNotification({
                                  title: 'Update Failed',
                                  message: result.error || 'Failed to update order status',
                                  type: 'error'
                                });
                              }
                            } catch (error) {
                              addNotification({
                                title: 'Update Failed',
                                message: 'An error occurred while updating the order',
                                type: 'error'
                              });
                            } finally {
                              setIsUpdating(false);
                            }
                          }}
                          className="text-purple-600 hover:text-purple-800 transition-colors flex items-center space-x-1"
                          title={`Mark as ${getNextStatus(order.status)}`}
                        >
                          <ArrowRight className="h-4 w-4" />
                          <span className="text-xs capitalize">{getNextStatus(order.status)}</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
          <p className="text-gray-500">
            {user?.role === 'customer' 
              ? 'You haven\'t placed any orders yet.'
              : 'No orders match your current filters.'
            }
          </p>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderDetailsModal}
        onClose={() => setShowOrderDetailsModal(false)}
        order={selectedOrder}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        order={selectedOrder}
        newStatus={newStatus}
        setNewStatus={setNewStatus}
        onSubmit={handleStatusUpdate}
        isUpdating={isUpdating}
      />
    </div>
  );
}

// Order Details Modal Component
function OrderDetailsModal({
  isOpen,
  onClose,
  order
}: {
  isOpen: boolean;
  onClose: () => void;
  order: any;
}) {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Order Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Order ID:</span> {order.id}</div>
                  <div><span className="font-medium">Date:</span> {new Date(order.orderDate).toLocaleDateString('vi-VN')}</div>
                  <div><span className="font-medium">Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full bg-${order.status === 'pending' ? 'yellow' : order.status === 'confirmed' ? 'blue' : order.status === 'shipped' ? 'purple' : order.status === 'delivered' ? 'green' : 'red'}-100 text-${order.status === 'pending' ? 'yellow' : order.status === 'confirmed' ? 'blue' : order.status === 'shipped' ? 'purple' : order.status === 'delivered' ? 'green' : 'red'}-800`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div><span className="font-medium">Total:</span> ₫{order.total.toLocaleString()}</div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Customer Information</h3>
                <div className="space-y-2 text-sm">
                  <div><span className="font-medium">Name:</span> {order.customerName}</div>
                  <div><span className="font-medium">Address:</span> {order.shippingAddress}</div>
                  <div><span className="font-medium">Payment:</span> {order.paymentMethod.toUpperCase()}</div>
                  <div><span className="font-medium">Payment Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Order Items</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.items.map((item: any, index: number) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.productName}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">₫{item.price.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">₫{(item.price * item.quantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 mt-6">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Status Update Modal Component
function StatusUpdateModal({
  isOpen,
  onClose,
  order,
  newStatus,
  setNewStatus,
  onSubmit,
  isUpdating
}: {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  newStatus: string;
  setNewStatus: (status: string) => void;
  onSubmit: () => void;
  isUpdating: boolean;
}) {
  if (!isOpen || !order) return null;

  const statusOptions = [
    { value: 'pending', label: 'Pending', description: 'Order is awaiting confirmation' },
    { value: 'confirmed', label: 'Confirmed', description: 'Order has been confirmed and is being prepared' },
    { value: 'shipped', label: 'Shipped', description: 'Order has been shipped and is on the way' },
    { value: 'delivered', label: 'Delivered', description: 'Order has been successfully delivered' },
    { value: 'cancelled', label: 'Cancelled', description: 'Order has been cancelled' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Update Order Status</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900">Order #{order.id}</h3>
            <p className="text-sm text-gray-500">Customer: {order.customerName}</p>
            <p className="text-sm text-gray-500">Current Status: <span className="capitalize font-medium">{order.status}</span></p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status
            </label>
            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label key={status.value} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    value={status.value}
                    checked={newStatus === status.value}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">{status.label}</div>
                    <div className="text-sm text-gray-500">{status.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={isUpdating || newStatus === order.status}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {isUpdating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isUpdating ? 'Updating...' : 'Update Status'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}