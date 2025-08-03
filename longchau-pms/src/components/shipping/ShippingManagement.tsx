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
  const { orders, shippers, updateShippingInfo, updateOrder } = useData();
  const { addNotification } = useNotifications();
  const { addActivity } = useActivity();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedShipperId, setSelectedShipperId] = useState('');

  // Get available shippers (those who are available and not currently assigned to active orders)
  const availableShippers = shippers.filter(shipper => 
    shipper.isAvailable && 
    !orders.some(order => 
      order.assignedShipperId === shipper.id && 
      ['shipped', 'in_transit'].includes(order.status)
    )
  );

  // Filter orders that need shipping assignment or are currently shipping
  const shippableOrders = orders.filter(order => 
    order.status === 'confirmed' || order.status === 'assigned'
  );

  // Check if user can manage shipping
  const canManageShipping = user?.role === 'pharmacist' || user?.role === 'manager';

  const handleAssignShipper = async () => {
    if (!selectedOrder || !selectedShipperId || isUpdating) return;

    setIsUpdating(true);
    try {
      // Get selected shipper data
      const selectedShipper = shippers.find(s => s.id === selectedShipperId);
      if (!selectedShipper) {
        addNotification({
          title: 'Assignment Failed',
          message: 'Selected shipper not found',
          type: 'error'
        });
        setIsUpdating(false);
        return;
      }

      // Generate tracking number if not exists
      const trackingNumber = selectedOrder.trackingNumber || 
        `TRK${Date.now().toString().slice(-8)}`;

      const shippingInfo = {
        shippingInfo: {
          shipperName: selectedShipper.name,
          shipperPhone: selectedShipper.phone,
          vehicleType: selectedShipper.vehicleType,
          vehicleNumber: selectedShipper.vehicleNumber,
          estimatedTime: '2-3 hours' // Default estimation
        },
        shipperLocation: {
          latitude: selectedShipper.currentLocation?.latitude || 14.5995, // Default to Manila
          longitude: selectedShipper.currentLocation?.longitude || 120.9842,
          address: selectedShipper.currentLocation?.address || 'Longchau Pharmacy',
          timestamp: new Date().toISOString()
        },
        trackingHistory: [
          {
            timestamp: new Date().toISOString(),
            status: 'shipped',
            location: {
              latitude: selectedShipper.currentLocation?.latitude || 14.5995,
              longitude: selectedShipper.currentLocation?.longitude || 120.9842,
              address: selectedShipper.currentLocation?.address || 'Longchau Pharmacy'
            },
            description: `Package picked up by ${selectedShipper.name}`
          }
        ],
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        assignedShipperId: selectedShipperId // Add shipper ID to track assignment
      };

      const result = await updateShippingInfo(selectedOrder.id, shippingInfo);

      if (result.success) {
        // Update order status to shipped if it was confirmed
        if (selectedOrder.status === 'confirmed') {
          const updatedOrder = {
            ...selectedOrder,
            status: 'shipped' as const,
            trackingNumber: trackingNumber,
            assignedShipperId: selectedShipperId
          };
          await updateOrder(updatedOrder);
        }

        // Log the activity
        addActivity(
          'order',
          'Assigned shipper',
          `Order #${selectedOrder.id} assigned to ${selectedShipper.name}`,
          {
            orderId: selectedOrder.id,
            status: 'shipped'
          }
        );

        addNotification({
          title: 'Shipper Assigned',
          message: `${selectedShipper.name} has been assigned to deliver Order #${selectedOrder.id}`,
          type: 'success'
        });

        setShowAssignModal(false);
        setSelectedShipperId('');
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

  const openAssignModal = (order: any) => {
    setSelectedOrder(order);
    setSelectedShipperId(''); // Reset selected shipper
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
                  setSelectedShipperId('');
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
                  Select Shipper
                </label>
                <select
                  value={selectedShipperId}
                  onChange={(e) => setSelectedShipperId(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose a shipper...</option>
                  {availableShippers.map((shipper) => (
                    <option key={shipper.id} value={shipper.id}>
                      {shipper.name} - {shipper.vehicleType} ({shipper.vehicleNumber})
                    </option>
                  ))}
                </select>
                {availableShippers.length === 0 && (
                  <p className="text-sm text-red-600 mt-1">
                    No available shippers. All shippers are currently assigned or unavailable.
                  </p>
                )}
              </div>

              {selectedShipperId && (
                <div className="bg-gray-50 p-3 rounded-md">
                  {(() => {
                    const shipper = shippers.find(s => s.id === selectedShipperId);
                    if (!shipper) return null;
                    
                    return (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900">Shipper Details</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>
                            <span className="ml-1 font-medium">{shipper.name}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>
                            <span className="ml-1 font-medium">{shipper.phone}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Vehicle:</span>
                            <span className="ml-1 font-medium">{shipper.vehicleType}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">License:</span>
                            <span className="ml-1 font-medium">{shipper.vehicleNumber}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Rating:</span>
                            <span className="ml-1 font-medium">⭐ {shipper.rating.toFixed(1)}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Deliveries:</span>
                            <span className="ml-1 font-medium">{shipper.totalDeliveries}</span>
                          </div>
                        </div>
                        {shipper.currentLocation && (
                          <div className="pt-2 border-t">
                            <span className="text-gray-600">Current Location:</span>
                            <span className="ml-1 text-sm">{shipper.currentLocation.address}</span>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedShipperId('');
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignShipper}
                disabled={isUpdating || !selectedShipperId}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="h-4 w-4 mr-1" />
                {isUpdating ? 'Assigning...' : 'Assign Shipper'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
