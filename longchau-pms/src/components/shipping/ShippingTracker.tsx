import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Package,
  User,
  Phone,
  Navigation,
  Calendar,
  ArrowRight,
  RefreshCw
} from 'lucide-react';

export default function ShippingTracker() {
  const { user } = useAuth();
  const { orders } = useData();
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [mapView, setMapView] = useState(false);

  // Filter orders for current customer that are shipped or delivered
  const trackableOrders = orders.filter(order => 
    order.customerId === user?.id && 
    (order.status === 'assigned' || order.status === 'delivered') &&
    order.trackingNumber
  );

  // Mock shipper location update (in real app, this would come from GPS tracking API)
  useEffect(() => {
    const interval = setInterval(() => {
      if (selectedOrder && selectedOrder.status === 'shipped') {
        // Simulate shipper movement (in real app, this would be from GPS tracking)
        setSelectedOrder((prev: any) => ({
          ...prev,
          shipperLocation: {
            ...prev.shipperLocation,
            timestamp: new Date().toISOString()
          }
        }));
      }
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [selectedOrder]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'shipped': return <Truck className="h-5 w-5 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getEstimatedDelivery = (order: any) => {
    if (order.actualDelivery) {
      return `Delivered: ${new Date(order.actualDelivery).toLocaleString()}`;
    }
    if (order.estimatedDelivery) {
      return `Estimated: ${new Date(order.estimatedDelivery).toLocaleString()}`;
    }
    return 'Estimating delivery time...';
  };

  if (!user || user.role !== 'customer') {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Shipping tracking is only available for customers.</p>
      </div>
    );
  }

  if (trackableOrders.length === 0) {
    return (
      <div className="p-6 text-center">
        <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Trackable Orders</h3>
        <p className="text-gray-500">You don't have any orders currently being shipped.</p>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <Truck className="h-6 w-6 mr-2 text-blue-500" />
          Track Your Orders
        </h2>
        <p className="text-gray-600 mt-1">Monitor your shipments in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Orders List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Your Shipments</h3>
          
          {trackableOrders.map((order) => (
            <div
              key={order.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                selectedOrder?.id === order.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(order.status)}
                    <span className="font-semibold text-gray-900">Order #{order.id}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'delivered' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-gray-600">
                      <Package className="h-3 w-3 inline mr-1" />
                      {order.items.length} item(s) • ${order.total}
                    </p>
                    <p className="text-sm text-gray-600">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {getEstimatedDelivery(order)}
                    </p>
                    {order.trackingNumber && (
                      <p className="text-sm text-gray-600">
                        <Navigation className="h-3 w-3 inline mr-1" />
                        Tracking: {order.trackingNumber}
                      </p>
                    )}
                  </div>
                </div>
                
                {selectedOrder?.id === order.id && (
                  <ArrowRight className="h-5 w-5 text-blue-500 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Order Details & Tracking */}
        <div>
          {selectedOrder ? (
            <div className="space-y-6">
              {/* Shipper Information */}
              {selectedOrder.shippingInfo && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    Your Delivery Person
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <strong>Name:</strong> {selectedOrder.shippingInfo.shipperName}
                    </p>
                    <p className="text-sm">
                      <strong>Phone:</strong> 
                      <a 
                        href={`tel:${selectedOrder.shippingInfo.shipperPhone}`}
                        className="text-blue-600 hover:text-blue-800 ml-1"
                      >
                        {selectedOrder.shippingInfo.shipperPhone}
                      </a>
                    </p>
                    <p className="text-sm">
                      <strong>Vehicle:</strong> {selectedOrder.shippingInfo.vehicleType} ({selectedOrder.shippingInfo.vehicleNumber})
                    </p>
                    <p className="text-sm">
                      <strong>ETA:</strong> {selectedOrder.shippingInfo.estimatedTime}
                    </p>
                  </div>
                </div>
              )}

              {/* Current Location */}
              {selectedOrder.shipperLocation && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                    Current Location
                  </h4>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      {selectedOrder.shipperLocation.address}
                    </p>
                    <p className="text-xs text-gray-500">
                      <Clock className="h-3 w-3 inline mr-1" />
                      Last updated: {new Date(selectedOrder.shipperLocation.timestamp).toLocaleString()}
                    </p>
                    <button
                      onClick={() => setMapView(!mapView)}
                      className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                    >
                      <Navigation className="h-3 w-3 mr-1" />
                      {mapView ? 'Hide Map' : 'View on Map'}
                    </button>
                  </div>
                </div>
              )}

              {/* Map View */}
              {mapView && selectedOrder.shipperLocation && (
                <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                    <p className="text-gray-600">Interactive Map</p>
                    <p className="text-sm text-gray-500">
                      Lat: {selectedOrder.shipperLocation.latitude.toFixed(6)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Lng: {selectedOrder.shipperLocation.longitude.toFixed(6)}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      In a real implementation, this would show Google Maps or similar
                    </p>
                  </div>
                </div>
              )}

              {/* Tracking History */}
              {selectedOrder.trackingHistory && selectedOrder.trackingHistory.length > 0 && (
                <div className="bg-white rounded-lg border p-4">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Tracking History
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.trackingHistory.map((event: any, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            index === 0 ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{event.description}</p>
                          <p className="text-xs text-gray-500">{event.location.address}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(event.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className="bg-white rounded-lg border p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Order Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <div>
                        <p className="text-sm font-medium">{item.productName}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold">${item.price}</p>
                    </div>
                  ))}
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total:</span>
                      <span className="font-semibold text-lg">${selectedOrder.total}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Select an Order</h3>
              <p className="text-gray-500">Choose an order from the list to track its delivery status and location.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
