import React, { createContext, useContext, useState, useEffect } from 'react';
import { DatabaseService } from '../lib/database';
import { DatabaseStorageService, StorageResult } from '../services/DatabaseStorageService';
import { db } from '../lib/db';
import type {
  Product as DBProduct,
  Customer as DBCustomer,
  Prescription as DBPrescription,
  Order as DBOrder
} from '../lib/schema';

// Shipper interface
export interface Shipper {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  vehicleType: 'motorcycle' | 'car' | 'van' | 'truck';
  vehicleNumber: string;
  licenseNumber: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  isAvailable: boolean;
  rating: number;
  totalDeliveries: number;
  branchId?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

// Branch interface
export interface Branch {
  id: string;
  name: string;
  address: string;
  city: string;
  province: string;
  postalCode?: string;
  phone: string;
  email?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  operatingHours?: {
    monday: { open: string; close: string; };
    tuesday: { open: string; close: string; };
    wednesday: { open: string; close: string; };
    thursday: { open: string; close: string; };
    friday: { open: string; close: string; };
    saturday: { open: string; close: string; };
    sunday: { open: string; close: string; };
  };
  managerId?: string;
  isActive: boolean;
}

// Keep the original interfaces for backward compatibility
export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  manufacturer: string;
  expiryDate: string;
  requiresPrescription: boolean;
  batchNumber: string;
}

export interface Prescription {
  id: string;
  customerId: string;
  customerName: string;
  pharmacistId?: string;
  pharmacistName?: string;
  medications: {
    productId: string;
    productName: string;
    dosage: string;
    quantity: number;
    instructions: string;
  }[];
  status: 'pending' | 'validated' | 'dispensed' | 'rejected';
  uploadDate: string;
  validationDate?: string;
  notes?: string;
  imageUrl?: string;
  totalAmount?: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }[];
  total: number;
  status: 'pending' | 'confirmed' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingAddress: string;
  paymentMethod: 'cod' | 'card' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingNumber?: string;
  deliveryDate?: string;
  
  // Shipper assignment
  assignedShipperId?: string;
  assignedShipper?: Shipper;
  assignedAt?: string;
  assignedBy?: string;
  
  // Destination tracking from branch to customer
  originBranchId?: string;
  originBranch?: Branch;
  destinationLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    city: string;
    province: string;
  };
  routeData?: {
    waypoints: Array<{
      latitude: number;
      longitude: number;
      address: string;
      order: number;
    }>;
    distance: number; // in kilometers
    duration: number; // in minutes
    polyline?: string; // Encoded polyline for route visualization
  };
  estimatedDistance?: number;
  estimatedDuration?: number;
  
  // Shipping tracking information
  shippingInfo?: {
    shipperName: string;
    shipperPhone: string;
    vehicleType: string;
    vehicleNumber: string;
    estimatedTime: string;
  };
  estimatedDelivery?: string;
  actualDelivery?: string;
  shipperLocation?: {
    latitude: number;
    longitude: number;
    address: string;
    timestamp: string;
  };
  trackingHistory?: {
    timestamp: string;
    status: string;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    description: string;
  }[];
  
  // Delivery confirmation
  deliveryProof?: {
    photos: string[];
    signature?: string;
    recipientName?: string;
    notes?: string;
  };
  customerRating?: number;
  deliveryNotes?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  allergies: string[];
  prescriptionHistory: string[];
  orderHistory: string[];
  // Enhanced health information
  healthStatus: {
    bloodType?: string;
    height?: number; // in cm
    weight?: number; // in kg
    chronicConditions: string[];
    emergencyContact: {
      name: string;
      phone: string;
      relationship: string;
    };
    insurance?: {
      provider: string;
      policyNumber: string;
      expiryDate: string;
    };
  };
  membershipTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  joinDate: string;
  totalSpent: number;
}

interface DataContextType {
  products: Product[];
  prescriptions: Prescription[];
  orders: Order[];
  customers: Customer[];
  shippers: Shipper[];
  branches: Branch[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<StorageResult>;
  updateProduct: (product: Product) => void;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<StorageResult>;
  updatePrescription: (prescription: Prescription) => Promise<StorageResult>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<StorageResult>;
  updateOrder: (order: Order) => Promise<StorageResult>;
  updateShippingInfo: (orderId: string, shippingData: {
    shippingInfo?: Order['shippingInfo'];
    shipperLocation?: Order['shipperLocation'];
    trackingHistory?: Order['trackingHistory'];
    estimatedDelivery?: string;
    actualDelivery?: string;
  }) => Promise<StorageResult>;
  assignShipper: (orderId: string, shipperId: string, routeData?: Order['routeData']) => Promise<StorageResult>;
  updateShipperLocation: (shipperId: string, location: Shipper['currentLocation']) => Promise<StorageResult>;
  addCustomer: (customer: Omit<Customer, 'id'>) => Promise<void>;
  updateCustomer: (customer: Customer) => void;
  addShipper: (shipper: Omit<Shipper, 'id'>) => Promise<StorageResult>;
  updateShipper: (shipper: Shipper) => Promise<StorageResult>;
  addBranch: (branch: Omit<Branch, 'id'>) => Promise<StorageResult>;
  updateBranch: (branch: Branch) => Promise<StorageResult>;
  isConnectedToDatabase: boolean;
  isLoading: boolean;
  refreshData: () => Promise<void>;
  forceReconnectDatabase: () => Promise<boolean>;
  getPendingOperationsCount: () => number;
  syncPendingOperations: () => Promise<StorageResult>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Helper functions to convert between database and local types
const convertDBProduct = (dbProduct: DBProduct): Product => ({
  id: dbProduct.id,
  name: dbProduct.name,
  description: dbProduct.description || '',
  category: dbProduct.category,
  price: parseFloat(dbProduct.price),
  stock: dbProduct.stock,
  minStock: dbProduct.minStock,
  manufacturer: dbProduct.manufacturer,
  expiryDate: dbProduct.expiryDate,
  requiresPrescription: dbProduct.requiresPrescription || false,
  batchNumber: dbProduct.batchNumber
});

const convertDBCustomer = (dbCustomer: DBCustomer): Customer => ({
  id: dbCustomer.id,
  name: dbCustomer.name,
  email: dbCustomer.email,
  phone: dbCustomer.phone,
  address: dbCustomer.address,
  dateOfBirth: dbCustomer.dateOfBirth,
  allergies: dbCustomer.allergies as string[] || [],
  prescriptionHistory: dbCustomer.prescriptionHistory as string[] || [],
  orderHistory: dbCustomer.orderHistory as string[] || [],
  healthStatus: dbCustomer.healthStatus as any || {
    chronicConditions: [],
    emergencyContact: { name: '', phone: '', relationship: '' }
  },
  membershipTier: (dbCustomer.membershipTier as any) || 'bronze',
  joinDate: dbCustomer.joinDate?.toISOString() || new Date().toISOString(),
  totalSpent: parseFloat(dbCustomer.totalSpent || '0')
});

const convertDBPrescription = (dbPrescription: DBPrescription): Prescription => ({
  id: dbPrescription.id,
  customerId: dbPrescription.customerId,
  customerName: dbPrescription.customerName,
  pharmacistId: dbPrescription.pharmacistId || undefined,
  pharmacistName: dbPrescription.pharmacistName || undefined,
  medications: dbPrescription.medications as any || [],
  status: dbPrescription.status as any,
  uploadDate: dbPrescription.uploadDate?.toISOString() || new Date().toISOString(),
  validationDate: dbPrescription.validationDate?.toISOString(),
  notes: dbPrescription.notes || undefined,
  imageUrl: dbPrescription.imageUrl || undefined,
  totalAmount: dbPrescription.totalAmount ? parseFloat(dbPrescription.totalAmount) : undefined
});

const convertDBOrder = (dbOrder: DBOrder): Order => ({
  id: dbOrder.id,
  customerId: dbOrder.customerId,
  customerName: dbOrder.customerName,
  items: dbOrder.items as any || [],
  total: parseFloat(dbOrder.total),
  status: dbOrder.status as any,
  orderDate: dbOrder.orderDate?.toISOString() || new Date().toISOString(),
  shippingAddress: dbOrder.shippingAddress,
  paymentMethod: dbOrder.paymentMethod as any,
  paymentStatus: dbOrder.paymentStatus as any,
  trackingNumber: (dbOrder as any).trackingNumber,
  deliveryDate: (dbOrder as any).deliveryDate?.toISOString(),
  shippingInfo: (dbOrder as any).shippingInfo,
  estimatedDelivery: (dbOrder as any).estimatedDelivery?.toISOString(),
  actualDelivery: (dbOrder as any).actualDelivery?.toISOString(),
  shipperLocation: (dbOrder as any).shipperLocation,
  trackingHistory: (dbOrder as any).trackingHistory
});

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [shippers, setShippers] = useState<Shipper[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isConnectedToDatabase, setIsConnectedToDatabase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxConnectionAttempts = 3;

  // Database-only data loading (no mock data fallback)
  const loadData = async () => {
    try {
      console.log('🔄 Loading data from database...');
      console.log('📊 Environment check:', {
        nodeEnv: import.meta.env.NODE_ENV,
        viteDatabaseUrl: import.meta.env?.VITE_DATABASE_URL ? 'Present' : 'Missing',
        isDev: import.meta.env.DEV,
        isProd: import.meta.env.PROD
      });
      setIsLoading(true);
      
      // Always try to connect to database
      const healthCheck = await DatabaseService.healthCheck();
      
      if (!healthCheck) {
        throw new Error('Database health check failed');
      }

      console.log('✅ Connected to Neon database, loading data...');
      setIsConnectedToDatabase(true);
      setConnectionAttempts(0); // Reset attempts on successful connection
      
      // Load data from database
      const [dbProducts, dbCustomers, dbPrescriptions, dbOrders] = await Promise.all([
        DatabaseService.getAllProducts(),
        DatabaseService.getAllCustomers(),
        DatabaseService.getAllPrescriptions(),
        DatabaseService.getAllOrders()
      ]);

      // Convert and set data
      setProducts(dbProducts.map(convertDBProduct));
      setCustomers(dbCustomers.map(convertDBCustomer));
      setPrescriptions(dbPrescriptions.map(convertDBPrescription));
      setOrders(dbOrders.map(convertDBOrder));
      
      console.log(`✅ Database data loaded successfully:
        - Products: ${dbProducts.length}
        - Customers: ${dbCustomers.length}
        - Prescriptions: ${dbPrescriptions.length}
        - Orders: ${dbOrders.length}`);
      
      setIsLoading(false);
      
    } catch (error) {
      console.error('❌ Failed to load data from database:', error);
      setIsConnectedToDatabase(false);
      setIsLoading(false);
      
      // Set empty arrays instead of mock data
      setProducts([]);
      setCustomers([]);
      setPrescriptions([]);
      setOrders([]);
      
      // Retry connection after a delay
      setConnectionAttempts(prev => prev + 1);
      if (connectionAttempts < maxConnectionAttempts) {
        console.log(`⏳ Retrying database connection in 5 seconds... (Attempt ${connectionAttempts + 1}/${maxConnectionAttempts})`);
        setTimeout(() => {
          loadData();
        }, 5000);
      } else {
        console.error('❌ Max connection attempts reached. Database connection failed permanently.');
      }
    }
  };

  useEffect(() => {
    // Test database connection on mount
    console.log('🚀 DataProvider mounting...');
    console.log('🔍 Environment Variables Check:', {
      viteDatabaseUrl: import.meta.env?.VITE_DATABASE_URL?.substring(0, 20) + '...',
      isProduction: import.meta.env.PROD,
      isDevelopment: import.meta.env.DEV
    });
    
    loadData();
  }, []);

  const refreshData = async () => {
    console.log('🔄 Refreshing data from database...');
    setIsLoading(true);
    try {
      await loadData();
      console.log('✅ Data refresh completed');
    } catch (error) {
      console.error('❌ Data refresh failed:', error);
      setIsLoading(false);
    }
  };

  const forceReconnectDatabase = async (): Promise<boolean> => {
    console.log('🔌 Attempting to reconnect to database...');
    try {
      // Reset connection attempts
      setConnectionAttempts(0);
      
      const healthCheck = await DatabaseService.healthCheck();
      if (healthCheck) {
        console.log('✅ Database reconnection successful');
        setIsConnectedToDatabase(true);
        await loadData();
        return true;
      }
      
      console.log('❌ Database reconnection failed');
      setIsConnectedToDatabase(false);
      return false;
    } catch (error) {
      console.error('❌ Database reconnection error:', error);
      setIsConnectedToDatabase(false);
      return false;
    }
  };

  const updateProduct = async (product: Product) => {
    try {
      if (isConnectedToDatabase) {
        await DatabaseService.updateProduct(product.id, {
          name: product.name,
          description: product.description,
          category: product.category,
          price: product.price.toString(),
          stock: product.stock,
          minStock: product.minStock,
          manufacturer: product.manufacturer,
          expiryDate: product.expiryDate,
          requiresPrescription: product.requiresPrescription,
          batchNumber: product.batchNumber
        });
      }
      
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    } catch (error) {
      console.error('Error updating product:', error);
      // Update locally anyway
      setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    }
  };

  const addProduct = async (productData: Omit<Product, 'id'>): Promise<StorageResult> => {
    const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newProduct: Product = { ...productData, id };
    
    console.log('🔄 Adding product:', {
      id: newProduct.id,
      name: newProduct.name,
      category: newProduct.category,
      price: newProduct.price,
      stock: newProduct.stock,
      isConnectedToDatabase
    });
    
    try {
      if (isConnectedToDatabase) {
        console.log('📡 Attempting to save to database...');
        const dbProduct = await DatabaseService.createProduct({
          id: newProduct.id,
          name: newProduct.name,
          description: newProduct.description,
          category: newProduct.category,
          price: newProduct.price.toString(),
          stock: newProduct.stock,
          minStock: newProduct.minStock,
          manufacturer: newProduct.manufacturer,
          expiryDate: newProduct.expiryDate,
          requiresPrescription: newProduct.requiresPrescription,
          batchNumber: newProduct.batchNumber,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        if (dbProduct) {
          console.log('✅ Product saved to database successfully!');
          // Convert database product to frontend Product interface
          const frontendProduct: Product = {
            id: dbProduct.id,
            name: dbProduct.name,
            description: dbProduct.description || '',
            category: dbProduct.category,
            price: parseFloat(dbProduct.price),
            stock: dbProduct.stock,
            minStock: dbProduct.minStock,
            manufacturer: dbProduct.manufacturer,
            expiryDate: dbProduct.expiryDate || '',
            requiresPrescription: dbProduct.requiresPrescription || false,
            batchNumber: dbProduct.batchNumber || ''
          };
          
          // Update local state with converted product
          setProducts(prev => [frontendProduct, ...prev]);
          console.log('✅ Product stored in database:', frontendProduct.id);
          return { success: true, stored: 'database' };
        } else {
          console.log('⚠️ Database returned null, falling back to local storage');
        }
      } else {
        console.log('⚠️ Database not connected, storing locally');
      }
      
      // If database storage failed or not connected, store locally
      setProducts(prev => [newProduct, ...prev]);
      console.log('⚠️ Product stored locally (will sync when database is available):', newProduct.id);
      return { success: true, stored: 'local' };
      
    } catch (error) {
      console.error('❌ Error adding product:', error);
      // Store locally as fallback
      setProducts(prev => [newProduct, ...prev]);
      return { success: false, stored: 'local', error: 'Failed to add product to database' };
    }
  };

  const addPrescription = async (prescription: Omit<Prescription, 'id'>): Promise<StorageResult> => {
    const id = `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newPrescription: Prescription = { ...prescription, id };
    
    // Use the enhanced storage service
    const storageResult = await DatabaseStorageService.storePrescription(newPrescription);
    
    // Always update local state
    setPrescriptions(prev => [newPrescription, ...prev]);
    
    return storageResult;
  };

  const updatePrescription = async (prescription: Prescription): Promise<StorageResult> => {
    // Use the enhanced storage service
    const storageResult = await DatabaseStorageService.updatePrescription(prescription);
    
    // Always update local state
    setPrescriptions(prev => prev.map(p => p.id === prescription.id ? prescription : p));
    
    return storageResult;
  };

  const addOrder = async (order: Omit<Order, 'id'>): Promise<StorageResult> => {
    const id = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const newOrder: Order = { ...order, id };
    
    // Use the enhanced storage service
    const storageResult = await DatabaseStorageService.storeOrder(newOrder);
    
    // Always update local state
    setOrders(prev => [newOrder, ...prev]);
    
    return storageResult;
  };

  const updateOrder = async (order: Order): Promise<StorageResult> => {
    // Use the enhanced storage service
    const storageResult = await DatabaseStorageService.updateOrder(order);
    
    // Always update local state
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
    
    return storageResult;
  };

  const updateShippingInfo = async (
    orderId: string, 
    shippingData: {
      shippingInfo?: Order['shippingInfo'];
      shipperLocation?: Order['shipperLocation'];
      trackingHistory?: Order['trackingHistory'];
      estimatedDelivery?: string;
      actualDelivery?: string;
    }
  ): Promise<StorageResult> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) {
      return { success: false, error: 'Order not found', stored: 'local' };
    }

    const updatedOrder: Order = {
      ...order,
      ...shippingData
    };

    return updateOrder(updatedOrder);
  };

  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<void> => {
    const id = `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newCustomer: Customer = {
      id,
      ...customer
    };
    
    console.log('🔄 Adding customer:', {
      id,
      name: customer.name,
      email: customer.email,
      isConnectedToDatabase
    });
    
    try {
      if (isConnectedToDatabase) {
        // Check if customer with this email already exists
        console.log('🔍 Checking for existing customer with email:', customer.email);
        const existingCustomers = await DatabaseService.getAllCustomers();
        const existingCustomer = existingCustomers.find(c => c.email === customer.email);
        
        if (existingCustomer) {
          console.log('⚠️ Customer with email already exists, skipping creation:', customer.email);
          return;
        }
        
        console.log('📡 Attempting to save customer to database...');
        await DatabaseService.createCustomer({
          id,
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          dateOfBirth: customer.dateOfBirth,
          allergies: customer.allergies as any,
          prescriptionHistory: customer.prescriptionHistory as any,
          orderHistory: customer.orderHistory as any,
          healthStatus: customer.healthStatus as any,
          membershipTier: customer.membershipTier,
          totalSpent: customer.totalSpent.toString()
        });
        console.log('✅ Customer saved to database successfully!');
      } else {
        console.log('⚠️ Database not connected, storing locally');
      }
      
      setCustomers(prev => [newCustomer, ...prev]);
      console.log('✅ Customer added to local state');
    } catch (error) {
      console.error('❌ Error adding customer:', error);
      // Add locally anyway
      setCustomers(prev => [newCustomer, ...prev]);
      throw error; // Re-throw to let the UI handle it
    }
  };

  const updateCustomer = async (customer: Customer) => {
    try {
      if (isConnectedToDatabase) {
        await DatabaseService.updateCustomer(customer.id, {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address,
          allergies: customer.allergies as any,
          healthStatus: customer.healthStatus as any,
          membershipTier: customer.membershipTier,
          totalSpent: customer.totalSpent.toString()
        });
      }
      
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    } catch (error) {
      console.error('Error updating customer:', error);
      // Update locally anyway
      setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
    }
  };

  const getPendingOperationsCount = (): number => {
    return DatabaseStorageService.getPendingOperationsCount();
  };

  const syncPendingOperations = async (): Promise<StorageResult> => {
    return await DatabaseStorageService.syncToDatabase();
  };

  // Shipper management
  const assignShipper = async (
    orderId: string, 
    shipperId: string, 
    routeData?: {
      waypoints: Array<{
        latitude: number;
        longitude: number;
        address: string;
        order: number;
      }>;
      distance: number;
      duration: number;
      polyline?: string;
    }
  ): Promise<StorageResult> => {
    try {
      const order = orders.find(o => o.id === orderId);
      const shipper = shippers.find(s => s.id === shipperId);
      
      if (!order || !shipper) {
        throw new Error('Order or shipper not found');
      }

      const updatedOrder: Order = {
        ...order,
        assignedShipperId: shipperId,
        assignedShipper: shipper,
        routeData,
        status: 'assigned'
      };

      if (isConnectedToDatabase) {
        // TODO: Update database
      }
      
      setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
      return { success: true, stored: 'local' };
    } catch (error) {
      console.error('Error assigning shipper:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', stored: 'local' };
    }
  };

  const updateShipperLocation = async (
    shipperId: string, 
    location?: {
      latitude: number;
      longitude: number;
      address: string;
      timestamp: string;
    }
  ): Promise<StorageResult> => {
    try {
      const updatedShipper = shippers.find(s => s.id === shipperId);
      if (!updatedShipper) {
        throw new Error('Shipper not found');
      }

      const newShipper: Shipper = {
        ...updatedShipper,
        currentLocation: location
      };

      if (isConnectedToDatabase) {
        // TODO: Update database
      }

      setShippers(prev => prev.map(s => s.id === shipperId ? newShipper : s));
      return { success: true, stored: 'local' };
    } catch (error) {
      console.error('Error updating shipper location:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', stored: 'local' };
    }
  };

  const addShipper = async (shipper: Omit<Shipper, 'id'>): Promise<StorageResult> => {
    try {
      const id = `shipper-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newShipper: Shipper = {
        ...shipper,
        id
      };

      if (isConnectedToDatabase) {
        // TODO: Save to database
      }

      setShippers(prev => [...prev, newShipper]);
      return { success: true, stored: 'local' };
    } catch (error) {
      console.error('Error adding shipper:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', stored: 'local' };
    }
  };

  const updateShipper = async (shipper: Shipper): Promise<StorageResult> => {
    try {
      const existingShipper = shippers.find(s => s.id === shipper.id);
      if (!existingShipper) {
        throw new Error('Shipper not found');
      }

      if (isConnectedToDatabase) {
        // TODO: Update database
      }

      setShippers(prev => prev.map(s => s.id === shipper.id ? shipper : s));
      return { success: true, stored: 'local' };
    } catch (error) {
      console.error('Error updating shipper:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', stored: 'local' };
    }
  };

  // Branch management
  const addBranch = async (branch: Omit<Branch, 'id'>): Promise<StorageResult> => {
    try {
      const id = `branch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newBranch: Branch = {
        ...branch,
        id
      };

      if (isConnectedToDatabase) {
        // TODO: Save to database
      }

      setBranches(prev => [...prev, newBranch]);
      return { success: true, stored: 'local' };
    } catch (error) {
      console.error('Error adding branch:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', stored: 'local' };
    }
  };

  const updateBranch = async (branch: Branch): Promise<StorageResult> => {
    try {
      const existingBranch = branches.find(b => b.id === branch.id);
      if (!existingBranch) {
        throw new Error('Branch not found');
      }

      if (isConnectedToDatabase) {
        // TODO: Update database
      }

      setBranches(prev => prev.map(b => b.id === branch.id ? branch : b));
      return { success: true, stored: 'local' };
    } catch (error) {
      console.error('Error updating branch:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error', stored: 'local' };
    }
  };

  return (
    <DataContext.Provider value={{
      products,
      prescriptions,
      orders,
      customers,
      shippers,
      branches,
      addProduct,
      updateProduct,
      addPrescription,
      updatePrescription,
      addOrder,
      updateOrder,
      updateShippingInfo,
      addCustomer,
      updateCustomer,
      assignShipper,
      updateShipperLocation,
      addShipper,
      updateShipper,
      addBranch,
      updateBranch,
      isConnectedToDatabase,
      isLoading,
      refreshData,
      forceReconnectDatabase,
      getPendingOperationsCount,
      syncPendingOperations
    }}>
      {children}
    </DataContext.Provider>
  );
}
