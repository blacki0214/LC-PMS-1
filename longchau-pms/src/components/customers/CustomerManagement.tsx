import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useActivity } from '../../contexts/ActivityContext';
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
  X,
  Save,
  User,
  Heart,
  Shield
} from 'lucide-react';

export default function CustomerManagement() {
  const { customers, addCustomer } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const { addActivity } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentView, setCurrentView] = useState<'management' | 'shopping' | 'profile'>('management');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);

  // Check if user can manage customers (pharmacist or manager)
  const canManageCustomers = user?.role === 'pharmacist' || user?.role === 'manager';

  // Wrapper function for adding customers with activity logging
  const handleAddCustomer = async (customerData: any) => {
    try {
      await addCustomer(customerData);
      
      // Log the activity
      addActivity(
        'customer',
        'Added new customer',
        `Customer "${customerData.name}" was added to the system`,
        {
          customerName: customerData.name
        }
      );
      
      setShowAddCustomerModal(false);
    } catch (error) {
      console.error('Error adding customer:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to add customer. Please try again.',
        type: 'error'
      });
    }
  };

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
          {user?.role === 'customer' && (
            <button
              onClick={() => setCurrentView('shopping')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Shop Now</span>
            </button>
          )}
          {canManageCustomers && (
            <button 
              onClick={() => setShowAddCustomerModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Customer</span>
            </button>
          )}
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

      {/* Add Customer Modal */}
      <AddCustomerModal 
        isOpen={showAddCustomerModal}
        onClose={() => setShowAddCustomerModal(false)}
        onSubmit={handleAddCustomer}
        addNotification={addNotification}
      />
    </div>
  );
}

// Add Customer Modal Component
function AddCustomerModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  addNotification 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (customer: any) => Promise<void>;
  addNotification: (notification: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    allergies: [] as string[],
    healthStatus: {
      bloodType: '',
      height: '',
      weight: '',
      chronicConditions: [] as string[],
      emergencyContact: {
        name: '',
        phone: '',
        relationship: ''
      },
      insurance: {
        provider: '',
        policyNumber: '',
        expiryDate: ''
      }
    },
    membershipTier: 'bronze' as 'bronze' | 'silver' | 'gold' | 'platinum'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!formData.name || !formData.email || !formData.phone) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields (Name, Email, Phone)',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const customerData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        dateOfBirth: formData.dateOfBirth,
        allergies: formData.allergies,
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          ...formData.healthStatus,
          height: formData.healthStatus.height ? parseInt(formData.healthStatus.height) : undefined,
          weight: formData.healthStatus.weight ? parseInt(formData.healthStatus.weight) : undefined,
        },
        membershipTier: formData.membershipTier,
        joinDate: new Date().toISOString(),
        totalSpent: 0
      };

      await onSubmit(customerData);
      
      addNotification({
        title: 'Customer Added',
        message: `${formData.name} has been added to the system`,
        type: 'success'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        allergies: [],
        healthStatus: {
          bloodType: '',
          height: '',
          weight: '',
          chronicConditions: [],
          emergencyContact: {
            name: '',
            phone: '',
            relationship: ''
          },
          insurance: {
            provider: '',
            policyNumber: '',
            expiryDate: ''
          }
        },
        membershipTier: 'bronze'
      });
      onClose();
      
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to add customer',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add New Customer</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={2}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Membership Tier
                  </label>
                  <select
                    value={formData.membershipTier}
                    onChange={(e) => setFormData({...formData, membershipTier: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="bronze">Bronze</option>
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Health Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Health Information (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Type
                  </label>
                  <select
                    value={formData.healthStatus.bloodType}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthStatus: { ...formData.healthStatus, bloodType: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.healthStatus.height}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthStatus: { ...formData.healthStatus, height: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="50"
                    max="250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.healthStatus.weight}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthStatus: { ...formData.healthStatus, weight: e.target.value }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="10"
                    max="300"
                  />
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Emergency Contact (Optional)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.healthStatus.emergencyContact.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthStatus: { 
                        ...formData.healthStatus, 
                        emergencyContact: { 
                          ...formData.healthStatus.emergencyContact, 
                          name: e.target.value 
                        }
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.healthStatus.emergencyContact.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthStatus: { 
                        ...formData.healthStatus, 
                        emergencyContact: { 
                          ...formData.healthStatus.emergencyContact, 
                          phone: e.target.value 
                        }
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Relationship
                  </label>
                  <input
                    type="text"
                    value={formData.healthStatus.emergencyContact.relationship}
                    onChange={(e) => setFormData({
                      ...formData,
                      healthStatus: { 
                        ...formData.healthStatus, 
                        emergencyContact: { 
                          ...formData.healthStatus.emergencyContact, 
                          relationship: e.target.value 
                        }
                      }
                    })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Adding...' : 'Add Customer'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
