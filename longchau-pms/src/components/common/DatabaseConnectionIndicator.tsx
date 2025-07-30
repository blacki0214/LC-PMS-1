import React from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { Database, Wifi, WifiOff } from 'lucide-react';

export default function DatabaseConnectionIndicator() {
  const { isConnectedToDatabase } = useData();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg ${
        isConnectedToDatabase 
          ? 'bg-green-500 text-white' 
          : 'bg-orange-500 text-white'
      }`}>
        {isConnectedToDatabase ? (
          <>
            <Database className="h-4 w-4" />
            <Wifi className="h-4 w-4" />
            <span className="text-sm font-medium">Neon DB Connected</span>
          </>
        ) : (
          <>
            <Database className="h-4 w-4" />
            <WifiOff className="h-4 w-4" />
            <span className="text-sm font-medium">Using Mock Data</span>
          </>
        )}
      </div>
    </div>
  );
}
