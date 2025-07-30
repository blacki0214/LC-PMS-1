import { 
  pgTable, 
  text, 
  integer, 
  decimal, 
  timestamp, 
  boolean, 
  jsonb,
  varchar,
  date
} from 'drizzle-orm/pg-core';

// Users table (for authentication)
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // Added password field
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(), // 'pharmacist', 'manager', 'customer', 'shipper'
  branchId: text('branch_id'),
  professionalInfo: jsonb('professional_info'), // For pharmacists/managers
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Shippers table (detailed shipper information)
export const shippers = pgTable('shippers', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull(),
  vehicleType: varchar('vehicle_type', { length: 50 }).notNull(), // 'motorcycle', 'car', 'van', 'truck'
  vehicleNumber: varchar('vehicle_number', { length: 20 }).notNull(),
  licenseNumber: varchar('license_number', { length: 50 }).notNull(),
  currentLocation: jsonb('current_location'), // GPS coordinates
  isAvailable: boolean('is_available').default(true),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('5.00'),
  totalDeliveries: integer('total_deliveries').default(0),
  branchId: text('branch_id'),
  emergencyContact: jsonb('emergency_contact'), // Emergency contact info
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Branches/Pharmacy locations table
export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address').notNull(),
  city: varchar('city', { length: 100 }).notNull(),
  province: varchar('province', { length: 100 }).notNull(),
  postalCode: varchar('postal_code', { length: 10 }),
  phone: varchar('phone', { length: 20 }).notNull(),
  email: varchar('email', { length: 255 }),
  location: jsonb('location'), // GPS coordinates {latitude, longitude}
  operatingHours: jsonb('operating_hours'), // Opening/closing times
  managerId: text('manager_id').references(() => users.id),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Customers table (detailed customer information)
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }).notNull(),
  address: text('address').notNull(),
  dateOfBirth: date('date_of_birth').notNull(),
  allergies: jsonb('allergies').$type<string[]>().default([]),
  prescriptionHistory: jsonb('prescription_history').$type<string[]>().default([]),
  orderHistory: jsonb('order_history').$type<string[]>().default([]),
  healthStatus: jsonb('health_status'), // Blood type, height, weight, etc.
  membershipTier: varchar('membership_tier', { length: 20 }).default('bronze'),
  joinDate: timestamp('join_date').defaultNow(),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  stock: integer('stock').notNull(),
  minStock: integer('min_stock').notNull(),
  manufacturer: varchar('manufacturer', { length: 255 }).notNull(),
  expiryDate: date('expiry_date').notNull(),
  requiresPrescription: boolean('requires_prescription').default(false),
  batchNumber: varchar('batch_number', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Prescriptions table
export const prescriptions = pgTable('prescriptions', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  pharmacistId: text('pharmacist_id').references(() => users.id),
  pharmacistName: varchar('pharmacist_name', { length: 255 }),
  medications: jsonb('medications'), // Array of medication objects
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'validated', 'dispensed', 'rejected'
  uploadDate: timestamp('upload_date').defaultNow(),
  validationDate: timestamp('validation_date'),
  notes: text('notes'),
  imageUrl: text('image_url'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  items: jsonb('items'), // Array of order items
  total: decimal('total', { precision: 10, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'confirmed', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'
  orderDate: timestamp('order_date').defaultNow(),
  shippingAddress: text('shipping_address').notNull(),
  paymentMethod: varchar('payment_method', { length: 20 }).notNull(), // 'cod', 'card', 'bank_transfer'
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'), // 'pending', 'paid', 'failed'
  trackingNumber: varchar('tracking_number', { length: 100 }),
  deliveryDate: timestamp('delivery_date'),
  
  // Shipper assignment
  assignedShipperId: text('assigned_shipper_id').references(() => shippers.id),
  assignedAt: timestamp('assigned_at'),
  assignedBy: text('assigned_by').references(() => users.id), // Who assigned the shipper
  
  // Destination tracking from branch to customer
  originBranchId: text('origin_branch_id').references(() => branches.id),
  destinationLocation: jsonb('destination_location'), // Customer location coordinates
  routeData: jsonb('route_data'), // Route waypoints and navigation data
  estimatedDistance: decimal('estimated_distance', { precision: 8, scale: 2 }), // in kilometers
  estimatedDuration: integer('estimated_duration'), // in minutes
  
  // Shipping tracking information
  shippingInfo: jsonb('shipping_info'), // Shipper details, current location, route, etc.
  estimatedDelivery: timestamp('estimated_delivery'),
  actualDelivery: timestamp('actual_delivery'),
  shipperLocation: jsonb('shipper_location'), // Current GPS coordinates
  trackingHistory: jsonb('tracking_history'), // Array of tracking events with timestamps and locations
  
  // Delivery confirmation
  deliveryProof: jsonb('delivery_proof'), // Photos, signatures, etc.
  customerRating: integer('customer_rating'), // 1-5 stars
  deliveryNotes: text('delivery_notes'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Notifications table
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 20 }).notNull(), // 'success', 'info', 'warning', 'error'
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').default(false),
  actionUrl: text('action_url'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Activity logs table (for dashboard activities)
export const activityLogs = pgTable('activity_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  action: varchar('action', { length: 255 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(), // 'prescription', 'order', 'inventory', etc.
  entityId: text('entity_id'),
  details: jsonb('details'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Inventory transactions table
export const inventoryTransactions = pgTable('inventory_transactions', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  type: varchar('type', { length: 20 }).notNull(), // 'stock_in', 'stock_out', 'adjustment'
  quantity: integer('quantity').notNull(),
  previousStock: integer('previous_stock').notNull(),
  newStock: integer('new_stock').notNull(),
  reason: varchar('reason', { length: 255 }),
  userId: text('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type NewCustomer = typeof customers.$inferInsert;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Prescription = typeof prescriptions.$inferSelect;
export type NewPrescription = typeof prescriptions.$inferInsert;
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type NewInventoryTransaction = typeof inventoryTransactions.$inferInsert;
