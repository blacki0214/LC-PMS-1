import React, { useState } from 'react';
import { DatabaseService } from '../../lib/database';

export default function DatabaseDebug() {
  const [testResult, setTestResult] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const testDatabaseConnection = async () => {
    setIsLoading(true);
    setTestResult('Testing database connection...\n');
    
    try {
      // Check environment variables
      const envCheck = {
        viteDatabaseUrl: import.meta.env?.VITE_DATABASE_URL ? 'Present' : 'Missing',
        nodeEnv: import.meta.env.NODE_ENV,
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD
      };
      
      setTestResult(prev => prev + `Environment Variables:\n${JSON.stringify(envCheck, null, 2)}\n\n`);
      
      // Test health check
      setTestResult(prev => prev + 'Testing database health check...\n');
      const healthCheck = await DatabaseService.healthCheck();
      setTestResult(prev => prev + `Health check result: ${healthCheck ? 'SUCCESS' : 'FAILED'}\n\n`);
      
      if (healthCheck) {
        // Test product creation
        setTestResult(prev => prev + 'Testing product creation...\n');
        const testProduct = {
          id: `browser-test-${Date.now()}`,
          name: 'Browser Test Product',
          description: 'Test product created from browser',
          category: 'Medicines',
          price: '25000',
          stock: 50,
          minStock: 5,
          manufacturer: 'Test Manufacturer',
          expiryDate: '2025-12-31',
          requiresPrescription: false,
          batchNumber: `BATCH-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        const result = await DatabaseService.createProduct(testProduct);
        
        if (result) {
          setTestResult(prev => prev + `✅ Product created successfully!\nID: ${result.id}\nName: ${result.name}\n\n`);
          
          // Verify by fetching
          const products = await DatabaseService.getAllProducts();
          setTestResult(prev => prev + `📊 Total products in database: ${products.length}\n`);
          
          const found = products.find((p: any) => p.id === testProduct.id);
          setTestResult(prev => prev + `🔍 Test product found: ${found ? 'YES' : 'NO'}\n`);
        } else {
          setTestResult(prev => prev + '❌ Product creation failed - no result returned\n');
        }
      }
      
    } catch (error: any) {
      setTestResult(prev => prev + `❌ Error: ${error?.message || error}\n`);
      console.error('Database test error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm border">
      <h2 className="text-xl font-bold mb-4">Database Connection Test</h2>
      
      <button
        onClick={testDatabaseConnection}
        disabled={isLoading}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {isLoading ? 'Testing...' : 'Test Database Connection'}
      </button>
      
      {testResult && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Test Results:</h3>
          <pre className="text-sm whitespace-pre-wrap text-gray-800">
            {testResult}
          </pre>
        </div>
      )}
    </div>
  );
}
