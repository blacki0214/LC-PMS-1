import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { 
  Database, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  ArrowUpCircle
} from 'lucide-react';

interface StorageStatusProps {
  compact?: boolean;
}

export default function StorageStatus({ compact = false }: StorageStatusProps) {
  const { 
    isConnectedToDatabase, 
    getPendingOperationsCount, 
    syncPendingOperations,
    forceReconnectDatabase
  } = useData();
  
  const [pendingCount, setPendingCount] = useState(0);
  const [isSync, setIsSync] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<string>('');

  useEffect(() => {
    const updatePendingCount = () => {
      setPendingCount(getPendingOperationsCount());
    };

    // Update every 2 seconds
    updatePendingCount();
    const interval = setInterval(updatePendingCount, 2000);
    return () => clearInterval(interval);
  }, [getPendingOperationsCount]);

  const handleSync = async () => {
    setIsSync(true);
    try {
      const result = await syncPendingOperations();
      if (result.success) {
        if (result.stored === 'database') {
          setLastSyncResult('All data synced to database successfully!');
        } else {
          setLastSyncResult(`Partial sync: ${result.error}`);
        }
      } else {
        setLastSyncResult('Sync failed. Data stored locally.');
      }
      setPendingCount(getPendingOperationsCount());
    } catch (error) {
      setLastSyncResult('Sync error occurred.');
    } finally {
      setIsSync(false);
      setTimeout(() => setLastSyncResult(''), 3000);
    }
  };

  const handleReconnect = async () => {
    setIsSync(true);
    try {
      await forceReconnectDatabase();
    } finally {
      setIsSync(false);
    }
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {isConnectedToDatabase ? (
          <div className="flex items-center space-x-1 text-green-600">
            <Database className="h-4 w-4" />
            <span className="text-xs font-medium">DB Connected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-orange-600">
            <WifiOff className="h-4 w-4" />
            <span className="text-xs font-medium">Local Storage</span>
            {pendingCount > 0 && (
              <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full text-xs font-medium">
                {pendingCount}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${
            isConnectedToDatabase 
              ? 'bg-green-100 text-green-600' 
              : 'bg-orange-100 text-orange-600'
          }`}>
            {isConnectedToDatabase ? (
              <Database className="h-5 w-5" />
            ) : (
              <WifiOff className="h-5 w-5" />
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900">
              {isConnectedToDatabase ? 'Database Connected' : 'Database Offline'}
            </h3>
            <p className="text-sm text-gray-600">
              {isConnectedToDatabase 
                ? 'All data is being stored in the database'
                : `Data is stored locally${pendingCount > 0 ? ` (${pendingCount} operations pending)` : ''}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isConnectedToDatabase && (
            <button
              onClick={handleReconnect}
              disabled={isSync}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isSync ? 'animate-spin' : ''}`} />
              <span>Reconnect</span>
            </button>
          )}
          
          {pendingCount > 0 && (
            <button
              onClick={handleSync}
              disabled={isSync}
              className="flex items-center space-x-1 bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 text-sm"
            >
              <ArrowUpCircle className={`h-4 w-4 ${isSync ? 'animate-spin' : ''}`} />
              <span>Sync ({pendingCount})</span>
            </button>
          )}
        </div>
      </div>

      {lastSyncResult && (
        <div className={`mt-3 p-2 rounded-lg text-sm ${
          lastSyncResult.includes('successfully') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-orange-50 text-orange-700 border border-orange-200'
        }`}>
          <div className="flex items-center space-x-2">
            {lastSyncResult.includes('successfully') ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            <span>{lastSyncResult}</span>
          </div>
        </div>
      )}

      {/* Database Status Details */}
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center space-x-2">
          {isConnectedToDatabase ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500" />
          )}
          <span className="text-gray-600">
            Connection: <span className={isConnectedToDatabase ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {isConnectedToDatabase ? 'Active' : 'Offline'}
            </span>
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-gray-400" />
          <span className="text-gray-600">
            Pending: <span className={pendingCount > 0 ? 'text-orange-600 font-medium' : 'text-green-600 font-medium'}>
              {pendingCount} operations
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
