import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContextWithDB';
import { useNotifications } from '../../contexts/NotificationContext';
import { useActivity } from '../../contexts/ActivityContext';
import { 
  Package, 
  Search, 
  Filter, 
  AlertTriangle, 
  Edit, 
  Plus,
  TrendingDown,
  TrendingUp,
  Save,
  X,
  Calendar,
  Barcode
} from 'lucide-react';

export default function InventoryManagement() {
  const { user } = useAuth();
  const { products, updateProduct, addProduct } = useData();
  const { addNotification } = useNotifications();
  const { addActivity } = useActivity();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [showLowStock, setShowLowStock] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showStockUpdateModal, setShowStockUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [newStock, setNewStock] = useState(0);

  // Check if user can manage inventory (pharmacist or manager)
  const canManageInventory = user?.role === 'pharmacist' || user?.role === 'manager';

  const categories = [...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const matchesLowStock = !showLowStock || product.stock <= product.minStock;
    
    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleStockUpdate = (productId: string, newStock: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const oldStock = product.stock;
      updateProduct({ ...product, stock: newStock });
      
      // Log the activity
      addActivity(
        'product',
        'Updated product stock',
        `Updated stock for "${product.name}" from ${oldStock} to ${newStock}`,
        {
          productName: product.name,
          amount: newStock - oldStock
        }
      );
      
      addNotification({
        title: 'Stock Updated',
        message: `Stock updated for ${product.name}`,
        type: 'success'
      });
    }
  };

  const openStockUpdateModal = (product: any) => {
    setSelectedProduct(product);
    setNewStock(product.stock);
    setShowStockUpdateModal(true);
  };

  const handleStockUpdateSubmit = () => {
    if (selectedProduct) {
      handleStockUpdate(selectedProduct.id, newStock);
      setShowStockUpdateModal(false);
      setSelectedProduct(null);
    }
  };

  // Wrapper function for adding products with activity logging
  const handleAddProduct = async (productData: any) => {
    try {
      await addProduct(productData);
      
      // Log the activity
      addActivity(
        'product',
        'Added new product',
        `Product "${productData.name}" was added to inventory`,
        {
          productName: productData.name,
          amount: productData.stock
        }
      );
      
      setShowAddProductModal(false);
      
      addNotification({
        title: 'Product Added',
        message: `${productData.name} has been added to inventory`,
        type: 'success'
      });
    } catch (error) {
      console.error('Error adding product:', error);
      addNotification({
        title: 'Error',
        message: 'Failed to add product. Please try again.',
        type: 'error'
      });
    }
  };

  const getStockStatus = (product: any) => {
    if (product.stock === 0) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Out of Stock' };
    if (product.stock <= product.minStock) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Low Stock' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600">
            {canManageInventory 
              ? 'Manage product stock levels and add new products'
              : 'View product inventory information'
            }
          </p>
        </div>
        {canManageInventory && (
          <button 
            onClick={() => setShowAddProductModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Product</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock <= p.minStock).length}
              </p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {products.filter(p => p.stock === 0).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-green-600">
                ₫{products.reduce((sum, p) => sum + (p.price * p.stock), 0).toLocaleString()}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={showLowStock}
              onChange={(e) => setShowLowStock(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">Show only low stock items</span>
          </label>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expiry Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product);
                return (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.manufacturer}</div>
                        <div className="text-xs text-gray-400">Batch: {product.batchNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₫{product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{product.stock}</span>
                        <span className="text-xs text-gray-500">/ {product.minStock} min</span>
                        {product.stock <= product.minStock && (
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                        {stockStatus.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(product.expiryDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      {canManageInventory ? (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => openStockUpdateModal(product)}
                            className="text-blue-600 hover:text-blue-800 transition-colors flex items-center space-x-1"
                            title="Update Stock"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="text-xs">Stock</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">View Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or add new products to inventory.</p>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal 
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
        addNotification={addNotification}
      />

      {/* Stock Update Modal */}
      <StockUpdateModal
        isOpen={showStockUpdateModal}
        onClose={() => setShowStockUpdateModal(false)}
        product={selectedProduct}
        newStock={newStock}
        setNewStock={setNewStock}
        onSubmit={handleStockUpdateSubmit}
      />
    </div>
  );
}

// Add Product Modal Component
function AddProductModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  addNotification 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSubmit: (product: any) => Promise<any>;
  addNotification: (notification: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    price: '',
    stock: '',
    minStock: '',
    manufacturer: '',
    expiryDate: '',
    requiresPrescription: false,
    batchNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'Medicines',
    'Vitamins & Supplements', 
    'Personal Care',
    'First Aid',
    'Baby Care',
    'Health Devices',
    'Beauty & Cosmetics'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Validation
    if (!formData.name || !formData.category || !formData.price || !formData.stock) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        minStock: parseInt(formData.minStock) || 10,
        manufacturer: formData.manufacturer,
        expiryDate: formData.expiryDate,
        requiresPrescription: formData.requiresPrescription,
        batchNumber: formData.batchNumber
      };

      const result = await onSubmit(productData);
      
      console.log('📋 Product submission result:', result);
      
      if (result.success) {
        const storageMessage = result.stored === 'database' 
          ? `${formData.name} has been added to inventory and saved to database` 
          : `${formData.name} has been added to inventory (saved locally)`;
          
        addNotification({
          title: 'Product Added',
          message: storageMessage,
          type: 'success'
        });
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          category: '',
          price: '',
          stock: '',
          minStock: '',
          manufacturer: '',
          expiryDate: '',
          requiresPrescription: false,
          batchNumber: ''
        });
        onClose();
      } else {
        addNotification({
          title: 'Error',
          message: result.error || 'Failed to add product',
          type: 'error'
        });
      }
    } catch (error) {
      addNotification({
        title: 'Error',
        message: 'Failed to add product',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price (₫) *
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                  step="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Initial Stock *
                </label>
                <input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({...formData, stock: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Minimum Stock Level
                </label>
                <input
                  type="number"
                  value={formData.minStock}
                  onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                  placeholder="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch Number
                </label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData({...formData, batchNumber: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="requiresPrescription"
                checked={formData.requiresPrescription}
                onChange={(e) => setFormData({...formData, requiresPrescription: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="requiresPrescription" className="ml-2 text-sm text-gray-700">
                Requires Prescription
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                <span>{isSubmitting ? 'Adding...' : 'Add Product'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Stock Update Modal Component
function StockUpdateModal({
  isOpen,
  onClose,
  product,
  newStock,
  setNewStock,
  onSubmit
}: {
  isOpen: boolean;
  onClose: () => void;
  product: any;
  newStock: number;
  setNewStock: (stock: number) => void;
  onSubmit: () => void;
}) {
  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Update Stock</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4">
            <h3 className="font-medium text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">Current stock: {product.stock}</p>
            <p className="text-sm text-gray-500">Minimum required: {product.minStock}</p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Stock Level
            </label>
            <input
              type="number"
              value={newStock}
              onChange={(e) => setNewStock(parseInt(e.target.value) || 0)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              min="0"
            />
          </div>

          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Update Stock</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}