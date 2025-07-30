import React, { useState } from 'react';
import { UserService } from '../../services/UserService';
import { Truck, UserPlus, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function CreateShipperAccounts() {
  const [isCreating, setIsCreating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [results, setResults] = useState<Array<{email: string, success: boolean, message: string}>>([]);

  const createShipperAccounts = async () => {
    setIsCreating(true);
    setStatus('Creating shipper accounts...');
    setResults([]);

    const shipperAccounts = [
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

    const newResults: Array<{email: string, success: boolean, message: string}> = [];

    for (const accountData of shipperAccounts) {
      try {
        setStatus(`Creating account for ${accountData.email}...`);
        const result = await UserService.createUser(accountData);
        
        if (result.success) {
          newResults.push({
            email: accountData.email,
            success: true,
            message: `Account created successfully! User ID: ${result.user?.id}`
          });
        } else {
          newResults.push({
            email: accountData.email,
            success: false,
            message: result.error || 'Unknown error'
          });
        }
      } catch (error) {
        newResults.push({
          email: accountData.email,
          success: false,
          message: error instanceof Error ? error.message : 'Failed to create account'
        });
      }
      
      setResults([...newResults]);
    }

    setStatus('Account creation completed!');
    setIsCreating(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <div className="mx-auto h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Truck className="h-6 w-6 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Shipper Accounts</h2>
        <p className="text-gray-600">Add shipper user accounts to the database</p>
      </div>

      <button
        onClick={createShipperAccounts}
        disabled={isCreating}
        className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-6"
      >
        {isCreating ? (
          <>
            <Loader2 className="animate-spin h-5 w-5 mr-2" />
            Creating Accounts...
          </>
        ) : (
          <>
            <UserPlus className="h-5 w-5 mr-2" />
            Create Shipper Accounts
          </>
        )}
      </button>

      {status && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">{status}</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-900 mb-3">Results:</h3>
          {results.map((result, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg border ${
                result.success
                  ? 'bg-green-50 border-green-200'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                )}
                <div>
                  <p className={`font-medium text-sm ${
                    result.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {result.email}
                  </p>
                  <p className={`text-xs mt-1 ${
                    result.success ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {result.message}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Account Details:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• shipper1@longchau.com - Nguyen Van Duc</p>
          <p>• shipper2@longchau.com - Tran Van Minh</p>
          <p>• shipper3@longchau.com - Le Van Nam</p>
          <p className="mt-2 font-medium">Password for all accounts: shipper123</p>
        </div>
      </div>
    </div>
  );
}
