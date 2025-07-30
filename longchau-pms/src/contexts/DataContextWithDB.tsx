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
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
  shippingAddress: string;
  paymentMethod: 'cod' | 'card' | 'bank_transfer';
  paymentStatus: 'pending' | 'paid' | 'failed';
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
  updateProduct: (product: Product) => void;
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<StorageResult>;
  updatePrescription: (prescription: Prescription) => Promise<StorageResult>;
  addOrder: (order: Omit<Order, 'id'>) => Promise<StorageResult>;
  updateOrder: (order: Order) => Promise<StorageResult>;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
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
  paymentStatus: dbOrder.paymentStatus as any
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
  const [isConnectedToDatabase, setIsConnectedToDatabase] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxConnectionAttempts = 3;

  // Database-only data loading (no mock data fallback)
  const loadData = async () => {
    try {
      console.log('🔄 Loading data from database...');
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

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    const id = `cust-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newCustomer: Customer = { ...customer, id };
    
    try {
      if (isConnectedToDatabase) {
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
      }
      
      setCustomers(prev => [newCustomer, ...prev]);
    } catch (error) {
      console.error('Error adding customer:', error);
      // Add locally anyway
      setCustomers(prev => [newCustomer, ...prev]);
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

  return (
    <DataContext.Provider value={{
      products,
      prescriptions,
      orders,
      customers,
      updateProduct,
      addPrescription,
      updatePrescription,
      addOrder,
      updateOrder,
      addCustomer,
      updateCustomer,
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
