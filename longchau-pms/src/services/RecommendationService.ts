import { db } from '../lib/db';
import { orders, products, customers, users } from '../lib/schema';
import { eq, desc, and, inArray } from 'drizzle-orm';
import { CustomerDataService, CustomerHealthData, CustomerOrderItem, CustomerPurchasePattern } from './CustomerDataService';

// Helper function to safely parse JSON (keeping for backward compatibility)
function safeJsonParse(data: any): any {
  if (!data) return null;
  if (typeof data === 'object') return data;
  if (typeof data === 'string') {
    try {
      return JSON.parse(data);
    } catch (error) {
      console.warn('Failed to parse JSON:', error, 'Data:', data);
      return null;
    }
  }
  return null;
}

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  healthConditions?: string[];
  allergies?: string[];
  chronicConditions?: string[];
  preferredCategories?: string[];
  totalOrders: number;
  averageOrderValue: number;
  lastOrderDate?: string;
  purchasePatterns?: CustomerPurchasePattern[];
  healthInfo?: CustomerHealthData;
}

export interface OrderHistory {
  orderId: string;
  date: string;
  products: {
    id: string;
    name: string;
    category: string;
    quantity: number;
    price: number;
    therapeuticClass?: string;
    activeIngredients?: string[];
  }[];
  totalAmount: number;
  frequency: 'one-time' | 'regular' | 'chronic';
}

export interface ProductRecommendation {
  product: {
    id: string;
    name: string;
    category: string;
    price: number;
    description: string;
    therapeuticClass?: string;
    activeIngredients?: string[];
    stockQuantity: number;
  };
  score: number;
  reasons: string[];
  recommendationType: 'similar' | 'complementary' | 'health-based' | 'trending' | 'seasonal';
  confidence: number;
}

export interface HealthInsight {
  condition: string;
  severity: 'low' | 'medium' | 'high';
  recommendedActions: string[];
  suggestedProducts: string[];
  lastRelatedPurchase?: string;
  frequency: number;
}

export class RecommendationService {
  
  // Helper method to find customer by email
  static async getCustomerByEmail(email: string): Promise<{ id: string; name: string; email: string } | null> {
    try {
      const customerData = await db.select()
        .from(customers)
        .where(eq(customers.email, email))
        .limit(1);

      if (customerData.length === 0) {
        console.log('No customer found with email:', email);
        return null;
      }

      return {
        id: customerData[0].id,
        name: customerData[0].name,
        email: customerData[0].email
      };
    } catch (error) {
      console.error('Error finding customer by email:', error);
      return null;
    }
  }
  
  // Public method to get personalized recommendations
  async getPersonalizedRecommendations(customerId: string, allProducts: any[]): Promise<ProductRecommendation[]> {
    try {
      console.log('🔍 Getting personalized recommendations for customer:', customerId);
      console.log('📊 Total products available:', allProducts.length);
      
      const profile = await RecommendationService.getCustomerProfile(customerId);
      if (!profile) {
        console.log('❌ No customer profile found for ID:', customerId);
        return [];
      }

      console.log('✅ Customer profile found:', {
        name: profile.name,
        email: profile.email,
        totalOrders: profile.totalOrders,
        preferredCategories: profile.preferredCategories
      });

      const orderHistory = await RecommendationService.analyzeCustomerHabits(customerId);
      console.log('📈 Order history analyzed:', orderHistory.length, 'orders');
      
      const healthInsights = await RecommendationService.getHealthInsights(customerId);
      console.log('🏥 Health insights generated:', healthInsights.length);

      // Combine different recommendation strategies
      const recommendations: ProductRecommendation[] = [];
      
      // Get health-based recommendations
      const healthBasedRecs = await RecommendationService.getHealthBasedRecommendations(profile, allProducts);
      console.log('🏥 Health-based recommendations:', healthBasedRecs.length);
      recommendations.push(...healthBasedRecs);

      // Get complementary product recommendations
      const complementaryRecs = await RecommendationService.getComplementaryRecommendations(orderHistory, allProducts);
      console.log('🔗 Complementary recommendations:', complementaryRecs.length);
      recommendations.push(...complementaryRecs);

      console.log('🎯 Total recommendations before sorting:', recommendations.length);

      // Sort by score and return top recommendations
      const finalRecs = recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, 10);
        
      console.log('✅ Final recommendations returned:', finalRecs.length);
      return finalRecs;
    } catch (error) {
      console.error('❌ Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Public method to generate health insights
  async generateHealthInsights(customerId: string): Promise<HealthInsight[]> {
    return RecommendationService.getHealthInsights(customerId);
  }
  
  // Get comprehensive customer profile with health and order analysis
  static async getCustomerProfile(customerId: string): Promise<CustomerProfile | null> {
    try {
      console.log('🔍 Getting customer profile from database for:', customerId);
      
      // Get complete customer profile using the new service
      const completeProfile = await CustomerDataService.getCompleteCustomerProfile(customerId);
      if (!completeProfile) {
        console.log('❌ No customer profile found');
        return null;
      }

      const { customer, healthInfo, orderHistory, purchasePatterns } = completeProfile;

      console.log('✅ Customer profile retrieved:', {
        customerName: customer.name,
        orderHistoryItems: orderHistory.length,
        purchasePatterns: purchasePatterns.length,
        hasHealthInfo: !!healthInfo
      });

      // Calculate basic stats from order history
      const totalOrders = orderHistory.length;
      const totalSpent = orderHistory.reduce((sum, item) => sum + item.totalPrice, 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
      const lastOrderDate = orderHistory[0]?.orderDate.toISOString();

      // Get preferred categories from purchase patterns
      const preferredCategories = purchasePatterns
        .sort((a, b) => b.preferenceScore - a.preferenceScore)
        .slice(0, 5)
        .map(pattern => pattern.productCategory);

      // Calculate age from date of birth
      const calculateAge = (dateOfBirth: string): number => {
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      };

      // Parse health status for backward compatibility
      const healthStatus = customer.healthStatus ? (customer.healthStatus as any) : {};
      const age = customer.dateOfBirth ? calculateAge(customer.dateOfBirth) : undefined;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        age,
        gender: healthInfo?.bloodType ? 'male' : healthStatus.gender || undefined,
        healthConditions: healthInfo?.chronicConditions || [],
        allergies: healthInfo?.allergies || customer.allergies || [],
        chronicConditions: healthInfo?.chronicConditions || [],
        preferredCategories,
        totalOrders,
        averageOrderValue,
        lastOrderDate,
        purchasePatterns,
        healthInfo: healthInfo || undefined,
      };

    } catch (error) {
      console.error('❌ Error getting customer profile:', error);
      return null;
    }
  }

  // Analyze customer order patterns and health trends
  static async analyzeCustomerHabits(customerId: string): Promise<OrderHistory[]> {
    try {
      console.log('📈 Analyzing customer habits from database for:', customerId);
      
      // Get order history from the new service
      const orderItems = await CustomerDataService.getCustomerOrderHistory(customerId);
      
      console.log('✅ Retrieved order items:', orderItems.length);

      // Group order items by order ID
      const orderMap: { [orderId: string]: CustomerOrderItem[] } = {};
      orderItems.forEach(item => {
        if (!orderMap[item.orderId]) {
          orderMap[item.orderId] = [];
        }
        orderMap[item.orderId].push(item);
      });

      const analyzedHistory: OrderHistory[] = [];

      // Convert to OrderHistory format
      for (const [orderId, items] of Object.entries(orderMap)) {
        const firstItem = items[0];
        
        const products = items.map(item => ({
          id: item.productId,
          name: item.productName,
          category: item.productCategory,
          quantity: item.quantity,
          price: item.unitPrice,
          therapeuticClass: item.therapeuticClass,
          activeIngredients: item.activeIngredients || [],
        }));

        // Determine frequency pattern based on product categories
        const frequency = await this.determineOrderFrequencyFromDatabase(items, customerId);

        const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

        analyzedHistory.push({
          orderId,
          date: firstItem.orderDate.toISOString(),
          products,
          totalAmount,
          frequency,
        });
      }

      console.log('✅ Analyzed order history:', analyzedHistory.length, 'orders');
      return analyzedHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    } catch (error) {
      console.error('❌ Error analyzing customer habits:', error);
      return [];
    }
  }

  // Determine order frequency using database purchase patterns
  private static async determineOrderFrequencyFromDatabase(
    orderItems: CustomerOrderItem[], 
    customerId: string
  ): Promise<'one-time' | 'regular' | 'chronic'> {
    try {
      // Get purchase patterns for the customer
      const purchasePatterns = await CustomerDataService.getCustomerPurchasePatterns(customerId);
      
      // Get categories from current order
      const orderCategories = [...new Set(orderItems.map(item => item.productCategory))];
      
      // Check purchase frequency for these categories
      let maxFrequency = 0;
      let totalPatterns = 0;
      
      for (const category of orderCategories) {
        const pattern = purchasePatterns.find(p => p.productCategory === category);
        if (pattern) {
          maxFrequency = Math.max(maxFrequency, pattern.purchaseFrequency);
          totalPatterns++;
        }
      }
      
      // Determine frequency based on patterns
      if (maxFrequency >= 5 || totalPatterns >= 3) return 'chronic';
      if (maxFrequency >= 2) return 'regular';
      return 'one-time';
    } catch (error) {
      console.warn('Error determining order frequency from database:', error);
      return 'one-time';
    }
  }

  // Generate personalized product recommendations
  static async generateRecommendations(customerId: string): Promise<ProductRecommendation[]> {
    try {
      const customerProfile = await this.getCustomerProfile(customerId);
      const orderHistory = await this.analyzeCustomerHabits(customerId);
      
      if (!customerProfile) return [];

      // Get all available products
      const allProducts = await db.select().from(products);
      
      const recommendations: ProductRecommendation[] = [];

      // 1. Similar products based on purchase history
      const similarRecommendations = this.getSimilarProductRecommendations(
        orderHistory, 
        allProducts, 
        customerProfile
      );
      recommendations.push(...similarRecommendations);

      // 2. Health-based recommendations
      const healthRecommendations = this.getHealthBasedRecommendations(
        customerProfile, 
        allProducts
      );
      recommendations.push(...healthRecommendations);

      // 3. Complementary products
      const complementaryRecommendations = this.getComplementaryRecommendations(
        orderHistory, 
        allProducts
      );
      recommendations.push(...complementaryRecommendations);

      // 4. Trending products in preferred categories
      const trendingRecommendations = this.getTrendingRecommendations(
        customerProfile, 
        allProducts
      );
      recommendations.push(...trendingRecommendations);

      // Sort by score and remove duplicates
      const uniqueRecommendations = this.removeDuplicatesAndSort(recommendations);

      return uniqueRecommendations.slice(0, 12); // Top 12 recommendations

    } catch (error) {
      console.error('❌ Error generating recommendations:', error);
      return [];
    }
  }

  // Analyze health insights and medication patterns
  static async getHealthInsights(customerId: string): Promise<HealthInsight[]> {
    try {
      const customerProfile = await this.getCustomerProfile(customerId);
      const orderHistory = await this.analyzeCustomerHabits(customerId);

      if (!customerProfile) return [];

      const insights: HealthInsight[] = [];

      // Analyze chronic conditions
      if (customerProfile.chronicConditions) {
        for (const condition of customerProfile.chronicConditions) {
          const insight = this.analyzeChronicCondition(condition, orderHistory);
          if (insight) insights.push(insight);
        }
      }

      // Analyze medication patterns
      const medicationInsights = this.analyzeMedicationPatterns(orderHistory);
      insights.push(...medicationInsights);

      // Analyze health trends
      const trendInsights = this.analyzeHealthTrends(orderHistory, customerProfile);
      insights.push(...trendInsights);

      return insights;

    } catch (error) {
      console.error('❌ Error getting health insights:', error);
      return [];
    }
  }

  // Helper method to determine order frequency
  private static determineOrderFrequency(currentOrder: any, allOrders: any[]): 'one-time' | 'regular' | 'chronic' {
    if (!currentOrder.items) return 'one-time';

    try {
      let items;
      if (typeof currentOrder.items === 'string') {
        items = JSON.parse(currentOrder.items);
      } else if (typeof currentOrder.items === 'object') {
        items = currentOrder.items;
      } else {
        return 'one-time';
      }

      if (!Array.isArray(items)) return 'one-time';

      const productIds = items.map((item: any) => item.productId || item.id);

      // Count how many times these products appear in other orders
      let repeatCount = 0;
      for (const order of allOrders) {
        if (order.id === currentOrder.id) continue;
        if (!order.items) continue;

        try {
          let orderItems;
          if (typeof order.items === 'string') {
            orderItems = JSON.parse(order.items);
          } else if (typeof order.items === 'object') {
            orderItems = order.items;
          } else {
            continue;
          }

          if (!Array.isArray(orderItems)) continue;

          const orderProductIds = orderItems.map((item: any) => item.productId || item.id);
          
          const commonProducts = productIds.filter((id: string) => orderProductIds.includes(id));
          if (commonProducts.length > 0) repeatCount++;
        } catch (error) {
          console.warn('Error parsing order items in frequency check:', error);
        }
      }

      if (repeatCount >= 3) return 'chronic';
      if (repeatCount >= 1) return 'regular';
      return 'one-time';
    } catch (error) {
      console.warn('Error in determineOrderFrequency:', error);
      return 'one-time';
    }
  }

  // Generate similar product recommendations
  private static getSimilarProductRecommendations(
    orderHistory: OrderHistory[], 
    allProducts: any[], 
    customerProfile: CustomerProfile
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];
    const purchasedProductIds = new Set();

    // Collect all purchased products
    orderHistory.forEach(order => {
      order.products.forEach(product => {
        purchasedProductIds.add(product.id);
      });
    });

    // Find similar products in preferred categories
    allProducts.forEach(product => {
      if (purchasedProductIds.has(product.id)) return; // Skip already purchased
      if (product.stockQuantity <= 0) return; // Skip out of stock

      let score = 0;
      const reasons: string[] = [];

      // Category preference
      if (customerProfile.preferredCategories?.includes(product.category)) {
        score += 30;
        reasons.push(`Popular in your preferred category: ${product.category}`);
      }

      // Price range compatibility
      if (product.price <= customerProfile.averageOrderValue * 1.5) {
        score += 20;
        reasons.push('Within your typical price range');
      }

      if (score > 25) {
        recommendations.push({
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description || '',
            therapeuticClass: product.therapeuticClass,
            activeIngredients: safeJsonParse(product.activeIngredients) || [],
            stockQuantity: product.stockQuantity,
          },
          score,
          reasons,
          recommendationType: 'similar',
          confidence: Math.min(score / 50, 1),
        });
      }
    });

    return recommendations;
  }

  // Generate health-based recommendations
  private static getHealthBasedRecommendations(
    customerProfile: CustomerProfile, 
    allProducts: any[]
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];

    if (!customerProfile.healthConditions && !customerProfile.chronicConditions) {
      return recommendations;
    }

    const allConditions = [
      ...(customerProfile.healthConditions || []),
      ...(customerProfile.chronicConditions || [])
    ];

    allProducts.forEach(product => {
      if (product.stockQuantity <= 0) return;

      let score = 0;
      const reasons: string[] = [];

      // Check if product helps with health conditions
      allConditions.forEach(condition => {
        if (product.therapeuticClass && this.isRelevantForCondition(condition, product.therapeuticClass)) {
          score += 40;
          reasons.push(`Recommended for ${condition}`);
        }

        if (product.description && product.description.toLowerCase().includes(condition.toLowerCase())) {
          score += 20;
          reasons.push(`May help with ${condition}`);
        }
      });

      // Age-based recommendations
      if (customerProfile.age) {
        if (customerProfile.age >= 60 && product.category === 'Senior Health') {
          score += 25;
          reasons.push('Senior health supplement');
        }
        if (customerProfile.age <= 30 && product.category === 'Vitamins') {
          score += 15;
          reasons.push('Young adult wellness');
        }
      }

      if (score > 30) {
        recommendations.push({
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description || '',
            therapeuticClass: product.therapeuticClass,
            activeIngredients: safeJsonParse(product.activeIngredients) || [],
            stockQuantity: product.stockQuantity,
          },
          score,
          reasons,
          recommendationType: 'health-based',
          confidence: Math.min(score / 60, 1),
        });
      }
    });

    return recommendations;
  }

  // Generate complementary product recommendations
  private static getComplementaryRecommendations(
    orderHistory: OrderHistory[], 
    allProducts: any[]
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];
    const recentProducts = new Set();

    // Get products from recent orders
    orderHistory.slice(0, 5).forEach(order => {
      order.products.forEach(product => {
        recentProducts.add(product.category);
      });
    });

    const complementaryPairs: { [key: string]: string[] } = {
      'Pain Relief': ['Digestive Health', 'Sleep Aid'],
      'Antibiotics': ['Probiotics', 'Digestive Health'],
      'Blood Pressure': ['Heart Health', 'Kidney Health'],
      'Diabetes': ['Heart Health', 'Kidney Health', 'Eye Care'],
      'Vitamins': ['Minerals', 'Digestive Health'],
      'Skin Care': ['Vitamins', 'Anti-inflammatory'],
    };

    allProducts.forEach(product => {
      if (product.stockQuantity <= 0) return;

      let score = 0;
      const reasons: string[] = [];
      const productCategory = product.category as string;

      recentProducts.forEach(category => {
        const categoryStr = category as string;
        if (complementaryPairs[categoryStr]?.includes(productCategory)) {
          score += 35;
          reasons.push(`Complements your recent ${categoryStr} purchase`);
        }
      });

      if (score > 20) {
        recommendations.push({
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description || '',
            therapeuticClass: product.therapeuticClass,
            activeIngredients: safeJsonParse(product.activeIngredients) || [],
            stockQuantity: product.stockQuantity,
          },
          score,
          reasons,
          recommendationType: 'complementary',
          confidence: Math.min(score / 40, 1),
        });
      }
    });

    return recommendations;
  }

  // Generate trending product recommendations
  private static getTrendingRecommendations(
    customerProfile: CustomerProfile, 
    allProducts: any[]
  ): ProductRecommendation[] {
    const recommendations: ProductRecommendation[] = [];

    // Simulate trending products (in a real app, you'd track this from actual data)
    const trendingCategories = ['Vitamins', 'Immune Support', 'Mental Health', 'Digestive Health'];

    allProducts.forEach(product => {
      if (product.stockQuantity <= 0) return;

      let score = 0;
      const reasons: string[] = [];

      if (trendingCategories.includes(product.category)) {
        score += 25;
        reasons.push('Currently trending in your area');
      }

      // Seasonal recommendations
      const currentMonth = new Date().getMonth();
      if (currentMonth >= 10 || currentMonth <= 2) { // Winter months
        if (['Immune Support', 'Vitamins', 'Cold & Flu'].includes(product.category)) {
          score += 20;
          reasons.push('Popular during winter season');
        }
      }

      if (score > 20) {
        recommendations.push({
          product: {
            id: product.id,
            name: product.name,
            category: product.category,
            price: product.price,
            description: product.description || '',
            therapeuticClass: product.therapeuticClass,
            activeIngredients: safeJsonParse(product.activeIngredients) || [],
            stockQuantity: product.stockQuantity,
          },
          score,
          reasons,
          recommendationType: 'trending',
          confidence: Math.min(score / 45, 1),
        });
      }
    });

    return recommendations;
  }

  // Helper method to check if therapeutic class is relevant for condition
  private static isRelevantForCondition(condition: string, therapeuticClass: string): boolean {
    const conditionMap: { [key: string]: string[] } = {
      'diabetes': ['Antidiabetic', 'Insulin', 'Blood Sugar'],
      'hypertension': ['Antihypertensive', 'ACE Inhibitor', 'Beta Blocker'],
      'arthritis': ['Anti-inflammatory', 'Pain Relief', 'NSAID'],
      'depression': ['Antidepressant', 'Mental Health', 'Mood Stabilizer'],
      'anxiety': ['Anxiolytic', 'Mental Health', 'Sedative'],
      'asthma': ['Bronchodilator', 'Respiratory', 'Anti-inflammatory'],
    };

    const relevantClasses = conditionMap[condition.toLowerCase()] || [];
    return relevantClasses.some(cls => therapeuticClass.includes(cls));
  }

  // Analyze chronic condition patterns
  private static analyzeChronicCondition(condition: string, orderHistory: OrderHistory[]): HealthInsight | null {
    const relatedOrders = orderHistory.filter(order => 
      order.products.some(product => 
        this.isRelevantForCondition(condition, product.therapeuticClass || '')
      )
    );

    if (relatedOrders.length === 0) return null;

    const frequency = relatedOrders.length;
    const lastPurchase = relatedOrders[0]?.date;

    let severity: 'low' | 'medium' | 'high' = 'low';
    if (frequency >= 5) severity = 'high';
    else if (frequency >= 3) severity = 'medium';

    return {
      condition,
      severity,
      recommendedActions: [
        'Maintain regular medication schedule',
        'Monitor symptoms regularly',
        'Consult healthcare provider for adjustments'
      ],
      suggestedProducts: relatedOrders[0]?.products.map(p => p.name) || [],
      lastRelatedPurchase: lastPurchase,
      frequency,
    };
  }

  // Analyze medication patterns
  private static analyzeMedicationPatterns(orderHistory: OrderHistory[]): HealthInsight[] {
    const insights: HealthInsight[] = [];
    const medicationCounts: { [key: string]: number } = {};

    orderHistory.forEach(order => {
      order.products.forEach(product => {
        if (product.therapeuticClass) {
          medicationCounts[product.therapeuticClass] = (medicationCounts[product.therapeuticClass] || 0) + 1;
        }
      });
    });

    Object.entries(medicationCounts).forEach(([therapeuticClass, count]) => {
      if (count >= 3) {
        insights.push({
          condition: `Regular ${therapeuticClass} use`,
          severity: count >= 5 ? 'high' : 'medium',
          recommendedActions: [
            'Continue as prescribed',
            'Monitor for side effects',
            'Schedule regular check-ups'
          ],
          suggestedProducts: [],
          frequency: count,
        });
      }
    });

    return insights;
  }

  // Analyze health trends
  private static analyzeHealthTrends(orderHistory: OrderHistory[], customerProfile: CustomerProfile): HealthInsight[] {
    const insights: HealthInsight[] = [];

    // Check for wellness trends
    const wellnessCategories = ['Vitamins', 'Supplements', 'Immune Support'];
    const wellnessPurchases = orderHistory.filter(order =>
      order.products.some(product => wellnessCategories.includes(product.category))
    );

    if (wellnessPurchases.length >= 3) {
      insights.push({
        condition: 'Wellness-focused lifestyle',
        severity: 'low',
        recommendedActions: [
          'Continue preventive care approach',
          'Consider annual health checkups',
          'Maintain balanced diet'
        ],
        suggestedProducts: ['Multivitamins', 'Omega-3', 'Probiotics'],
        frequency: wellnessPurchases.length,
      });
    }

    return insights;
  }

  // Remove duplicates and sort recommendations
  private static removeDuplicatesAndSort(recommendations: ProductRecommendation[]): ProductRecommendation[] {
    const seen = new Set();
    const unique = recommendations.filter(rec => {
      if (seen.has(rec.product.id)) return false;
      seen.add(rec.product.id);
      return true;
    });

    return unique.sort((a, b) => b.score - a.score);
  }
}
