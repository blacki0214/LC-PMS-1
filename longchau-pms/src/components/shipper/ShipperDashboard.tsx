import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { useAuth } from '../../contexts/AuthContext';
import { AddressService, Address } from '../../services/AddressService';
import VietnamMap from '../maps/VietnamMap';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle, 
  Package, 
  Navigation,
  User,
  Star,
  BarChart3,
  Settings,
  LogOut,
  Camera,
  Upload
} from 'lucide-react';

export default function ShipperDashboard() {
  const { orders, shippers, updateShipperLocation, updateOrder } = useData();
  const { user, logout } = useAuth();
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showLocationUpdate, setShowLocationUpdate] = useState(false);
  const [deliveryProof, setDeliveryProof] = useState<File | null>(null);
  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [foundAddress, setFoundAddress] = useState<Address | null>(null);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);

  // Find current shipper
  const currentShipper = shippers.find(s => s.userId === user?.id);
  
  // Get assigned orders for current shipper
  const assignedOrders = orders.filter(order => 
    order.assignedShipperId === currentShipper?.id && 
    order.status !== 'delivered' && 
    order.status !== 'cancelled'
  );

  // Get completed deliveries
  const completedDeliveries = orders.filter(order => 
    order.assignedShipperId === currentShipper?.id && 
    order.status === 'delivered'
  );

  // Update location periodically
  useEffect(() => {
    if (!currentShipper) return;

    const updateLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              address: 'Current location',
              timestamp: new Date().toISOString()
            };
            updateShipperLocation(currentShipper.id, location);
          },
          (error) => {
            console.error('Error getting location:', error);
          }
        );
      }
    };

    // Update location immediately and then every 30 seconds
    updateLocation();
    const interval = setInterval(updateLocation, 30000);

    return () => clearInterval(interval);
  }, [currentShipper, updateShipperLocation]);

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const order = orders.find(o => o.id === orderId);
      if (!order) return;

      const updatedOrder = {
        ...order,
        status: newStatus as any,
        actualDelivery: newStatus === 'delivered' ? new Date().toISOString() : order.actualDelivery,
        deliveryProof: newStatus === 'delivered' && deliveryProof ? {
          photos: [URL.createObjectURL(deliveryProof)],
          notes: 'Delivered by shipper with photo proof'
        } : order.deliveryProof
      };

      await updateOrder(updatedOrder);
      
      if (newStatus === 'delivered') {
        setDeliveryProof(null);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleDeliveryProofUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDeliveryProof(file);
    }
  };

  const handleAddressSearch = async () => {
    if (!addressSearchQuery.trim()) return;

    setIsSearchingAddress(true);
    try {
      const result = await AddressService.geocode(addressSearchQuery);
      if (result.success && result.address) {
        setFoundAddress(result.address);
      } else {
        // Try city search
        const cityResults = AddressService.getAddressesByCity(addressSearchQuery);
        if (cityResults.length > 0) {
          setFoundAddress(cityResults[0]);
        }
      }
    } catch (error) {
      console.error('Address search failed:', error);
    } finally {
      setIsSearchingAddress(false);
    }
  };

  if (!currentShipper) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Truck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Shipper Profile Not Found</h2>
          <p className="text-gray-600 mb-6">Please contact your administrator to set up your shipper profile.</p>
          <button
            onClick={logout}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Shipper Dashboard</h1>
                <p className="text-sm text-gray-600">Welcome back, {currentShipper.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                {currentShipper.rating.toFixed(1)} rating
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Package className="h-4 w-4 text-green-500 mr-1" />
                {currentShipper.totalDeliveries} deliveries
              </div>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Orders */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Orders</p>
                    <p className="text-xl font-semibold text-gray-900">{assignedOrders.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-xl font-semibold text-gray-900">{completedDeliveries.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Lookup */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-blue-500" />
                  Address Lookup
                </h2>
              </div>
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Search for address..."
                    value={addressSearchQuery}
                    onChange={(e) => setAddressSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddressSearch()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                  <button
                    onClick={handleAddressSearch}
                    disabled={isSearchingAddress || !addressSearchQuery.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                  >
                    {isSearchingAddress ? '...' : 'Find'}
                  </button>
                </div>

                {foundAddress && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-blue-900 text-sm">{foundAddress.street}</p>
                        <p className="text-xs text-blue-700">{foundAddress.ward}, {foundAddress.district}</p>
                        <p className="text-xs text-blue-600">{foundAddress.city}, {foundAddress.province}</p>
                        <p className="text-xs text-blue-500 mt-1">
                          📍 {foundAddress.coordinates.latitude.toFixed(4)}, {foundAddress.coordinates.longitude.toFixed(4)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setAddressSearchQuery('Ho Chi Minh City');
                      handleAddressSearch();
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    HCMC
                  </button>
                  <button
                    onClick={() => {
                      setAddressSearchQuery('Hanoi');
                      handleAddressSearch();
                    }}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-xs hover:bg-gray-200"
                  >
                    Hanoi
                  </button>
                </div>
              </div>
            </div>

            {/* Active Orders */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">Active Deliveries</h2>
              </div>
              <div className="p-4 space-y-4">
                {assignedOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No active deliveries</p>
                  </div>
                ) : (
                  assignedOrders.map((order) => (
                    <div
                      key={order.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedOrderId === order.id 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedOrderId(order.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-gray-900">#{order.id}</h3>
                          <p className="text-sm text-gray-600">{order.customerName}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'picked_up' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'in_transit' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status.toUpperCase()}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="h-4 w-4 mr-1" />
                        {order.shippingAddress}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-3">
                        <Clock className="h-4 w-4 mr-1" />
                        Est. delivery: {order.estimatedDelivery ? 
                          new Date(order.estimatedDelivery).toLocaleTimeString() : 
                          'Not set'
                        }
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        {order.status === 'assigned' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, 'picked_up');
                            }}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                          >
                            Pick Up
                          </button>
                        )}
                        {order.status === 'picked_up' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStatusUpdate(order.id, 'in_transit');
                            }}
                            className="flex-1 px-3 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                          >
                            Start Delivery
                          </button>
                        )}
                        {order.status === 'in_transit' && (
                          <div className="flex-1 space-y-2">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleDeliveryProofUpload}
                              className="hidden"
                              id={`proof-${order.id}`}
                            />
                            <label
                              htmlFor={`proof-${order.id}`}
                              className="flex items-center justify-center px-3 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700 cursor-pointer"
                            >
                              <Camera className="h-4 w-4 mr-1" />
                              {deliveryProof ? 'Photo Added' : 'Add Photo'}
                            </label>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusUpdate(order.id, 'delivered');
                              }}
                              disabled={!deliveryProof}
                              className="w-full px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Mark Delivered
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-gray-900">Delivery Map</h2>
                  <div className="flex items-center space-x-2">
                    <Navigation className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Real-time tracking</span>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <VietnamMap
                  orders={assignedOrders.map(order => ({
                    id: order.id,
                    customerName: order.customerName,
                    destinationLocation: order.destinationLocation,
                    originBranch: order.originBranch,
                    assignedShipper: {
                      name: currentShipper.name,
                      currentLocation: currentShipper.currentLocation
                    },
                    status: order.status
                  }))}
                  selectedOrderId={selectedOrderId}
                  onOrderSelect={setSelectedOrderId}
                  showRoute={true}
                  centerLocation={currentShipper.currentLocation ? {
                    latitude: currentShipper.currentLocation.latitude,
                    longitude: currentShipper.currentLocation.longitude
                  } : undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
