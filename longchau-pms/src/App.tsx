import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContextWithDB';
import { NotificationProvider } from './contexts/NotificationContext';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';
import PrescriptionManagement from './components/prescriptions/PrescriptionManagementWorking';
import InventoryManagement from './components/inventory/InventoryManagement';
import OrderManagement from './components/orders/OrderManagement';
import CustomerManagement from './components/customers/CustomerManagement';
import Reports from './components/reports/Report';
import Layout from './components/layout/Layout';
import DatabaseConnectionIndicator from './components/common/DatabaseConnectionIndicator';
import DatabaseLoading from './components/common/DatabaseLoading';
import DatabaseError from './components/common/DatabaseError';
import NeonSetupGuide from './components/setup/NeonSetupGuide';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();
  const { isLoading, isConnectedToDatabase, forceReconnectDatabase } = useData();

  // Show loading screen while connecting to database
  if (isLoading) {
    return <DatabaseLoading message="Loading pharmacy data from database..." />;
  }

  // Show error screen if database connection failed completely
  if (!isConnectedToDatabase) {
    return (
      <DatabaseError 
        onRetry={forceReconnectDatabase}
        error="Failed to connect to Neon PostgreSQL database"
      />
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/prescriptions" element={<PrescriptionManagement />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/setup" element={<NeonSetupGuide />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <DatabaseConnectionIndicator />
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <NotificationProvider>
          <Router>
            <div className="App">
              <AppRoutes />
            </div>
          </Router>
        </NotificationProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;