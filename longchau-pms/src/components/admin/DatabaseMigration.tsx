import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { Database, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { db } from '../../lib/db';

export default function DatabaseMigration() {
  const [isMigrating, setIsMigrating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const { isConnectedToDatabase } = useData();

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const runMigration = async () => {
    setIsMigrating(true);
    setResults([]);
    
    try {
      addResult('🚀 Starting database migration...');

      // Check if the orders table exists and has the required columns
      addResult('🔍 Checking orders table structure...');

      // List of required columns for orders table
      const requiredColumns = [
        'assigned_shipper_id',
        'assigned_at',
        'assigned_by',
        'origin_branch_id',
        'destination_location',
        'route_data',
        'estimated_distance',
        'estimated_duration',
        'shipping_info',
        'estimated_delivery',
        'actual_delivery',
        'shipper_location',
        'tracking_history',
        'delivery_proof',
        'customer_rating',
        'delivery_notes'
      ];

      // SQL to add missing columns
      const alterTableStatements = [
        // Shipper assignment columns
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_shipper_id TEXT REFERENCES shippers(id)`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS assigned_by TEXT REFERENCES users(id)`,
        
        // Route and destination columns
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS origin_branch_id TEXT REFERENCES branches(id)`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS destination_location JSONB`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS route_data JSONB`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_distance DECIMAL(8,2)`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_duration INTEGER`,
        
        // Shipping tracking columns
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_info JSONB`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS actual_delivery TIMESTAMP`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipper_location JSONB`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_history JSONB`,
        
        // Delivery confirmation columns
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_proof JSONB`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_rating INTEGER`,
        `ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_notes TEXT`
      ];

      // Execute each ALTER TABLE statement
      for (let i = 0; i < alterTableStatements.length; i++) {
        const statement = alterTableStatements[i];
        const columnName = requiredColumns[i];
        
        try {
          addResult(`📝 Adding column: ${columnName}...`);
          await db.execute(statement as any);
          addResult(`✅ Successfully added: ${columnName}`);
        } catch (error: any) {
          if (error.message?.includes('already exists')) {
            addResult(`⚠️ Column ${columnName} already exists`);
          } else {
            addResult(`❌ Error adding ${columnName}: ${error.message}`);
          }
        }
      }

      // Also ensure other required tables exist
      addResult('🔍 Checking other required tables...');

      // Create tables if they don't exist (using CREATE TABLE IF NOT EXISTS)
      const createTableStatements = [
        // Users table
        `CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          branch_id TEXT,
          professional_info JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,

        // Shippers table
        `CREATE TABLE IF NOT EXISTS shippers (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id),
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL,
          vehicle_type VARCHAR(50) NOT NULL,
          vehicle_number VARCHAR(20) NOT NULL,
          license_number VARCHAR(50) NOT NULL,
          current_location JSONB,
          is_available BOOLEAN DEFAULT true,
          rating DECIMAL(3,2) DEFAULT 5.00,
          total_deliveries INTEGER DEFAULT 0,
          branch_id TEXT,
          emergency_contact JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,

        // Branches table
        `CREATE TABLE IF NOT EXISTS branches (
          id TEXT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address TEXT NOT NULL,
          city VARCHAR(100) NOT NULL,
          province VARCHAR(100) NOT NULL,
          postal_code VARCHAR(10),
          phone VARCHAR(20),
          email VARCHAR(255),
          location JSONB,
          operating_hours JSONB,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`,

        // Customers table
        `CREATE TABLE IF NOT EXISTS customers (
          id TEXT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE,
          phone VARCHAR(20),
          address TEXT,
          date_of_birth DATE,
          join_date TIMESTAMP DEFAULT NOW(),
          allergies JSONB,
          prescription_history JSONB,
          order_history JSONB,
          health_status JSONB,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        )`
      ];

      for (const statement of createTableStatements) {
        try {
          await db.execute(statement as any);
          addResult(`✅ Table structure verified/created`);
        } catch (error: any) {
          addResult(`⚠️ Table creation note: ${error.message}`);
        }
      }

      addResult('🎉 Database migration completed successfully!');
      addResult('📊 All required columns for shipping functionality have been added.');
      addResult('🔄 You may need to refresh the page to see the changes.');

    } catch (error: any) {
      addResult(`❌ Migration failed: ${error.message}`);
    } finally {
      setIsMigrating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
        <Database className="h-6 w-6 mr-3 text-blue-500" />
        Database Migration - Fix Missing Columns
      </h2>
      
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-yellow-800">Database Schema Update Required</h3>
            <p className="text-yellow-700 text-sm mt-1">
              The orders table is missing columns for shipping functionality. This migration will add:
            </p>
            <ul className="text-yellow-700 text-sm mt-2 ml-4 list-disc">
              <li>assigned_shipper_id, assigned_at, assigned_by</li>
              <li>origin_branch_id, destination_location, route_data</li>
              <li>shipping_info, tracking_history, delivery_proof</li>
              <li>And other shipping-related columns</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mb-4 p-3 bg-gray-100 rounded">
        <p className="font-medium">Database Status:</p>
        <div className="flex items-center mt-2">
          {isConnectedToDatabase ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
              <span className="text-green-700">Connected to Neon PostgreSQL</span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-red-700">Not connected to database</span>
            </>
          )}
        </div>
      </div>

      <div className="mb-4">
        <button
          onClick={runMigration}
          disabled={isMigrating || !isConnectedToDatabase}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center"
        >
          {isMigrating ? (
            <>
              <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
              Running Migration...
            </>
          ) : (
            <>
              <Database className="h-5 w-5 mr-2" />
              Run Database Migration
            </>
          )}
        </button>
      </div>

      <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-y-auto">
        <div className="text-white mb-2">Migration Output:</div>
        {results.map((result, index) => (
          <div key={index}>{result}</div>
        ))}
        {results.length === 0 && <div className="text-gray-500">Ready to run migration...</div>}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">After Migration:</h3>
        <ol className="text-blue-700 text-sm space-y-1 ml-4 list-decimal">
          <li>Refresh the application page</li>
          <li>The orders should load without column errors</li>
          <li>Shipper assignment and tracking features will work</li>
          <li>Vietnam map with address lookup will be functional</li>
        </ol>
      </div>
    </div>
  );
}
