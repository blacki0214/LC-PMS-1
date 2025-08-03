import { db } from '../lib/db';
import { customers } from '../lib/schema';
import { customerHealthInfo, customerOrderItems, customerPurchasePatterns } from '../lib/recommendation-schema';
import { eq, desc, and, sql } from 'drizzle-orm';

export interface CustomerHealthData {
  id?: string;
  customerId: string;
  bloodType?: string;
  height?: number;
  weight?: number;
  allergies?: string[];
  chronicConditions?: string[];
  currentMedications?: {
    name: string;
    dosage: string;
    frequency: string;
    startDate: string;
    prescribedBy?: string;
  }[];
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
}

export interface CustomerOrderItem {
  id?: string;
  customerId: string;
  orderId: string;
  productId: string;
  productName: string;
  productCategory: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  therapeuticClass?: string;
  activeIngredients?: string[];
  orderDate: Date;
  orderStatus: string;
}

export interface CustomerPurchasePattern {
  id?: string;
  customerId: string;
  productCategory: string;
  purchaseFrequency: number;
  totalQuantity: number;
  totalAmount: number;
  averageQuantityPerOrder: number;
  lastPurchaseDate?: Date;
  firstPurchaseDate?: Date;
  preferenceScore: number;
  seasonalPattern: {
    spring: number;
    summer: number;
    autumn: number;
    winter: number;
  };
}

export class CustomerDataService {
  
  // Health Information Methods
  static async saveCustomerHealthInfo(healthData: CustomerHealthData): Promise<CustomerHealthData | null> {
    try {
      const id = healthData.id || `health-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const result = await db.insert(customerHealthInfo).values({
        id,
        customerId: healthData.customerId,
        bloodType: healthData.bloodType,
        height: healthData.height,
        weight: healthData.weight ? healthData.weight.toString() : undefined,
        allergies: healthData.allergies || [],
        chronicConditions: healthData.chronicConditions || [],
        currentMedications: healthData.currentMedications || [],
        emergencyContactName: healthData.emergencyContactName,
        emergencyContactPhone: healthData.emergencyContactPhone,
        emergencyContactRelationship: healthData.emergencyContactRelationship,
        insuranceProvider: healthData.insuranceProvider,
        insurancePolicyNumber: healthData.insurancePolicyNumber,
      }).returning();

      return result[0] ? {
        ...healthData,
        id: result[0].id
      } : null;
    } catch (error) {
      console.error('Error saving customer health info:', error);
      return null;
    }
  }

  static async getCustomerHealthInfo(customerId: string): Promise<CustomerHealthData | null> {
    try {
      const result = await db.select()
        .from(customerHealthInfo)
        .where(eq(customerHealthInfo.customerId, customerId))
        .limit(1);

      if (result.length === 0) return null;

      const health = result[0];
      return {
        id: health.id,
        customerId: health.customerId,
        bloodType: health.bloodType || undefined,
        height: health.height || undefined,
        weight: health.weight ? parseFloat(health.weight) : undefined,
        allergies: health.allergies || [],
        chronicConditions: health.chronicConditions || [],
        currentMedications: health.currentMedications || [],
        emergencyContactName: health.emergencyContactName || undefined,
        emergencyContactPhone: health.emergencyContactPhone || undefined,
        emergencyContactRelationship: health.emergencyContactRelationship || undefined,
        insuranceProvider: health.insuranceProvider || undefined,
        insurancePolicyNumber: health.insurancePolicyNumber || undefined,
      };
    } catch (error) {
      console.error('Error getting customer health info:', error);
      return null;
    }
  }

  static async updateCustomerHealthInfo(customerId: string, healthData: Partial<CustomerHealthData>): Promise<boolean> {
    try {
      await db.update(customerHealthInfo)
        .set({
          bloodType: healthData.bloodType,
          height: healthData.height,
          weight: healthData.weight ? healthData.weight.toString() : undefined,
          allergies: healthData.allergies,
          chronicConditions: healthData.chronicConditions,
          currentMedications: healthData.currentMedications,
          emergencyContactName: healthData.emergencyContactName,
          emergencyContactPhone: healthData.emergencyContactPhone,
          emergencyContactRelationship: healthData.emergencyContactRelationship,
          insuranceProvider: healthData.insuranceProvider,
          insurancePolicyNumber: healthData.insurancePolicyNumber,
          updatedAt: new Date(),
        })
        .where(eq(customerHealthInfo.customerId, customerId));

      return true;
    } catch (error) {
      console.error('Error updating customer health info:', error);
      return false;
    }
  }

  // Order Items Methods
  static async saveCustomerOrderItems(orderItems: CustomerOrderItem[]): Promise<boolean> {
    try {
      const itemsToInsert = orderItems.map(item => ({
        id: item.id || `order-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        customerId: item.customerId,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        productCategory: item.productCategory,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        totalPrice: item.totalPrice.toString(),
        therapeuticClass: item.therapeuticClass,
        activeIngredients: item.activeIngredients || [],
        orderDate: item.orderDate,
        orderStatus: item.orderStatus,
      }));

      await db.insert(customerOrderItems).values(itemsToInsert);
      return true;
    } catch (error) {
      console.error('Error saving customer order items:', error);
      return false;
    }
  }

  static async getCustomerOrderHistory(customerId: string, limit: number = 50): Promise<CustomerOrderItem[]> {
    try {
      const result = await db.select()
        .from(customerOrderItems)
        .where(eq(customerOrderItems.customerId, customerId))
        .orderBy(desc(customerOrderItems.orderDate))
        .limit(limit);

      return result.map(item => ({
        id: item.id,
        customerId: item.customerId,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        productCategory: item.productCategory,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice),
        totalPrice: parseFloat(item.totalPrice),
        therapeuticClass: item.therapeuticClass || undefined,
        activeIngredients: item.activeIngredients || [],
        orderDate: item.orderDate,
        orderStatus: item.orderStatus,
      }));
    } catch (error) {
      console.error('Error getting customer order history:', error);
      return [];
    }
  }

  // Purchase Patterns Methods
  static async updateCustomerPurchasePatterns(customerId: string): Promise<boolean> {
    try {
      // Get all order items for this customer
      const orderItems = await this.getCustomerOrderHistory(customerId, 1000);
      
      // Group by category and calculate patterns
      const categoryMap: { [category: string]: CustomerOrderItem[] } = {};
      orderItems.forEach(item => {
        if (!categoryMap[item.productCategory]) {
          categoryMap[item.productCategory] = [];
        }
        categoryMap[item.productCategory].push(item);
      });

      // Calculate patterns for each category
      const patterns: CustomerPurchasePattern[] = [];
      for (const [category, items] of Object.entries(categoryMap)) {
        const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const purchaseFrequency = items.length;
        const averageQuantityPerOrder = totalQuantity / purchaseFrequency;
        
        const dates = items.map(item => new Date(item.orderDate)).sort();
        const firstPurchaseDate = dates[0];
        const lastPurchaseDate = dates[dates.length - 1];

        // Calculate seasonal pattern
        const seasonalPattern = { spring: 0, summer: 0, autumn: 0, winter: 0 };
        items.forEach(item => {
          const month = new Date(item.orderDate).getMonth();
          if (month >= 2 && month <= 4) seasonalPattern.spring++;
          else if (month >= 5 && month <= 7) seasonalPattern.summer++;
          else if (month >= 8 && month <= 10) seasonalPattern.autumn++;
          else seasonalPattern.winter++;
        });

        // Calculate preference score (0-100) based on frequency and recency
        const daysSinceLastPurchase = (Date.now() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24);
        const recencyScore = Math.max(0, 100 - (daysSinceLastPurchase / 30) * 10); // Decrease 10 points per 30 days
        const frequencyScore = Math.min(100, purchaseFrequency * 10); // 10 points per purchase, max 100
        const preferenceScore = (recencyScore * 0.4 + frequencyScore * 0.6);

        patterns.push({
          customerId,
          productCategory: category,
          purchaseFrequency,
          totalQuantity,
          totalAmount,
          averageQuantityPerOrder,
          lastPurchaseDate,
          firstPurchaseDate,
          preferenceScore,
          seasonalPattern,
        });
      }

      // Delete existing patterns and insert new ones
      await db.delete(customerPurchasePatterns)
        .where(eq(customerPurchasePatterns.customerId, customerId));

      if (patterns.length > 0) {
        const patternsToInsert = patterns.map(pattern => ({
          id: `pattern-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          customerId: pattern.customerId,
          productCategory: pattern.productCategory,
          purchaseFrequency: pattern.purchaseFrequency,
          totalQuantity: pattern.totalQuantity,
          totalAmount: pattern.totalAmount.toString(),
          averageQuantityPerOrder: pattern.averageQuantityPerOrder.toString(),
          lastPurchaseDate: pattern.lastPurchaseDate,
          firstPurchaseDate: pattern.firstPurchaseDate,
          preferenceScore: pattern.preferenceScore.toString(),
          seasonalPattern: pattern.seasonalPattern,
        }));

        await db.insert(customerPurchasePatterns).values(patternsToInsert);
      }

      return true;
    } catch (error) {
      console.error('Error updating customer purchase patterns:', error);
      return false;
    }
  }

  static async getCustomerPurchasePatterns(customerId: string): Promise<CustomerPurchasePattern[]> {
    try {
      const result = await db.select()
        .from(customerPurchasePatterns)
        .where(eq(customerPurchasePatterns.customerId, customerId))
        .orderBy(desc(customerPurchasePatterns.preferenceScore));

      return result.map(pattern => ({
        id: pattern.id,
        customerId: pattern.customerId,
        productCategory: pattern.productCategory,
        purchaseFrequency: pattern.purchaseFrequency || 0,
        totalQuantity: pattern.totalQuantity || 0,
        totalAmount: parseFloat(pattern.totalAmount || '0'),
        averageQuantityPerOrder: parseFloat(pattern.averageQuantityPerOrder || '0'),
        lastPurchaseDate: pattern.lastPurchaseDate || undefined,
        firstPurchaseDate: pattern.firstPurchaseDate || undefined,
        preferenceScore: parseFloat(pattern.preferenceScore || '0'),
        seasonalPattern: pattern.seasonalPattern || { spring: 0, summer: 0, autumn: 0, winter: 0 },
      }));
    } catch (error) {
      console.error('Error getting customer purchase patterns:', error);
      return [];
    }
  }

  // Comprehensive customer profile for recommendations
  static async getCompleteCustomerProfile(customerId: string): Promise<{
    customer: any;
    healthInfo: CustomerHealthData | null;
    orderHistory: CustomerOrderItem[];
    purchasePatterns: CustomerPurchasePattern[];
  } | null> {
    try {
      // Get basic customer info
      const customerResult = await db.select()
        .from(customers)
        .where(eq(customers.id, customerId))
        .limit(1);

      if (customerResult.length === 0) return null;

      const customer = customerResult[0];

      // Get health info
      const healthInfo = await this.getCustomerHealthInfo(customerId);

      // Get order history
      const orderHistory = await this.getCustomerOrderHistory(customerId);

      // Get purchase patterns
      const purchasePatterns = await this.getCustomerPurchasePatterns(customerId);

      return {
        customer,
        healthInfo,
        orderHistory,
        purchasePatterns,
      };
    } catch (error) {
      console.error('Error getting complete customer profile:', error);
      return null;
    }
  }
}
