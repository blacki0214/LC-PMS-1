import { db } from '../lib/db';
import { paymentTransactions, customerPaymentMethods, receipts, paymentGatewayConfigs } from '../lib/payment-schema';
import { orders } from '../lib/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export interface PaymentRequest {
  orderId: string;
  customerId: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  gatewayProvider?: string;
  returnUrl?: string;
  description?: string;
  customerInfo?: {
    name: string;
    email: string;
    phone: string;
  };
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  paymentUrl?: string;
  qrCode?: string;
  message?: string;
  error?: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
  reason: string;
}

export class PaymentService {
  
  // Initialize payment for an order
  static async initiatePayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const transactionId = nanoid();
      
      // Create payment transaction record
      const transaction = {
        id: transactionId,
        orderId: paymentRequest.orderId,
        customerId: paymentRequest.customerId,
        amount: paymentRequest.amount.toString(),
        currency: paymentRequest.currency || 'VND',
        paymentMethod: paymentRequest.paymentMethod,
        gatewayProvider: paymentRequest.gatewayProvider,
        paymentStatus: 'pending',
        securityCode: nanoid(8),
        ipAddress: '', // Should be set from request
        userAgent: '', // Should be set from request
      };
      
      await db.insert(paymentTransactions).values(transaction);
      
      // Handle different payment methods
      switch (paymentRequest.paymentMethod) {
        case 'cod':
          return await this.handleCODPayment(transactionId);
        
        case 'vnpay':
          return await this.handleVNPayPayment(transactionId, paymentRequest);
        
        case 'momo':
          return await this.handleMoMoPayment(transactionId, paymentRequest);
        
        case 'zalopay':
          return await this.handleZaloPayPayment(transactionId, paymentRequest);
        
        case 'bank_transfer':
          return await this.handleBankTransferPayment(transactionId, paymentRequest);
        
        default:
          throw new Error(`Unsupported payment method: ${paymentRequest.paymentMethod}`);
      }
      
    } catch (error) {
      console.error('Payment initiation error:', error);
      return {
        success: false,
        transactionId: '',
        error: error instanceof Error ? error.message : 'Payment initiation failed'
      };
    }
  }
  
  // Handle Cash on Delivery
  private static async handleCODPayment(transactionId: string): Promise<PaymentResponse> {
    await db.update(paymentTransactions)
      .set({ 
        paymentStatus: 'pending',
        processedAt: new Date()
      })
      .where(eq(paymentTransactions.id, transactionId));
    
    return {
      success: true,
      transactionId,
      message: 'Cash on Delivery order confirmed. Pay when you receive your items.'
    };
  }
  
  // Handle VNPay integration
  private static async handleVNPayPayment(transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      // Get VNPay configuration
      const config = await this.getGatewayConfig('vnpay');
      if (!config) {
        throw new Error('VNPay configuration not found');
      }
      
      // VNPay payment URL generation
      const vnpayData = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: config.merchantId,
        vnp_Amount: Math.round(request.amount * 100), // VNPay requires amount in xu (VND * 100)
        vnp_CreateDate: new Date().toISOString().replace(/[-:]/g, '').split('.')[0],
        vnp_CurrCode: 'VND',
        vnp_IpAddr: '127.0.0.1', // Should get real IP
        vnp_Locale: 'vn',
        vnp_OrderInfo: `Payment for order ${request.orderId}`,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: request.returnUrl || 'http://localhost:5182/payment/return',
        vnp_TxnRef: transactionId,
      };
      
      // Generate secure hash and payment URL
      const paymentUrl = this.generateVNPayUrl(vnpayData, config.secretKey || '');
      
      await db.update(paymentTransactions)
        .set({ 
          paymentStatus: 'processing',
          gatewayResponse: vnpayData
        })
        .where(eq(paymentTransactions.id, transactionId));
      
      return {
        success: true,
        transactionId,
        paymentUrl,
        message: 'Redirect to VNPay for payment'
      };
      
    } catch (error) {
      console.error('VNPay payment error:', error);
      return {
        success: false,
        transactionId,
        error: 'VNPay payment setup failed'
      };
    }
  }
  
  // Handle MoMo integration
  private static async handleMoMoPayment(transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const config = await this.getGatewayConfig('momo');
      if (!config) {
        throw new Error('MoMo configuration not found');
      }
      
      // MoMo payment request
      const momoData = {
        partnerCode: config.merchantId,
        requestId: transactionId,
        amount: request.amount,
        orderId: request.orderId,
        orderInfo: `Payment for order ${request.orderId}`,
        redirectUrl: request.returnUrl || 'http://localhost:5182/payment/return',
        ipnUrl: 'http://localhost:5182/api/payment/momo/callback',
        requestType: 'payWithATM',
        extraData: '',
        lang: 'en'
      };
      
      // Generate signature and make API call to MoMo
      // This would require actual MoMo API integration
      const paymentUrl = `https://test-payment.momo.vn/gw_payment/transactionProcessor?${new URLSearchParams(momoData as any).toString()}`;
      
      await db.update(paymentTransactions)
        .set({ 
          paymentStatus: 'processing',
          gatewayResponse: momoData
        })
        .where(eq(paymentTransactions.id, transactionId));
      
      return {
        success: true,
        transactionId,
        paymentUrl,
        message: 'Redirect to MoMo for payment'
      };
      
    } catch (error) {
      console.error('MoMo payment error:', error);
      return {
        success: false,
        transactionId,
        error: 'MoMo payment setup failed'
      };
    }
  }
  
  // Handle ZaloPay integration
  private static async handleZaloPayPayment(transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    try {
      const config = await this.getGatewayConfig('zalopay');
      if (!config) {
        throw new Error('ZaloPay configuration not found');
      }
      
      // ZaloPay specific implementation
      const zaloPayData = {
        app_id: config.merchantId,
        app_trans_id: transactionId,
        app_user: request.customerInfo?.name || 'customer',
        amount: request.amount,
        description: `Payment for order ${request.orderId}`,
        bank_code: '',
        callback_url: 'http://localhost:5182/api/payment/zalopay/callback'
      };
      
      // This would require actual ZaloPay API integration
      const paymentUrl = 'https://sb-openapi.zalopay.vn/v2/create';
      
      await db.update(paymentTransactions)
        .set({ 
          paymentStatus: 'processing',
          gatewayResponse: zaloPayData
        })
        .where(eq(paymentTransactions.id, transactionId));
      
      return {
        success: true,
        transactionId,
        paymentUrl,
        message: 'Redirect to ZaloPay for payment'
      };
      
    } catch (error) {
      console.error('ZaloPay payment error:', error);
      return {
        success: false,
        transactionId,
        error: 'ZaloPay payment setup failed'
      };
    }
  }
  
  // Handle Bank Transfer
  private static async handleBankTransferPayment(transactionId: string, request: PaymentRequest): Promise<PaymentResponse> {
    // Generate bank transfer instructions
    const bankInfo = {
      bankName: 'Vietcombank',
      accountNumber: '1234567890',
      accountName: 'Long Chau Pharmacy',
      transferContent: `PAYMENT ${transactionId}`,
      amount: request.amount
    };
    
    await db.update(paymentTransactions)
      .set({ 
        paymentStatus: 'pending',
        gatewayResponse: bankInfo
      })
      .where(eq(paymentTransactions.id, transactionId));
    
    return {
      success: true,
      transactionId,
      message: 'Bank transfer instructions generated. Please complete the transfer to confirm your order.'
    };
  }
  
  // Process payment callback/webhook
  static async processPaymentCallback(provider: string, callbackData: any): Promise<boolean> {
    try {
      let transactionId: string;
      let status: string;
      
      switch (provider) {
        case 'vnpay':
          transactionId = callbackData.vnp_TxnRef;
          status = callbackData.vnp_ResponseCode === '00' ? 'completed' : 'failed';
          break;
        
        case 'momo':
          transactionId = callbackData.requestId;
          status = callbackData.resultCode === 0 ? 'completed' : 'failed';
          break;
        
        case 'zalopay':
          transactionId = callbackData.app_trans_id;
          status = callbackData.return_code === 1 ? 'completed' : 'failed';
          break;
        
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
      
      // Update transaction status
      await db.update(paymentTransactions)
        .set({ 
          paymentStatus: status,
          processedAt: new Date(),
          gatewayTransactionId: callbackData.transaction_id || callbackData.orderId,
          gatewayResponse: callbackData
        })
        .where(eq(paymentTransactions.id, transactionId));
      
      // Update order status if payment completed
      if (status === 'completed') {
        await db.update(orders)
          .set({ 
            paymentStatus: 'paid',
            status: 'confirmed'
          })
          .where(eq(orders.id, (await this.getTransactionOrder(transactionId))?.orderId || ''));
        
        // Generate receipt
        await this.generateReceipt(transactionId);
      }
      
      return true;
      
    } catch (error) {
      console.error('Payment callback processing error:', error);
      return false;
    }
  }
  
  // Process refund
  static async processRefund(refundRequest: RefundRequest): Promise<PaymentResponse> {
    try {
      const transaction = await db.select()
        .from(paymentTransactions)
        .where(eq(paymentTransactions.id, refundRequest.transactionId))
        .limit(1);
      
      if (transaction.length === 0) {
        throw new Error('Transaction not found');
      }
      
      const tx = transaction[0];
      
      // Update transaction with refund info
      await db.update(paymentTransactions)
        .set({
          paymentStatus: 'refunded',
          refundAmount: refundRequest.amount.toString(),
          refundDate: new Date(),
          refundReason: refundRequest.reason
        })
        .where(eq(paymentTransactions.id, refundRequest.transactionId));
      
      // Generate refund receipt
      await this.generateRefundReceipt(refundRequest.transactionId, refundRequest.amount);
      
      return {
        success: true,
        transactionId: refundRequest.transactionId,
        message: 'Refund processed successfully'
      };
      
    } catch (error) {
      console.error('Refund processing error:', error);
      return {
        success: false,
        transactionId: refundRequest.transactionId,
        error: error instanceof Error ? error.message : 'Refund failed'
      };
    }
  }
  
  // Generate receipt
  static async generateReceipt(transactionId: string): Promise<string> {
    try {
      const transaction = await this.getTransactionDetails(transactionId);
      if (!transaction) {
        throw new Error('Transaction not found');
      }
      
      const receiptId = nanoid();
      const receiptNumber = `RC-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
      
      const receipt = {
        id: receiptId,
        orderId: transaction.orderId,
        paymentTransactionId: transactionId,
        customerId: transaction.customerId,
        receiptNumber,
        type: 'sale',
        subtotal: transaction.amount,
        taxAmount: '0',
        discountAmount: '0',
        totalAmount: transaction.amount,
        items: [], // Would fetch actual order items
        taxRate: '0',
        qrCode: `RECEIPT-${receiptNumber}`,
      };
      
      await db.insert(receipts).values(receipt);
      
      // Generate PDF (would integrate with PDF generation service)
      const pdfUrl = await this.generateReceiptPDF(receipt);
      
      // Update receipt with PDF URL
      await db.update(receipts)
        .set({ pdfUrl })
        .where(eq(receipts.id, receiptId));
      
      return receiptId;
      
    } catch (error) {
      console.error('Receipt generation error:', error);
      throw error;
    }
  }
  
  // Helper methods
  private static async getGatewayConfig(provider: string) {
    const configs = await db.select()
      .from(paymentGatewayConfigs)
      .where(and(
        eq(paymentGatewayConfigs.provider, provider),
        eq(paymentGatewayConfigs.isActive, true)
      ))
      .limit(1);
    
    return configs.length > 0 ? configs[0] : null;
  }
  
  private static async getTransactionOrder(transactionId: string) {
    const result = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, transactionId))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }
  
  private static async getTransactionDetails(transactionId: string) {
    // This would include order details, items, etc.
    const result = await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.id, transactionId))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }
  
  private static generateVNPayUrl(data: any, secretKey: string): string {
    // Implementation would include proper VNPay URL generation with signature
    return `https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?${new URLSearchParams(data).toString()}`;
  }
  
  private static async generateReceiptPDF(receipt: any): Promise<string> {
    // This would integrate with a PDF generation service
    // For now, return a placeholder URL
    return `https://receipts.longchau.com/${receipt.receiptNumber}.pdf`;
  }
  
  private static async generateRefundReceipt(transactionId: string, amount: number): Promise<string> {
    // Generate refund receipt similar to regular receipt
    return await this.generateReceipt(transactionId);
  }
  
  // Get payment history for customer
  static async getCustomerPaymentHistory(customerId: string) {
    return await db.select()
      .from(paymentTransactions)
      .where(eq(paymentTransactions.customerId, customerId))
      .orderBy(paymentTransactions.createdAt);
  }
  
  // Get receipt by ID
  static async getReceipt(receiptId: string) {
    const result = await db.select()
      .from(receipts)
      .where(eq(receipts.id, receiptId))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }
}
