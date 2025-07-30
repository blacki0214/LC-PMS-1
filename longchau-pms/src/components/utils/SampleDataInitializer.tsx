import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { UserService } from '../../services/UserService';
import { Database, MapPin, Package, Users, Building2, CheckCircle, AlertCircle } from 'lucide-react';

export default function SampleDataInitializer() {
  const { 
    addOrder, 
    addCustomer, 
    addShipper, 
    addBranch, 
    customers, 
    orders, 
    shippers, 
    branches 
  } = useData();
  
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationStatus, setInitializationStatus] = useState<string>('');

  const initializeSampleData = async () => {
    setIsInitializing(true);
    setInitializationStatus('Starting initialization...');

    try {
      // 0. Create admin and shipper user accounts first
      setInitializationStatus('Creating admin and shipper user accounts...');
      const allUserData = [
        {
          email: 'admin@longchau.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'manager' as const
        },
        {
          email: 'shipper1@longchau.com',
          password: 'shipper123',
          name: 'Nguyen Van Duc',
          role: 'shipper' as const
        },
        {
          email: 'shipper2@longchau.com', 
          password: 'shipper123',
          name: 'Tran Van Minh',
          role: 'shipper' as const
        },
        {
          email: 'shipper3@longchau.com',
          password: 'shipper123', 
          name: 'Le Van Nam',
          role: 'shipper' as const
        }
      ];

      const createdShipperUsers: string[] = [];
      for (const userData of allUserData) {
        try {
          const result = await UserService.createUser(userData);
          if (result.success && result.user) {
            console.log(`✅ Created user: ${userData.email} (${userData.role})`);
            if (userData.role === 'shipper') {
              createdShipperUsers.push(result.user.id);
            }
          } else {
            console.log(`⚠️ User ${userData.email} might already exist`);
            // Try to find existing user by email for the ID
            if (userData.role === 'shipper') {
              createdShipperUsers.push(`shipper-user-${createdShipperUsers.length + 1}`);
            }
          }
        } catch (error) {
          console.log(`⚠️ Error creating user ${userData.email}:`, error);
          if (userData.role === 'shipper') {
            createdShipperUsers.push(`shipper-user-${createdShipperUsers.length + 1}`);
          }
        }
      }

      // 1. Initialize branches first
      if (branches.length === 0) {
        setInitializationStatus('Creating pharmacy branches...');
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
          },
          {
            name: 'Long Chau Thu Duc',
            address: '789 Vo Van Ngan Street, Thu Duc City, Ho Chi Minh City',
            city: 'Ho Chi Minh City',
            province: 'Ho Chi Minh',
            postalCode: '700000',
            phone: '+84 28 1234 5680',
            email: 'thuduc@longchau.com',
            location: {
              latitude: 10.8503,
              longitude: 106.7719
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

      // 2. Initialize shippers
      if (shippers.length === 0) {
        setInitializationStatus('Creating shipper accounts...');
        const sampleShippers = [
          {
            userId: createdShipperUsers[0] || 'shipper-user-1',
            name: 'Nguyen Van Duc',
            email: 'shipper1@longchau.com',
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
            userId: createdShipperUsers[1] || 'shipper-user-2',
            name: 'Tran Van Minh',
            email: 'shipper2@longchau.com',
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
          },
          {
            userId: createdShipperUsers[2] || 'shipper-user-3',
            name: 'Le Van Nam',
            email: 'shipper3@longchau.com',
            phone: '+84 92 345 6789',
            vehicleType: 'car' as const,
            vehicleNumber: '59X1-54321',
            licenseNumber: 'DL555666777',
            currentLocation: {
              latitude: 10.8503,
              longitude: 106.7719,
              address: 'Thu Duc City, Ho Chi Minh City',
              timestamp: new Date().toISOString()
            },
            isAvailable: true,
            rating: 4.9,
            totalDeliveries: 312,
            branchId: branches[2]?.id,
            emergencyContact: {
              name: 'Le Van Long',
              phone: '+84 92 876 5432',
              relationship: 'brother'
            }
          }
        ];

        for (const shipperData of sampleShippers) {
          await addShipper(shipperData);
        }
      }

      // 3. Initialize customers with realistic Vietnamese addresses
      setInitializationStatus('Creating customer accounts...');
      const sampleCustomers = [
        {
          name: 'Nguyen Thi Lan',
          email: 'lan.nguyen@email.com',
          phone: '+84 90 111 2222',
          address: '45 Le Loi Street, District 1, Ho Chi Minh City',
          dateOfBirth: '1985-03-15',
          joinDate: new Date().toISOString(),
          allergies: [],
          prescriptionHistory: [],
          orderHistory: [],
          healthStatus: {
            bloodType: 'O+',
            height: 165,
            weight: 58,
            chronicConditions: [],
            emergencyContact: {
              name: 'Nguyen Van Duc',
              phone: '+84 90 111 1111',
              relationship: 'husband'
            },
            insurance: {
              provider: 'Bao Viet Insurance',
              policyNumber: 'BV-2024-001',
              expiryDate: '2025-12-31'
            }
          },
          membershipTier: 'gold' as const,
          totalSpent: 1250000
        },
        {
          name: 'Pham Van Minh',
          email: 'minh.pham@email.com',
          phone: '+84 91 333 4444',
          address: '78 Pasteur Street, District 3, Ho Chi Minh City',
          dateOfBirth: '1978-11-22',
          joinDate: new Date().toISOString(),
          allergies: ['penicillin'],
          prescriptionHistory: [],
          orderHistory: [],
          healthStatus: {
            bloodType: 'A+',
            height: 172,
            weight: 68,
            chronicConditions: ['hypertension'],
            emergencyContact: {
              name: 'Pham Thi Hoa',
              phone: '+84 91 333 3333',
              relationship: 'wife'
            }
          },
          membershipTier: 'silver' as const,
          totalSpent: 875000
        },
        {
          name: 'Tran Thi Hong',
          email: 'hong.tran@email.com',
          phone: '+84 92 555 6666',
          address: '156 Vo Van Ngan Street, Thu Duc City, Ho Chi Minh City',
          dateOfBirth: '1992-07-08',
          joinDate: new Date().toISOString(),
          allergies: [],
          prescriptionHistory: [],
          orderHistory: [],
          healthStatus: {
            bloodType: 'B+',
            height: 160,
            weight: 52,
            chronicConditions: [],
            emergencyContact: {
              name: 'Le Van Quan',
              phone: '+84 92 555 5555',
              relationship: 'brother'
            },
            insurance: {
              provider: 'PJICO Insurance',
              policyNumber: 'PJ-2024-002',
              expiryDate: '2025-06-30'
            }
          },
          membershipTier: 'platinum' as const,
          totalSpent: 2100000
        },
        {
          name: 'Le Van Nam',
          email: 'nam.le@email.com',
          phone: '+84 93 777 8888',
          address: '234 Nguyen Van Cu Street, District 5, Ho Chi Minh City',
          dateOfBirth: '1989-12-03',
          joinDate: new Date().toISOString(),
          allergies: ['sulfa'],
          prescriptionHistory: [],
          orderHistory: [],
          healthStatus: {
            bloodType: 'AB+',
            height: 175,
            weight: 75,
            chronicConditions: ['diabetes'],
            emergencyContact: {
              name: 'Le Thi Nga',
              phone: '+84 93 777 7777',
              relationship: 'mother'
            }
          },
          membershipTier: 'bronze' as const,
          totalSpent: 450000
        },
        {
          name: 'Vo Thi Mai',
          email: 'mai.vo@email.com',
          phone: '+84 94 999 0000',
          address: '67 Dien Bien Phu Street, Binh Thanh District, Ho Chi Minh City',
          dateOfBirth: '1995-05-20',
          joinDate: new Date().toISOString(),
          allergies: [],
          prescriptionHistory: [],
          orderHistory: [],
          healthStatus: {
            bloodType: 'O-',
            height: 158,
            weight: 48,
            chronicConditions: [],
            emergencyContact: {
              name: 'Vo Van Tai',
              phone: '+84 94 999 9999',
              relationship: 'father'
            }
          },
          membershipTier: 'silver' as const,
          totalSpent: 680000
        }
      ];

      for (const customerData of sampleCustomers) {
        await addCustomer(customerData);
      }

      // 4. Create sample orders with destination tracking
      setInitializationStatus('Creating sample orders with delivery tracking...');
      
      // Customer addresses with GPS coordinates
      const customerLocations = [
        {
          customerId: customers[0]?.id,
          customerName: 'Nguyen Thi Lan',
          address: '45 Le Loi Street, District 1, Ho Chi Minh City',
          latitude: 10.8230,
          longitude: 106.6297
        },
        {
          customerId: customers[1]?.id,
          customerName: 'Pham Van Minh',
          address: '78 Pasteur Street, District 3, Ho Chi Minh City',
          latitude: 10.7869,
          longitude: 106.6831
        },
        {
          customerId: customers[2]?.id,
          customerName: 'Tran Thi Hong',
          address: '156 Vo Van Ngan Street, Thu Duc City, Ho Chi Minh City',
          latitude: 10.8485,
          longitude: 106.7734
        },
        {
          customerId: customers[3]?.id,
          customerName: 'Le Van Nam',
          address: '234 Nguyen Van Cu Street, District 5, Ho Chi Minh City',
          latitude: 10.7594,
          longitude: 106.6672
        },
        {
          customerId: customers[4]?.id,
          customerName: 'Vo Thi Mai',
          address: '67 Dien Bien Phu Street, Binh Thanh District, Ho Chi Minh City',
          latitude: 10.8014,
          longitude: 106.7109
        }
      ];

      // Create orders with different statuses
      const orderStatuses = ['confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered'];
      
      for (let i = 0; i < customerLocations.length; i++) {
        const location = customerLocations[i];
        const branch = branches[i % branches.length];
        const status = orderStatuses[i % orderStatuses.length];
        
        if (!location.customerId || !branch) continue;

        const sampleOrder = {
          customerId: location.customerId,
          customerName: location.customerName,
          items: [
            {
              productId: `med-${i + 1}`,
              productName: i === 0 ? 'Paracetamol 500mg' : 
                    i === 1 ? 'Vitamin C 1000mg' :
                    i === 2 ? 'Omega-3 Fish Oil' :
                    i === 3 ? 'Aspirin 100mg' : 'Multivitamin',
              quantity: Math.floor(Math.random() * 3) + 1,
              price: Math.floor(Math.random() * 100000) + 50000
            }
          ],
          total: Math.floor(Math.random() * 500000) + 100000,
          status: status as any,
          orderDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          shippingAddress: location.address,
          paymentMethod: 'cod' as const,
          paymentStatus: 'pending' as const,
          
          // Enhanced shipping data
          originBranch: branch,
          destinationLocation: {
            latitude: location.latitude,
            longitude: location.longitude,
            address: location.address,
            city: 'Ho Chi Minh City',
            province: 'Ho Chi Minh'
          },
          estimatedDelivery: new Date(Date.now() + Math.random() * 2 * 24 * 60 * 60 * 1000).toISOString(),
          
          // Add shipper assignment for some orders
          ...(status !== 'confirmed' && shippers.length > 0 ? {
            assignedShipperId: shippers[i % shippers.length]?.id,
            assignedShipper: shippers[i % shippers.length]
          } : {}),
          
          // Add delivery confirmation for delivered orders
          ...(status === 'delivered' ? {
            actualDelivery: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
            deliveryProof: {
              photos: ['delivered-photo.jpg'],
              signature: 'Customer signature',
              recipientName: location.customerName,
              notes: 'Package delivered successfully'
            }
          } : {})
        };

        await addOrder(sampleOrder);
      }

      setInitializationStatus('Sample data initialized successfully!');
      
    } catch (error) {
      console.error('Error initializing sample data:', error);
      setInitializationStatus('Error initializing sample data');
    } finally {
      setIsInitializing(false);
    }
  };

  const hasData = customers.length > 0 || orders.length > 0 || shippers.length > 0 || branches.length > 0;

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <div className="flex items-center mb-4">
        <Database className="h-6 w-6 text-blue-600 mr-3" />
        <h3 className="text-lg font-semibold text-gray-900">Sample Data Initializer</h3>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <Building2 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">{branches.length}</p>
          <p className="text-xs text-gray-600">Branches</p>
        </div>
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <Users className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">{shippers.length}</p>
          <p className="text-xs text-gray-600">Shippers</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <Users className="h-8 w-8 text-purple-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">{customers.length}</p>
          <p className="text-xs text-gray-600">Customers</p>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <Package className="h-8 w-8 text-orange-600 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">{orders.length}</p>
          <p className="text-xs text-gray-600">Orders</p>
        </div>
      </div>

      {initializationStatus && (
        <div className={`flex items-center p-3 rounded-lg mb-4 ${
          initializationStatus.includes('Error') 
            ? 'bg-red-50 text-red-700' 
            : initializationStatus.includes('successfully')
            ? 'bg-green-50 text-green-700'
            : 'bg-blue-50 text-blue-700'
        }`}>
          {initializationStatus.includes('Error') ? (
            <AlertCircle className="h-4 w-4 mr-2" />
          ) : initializationStatus.includes('successfully') ? (
            <CheckCircle className="h-4 w-4 mr-2" />
          ) : (
            <MapPin className="h-4 w-4 mr-2 animate-spin" />
          )}
          {initializationStatus}
        </div>
      )}

      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Initialize the system with sample pharmacy branches, shippers, customers, and orders with Vietnam map locations.
        </p>
        
        {hasData && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Sample data already exists. Initializing will add additional sample data.
            </p>
          </div>
        )}

        <button
          onClick={initializeSampleData}
          disabled={isInitializing}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isInitializing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Initializing...
            </>
          ) : (
            <>
              <Database className="h-4 w-4 mr-2" />
              Initialize Sample Data
            </>
          )}
        </button>
      </div>
    </div>
  );
}
