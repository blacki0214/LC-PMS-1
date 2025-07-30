import React, { createContext, useContext, useState, useEffect } from 'react';

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
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
  addPrescription: (prescription: Omit<Prescription, 'id'>) => void;
  updatePrescription: (prescription: Prescription) => void;
  addOrder: (order: Omit<Order, 'id'>) => void;
  updateOrder: (order: Order) => void;
  addCustomer: (customer: Omit<Customer, 'id'>) => void;
  updateCustomer: (customer: Customer) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

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

  useEffect(() => {
    // Initialize with sample data
    initializeSampleData();
  }, []);

  const initializeSampleData = () => {
    const sampleProducts: Product[] = [
      {
        id: 'prod-1',
        name: 'Paracetamol 500mg',
        description: 'Pain reliever and fever reducer',
        category: 'Analgesics',
        price: 25000,
        stock: 150,
        minStock: 20,
        manufacturer: 'Teva Vietnam',
        expiryDate: '2025-12-31',
        requiresPrescription: false,
        batchNumber: 'PAR2024001'
      },
      {
        id: 'prod-2',
        name: 'Amoxicillin 500mg',
        description: 'Antibiotic for bacterial infections',
        category: 'Antibiotics',
        price: 45000,
        stock: 80,
        minStock: 15,
        manufacturer: 'Sandoz Vietnam',
        expiryDate: '2025-08-15',
        requiresPrescription: true,
        batchNumber: 'AMX2024002'
      },
      {
        id: 'prod-3',
        name: 'Vitamin D3 1000IU',
        description: 'Vitamin D supplement',
        category: 'Vitamins',
        price: 180000,
        stock: 60,
        minStock: 10,
        manufacturer: 'Pharma Plus',
        expiryDate: '2026-03-20',
        requiresPrescription: false,
        batchNumber: 'VIT2024003'
      }
    ];

    const sampleCustomers: Customer[] = [
      {
        id: 'cust-1',
        name: 'Nguyen Van Duc',
        email: 'duc.nguyen@email.com',
        phone: '0901234567',
        address: '123 Le Loi St, District 1, Ho Chi Minh City',
        dateOfBirth: '1985-05-15',
        allergies: ['Penicillin'],
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          bloodType: 'A+',
          height: 175,
          weight: 70,
          chronicConditions: ['Hypertension'],
          emergencyContact: {
            name: 'Nguyen Thi Lan',
            phone: '0987654321',
            relationship: 'Wife'
          },
          insurance: {
            provider: 'Vietnam Social Insurance',
            policyNumber: 'VSI-2024-001',
            expiryDate: '2025-12-31'
          }
        },
        membershipTier: 'gold',
        joinDate: '2020-03-15',
        totalSpent: 2500000
      },
      {
        id: 'cust-2',
        name: 'Tran Thi Mai',
        email: 'mai.tran@email.com',
        phone: '0912345678',
        address: '456 Nguyen Hue St, District 1, Ho Chi Minh City',
        dateOfBirth: '1990-08-22',
        allergies: [],
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          bloodType: 'O-',
          height: 160,
          weight: 55,
          chronicConditions: ['Diabetes Type 2'],
          emergencyContact: {
            name: 'Tran Van Nam',
            phone: '0976543210',
            relationship: 'Brother'
          },
          insurance: {
            provider: 'Bao Viet Insurance',
            policyNumber: 'BV-2024-456',
            expiryDate: '2025-08-22'
          }
        },
        membershipTier: 'platinum',
        joinDate: '2019-01-10',
        totalSpent: 4200000
      },
      {
        id: '3',
        name: 'Le Van C',
        email: 'customer@gmail.com',
        phone: '0923456789',
        address: '789 Pham Ngu Lao St, District 1, Ho Chi Minh City',
        dateOfBirth: '1992-03-10',
        allergies: ['Sulfa drugs'],
        prescriptionHistory: [],
        orderHistory: [],
        healthStatus: {
          bloodType: 'B+',
          height: 168,
          weight: 65,
          chronicConditions: [],
          emergencyContact: {
            name: 'Le Thi Hoa',
            phone: '0965432109',
            relationship: 'Mother'
          }
        },
        membershipTier: 'silver',
        joinDate: '2022-06-20',
        totalSpent: 850000
      }
    ];

    const samplePrescriptions: Prescription[] = [
      {
        id: 'presc-1',
        customerId: 'cust-1',
        customerName: 'Nguyen Van Duc',
        medications: [
          {
            productId: 'prod-2',
            productName: 'Amoxicillin 500mg',
            dosage: '500mg',
            quantity: 20,
            instructions: 'Take 1 tablet twice daily after meals for 7 days'
          }
        ],
        status: 'pending',
        uploadDate: new Date().toISOString(),
        imageUrl: 'https://images.pexels.com/photos/5910955/pexels-photo-5910955.jpeg'
      }
    ];

    setProducts(sampleProducts);
    setCustomers(sampleCustomers);
    setPrescriptions(samplePrescriptions);
  };

  const updateProduct = (product: Product) => {
    setProducts(prev => prev.map(p => p.id === product.id ? product : p));
  };

  const addPrescription = (prescription: Omit<Prescription, 'id'>) => {
    const newPrescription: Prescription = {
      ...prescription,
      id: `presc-${Date.now()}`
    };
    setPrescriptions(prev => [newPrescription, ...prev]);
  };

  const updatePrescription = (prescription: Prescription) => {
    setPrescriptions(prev => prev.map(p => p.id === prescription.id ? prescription : p));
  };

  const addOrder = (order: Omit<Order, 'id'>) => {
    const newOrder: Order = {
      ...order,
      id: `order-${Date.now()}`
    };
    setOrders(prev => [newOrder, ...prev]);
    
    // Update customer's order history
    setCustomers(prev => prev.map(customer => 
      customer.id === order.customerId 
        ? { ...customer, orderHistory: [...customer.orderHistory, newOrder.id] }
        : customer
    ));
  };

  const updateOrder = (order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? order : o));
  };

  const addCustomer = (customer: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: `cust-${Date.now()}`
    };
    setCustomers(prev => [newCustomer, ...prev]);
  };

  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === customer.id ? customer : c));
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
      updateCustomer
    }}>
      {children}
    </DataContext.Provider>
  );
}