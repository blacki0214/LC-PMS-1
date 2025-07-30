import React from 'react';
import { Database, Loader2 } from 'lucide-react';

interface DatabaseLoadingProps {
  message?: string;
}

export default function DatabaseLoading({ message = "Loading data from database..." }: DatabaseLoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 max-w-md w-full mx-4">
        <div className="text-center">
          {/* Animated Database Icon */}
          <div className="relative mb-6">
            <Database className="h-16 w-16 text-blue-600 mx-auto" />
            <Loader2 className="h-6 w-6 text-blue-400 absolute top-0 right-6 animate-spin" />
          </div>
          
          {/* Loading Message */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Long Chau PMS
          </h2>
          <p className="text-gray-600 mb-6">
            {message}
          </p>
          
          {/* Animated Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
          
          {/* Status Text */}
          <p className="text-sm text-gray-500">
            Connecting to Neon PostgreSQL database...
          </p>
          
          {/* Loading Dots Animation */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
