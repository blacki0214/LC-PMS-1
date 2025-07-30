import { eq, desc, and, or, gte, lte } from 'drizzle-orm';
import { db } from './db';
import * as schema from './schema';
import type { 
  Customer, 
  NewCustomer, 
  Product, 
  NewProduct, 
  Prescription, 
  NewPrescription, 
  Order, 
  NewOrder,
  User,
  NewUser,
  NewNotification,
  NewActivityLog
} from './schema';

// Database service class
export class DatabaseService {
  // User operations
  static async createUser(userData: NewUser): Promise<User | null> {
    if (!db) return null;
    try {
      const [user] = await db.insert(schema.users).values(userData).returning();
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  static async getUserByEmail(email: string): Promise<User | null> {
    if (!db) return null;
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email));
      return user || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  static async getUserById(id: string): Promise<User | null> {
    if (!db) return null;
    try {
      const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
      return user || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  // Customer operations
  static async getAllCustomers(): Promise<Customer[]> {
    if (!db) return [];
    try {
      return await db.select().from(schema.customers).orderBy(desc(schema.customers.createdAt));
    } catch (error) {
      console.error('Error getting customers:', error);
      return [];
    }
  }

  static async createCustomer(customerData: NewCustomer): Promise<Customer | null> {
    if (!db) return null;
    try {
      const [customer] = await db.insert(schema.customers).values(customerData).returning();
      return customer;
    } catch (error) {
      console.error('Error creating customer:', error);
      return null;
    }
  }

  static async updateCustomer(id: string, customerData: Partial<NewCustomer>): Promise<Customer | null> {
    if (!db) return null;
    try {
      const [customer] = await db
        .update(schema.customers)
        .set({ ...customerData, updatedAt: new Date() })
        .where(eq(schema.customers.id, id))
        .returning();
      return customer;
    } catch (error) {
      console.error('Error updating customer:', error);
      return null;
    }
  }

  static async getCustomerById(id: string): Promise<Customer | null> {
    if (!db) return null;
    try {
      const [customer] = await db.select().from(schema.customers).where(eq(schema.customers.id, id));
      return customer || null;
    } catch (error) {
      console.error('Error getting customer by ID:', error);
      return null;
    }
  }

  // Product operations
  static async getAllProducts(): Promise<Product[]> {
    if (!db) return [];
    try {
      return await db.select().from(schema.products).orderBy(desc(schema.products.createdAt));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  }

  static async createProduct(productData: NewProduct): Promise<Product | null> {
    if (!db) return null;
    try {
      const [product] = await db.insert(schema.products).values(productData).returning();
      return product;
    } catch (error) {
      console.error('Error creating product:', error);
      return null;
    }
  }

  static async updateProduct(id: string, productData: Partial<NewProduct>): Promise<Product | null> {
    if (!db) return null;
    try {
      const [product] = await db
        .update(schema.products)
        .set({ ...productData, updatedAt: new Date() })
        .where(eq(schema.products.id, id))
        .returning();
      return product;
    } catch (error) {
      console.error('Error updating product:', error);
      return null;
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    if (!db) return null;
    try {
      const [product] = await db.select().from(schema.products).where(eq(schema.products.id, id));
      return product || null;
    } catch (error) {
      console.error('Error getting product by ID:', error);
      return null;
    }
  }

  static async getLowStockProducts(): Promise<Product[]> {
    if (!db) return [];
    try {
      return await db.select().from(schema.products).where(
        lte(schema.products.stock, schema.products.minStock)
      );
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  }

  // Prescription operations
  static async getAllPrescriptions(): Promise<Prescription[]> {
    if (!db) return [];
    try {
      return await db.select().from(schema.prescriptions).orderBy(desc(schema.prescriptions.createdAt));
    } catch (error) {
      console.error('Error getting prescriptions:', error);
      return [];
    }
  }

  static async createPrescription(prescriptionData: NewPrescription): Promise<Prescription | null> {
    if (!db) return null;
    try {
      const [prescription] = await db.insert(schema.prescriptions).values(prescriptionData).returning();
      return prescription;
    } catch (error) {
      console.error('Error creating prescription:', error);
      return null;
    }
  }

  static async updatePrescription(id: string, prescriptionData: Partial<NewPrescription>): Promise<Prescription | null> {
    if (!db) return null;
    try {
      const [prescription] = await db
        .update(schema.prescriptions)
        .set({ ...prescriptionData, updatedAt: new Date() })
        .where(eq(schema.prescriptions.id, id))
        .returning();
      return prescription;
    } catch (error) {
      console.error('Error updating prescription:', error);
      return null;
    }
  }

  static async getPrescriptionsByCustomerId(customerId: string): Promise<Prescription[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.prescriptions)
        .where(eq(schema.prescriptions.customerId, customerId))
        .orderBy(desc(schema.prescriptions.createdAt));
    } catch (error) {
      console.error('Error getting prescriptions by customer ID:', error);
      return [];
    }
  }

  static async getPendingPrescriptions(): Promise<Prescription[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.prescriptions)
        .where(eq(schema.prescriptions.status, 'pending'))
        .orderBy(desc(schema.prescriptions.createdAt));
    } catch (error) {
      console.error('Error getting pending prescriptions:', error);
      return [];
    }
  }

  // Order operations
  static async getAllOrders(): Promise<Order[]> {
    if (!db) return [];
    try {
      return await db.select().from(schema.orders).orderBy(desc(schema.orders.createdAt));
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  }

  static async createOrder(orderData: NewOrder): Promise<Order | null> {
    if (!db) return null;
    try {
      const [order] = await db.insert(schema.orders).values(orderData).returning();
      return order;
    } catch (error) {
      console.error('Error creating order:', error);
      return null;
    }
  }

  static async updateOrder(id: string, orderData: Partial<NewOrder>): Promise<Order | null> {
    if (!db) return null;
    try {
      const [order] = await db
        .update(schema.orders)
        .set({ ...orderData, updatedAt: new Date() })
        .where(eq(schema.orders.id, id))
        .returning();
      return order;
    } catch (error) {
      console.error('Error updating order:', error);
      return null;
    }
  }

  static async getOrdersByCustomerId(customerId: string): Promise<Order[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.orders)
        .where(eq(schema.orders.customerId, customerId))
        .orderBy(desc(schema.orders.createdAt));
    } catch (error) {
      console.error('Error getting orders by customer ID:', error);
      return [];
    }
  }

  // Notification operations
  static async createNotification(notificationData: NewNotification): Promise<boolean> {
    if (!db) return false;
    try {
      await db.insert(schema.notifications).values(notificationData);
      return true;
    } catch (error) {
      console.error('Error creating notification:', error);
      return false;
    }
  }

  static async getUserNotifications(userId: string): Promise<schema.Notification[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.notifications)
        .where(eq(schema.notifications.userId, userId))
        .orderBy(desc(schema.notifications.createdAt));
    } catch (error) {
      console.error('Error getting user notifications:', error);
      return [];
    }
  }

  static async markNotificationAsRead(id: string): Promise<boolean> {
    if (!db) return false;
    try {
      await db
        .update(schema.notifications)
        .set({ read: true, updatedAt: new Date() })
        .where(eq(schema.notifications.id, id));
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }

  // Activity log operations
  static async createActivityLog(activityData: NewActivityLog): Promise<boolean> {
    if (!db) return false;
    try {
      await db.insert(schema.activityLogs).values(activityData);
      return true;
    } catch (error) {
      console.error('Error creating activity log:', error);
      return false;
    }
  }

  static async getRecentActivities(limit: number = 20): Promise<schema.ActivityLog[]> {
    if (!db) return [];
    try {
      return await db
        .select()
        .from(schema.activityLogs)
        .orderBy(desc(schema.activityLogs.createdAt))
        .limit(limit);
    } catch (error) {
      console.error('Error getting recent activities:', error);
      return [];
    }
  }

  // Inventory transaction operations
  static async createInventoryTransaction(transactionData: schema.NewInventoryTransaction): Promise<boolean> {
    if (!db) return false;
    try {
      await db.insert(schema.inventoryTransactions).values(transactionData);
      return true;
    } catch (error) {
      console.error('Error creating inventory transaction:', error);
      return false;
    }
  }

  // Database initialization and seeding
  static async seedDatabase(): Promise<boolean> {
    if (!db) return false;
    try {
      // This will be called to populate the database with initial data
      console.log('Database seeding would happen here');
      return true;
    } catch (error) {
      console.error('Error seeding database:', error);
      return false;
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    if (!db) return false;
    try {
      console.log('🏥 Performing database health check...');
      
      // Use a simple query with timeout to prevent hanging
      const result = await Promise.race([
        db.select().from(schema.products).limit(1),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Health check timeout')), 5000)
        )
      ]);
      
      console.log('✅ Database health check passed');
      return true;
    } catch (error) {
      console.warn('❌ Database health check failed:', error);
      return false;
    }
  }
}
