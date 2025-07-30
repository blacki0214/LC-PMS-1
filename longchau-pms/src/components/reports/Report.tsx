import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  FileText,
  Download,
  Calendar
} from 'lucide-react';

export default function Reports() {
  const { products, prescriptions, orders, customers } = useData();
  const [timeRange, setTimeRange] = useState('30');

  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
  const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const topProducts = products
    .map(product => ({
      ...product,
      sold: Math.floor(Math.random() * 100) // Mock sold quantity
    }))
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  const monthlyData = [
    { month: 'Jan', revenue: 25000000, orders: 120, prescriptions: 85 },
    { month: 'Feb', revenue: 28000000, orders: 135, prescriptions: 92 },
    { month: 'Mar', revenue: 32000000, orders: 150, prescriptions: 110 },
    { month: 'Apr', revenue: 30000000, orders: 142, prescriptions: 95 },
    { month: 'May', revenue: 35000000, orders: 165, prescriptions: 125 },
    { month: 'Jun', revenue: 38000000, orders: 180, prescriptions: 140 }
  ];

  const keyMetrics = [
    {
      label: 'Total Revenue',
      value: `₫${totalRevenue.toLocaleString()}`,
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Total Orders',
      value: orders.length,
      change: '+8.2%',
      trend: 'up',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      label: 'Active Customers',
      value: customers.length,
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'text-purple-600'
    },
    {
      label: 'Prescriptions Processed',
      value: prescriptions.length,
      change: '+5.7%',
      trend: 'up',
      icon: FileText,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 3 months</option>
            <option value="365">Last year</option>
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {keyMetrics.map((metric, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{metric.value}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm font-medium text-green-600">{metric.change}</span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <metric.icon className={`h-6 w-6 ${metric.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
            <BarChart3 className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {monthlyData.map((data, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-600 w-12">{data.month}</span>
                <div className="flex-1 mx-4">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(data.revenue / 40000000) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-900 w-24 text-right">
                  ₫{(data.revenue / 1000000).toFixed(1)}M
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
            <Package className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center space-x-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-gray-500">{product.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{product.sold} sold</p>
                  <p className="text-sm text-gray-500">₫{product.price.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Performance */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
          <Calendar className="h-5 w-5 text-gray-400" />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Month</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Orders</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Prescriptions</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Avg. Order Value</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((data, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{data.month} 2024</td>
                  <td className="py-3 px-4 text-sm text-gray-900">₫{data.revenue.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{data.orders}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{data.prescriptions}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    ₫{(data.revenue / data.orders).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}