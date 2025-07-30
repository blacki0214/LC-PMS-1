import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  ShieldCheck,
  ShoppingBag,
  Settings,
  Database,
  Truck,
  MapPin,
  UserPlus,
  TestTube
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['pharmacist', 'manager', 'customer'] },
    { name: 'Prescriptions', href: '/prescriptions', icon: FileText, roles: ['pharmacist', 'manager', 'customer'] },
    { name: 'Inventory', href: '/inventory', icon: Package, roles: ['pharmacist', 'manager'] },
    { name: 'Orders', href: '/orders', icon: ShoppingCart, roles: ['pharmacist', 'manager', 'customer'] },
    { name: 'Track Orders', href: '/shipping/track', icon: MapPin, roles: ['customer'] },
    { name: 'Manage Shipping', href: '/shipping/manage', icon: Truck, roles: ['pharmacist', 'manager'] },
    { name: 'Shop', href: '/customers', icon: ShoppingBag, roles: ['customer'] },
    { name: 'Customers', href: '/customers', icon: Users, roles: ['pharmacist', 'manager'] },
    { name: 'Reports', href: '/reports', icon: BarChart3, roles: ['manager'] },
    { name: 'Create Shippers', href: '/admin/create-shippers', icon: UserPlus, roles: ['manager'] },
    { name: 'Create Profiles', href: '/admin/create-profiles', icon: Truck, roles: ['manager'] },
    { name: 'Migrate Database', href: '/admin/migrate-db', icon: Database, roles: ['manager'] },
    { name: 'Test Database', href: '/admin/test-db', icon: TestTube, roles: ['manager'] },
    { name: 'Address Lookup', href: '/admin/address-lookup', icon: MapPin, roles: ['manager'] },
    { name: 'Database Setup', href: '/setup', icon: Database, roles: ['manager'] },
  ];

  const filteredNavigation = navigation.filter(item => 
    item.roles.includes(user?.role || '')
  );

  return (
    <div className="bg-white w-64 border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Long Chau</h1>
            <p className="text-sm text-gray-500">PMS</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {filteredNavigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-900 mb-1">Need Help?</p>
          <p className="text-xs text-gray-600 mb-3">Contact system administrator for assistance</p>
          <button className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors">
            Get Support
          </button>
        </div>
      </div>
    </div>
  );
}