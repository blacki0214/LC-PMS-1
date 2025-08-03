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
import { customers, orders } from './schema';

// Customer Health Information Table
export const customerHealthInfo = pgTable('customer_health_info', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  bloodType: varchar('blood_type', { length: 10 }),
  height: integer('height'), // in cm
  weight: decimal('weight', { precision: 5, scale: 2 }), // in kg
  allergies: jsonb('allergies').$type<string[]>().default([]),
  chronicConditions: jsonb('chronic_conditions').$type<string[]>().default([]),
  currentMedications: jsonb('current_medications').$type<{
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescribedBy?: string;
  }[]>().default([]),
  emergencyContactName: varchar('emergency_contact_name', { length: 255 }),
  emergencyContactPhone: varchar('emergency_contact_phone', { length: 20 }),
  emergencyContactRelationship: varchar('emergency_contact_relationship', { length: 100 }),
  insuranceProvider: varchar('insurance_provider', { length: 255 }),
  insurancePolicyNumber: varchar('insurance_policy_number', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Customer Order Items Table (for better order history tracking)
export const customerOrderItems = pgTable('customer_order_items', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: text('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  productCategory: varchar('product_category', { length: 100 }).notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  therapeuticClass: varchar('therapeutic_class', { length: 100 }),
  activeIngredients: jsonb('active_ingredients').$type<string[]>().default([]),
  orderDate: timestamp('order_date').notNull(),
  orderStatus: varchar('order_status', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Customer Purchase Patterns Table (for recommendation analytics)
export const customerPurchasePatterns = pgTable('customer_purchase_patterns', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  productCategory: varchar('product_category', { length: 100 }).notNull(),
  purchaseFrequency: integer('purchase_frequency').default(0), // times purchased
  totalQuantity: integer('total_quantity').default(0),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).default('0'),
  averageQuantityPerOrder: decimal('average_quantity_per_order', { precision: 8, scale: 2 }).default('0'),
  lastPurchaseDate: timestamp('last_purchase_date'),
  firstPurchaseDate: timestamp('first_purchase_date'),
  preferenceScore: decimal('preference_score', { precision: 5, scale: 2 }).default('0'), // 0-100
  seasonalPattern: jsonb('seasonal_pattern').$type<{
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  }>().default({ spring: 0, summer: 0, autumn: 0, winter: 0 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});
