import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { useAuth } from '../../contexts/AuthContext';
import CustomerShopping from './CustomerShopping';
import ProfileView from '../profile/ProfileView';
import { 
  Users, 
  Search, 
  Eye, 
  Edit, 
  Plus,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShoppingBag,
  UserCog,
  ArrowLeft,
  X
} from 'lucide-react';

export default function CustomerManagement() {
  const { customers } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'management' | 'shopping' | 'profile'>('management');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // If user is a customer, default to shopping view
  React.useEffect(() => {
    if (user?.role === 'customer') {
      setCurrentView('shopping');
    }
  }, [user]);

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  const handleViewCustomerProfile = (customer: any) => {
    setSelectedCustomer(customer);
    setCurrentView('profile');
  };

  if (currentView === 'profile' && selectedCustomer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentView('management')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Customer Management</span>
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Customer Profile</h2>
            <button
              onClick={() => setCurrentView('management')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          {/* Customer Profile Component */}
          <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {selectedCustomer.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}</h2>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedCustomer.membershipTier === 'bronze' ? 'text-amber-600 bg-amber-50' :
                  selectedCustomer.membershipTier === 'silver' ? 'text-gray-600 bg-gray-50' :
                  selectedCustomer.membershipTier === 'gold' ? 'text-yellow-600 bg-yellow-50' :
                  'text-purple-600 bg-purple-50'
                }`}>
                  <Users className="h-4 w-4 mr-1" />
                  {selectedCustomer.membershipTier?.toUpperCase() || 'BRONZE'} MEMBER
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">{selectedCustomer.address}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-700">
                      {new Date(selectedCustomer.dateOfBirth).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Health Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <ShoppingBag className="h-5 w-5 mr-2 text-red-600" />
                  Health Information
                </h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {selectedCustomer.healthStatus?.bloodType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Blood Type:</span>
                      <span className="font-medium text-red-600">{selectedCustomer.healthStatus.bloodType}</span>
                    </div>
                  )}
                  
                  {selectedCustomer.healthStatus?.height && selectedCustomer.healthStatus?.weight && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Height:</span>
                        <span className="font-medium">{selectedCustomer.healthStatus.height} cm</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weight:</span>
                        <span className="font-medium">{selectedCustomer.healthStatus.weight} kg</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-4 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900">Medical Alerts</h3>
                
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">Allergies:</span>
                    {selectedCustomer.allergies?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.allergies.map((allergy: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                            {allergy}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No known allergies</span>
                    )}
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600 block mb-2">Chronic Conditions:</span>
                    {selectedCustomer.healthStatus?.chronicConditions?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.healthStatus.chronicConditions.map((condition: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                            {condition}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">No chronic conditions</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentView === 'shopping') {
    return (
      <div className="space-y-6">
        {user?.role !== 'customer' && (
          <div className="flex justify-end">
            <button
              onClick={() => setCurrentView('management')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <UserCog className="h-4 w-4" />
              <span>Switch to Management</span>
            </button>
          </div>
        )}
        <CustomerShopping />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
          <p className="text-gray-600">Manage customer information and history</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setCurrentView('shopping')}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Shop Now</span>
          </button>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Customers</p>
              <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active This Month</p>
              <p className="text-2xl font-bold text-green-600">
                {Math.floor(customers.length * 0.7)}
              </p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Week</p>
              <p className="text-2xl font-bold text-blue-600">
                {Math.floor(customers.length * 0.1)}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">VIP Customers</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.floor(customers.length * 0.15)}
              </p>
            </div>
            <Users className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full md:w-96"
          />
        </div>
      </div>

      {/* Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-lg">
                    {customer.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">ID: {customer.id}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleViewCustomerProfile(customer)}
                  className="text-blue-600 hover:text-blue-800 transition-colors"
                  title="View Profile"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button className="text-gray-600 hover:text-gray-800 transition-colors">
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{customer.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">{customer.phone}</span>
              </div>
              <div className="flex items-start space-x-3 text-sm">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <span className="text-gray-700 flex-1">{customer.address}</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700">
                  Born: {new Date(customer.dateOfBirth).toLocaleDateString('vi-VN')}
                </span>
              </div>
            </div>

            {customer.allergies.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-600 mb-2">ALLERGIES</p>
                <div className="flex flex-wrap gap-1">
                  {customer.allergies.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
              <div>
                <p className="text-gray-500">Prescriptions</p>
                <p className="font-semibold text-gray-900">{customer.prescriptionHistory.length}</p>
              </div>
              <div>
                <p className="text-gray-500">Orders</p>
                <p className="font-semibold text-gray-900">{customer.orderHistory.length}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or add new customers.</p>
        </div>
      )}
    </div>
  );
}
