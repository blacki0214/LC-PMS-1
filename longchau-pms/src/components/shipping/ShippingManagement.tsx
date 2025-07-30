import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { useNotifications } from '../../contexts/NotificationContext';
import { useActivity } from '../../contexts/ActivityContext';
import {
  Truck,
  MapPin,
  User,
  Phone,
  Clock,
  Package,
  Save,
  X,
  Plus,
  Edit,
  RefreshCw
} from 'lucide-react';

export default function ShippingManagement() {
  const { user } = useAuth();
  const { orders, updateShippingInfo, updateOrder } = useData();
  const { addNotification } = useNotifications();
  const { addActivity } = useActivity();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Form data for shipping assignment
  const [shippingData, setShippingData] = useState({
    shipperName: '',
    shipperPhone: '',
    vehicleType: 'motorcycle',
    vehicleNumber: '',
    estimatedTime: '',
    currentLocation: '',
    latitude: 0,
    longitude: 0
  });

  // Filter orders that need shipping assignment or are currently shipping
  const shippableOrders = orders.filter(order => 
    order.status === 'confirmed' || order.status === 'assigned'
  );

  // Check if user can manage shipping
  const canManageShipping = user?.role === 'pharmacist' || user?.role === 'manager';

  const handleAssignShipper = async () => {
    if (!selectedOrder || isUpdating) return;

    setIsUpdating(true);
    try {
      // Generate tracking number if not exists
      const trackingNumber = selectedOrder.trackingNumber || 
        `TRK${Date.now().toString().slice(-8)}`;

      const shippingInfo = {
        shippingInfo: {
          shipperName: shippingData.shipperName,
          shipperPhone: shippingData.shipperPhone,
          vehicleType: shippingData.vehicleType,
          vehicleNumber: shippingData.vehicleNumber,
          estimatedTime: shippingData.estimatedTime
        },
        shipperLocation: {
          latitude: shippingData.latitude || 14.5995, // Default to Manila
          longitude: shippingData.longitude || 120.9842,
          address: shippingData.currentLocation || 'Longchau Pharmacy',
          timestamp: new Date().toISOString()
        },
        trackingHistory: [
          {
            timestamp: new Date().toISOString(),
            status: 'shipped',
            location: {
              latitude: shippingData.latitude || 14.5995,
              longitude: shippingData.longitude || 120.9842,
              address: shippingData.currentLocation || 'Longchau Pharmacy'
            },
            description: `Package picked up by ${shippingData.shipperName}`
          }
        ],
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString() // 2 hours from now
      };

      const result = await updateShippingInfo(selectedOrder.id, shippingInfo);

      if (result.success) {
        // Update order status to shipped if it was confirmed
        if (selectedOrder.status === 'confirmed') {
          const updatedOrder = {
            ...selectedOrder,
            status: 'shipped' as const,
            trackingNumber: trackingNumber
          };
          await updateOrder(updatedOrder);
        }

        // Log the activity
        addActivity(
          'order',
          'Assigned shipper',
          `Order #${selectedOrder.id} assigned to ${shippingData.shipperName}`,
          {
            orderId: selectedOrder.id,
            status: 'shipped'
          }
        );

        addNotification({
          title: 'Shipper Assigned',
          message: `${shippingData.shipperName} has been assigned to deliver Order #${selectedOrder.id}`,
          type: 'success'
        });

        setShowAssignModal(false);
        resetForm();
      } else {
        addNotification({
          title: 'Assignment Failed',
          message: result.error || 'Failed to assign shipper',
          type: 'error'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Assignment Failed',
        message: 'An error occurred while assigning the shipper',
        type: 'error'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const updateShipperLocation = async (orderId: string) => {
    // Simulate GPS update (in real app, this would come from shipper's mobile app)
    const mockLocations = [
      { lat: 14.5995, lng: 120.9842, address: 'Longchau Pharmacy, Manila' },
      { lat: 14.6042, lng: 120.9822, address: 'Taft Avenue, Manila' },
      { lat: 14.6091, lng: 120.9794, address: 'UN Avenue, Manila' },
      { lat: 14.6137, lng: 120.9765, address: 'Pedro Gil Street, Manila' }
    ];

    const randomLocation = mockLocations[Math.floor(Math.random() * mockLocations.length)];
    const order = orders.find(o => o.id === orderId);
    
    if (order && order.trackingHistory) {
      const newTrackingEvent = {
        timestamp: new Date().toISOString(),
        status: 'in_transit',
        location: {
          latitude: randomLocation.lat,
          longitude: randomLocation.lng,
          address: randomLocation.address
        },
        description: 'Package is on the way'
      };

      const updatedShippingData = {
        shipperLocation: {
          latitude: randomLocation.lat,
          longitude: randomLocation.lng,
          address: randomLocation.address,
          timestamp: new Date().toISOString()
        },
        trackingHistory: [newTrackingEvent, ...order.trackingHistory]
      };

      const result = await updateShippingInfo(orderId, updatedShippingData);
      
      if (result.success) {
        addNotification({
          title: 'Location Updated',
          message: `Shipper location updated for Order #${orderId}`,
          type: 'success'
        });
      }
    }
  };

  const resetForm = () => {
    setShippingData({
      shipperName: '',
      shipperPhone: '',
      vehicleType: 'motorcycle',
      vehicleNumber: '',
      estimatedTime: '',
      currentLocation: '',
      latitude: 0,
      longitude: 0
    });
    setSelectedOrder(null);
  };

  const openAssignModal = (order: any) => {
    setSelectedOrder(order);
    setShowAssignModal(true);
  };

  if (!canManageShipping) {
    return (
      <div className="p-6 text-center">
        <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
        <p className="text-gray-500">Only pharmacists and managers can manage shipping.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Truck className="h-6 w-6 mr-2 text-blue-500" />
          Shipping Management
        </h2>
        <p className="text-gray-600 mt-1">Assign shippers and track deliveries</p>
      </div>

      <div className="p-6">
        {shippableOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Orders to Ship</h3>
            <p className="text-gray-500">All orders are either pending confirmation or already delivered.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shippableOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                        <div className="text-sm text-gray-500">${order.total}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                        <div className="text-sm text-gray-500">{order.shippingAddress}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'confirmed'
                          ? 'bg-yellow-100 text-yellow-800'
                          : order.status === 'assigned'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.shippingInfo ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {order.shippingInfo.shipperName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingInfo.vehicleType} - {order.shippingInfo.vehicleNumber}
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {!order.shippingInfo ? (
                          <button
                            onClick={() => openAssignModal(order)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Assign
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openAssignModal(order)}
                              className="text-gray-600 hover:text-gray-900 flex items-center"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            {order.status === 'assigned' && (
                              <button
                                onClick={() => updateShipperLocation(order.id)}
                                className="text-green-600 hover:text-green-900 flex items-center"
                              >
                                <RefreshCw className="h-4 w-4 mr-1" />
                                Update Location
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assign Shipper Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedOrder?.shippingInfo ? 'Edit Shipper' : 'Assign Shipper'}
              </h3>
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  resetForm();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="h-4 w-4 inline mr-1" />
                  Shipper Name
                </label>
                <input
                  type="text"
                  value={shippingData.shipperName}
                  onChange={(e) => setShippingData(prev => ({ ...prev, shipperName: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter shipper name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="text"
                  value={shippingData.shipperPhone}
                  onChange={(e) => setShippingData(prev => ({ ...prev, shipperPhone: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Truck className="h-4 w-4 inline mr-1" />
                  Vehicle Type
                </label>
                <select
                  value={shippingData.vehicleType}
                  onChange={(e) => setShippingData(prev => ({ ...prev, vehicleType: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="motorcycle">Motorcycle</option>
                  <option value="car">Car</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vehicle Number
                </label>
                <input
                  type="text"
                  value={shippingData.vehicleNumber}
                  onChange={(e) => setShippingData(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter vehicle number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Estimated Delivery Time
                </label>
                <input
                  type="text"
                  value={shippingData.estimatedTime}
                  onChange={(e) => setShippingData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 2-3 hours"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Current Location
                </label>
                <input
                  type="text"
                  value={shippingData.currentLocation}
                  onChange={(e) => setShippingData(prev => ({ ...prev, currentLocation: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Current address"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  resetForm();
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignShipper}
                disabled={isUpdating || !shippingData.shipperName || !shippingData.shipperPhone}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                {isUpdating ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
