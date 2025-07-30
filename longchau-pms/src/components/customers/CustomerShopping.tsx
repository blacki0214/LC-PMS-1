import React, { useState } from 'react';
import { useData } from '../../contexts/DataContextWithDB';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import StorageStatus from '../common/StorageStatus';
import { Link } from 'react-router-dom';
import { 
  ShoppingCart, 
  Search, 
  Filter, 
  Plus,
  Minus,
  Package,
  Trash2,
  CreditCard,
  MapPin,
  Star,
  CheckCircle,
  Eye,
  RefreshCw,
  Database,
  Save
} from 'lucide-react';

interface CartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  stock: number;
}

export default function CustomerShopping() {
  const { products, customers, addOrder, updateProduct, refreshData, forceReconnectDatabase, isConnectedToDatabase } = useData();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card' | 'bank_transfer'>('cod');
  const [orderConfirmation, setOrderConfirmation] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [orderStorageResult, setOrderStorageResult] = useState<string>('');

  const categories = [...new Set(products.map(p => p.category))];
  
  // Filter products that are in stock
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    const inStock = product.stock > 0;
    
    return matchesSearch && matchesCategory && inStock;
  });

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.productId === product.id);
    
    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        // Update cart first
        setCart(prevCart =>
          prevCart.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
        
        // Then add notification
        addNotification({
          title: 'Cart Updated',
          message: `Increased quantity of ${product.name} in cart`,
          type: 'info'
        });
      }
    } else {
      // Update cart first
      setCart(prevCart => [...prevCart, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1,
        stock: product.stock
      }]);
      
      // Then add notification
      addNotification({
        title: 'Item Added to Cart',
        message: `${product.name} has been added to your cart`,
        type: 'success'
      });
    }
  };

  const updateCartQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(prevCart =>
      prevCart.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.min(newQuantity, item.stock) }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.productId !== productId));
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = async () => {
    if (!user || cart.length === 0) {
      alert('Please add items to your cart before placing an order.');
      return;
    }

    const customer = customers.find(c => c.id === user.id);
    
    if (!customer) {
      alert('Customer information not found. Please try logging in again.');
      return;
    }

    setIsProcessingOrder(true);
    setOrderStorageResult('');

    try {
      // Generate unique order ID
      const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      const newOrder = {
        customerId: user.id,
        customerName: customer.name,
        items: cart.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.price
        })),
        total: getCartTotal(),
        status: 'pending' as const,
        orderDate: new Date().toISOString(),
        shippingAddress: shippingAddress || customer.address,
        paymentMethod,
        paymentStatus: 'pending' as const
      };

      // Add order to the system with database-first storage
      const storageResult = await addOrder(newOrder);

      // Update product stock levels
      cart.forEach(cartItem => {
        const product = products.find(p => p.id === cartItem.productId);
        if (product) {
          const updatedProduct = {
            ...product,
            stock: product.stock - cartItem.quantity
          };
          updateProduct(updatedProduct);
        }
      });

      // Set storage feedback
      if (storageResult.stored === 'database') {
        setOrderStorageResult(`✅ Order ${orderId} successfully stored in database`);
        addNotification({
          title: 'Order Placed Successfully',
          message: `Your order ${orderId} has been placed and stored in database. Total: ₫${getCartTotal().toLocaleString()}`,
          type: 'success'
        });
      } else {
        setOrderStorageResult(`⚠️ Order ${orderId} stored locally (will sync when database is available)`);
        addNotification({
          title: 'Order Placed (Local Storage)',
          message: `Your order ${orderId} has been placed and stored locally. Total: ₫${getCartTotal().toLocaleString()}`,
          type: 'warning'
        });
      }

      // Clear cart and show confirmation
      setCart([]);
      setShowCart(false);
      setOrderConfirmation(orderId);
      
      // Auto-hide confirmation and storage result after 8 seconds
      setTimeout(() => {
        setOrderConfirmation(null);
        setOrderStorageResult('');
      }, 8000);
    } catch (error) {
      console.error('Error during checkout:', error);
      setOrderStorageResult('❌ Error placing order. Please try again.');
      setTimeout(() => setOrderStorageResult(''), 5000);
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const isProductInCart = (productId: string) => {
    return cart.some(item => item.productId === productId);
  };

  const getProductCartQuantity = (productId: string) => {
    const item = cart.find(item => item.productId === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-6">
      {/* Order Confirmation Notification */}
      {orderConfirmation && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-green-800">Order Placed Successfully!</h3>
            <p className="text-sm text-green-700">
              Your order #{orderConfirmation} has been placed and will be processed soon.
            </p>
          </div>
          <Link
            to="/orders"
            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center space-x-1"
          >
            <Eye className="h-4 w-4" />
            <span>View Orders</span>
          </Link>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Long Châu Pharmacy</h1>
          <p className="text-gray-600">Shop for medicines and health products</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshData}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
            {!isConnectedToDatabase && (
              <button
                onClick={forceReconnectDatabase}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Connect DB</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isConnectedToDatabase ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnectedToDatabase ? 'Database Connected' : 'Using Mock Data'}
            </span>
          </div>
          <Link
            to="/orders"
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>My Orders</span>
          </Link>
          <button
            onClick={() => setShowCart(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 relative"
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            {getCartItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </button>
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
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-80"
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
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
                {product.requiresPrescription && (
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full ml-2">
                    Rx
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-2">{product.manufacturer}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded-full">
                  {product.category}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">4.5</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xl font-bold text-blue-600">
                    ₫{product.price.toLocaleString()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  Stock: {product.stock}
                </span>
              </div>

              {isProductInCart(product.id) ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateCartQuantity(product.id, getProductCartQuantity(product.id) - 1)}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="font-medium">{getProductCartQuantity(product.id)}</span>
                    <button
                      onClick={() => updateCartQuantity(product.id, getProductCartQuantity(product.id) + 1)}
                      disabled={getProductCartQuantity(product.id) >= product.stock}
                      className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(product.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add to Cart</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search criteria.</p>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Shopping Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Your cart is empty</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.productId} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.productName}</h4>
                        <p className="text-sm text-gray-600">₫{item.price.toLocaleString()} each</p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="font-medium w-8 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                            disabled={item.quantity >= item.stock}
                            className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                        <span className="font-medium text-blue-600 w-20 text-right">
                          ₫{(item.price * item.quantity).toLocaleString()}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-200 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Shipping address (optional)"
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as 'cod' | 'card' | 'bank_transfer')}
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="cod">Cash on Delivery</option>
                      <option value="card">Credit/Debit Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">₫{getCartTotal().toLocaleString()}</span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={cart.length === 0 || isProcessingOrder}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isProcessingOrder ? (
                    <>
                      <Save className="h-4 w-4 animate-spin" />
                      <span>Saving to {isConnectedToDatabase ? 'Database' : 'Local Storage'}...</span>
                    </>
                  ) : cart.length === 0 ? (
                    'Cart is Empty'
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      <span>Place Order</span>
                    </>
                  )}
                </button>

                {/* Order Storage Result */}
                {orderStorageResult && (
                  <div className={`p-3 rounded-lg text-sm ${
                    orderStorageResult.includes('✅') 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : orderStorageResult.includes('⚠️')
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {orderStorageResult}
                  </div>
                )}

                {/* Storage Status */}
                <div className="border-t pt-4">
                  <StorageStatus compact />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
