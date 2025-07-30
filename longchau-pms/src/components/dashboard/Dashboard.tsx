import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { useNotifications } from '../../contexts/NotificationContext';
import { useActivity, Activity } from '../../contexts/ActivityContext';
import StorageStatus from '../common/StorageStatus';
import {
  FileText,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  Activity as ActivityIcon,
  Heart,
  Pill,
  CreditCard,
  Calendar,
  Star,
  Zap,
  RefreshCw,
  LucideIcon
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const { products, prescriptions, orders, customers } = useData();
  const { addNotification } = useNotifications();
  const { getRecentActivities } = useActivity();
  const [liveStats, setLiveStats] = useState({
    onlineUsers: 1, // At least the current user
    activeOrders: 0,
    systemLoad: 0,
    uptime: 0
  });

  // Get real activities from the activity context
  const recentActivities = getRecentActivities(8);

  // Calculate real stats from actual data
  useEffect(() => {
    const activeOrdersCount = orders.filter(order => 
      order.status === 'pending' || order.status === 'confirmed' || order.status === 'assigned'
    ).length;

    setLiveStats({
      onlineUsers: 1, // Current user (could be expanded to track multiple sessions)
      activeOrders: activeOrdersCount,
      systemLoad: Math.random() * 50 + 25, // Simulated system load
      uptime: Math.floor(Date.now() / 1000 / 60) % 1440 // Minutes since midnight
    });
  }, [orders]);

  // Helper function to get activity display properties
  const getActivityDisplay = (activity: Activity) => {
    const typeMap: Record<string, { icon: LucideIcon; color: string }> = {
      prescription: { icon: FileText, color: 'text-blue-500' },
      product: { icon: Package, color: 'text-green-500' },
      order: { icon: ShoppingCart, color: 'text-purple-500' },
      customer: { icon: Users, color: 'text-orange-500' },
      user: { icon: Users, color: 'text-indigo-500' },
      system: { icon: ActivityIcon, color: 'text-gray-500' }
    };
    
    const display = typeMap[activity.type] || { icon: ActivityIcon, color: 'text-gray-500' };
    
    // Format timestamp to relative time
    const now = new Date();
    const activityTime = new Date(activity.timestamp);
    const diffMs = now.getTime() - activityTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    let timeString;
    if (diffMins < 1) {
      timeString = 'Just now';
    } else if (diffMins < 60) {
      timeString = `${diffMins}m ago`;
    } else if (diffHours < 24) {
      timeString = `${diffHours}h ago`;
    } else {
      timeString = `${diffDays}d ago`;
    }
    
    return {
      ...display,
      timeString
    };
  };

  // Calculate real business metrics
  const pendingPrescriptions = prescriptions.filter((p: any) => p.status === 'pending').length;
  const lowStockProducts = products.filter((p: any) => p.stock <= p.minStock).length;
  const totalRevenue = orders.reduce((sum: number, order: any) => sum + order.total, 0);
  const activeCustomers = customers.length;

  // Different stats for customers vs staff
  const stats = user?.role === 'customer' ? [
    {
      name: 'My Orders',
      value: orders.filter(o => o.customerId === user.id).length,
      icon: ShoppingCart,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      name: 'My Prescriptions',
      value: prescriptions.filter(p => p.customerId === user.id).length,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    },
    {
      name: 'Loyalty Points',
      value: '2,450',
      icon: Star,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      name: 'Next Refill',
      value: '3 days',
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    }
  ] : [
    {
      name: 'Pending Prescriptions',
      value: pendingPrescriptions,
      icon: FileText,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      name: 'Low Stock Items',
      value: lowStockProducts,
      icon: AlertTriangle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700'
    },
    {
      name: 'Total Revenue',
      value: `₫${totalRevenue.toLocaleString()}`,
      icon: TrendingUp,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      name: 'Active Customers',
      value: activeCustomers,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            {user?.role === 'customer' 
              ? "Here's your health and order overview." 
              : "Here's what's happening at Long Chau Pharmacy today."
            }
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Today Date</p>
          <p className="text-lg font-semibold text-gray-900">
            {new Date().toLocaleDateString('vi-VN')}
          </p>
          <div className="flex items-center justify-end space-x-2 mt-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-600">Live</span>
          </div>
        </div>
      </div>

      {/* Database Storage Status */}
      <StorageStatus />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Activities */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ActivityIcon className="h-5 w-5 mr-2 text-blue-500" />
              Live Activity Feed
            </h3>
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />
              <span className="text-xs text-gray-500">Auto-updating</span>
            </div>
          </div>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentActivities.map((activity) => {
              const display = getActivityDisplay(activity);
              const IconComponent = display.icon;
              
              return (
                <div 
                  key={activity.id} 
                  className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors animate-fadeIn"
                >
                  <div className="flex-shrink-0">
                    <IconComponent className={`h-5 w-5 ${display.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.userName} ({activity.userRole})</p>
                  </div>
                  <div className="flex-shrink-0">
                    <p className="text-xs text-gray-400">{display.timeString}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live System Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Live Stats
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Online Users</span>
                  <span className="font-medium text-green-600">{liveStats.onlineUsers}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((liveStats.onlineUsers / 70) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Active Orders</span>
                  <span className="font-medium text-blue-600">{liveStats.activeOrders}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min((liveStats.activeOrders / 20) * 100, 100)}%` }}
                  ></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">System Load</span>
                  <span className="font-medium text-purple-600">{liveStats.systemLoad}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${liveStats.systemLoad}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-medium text-gray-900">
                    {Math.floor(liveStats.uptime / 3600)}h {Math.floor((liveStats.uptime % 3600) / 60)}m
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-3">
              {user?.role === 'customer' ? (
                <>
                  <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Shop Medicines</span>
                  </button>
                  <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Upload Prescription</span>
                  </button>
                  <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <Heart className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Health Profile</span>
                  </button>
                  <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Payment History</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Validate Prescription</span>
                  </button>
                  <button className="p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <Package className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Update Inventory</span>
                  </button>
                  <button className="p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <ShoppingCart className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Process Orders</span>
                  </button>
                  <button className="p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left flex items-center space-x-3">
                    <Users className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-900">Customer Support</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Prescription System</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Inventory System</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
            <div>
              <p className="text-sm font-medium text-gray-900">Payment Gateway</p>
              <p className="text-xs text-yellow-600">Maintenance</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">Notification Service</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}