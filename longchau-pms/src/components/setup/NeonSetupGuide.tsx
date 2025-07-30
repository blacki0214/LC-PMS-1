import React, { useState } from 'react';
import { ExternalLink, Copy, Check, Database, ArrowRight } from 'lucide-react';

export default function NeonSetupGuide() {
  const [copiedStep, setCopiedStep] = useState<number | null>(null);

  const copyToClipboard = (text: string, step: number) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const steps = [
    {
      id: 1,
      title: 'Create a Neon Account',
      description: 'Sign up for a free Neon database account',
      action: 'Go to neon.tech',
      url: 'https://neon.tech',
      copyText: null
    },
    {
      id: 2,
      title: 'Create a New Project',
      description: 'Create a new PostgreSQL project in your Neon dashboard',
      action: 'Click "Create Project"',
      copyText: null
    },
    {
      id: 3,
      title: 'Get Connection String',
      description: 'Copy your database connection string from the dashboard',
      action: 'Copy the connection string',
      copyText: 'postgresql://username:password@ep-example.us-east-2.aws.neon.tech/dbname?sslmode=require'
    },
    {
      id: 4,
      title: 'Update Environment Variables',
      description: 'Add your connection string to the .env file',
      action: 'Update VITE_DATABASE_URL',
      copyText: 'VITE_DATABASE_URL=your_neon_connection_string_here'
    },
    {
      id: 5,
      title: 'Generate and Push Schema',
      description: 'Create database tables using Drizzle migrations',
      action: 'Run migration commands',
      copyText: 'npm run db:generate && npm run db:push'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-lg">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Database className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">Neon Database Setup</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Connect your Long Châu PMS to Neon PostgreSQL database in 5 easy steps
        </p>
      </div>

      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start space-x-4 p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                {step.id}
              </div>
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-gray-600 mb-4">{step.description}</p>
              
              <div className="flex items-center space-x-3">
                {step.url && (
                  <a
                    href={step.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>{step.action}</span>
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                )}
                
                {step.copyText && (
                  <button
                    onClick={() => copyToClipboard(step.copyText!, step.id)}
                    className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    {copiedStep === step.id ? (
                      <>
                        <Check className="h-4 w-4 mr-2 text-green-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        <span>{step.action}</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              
              {step.copyText && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <code className="text-sm text-gray-800 font-mono break-all">
                    {step.copyText}
                  </code>
                </div>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div className="flex-shrink-0 mt-4">
                <ArrowRight className="h-5 w-5 text-gray-400" />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">After Setup</h3>
        <p className="text-blue-800 mb-4">
          Once connected, your Long Châu PMS will automatically:
        </p>
        <ul className="list-disc list-inside text-blue-800 space-y-1">
          <li>Store all customer data securely in Neon PostgreSQL</li>
          <li>Persist prescriptions, orders, and inventory data</li>
          <li>Enable real-time data synchronization</li>
          <li>Provide automatic backups and scaling</li>
        </ul>
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-800 text-sm">
          <strong>Note:</strong> The application will work with mock data until the database is properly configured. 
          Look for the connection indicator in the bottom-right corner.
        </p>
      </div>
    </div>
  );
}
