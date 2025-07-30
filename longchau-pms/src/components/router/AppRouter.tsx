import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import Layout from '../layout/Layout';
import Dashboard from '../dashboard/Dashboard';
import CustomerManagement from '../customers/CustomerManagement';
import InventoryManagement from '../inventory/InventoryManagement';
import OrderManagement from '../orders/OrderManagement';
import PrescriptionManagement from '../prescriptions/PrescriptionManagement';
import ShippingManagementEnhanced from '../shipping/ShippingManagementEnhanced';
import ShipperDashboard from '../shipper/ShipperDashboard';
import ShipperLogin from '../auth/ShipperLogin';
import Report from '../reports/Report';

interface AppRouterProps {
  currentView: string;
}

export default function AppRouter({ currentView }: AppRouterProps) {
  const { user, logout } = useAuth();
  const { shippers } = useData();
  const [showShipperLogin, setShowShipperLogin] = useState(false);

  // Check if current user is a shipper
  const currentShipper = user ? shippers.find(s => s.userId === user.id) : null;
  const isShipperUser = currentShipper !== undefined;

  // Handle shipper login success
  const handleShipperLoginSuccess = () => {
    setShowShipperLogin(false);
    // User is now authenticated as a shipper
  };

  // Show shipper login if requested
  if (showShipperLogin) {
    return <ShipperLogin onLoginSuccess={handleShipperLoginSuccess} />;
  }

  // Show shipper dashboard if user is a shipper
  if (isShipperUser) {
    return <ShipperDashboard />;
  }

  // Regular admin/staff interface
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Long Chau PMS</h1>
          <p className="text-blue-100 mb-8">Pharmacy Management System</p>
          <div className="space-y-4">
            <button
              onClick={() => setShowShipperLogin(true)}
              className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Shipper Login
            </button>
            <p className="text-sm text-blue-200">
              Staff and admin login through regular authentication
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'customers':
        return <CustomerManagement />;
      case 'inventory':
        return <InventoryManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'prescriptions':
        return <PrescriptionManagement />;
      case 'shipping':
        return <ShippingManagementEnhanced />;
      case 'reports':
        return <Report />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
}
