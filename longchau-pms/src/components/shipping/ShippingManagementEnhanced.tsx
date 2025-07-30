import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import VietnamMap from '../maps/VietnamMap';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Clock, 
  Package, 
  User,
  Navigation,
  Search,
  Filter,
  Plus,
  Building2,
  Star,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function ShippingManagement() {
  const { 
    orders, 
    shippers, 
    branches,
    assignShipper, 
    updateShipperLocation, 
    addShipper, 
    updateShipper,
    addBranch,
    updateBranch
  } = useData();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'orders' | 'shippers' | 'branches'>('overview');
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddShipperModal, setShowAddShipperModal] = useState(false);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Initialize sample data if none exists
  useEffect(() => {
    initializeSampleData();
  }, []);

  const initializeSampleData = async () => {
    try {
      // Add sample branches if none exist
      if (branches.length === 0) {
        const sampleBranches = [
          {
            name: 'Long Chau District 1',
            address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
            city: 'Ho Chi Minh City',
            province: 'Ho Chi Minh',
            postalCode: '700000',
            phone: '+84 28 1234 5678',
            email: 'district1@longchau.com',
            location: {
              latitude: 10.8231,
              longitude: 106.6297
            },
            operatingHours: {
              monday: { open: '08:00', close: '22:00' },
              tuesday: { open: '08:00', close: '22:00' },
              wednesday: { open: '08:00', close: '22:00' },
              thursday: { open: '08:00', close: '22:00' },
              friday: { open: '08:00', close: '22:00' },
              saturday: { open: '08:00', close: '22:00' },
              sunday: { open: '08:00', close: '22:00' }
            },
            isActive: true
          },
          {
            name: 'Long Chau District 3',
            address: '456 Vo Van Tan Street, District 3, Ho Chi Minh City',
            city: 'Ho Chi Minh City',
            province: 'Ho Chi Minh',
            postalCode: '700000',
            phone: '+84 28 1234 5679',
            email: 'district3@longchau.com',
            location: {
              latitude: 10.7892,
              longitude: 106.6762
            },
            operatingHours: {
              monday: { open: '08:00', close: '22:00' },
              tuesday: { open: '08:00', close: '22:00' },
              wednesday: { open: '08:00', close: '22:00' },
              thursday: { open: '08:00', close: '22:00' },
              friday: { open: '08:00', close: '22:00' },
              saturday: { open: '08:00', close: '22:00' },
              sunday: { open: '08:00', close: '22:00' }
            },
            isActive: true
          }
        ];

        for (const branchData of sampleBranches) {
          await addBranch(branchData);
        }
      }

      // Add sample shippers if none exist
      if (shippers.length === 0) {
        const sampleShippers = [
          {
            userId: 'shipper-user-1',
            name: 'Nguyen Van Duc',
            email: 'shipper@longchau.com',
            phone: '+84 90 123 4567',
            vehicleType: 'motorcycle' as const,
            vehicleNumber: '59X1-12345',
            licenseNumber: 'DL123456789',
            currentLocation: {
              latitude: 10.8231,
              longitude: 106.6297,
              address: 'District 1, Ho Chi Minh City',
              timestamp: new Date().toISOString()
            },
            isAvailable: true,
            rating: 4.8,
            totalDeliveries: 245,
            branchId: branches[0]?.id,
            emergencyContact: {
              name: 'Nguyen Thi Mai',
              phone: '+84 90 987 6543',
              relationship: 'spouse'
            }
          },
          {
            userId: 'shipper-user-2',
            name: 'Tran Minh Hieu',
            email: 'hieu.shipper@longchau.com',
            phone: '+84 91 234 5678',
            vehicleType: 'motorcycle' as const,
            vehicleNumber: '59X1-67890',
            licenseNumber: 'DL987654321',
            currentLocation: {
              latitude: 10.7892,
              longitude: 106.6762,
              address: 'District 3, Ho Chi Minh City',
              timestamp: new Date().toISOString()
            },
            isAvailable: true,
            rating: 4.6,
            totalDeliveries: 189,
            branchId: branches[1]?.id,
            emergencyContact: {
              name: 'Tran Van Nam',
              phone: '+84 91 876 5432',
              relationship: 'father'
            }
          }
        ];

        for (const shipperData of sampleShippers) {
          await addShipper(shipperData);
        }
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
    }
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Get orders with location data for map
  const mapOrders = filteredOrders.map(order => ({
    id: order.id,
    customerName: order.customerName,
    destinationLocation: order.destinationLocation,
    originBranch: order.originBranch,
    assignedShipper: order.assignedShipper ? {
      name: order.assignedShipper.name,
      currentLocation: order.assignedShipper.currentLocation
    } : undefined,
    status: order.status
  }));

  const handleAssignShipper = async (orderId: string, shipperId: string) => {
    try {
      const selectedOrder = orders.find(o => o.id === orderId);
      const selectedShipper = shippers.find(s => s.id === shipperId);
      
      if (!selectedOrder || !selectedShipper) return;

      // Create route data from branch to customer
      const routeData = selectedOrder.originBranch && selectedOrder.destinationLocation ? {
        waypoints: [
          {
            latitude: selectedOrder.originBranch.location.latitude,
            longitude: selectedOrder.originBranch.location.longitude,
            address: selectedOrder.originBranch.name,
            order: 0
          },
          {
            latitude: selectedOrder.destinationLocation.latitude,
            longitude: selectedOrder.destinationLocation.longitude,
            address: selectedOrder.destinationLocation.address,
            order: 1
          }
        ],
        distance: calculateDistance(
          selectedOrder.originBranch.location.latitude,
          selectedOrder.originBranch.location.longitude,
          selectedOrder.destinationLocation.latitude,
          selectedOrder.destinationLocation.longitude
        ),
        duration: 30 // Estimated 30 minutes
      } : undefined;

      await assignShipper(orderId, shipperId, routeData);
      setShowAssignModal(false);
    } catch (error) {
      console.error('Error assigning shipper:', error);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'confirmed': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Truck className="h-7 w-7 mr-3 text-blue-600" />
                Shipping Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage deliveries, shippers, and branch locations with Vietnam map integration
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowAddShipperModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Shipper
              </button>
              <button
                onClick={() => setShowAddBranchModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Add Branch
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview', icon: MapPin },
              { id: 'orders', label: 'Orders', icon: Package },
              { id: 'shippers', label: 'Shippers', icon: Truck },
              { id: 'branches', label: 'Branches', icon: Building2 }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Orders</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Truck className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Available Shippers</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {shippers.filter(s => s.isAvailable).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Active Branches</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {branches.filter(b => b.isActive).length}
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border shadow-sm">
                <div className="flex items-center">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Delivered Today</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {orders.filter(o => o.status === 'delivered' && 
                        o.actualDelivery && 
                        new Date(o.actualDelivery).toDateString() === new Date().toDateString()
                      ).length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg border shadow-sm">
              <div className="p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
              </div>
              <div className="p-4 space-y-3">
                {orders.slice(0, 5).map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">#{order.id}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Vietnam Map */}
          <div className="lg:col-span-2">
            <VietnamMap
              orders={mapOrders}
              selectedOrderId={selectedOrderId}
              onOrderSelect={setSelectedOrderId}
              showRoute={true}
            />
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {selectedTab === 'orders' && (
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Order Management</h2>
              <div className="flex space-x-3">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search orders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="assigned">Assigned</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          </div>
          
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shipper
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.assignedShipper ? order.assignedShipper.name : 'Unassigned'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.destinationLocation?.address || order.shippingAddress}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {!order.assignedShipperId && (
                        <button
                          onClick={() => {
                            setSelectedOrderId(order.id);
                            setShowAssignModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Assign Shipper
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign Shipper Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Shipper</h3>
            <div className="space-y-4">
              {shippers.filter(s => s.isAvailable).map((shipper) => (
                <div
                  key={shipper.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleAssignShipper(selectedOrderId, shipper.id)}
                >
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg mr-3">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{shipper.name}</p>
                      <p className="text-sm text-gray-600">{shipper.vehicleType} • {shipper.vehicleNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-gray-600">{shipper.rating}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
