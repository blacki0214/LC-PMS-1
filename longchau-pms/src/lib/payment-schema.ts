import { pgTable, text, varchar, decimal, timestamp, boolean, jsonb, integer } from 'drizzle-orm/pg-core';
import { orders, customers } from './schema';

// Payment Transactions Table
export const paymentTransactions = pgTable('payment_transactions', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  customerId: text('customer_id').notNull().references(() => customers.id),
  
  // Payment Details
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).default('VND'),
  paymentMethod: varchar('payment_method', { length: 20 }).notNull(), // 'cod', 'card', 'bank_transfer', 'momo', 'zalopay', 'vnpay'
  paymentStatus: varchar('payment_status', { length: 20 }).notNull().default('pending'), // 'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
  
  // Gateway Information
  gatewayProvider: varchar('gateway_provider', { length: 50 }), // 'vnpay', 'momo', 'zalopay', 'stripe', etc.
  gatewayTransactionId: varchar('gateway_transaction_id', { length: 255 }),
  gatewayResponse: jsonb('gateway_response'), // Full response from payment gateway
  
  // Transaction Details
  transactionDate: timestamp('transaction_date').defaultNow(),
  processedAt: timestamp('processed_at'),
  failureReason: text('failure_reason'),
  refundAmount: decimal('refund_amount', { precision: 10, scale: 2 }),
  refundDate: timestamp('refund_date'),
  refundReason: text('refund_reason'),
  
  // Security and Verification
  securityCode: varchar('security_code', { length: 10 }), // For verification
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payment Methods (Saved payment methods for customers)
export const customerPaymentMethods = pgTable('customer_payment_methods', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  
  // Payment Method Info
  type: varchar('type', { length: 20 }).notNull(), // 'card', 'bank_account', 'e_wallet'
  provider: varchar('provider', { length: 50 }), // 'visa', 'mastercard', 'momo', 'zalopay', etc.
  name: varchar('name', { length: 100 }).notNull(), // Display name
  
  // Encrypted/Tokenized Data
  maskedNumber: varchar('masked_number', { length: 50 }), // e.g., "**** **** **** 1234"
  token: text('token'), // Payment gateway token for reuse
  expiryMonth: integer('expiry_month'),
  expiryYear: integer('expiry_year'),
  
  // Settings
  isDefault: boolean('is_default').default(false),
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Receipts Table
export const receipts = pgTable('receipts', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  paymentTransactionId: text('payment_transaction_id').references(() => paymentTransactions.id),
  customerId: text('customer_id').notNull().references(() => customers.id),
  
  // Receipt Details
  receiptNumber: varchar('receipt_number', { length: 50 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'sale', 'refund', 'partial_refund'
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }).notNull(),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  
  // Receipt Items (detailed breakdown)
  items: jsonb('items').notNull(), // Array of items with prices, quantities, etc.
  
  // Tax and Compliance
  taxRate: decimal('tax_rate', { precision: 5, scale: 2 }).default('0'),
  taxId: varchar('tax_id', { length: 50 }), // For business tax purposes
  
  // Generation and Delivery
  generatedAt: timestamp('generated_at').defaultNow(),
  sentToCustomer: boolean('sent_to_customer').default(false),
  emailSentAt: timestamp('email_sent_at'),
  printedAt: timestamp('printed_at'),
  
  // Digital Receipt
  pdfUrl: text('pdf_url'),
  qrCode: text('qr_code'), // QR code for verification
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Payment Gateway Configurations
export const paymentGatewayConfigs = pgTable('payment_gateway_configs', {
  id: text('id').primaryKey(),
  provider: varchar('provider', { length: 50 }).notNull(), // 'vnpay', 'momo', 'zalopay', etc.
  name: varchar('name', { length: 100 }).notNull(),
  
  // Configuration
  isActive: boolean('is_active').default(false),
  isTestMode: boolean('is_test_mode').default(true),
  config: jsonb('config').notNull(), // Provider-specific configuration
  
  // Credentials (should be encrypted)
  merchantId: varchar('merchant_id', { length: 255 }),
  secretKey: text('secret_key'), // Encrypted
  publicKey: text('public_key'),
  
  // Settings
  supportedCurrencies: jsonb('supported_currencies').default(['VND']),
  minAmount: decimal('min_amount', { precision: 10, scale: 2 }).default('1000'),
  maxAmount: decimal('max_amount', { precision: 10, scale: 2 }).default('100000000'),
  
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
