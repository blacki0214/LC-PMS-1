import React from 'react';
import { Database, AlertTriangle, RefreshCw, Wifi } from 'lucide-react';

interface DatabaseErrorProps {
  onRetry: () => void;
  error?: string;
}

export default function DatabaseError({ onRetry, error }: DatabaseErrorProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Error Icon */}
          <div className="relative mb-6">
            <Database className="h-16 w-16 text-gray-400 mx-auto" />
            <AlertTriangle className="h-6 w-6 text-red-500 absolute top-0 right-6" />
          </div>
          
          {/* Error Message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Database Connection Failed
          </h2>
          <p className="text-gray-600 mb-6">
            Unable to connect to the database. The application requires a database connection to function.
          </p>
          
          {/* Error Details */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-red-700 font-mono">
                {error}
              </p>
            </div>
          )}
          
          {/* Retry Button */}
          <button
            onClick={onRetry}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2 mb-4"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry Connection</span>
          </button>
          
          {/* Help Text */}
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <h3 className="font-medium text-gray-900 mb-2 flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              Troubleshooting
            </h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Check your internet connection</li>
              <li>• Verify database credentials</li>
              <li>• Ensure database server is running</li>
              <li>• Contact administrator if problem persists</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
