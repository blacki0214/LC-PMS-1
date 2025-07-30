import React, { useState } from 'react';
import { UserService } from '../../services/UserService';
import { useData } from '../../contexts/DataContextWithDB';

export default function TestDatabaseConnection() {
  const [status, setStatus] = useState<string>('Ready to test');
  const [results, setResults] = useState<string[]>([]);
  const { isConnectedToDatabase } = useData();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setStatus('Testing database connection...');
    setResults([]);
    
    addResult(`Database connected: ${isConnectedToDatabase}`);
    
    // Test creating admin account
    try {
      addResult('Creating admin account...');
      const adminResult = await UserService.createUser({
        email: 'admin@longchau.com',
        password: 'admin123',
        name: 'Admin User',
        role: 'manager'
      });
      
      if (adminResult.success) {
        addResult(`✅ Admin created: ${adminResult.user?.id}`);
      } else {
        addResult(`⚠️ Admin creation failed: ${adminResult.error}`);
      }
    } catch (error) {
      addResult(`❌ Admin creation error: ${error}`);
    }

    // Test creating shipper accounts
    const shippers = [
      { email: 'shipper1@longchau.com', name: 'Nguyen Van Duc' },
      { email: 'shipper2@longchau.com', name: 'Tran Van Minh' },
      { email: 'shipper3@longchau.com', name: 'Le Van Nam' }
    ];

    for (const shipper of shippers) {
      try {
        addResult(`Creating ${shipper.email}...`);
        const result = await UserService.createUser({
          email: shipper.email,
          password: 'shipper123',
          name: shipper.name,
          role: 'shipper'
        });
        
        if (result.success) {
          addResult(`✅ ${shipper.email} created: ${result.user?.id}`);
        } else {
          addResult(`⚠️ ${shipper.email} failed: ${result.error}`);
        }
      } catch (error) {
        addResult(`❌ ${shipper.email} error: ${error}`);
      }
    }

    setStatus('Test completed');
  };

  const testLogin = async () => {
    setStatus('Testing login...');
    
    try {
      addResult('Testing shipper1 login...');
      const loginResult = await UserService.loginUser('shipper1@longchau.com', 'shipper123');
      
      if (loginResult.success) {
        addResult(`✅ Login successful: ${loginResult.user?.name} (${loginResult.user?.role})`);
      } else {
        addResult(`❌ Login failed: ${loginResult.error}`);
      }
    } catch (error) {
      addResult(`❌ Login error: ${error}`);
    }

    setStatus('Login test completed');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Database Connection Test</h2>
      
      <div className="mb-4 flex gap-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test User Creation
        </button>
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Test Login
        </button>
      </div>

      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="font-medium">Status: {status}</p>
        <p className="text-sm">Database Connected: {isConnectedToDatabase ? '✅ Yes' : '❌ No'}</p>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
        <div className="text-white mb-2">Console Output:</div>
        {results.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
        {results.length === 0 && <div className="text-gray-500">No output yet...</div>}
      </div>
    </div>
  );
}
