import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { UserService } from '../../services/UserService';
import { Truck, CheckCircle, AlertCircle } from 'lucide-react';

export default function CreateShipperProfiles() {
  const { addShipper, shippers, branches } = useData();
  const [isCreating, setIsCreating] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const createShipperProfiles = async () => {
    setIsCreating(true);
    setResults([]);
    
    try {
      // Get all users to find shipper accounts
      const allUsers = await UserService.getAllUsers();
      const shipperUsers = allUsers.filter(user => user.role === 'shipper');
      
      addResult(`Found ${shipperUsers.length} shipper user accounts`);
      
      if (shipperUsers.length === 0) {
        addResult('❌ No shipper user accounts found. Please create them first.');
        setIsCreating(false);
        return;
      }

      // Create shipper profiles for each user account
      const shipperProfilesData = [
        {
          email: 'shipper1@longchau.com',
          name: 'Nguyen Van Duc',
          phone: '+84 90 123 4567',
          vehicleType: 'motorcycle' as const,
          vehicleNumber: '59A1-12345',
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
          emergencyContact: {
            name: 'Nguyen Thi Mai',
            phone: '+84 90 987 6543',
            relationship: 'spouse'
          }
        },
        {
          email: 'shipper2@longchau.com',
          name: 'Tran Van Minh',
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
          rating: 4.7,
          totalDeliveries: 189,
          emergencyContact: {
            name: 'Tran Thi Hoa',
            phone: '+84 91 876 5432',
            relationship: 'spouse'
          }
        },
        {
          email: 'shipper3@longchau.com',
          name: 'Le Van Nam',
          phone: '+84 92 345 6789',
          vehicleType: 'motorcycle' as const,
          vehicleNumber: '59B1-54321',
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
          emergencyContact: {
            name: 'Le Van Long',
            phone: '+84 92 876 5432',
            relationship: 'brother'
          }
        }
      ];

      for (const profileData of shipperProfilesData) {
        try {
          // Find the matching user account
          const matchingUser = shipperUsers.find(user => user.email === profileData.email);
          
          if (!matchingUser) {
            addResult(`⚠️ No user account found for ${profileData.email}`);
            continue;
          }

          // Check if shipper profile already exists
          const existingShipper = shippers.find(s => s.userId === matchingUser.id);
          if (existingShipper) {
            addResult(`⚠️ Shipper profile already exists for ${profileData.email}`);
            continue;
          }

          // Create the shipper profile
          const shipperData = {
            ...profileData,
            userId: matchingUser.id,
            branchId: branches[0]?.id || undefined // Assign to first branch
          };

          await addShipper(shipperData);
          addResult(`✅ Created shipper profile for ${profileData.email} (${matchingUser.id})`);
          
        } catch (error) {
          addResult(`❌ Error creating profile for ${profileData.email}: ${error}`);
        }
      }

      addResult('🎉 Shipper profile creation completed!');
      
    } catch (error) {
      addResult(`❌ Error: ${error}`);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <Truck className="h-6 w-6 mr-3 text-blue-500" />
        Create Shipper Profiles
      </h2>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 mb-2">
          This tool creates shipper profiles linked to existing user accounts.
        </p>
        <p className="text-blue-700 text-sm">
          Make sure shipper user accounts exist before running this tool.
        </p>
      </div>

      <div className="mb-4">
        <button
          onClick={createShipperProfiles}
          disabled={isCreating}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isCreating ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
              Creating Profiles...
            </>
          ) : (
            <>
              <Truck className="h-5 w-5 mr-2" />
              Create Shipper Profiles
            </>
          )}
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
        <div className="text-white mb-2">Console Output:</div>
        {results.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
        {results.length === 0 && <div className="text-gray-500">No output yet...</div>}
      </div>

      {/* Current Shipper Status */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Current Status:</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span>Shippers: {shippers.length} profiles</span>
          </div>
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-blue-500 mr-2" />
            <span>Branches: {branches.length} locations</span>
          </div>
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-yellow-500 mr-2" />
            <span>Ready to create profiles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
