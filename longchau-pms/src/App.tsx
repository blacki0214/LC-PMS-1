import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DataProvider, useData } from './contexts/DataContextWithDB';
import { NotificationProvider } from './contexts/NotificationContext';
import { ActivityProvider } from './contexts/ActivityContext';
import Login from './components/auth/Login';
import ChangePassword from './components/auth/ChangePassword';
import Dashboard from './components/dashboard/Dashboard';
import PrescriptionManagement from './components/prescriptions/PrescriptionManagementWorking';
import InventoryManagement from './components/inventory/InventoryManagement';
import OrderManagement from './components/orders/OrderManagement';
import CustomerManagement from './components/customers/CustomerManagement';
import Reports from './components/reports/Report';
import ShippingTracker from './components/shipping/ShippingTracker';
import ShippingManagement from './components/shipping/ShippingManagement';
import ShipperDashboard from './components/shipper/ShipperDashboard';
import CreateShipperAccounts from './components/admin/CreateShipperAccounts';
import CreateShipperProfiles from './components/admin/CreateShipperProfiles';
import ProductSeeder from './components/admin/ProductSeeder';
import DatabaseMigration from './components/admin/DatabaseMigration';
import TestDatabaseConnection from './components/admin/TestDatabaseConnection';
import AddressLookup from './components/admin/AddressLookup';
import Layout from './components/layout/Layout';
import DatabaseConnectionIndicator from './components/common/DatabaseConnectionIndicator';
import DatabaseLoading from './components/common/DatabaseLoading';
import DatabaseError from './components/common/DatabaseError';
import NeonSetupGuide from './components/setup/NeonSetupGuide';
import SampleDataInitializer from './components/utils/SampleDataInitializer';
import './App.css';

function AppRoutes() {
  const { user } = useAuth();
  const { isLoading, isConnectedToDatabase, forceReconnectDatabase } = useData();

  // Special public route for database testing
  if (window.location.pathname === '/test-db-public') {
    return <TestDatabaseConnection />;
  }

  // Special public route for sample data initialization
  if (window.location.pathname === '/init-data-public') {
    return <SampleDataInitializer />;
  }

  // Special public route for creating shipper profiles
  if (window.location.pathname === '/create-profiles-public') {
    return <CreateShipperProfiles />;
  }

  // Special public route for database migration
  if (window.location.pathname === '/migrate-db-public') {
    return <DatabaseMigration />;
  }

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

  // Route shippers to their dedicated dashboard
  if (user.role === 'shipper') {
    return <ShipperDashboard />;
  }

  return (
    <Layout>
      <SampleDataInitializer />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/prescriptions" element={<PrescriptionManagement />} />
        <Route path="/inventory" element={<InventoryManagement />} />
        <Route path="/orders" element={<OrderManagement />} />
        <Route path="/shipping/track" element={<ShippingTracker />} />
        <Route path="/shipping/manage" element={<ShippingManagement />} />
        <Route path="/customers" element={<CustomerManagement />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/admin/create-shippers" element={<CreateShipperAccounts />} />
        <Route path="/admin/create-profiles" element={<CreateShipperProfiles />} />
        <Route path="/admin/seed-products" element={<ProductSeeder />} />
        <Route path="/admin/migrate-db" element={<DatabaseMigration />} />
        <Route path="/admin/test-db" element={<TestDatabaseConnection />} />
        <Route path="/admin/address-lookup" element={<AddressLookup />} />
        <Route path="/change-password" element={<ChangePassword />} />
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
        <ActivityProvider>
          <NotificationProvider>
            <Router>
              <div className="App">
                <AppRoutes />
              </div>
            </Router>
          </NotificationProvider>
        </ActivityProvider>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;