import { PaymentService } from './PaymentService';

export interface ReceiptData {
  receiptNumber: string;
  orderNumber: string;
  date: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address: string;
  };
  pharmacy: {
    name: string;
    address: string;
    phone: string;
    email: string;
    license: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    prescription?: boolean;
  }>;
  payment: {
    method: string;
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    status: string;
  };
  notes?: string;
}

export class ReceiptGenerator {
  
  // Generate HTML receipt template
  static generateHTMLReceipt(data: ReceiptData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Receipt - ${data.receiptNumber}</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .receipt {
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        .header {
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 2.5em;
            font-weight: bold;
        }
        .header p {
            margin: 5px 0 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .receipt-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e5e7eb;
        }
        .receipt-number {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            font-weight: bold;
            font-size: 1.2em;
        }
        .customer-info, .pharmacy-info {
            flex: 1;
        }
        .customer-info {
            margin-right: 30px;
        }
        .info-section h3 {
            color: #1f2937;
            margin: 0 0 10px 0;
            font-size: 1.1em;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
        }
        .info-section p {
            margin: 5px 0;
            color: #6b7280;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .items-table th {
            background: #f8fafc;
            padding: 15px;
            text-align: left;
            font-weight: 600;
            color: #374151;
            border-bottom: 2px solid #e5e7eb;
        }
        .items-table td {
            padding: 15px;
            border-bottom: 1px solid #f3f4f6;
        }
        .items-table tr:hover {
            background: #f9fafb;
        }
        .prescription-item {
            background: #fef3c7 !important;
        }
        .prescription-badge {
            background: #f59e0b;
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 500;
        }
        .totals {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        .total-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 5px 0;
        }
        .total-row.final {
            border-top: 2px solid #2563eb;
            font-weight: bold;
            font-size: 1.2em;
            color: #2563eb;
            margin-top: 15px;
            padding-top: 15px;
        }
        .payment-info {
            background: #ecfdf5;
            border: 1px solid #10b981;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .payment-status {
            color: #065f46;
            font-weight: 600;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
        }
        .qr-code {
            text-align: center;
            margin: 20px 0;
        }
        .notes {
            background: #fff7ed;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        @media print {
            body { background: white; }
            .receipt { box-shadow: none; }
        }
    </style>
</head>
<body>
    <div class="receipt">
        <div class="header">
            <h1>🏥 ${data.pharmacy.name}</h1>
            <p>Your Health, Our Priority</p>
        </div>
        
        <div class="content">
            <div class="receipt-info">
                <div class="receipt-number">
                    Receipt #${data.receiptNumber}
                    <br>
                    <small style="font-weight: normal; opacity: 0.7;">Order #${data.orderNumber}</small>
                    <br>
                    <small style="font-weight: normal; opacity: 0.7;">${data.date}</small>
                </div>
            </div>
            
            <div style="display: flex; gap: 30px; margin-bottom: 30px;">
                <div class="customer-info info-section">
                    <h3>👤 Customer Information</h3>
                    <p><strong>Name:</strong> ${data.customer.name}</p>
                    <p><strong>Email:</strong> ${data.customer.email}</p>
                    <p><strong>Phone:</strong> ${data.customer.phone}</p>
                    <p><strong>Address:</strong> ${data.customer.address}</p>
                </div>
                
                <div class="pharmacy-info info-section">
                    <h3>🏪 Pharmacy Information</h3>
                    <p><strong>Name:</strong> ${data.pharmacy.name}</p>
                    <p><strong>Address:</strong> ${data.pharmacy.address}</p>
                    <p><strong>Phone:</strong> ${data.pharmacy.phone}</p>
                    <p><strong>Email:</strong> ${data.pharmacy.email}</p>
                    <p><strong>License:</strong> ${data.pharmacy.license}</p>
                </div>
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                    <tr ${item.prescription ? 'class="prescription-item"' : ''}>
                        <td>
                            <strong>${item.name}</strong>
                            ${item.prescription ? '<br><span class="prescription-badge">Prescription</span>' : ''}
                        </td>
                        <td>${item.quantity}</td>
                        <td>₫${item.unitPrice.toLocaleString('vi-VN')}</td>
                        <td><strong>₫${item.totalPrice.toLocaleString('vi-VN')}</strong></td>
                        <td>${item.prescription ? '🔒 Rx' : '🛒 OTC'}</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₫${data.payment.subtotal.toLocaleString('vi-VN')}</span>
                </div>
                ${data.payment.discount > 0 ? `
                <div class="total-row">
                    <span>Discount:</span>
                    <span style="color: #dc2626;">-₫${data.payment.discount.toLocaleString('vi-VN')}</span>
                </div>
                ` : ''}
                ${data.payment.tax > 0 ? `
                <div class="total-row">
                    <span>Tax (VAT):</span>
                    <span>₫${data.payment.tax.toLocaleString('vi-VN')}</span>
                </div>
                ` : ''}
                <div class="total-row final">
                    <span>Total Amount:</span>
                    <span>₫${data.payment.total.toLocaleString('vi-VN')}</span>
                </div>
            </div>
            
            <div class="payment-info">
                <div class="payment-status">
                    💳 Payment Method: ${this.getPaymentMethodDisplay(data.payment.method)}
                    <br>
                    ✅ Status: ${data.payment.status.toUpperCase()}
                </div>
            </div>
            
            ${data.notes ? `
            <div class="notes">
                <strong>📝 Notes:</strong>
                <br>
                ${data.notes}
            </div>
            ` : ''}
            
            <div class="qr-code">
                <div style="border: 2px dashed #d1d5db; padding: 20px; border-radius: 8px; display: inline-block;">
                    <div style="width: 100px; height: 100px; background: #f3f4f6; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                        📱 QR Code
                    </div>
                    <p style="margin: 10px 0 0 0; font-size: 0.9em;">Scan to verify receipt</p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Thank you for choosing ${data.pharmacy.name}!</strong></p>
                <p>For questions about this receipt, please contact us at ${data.pharmacy.phone}</p>
                <p style="font-size: 0.8em; margin-top: 15px;">
                    This is a digital receipt generated on ${new Date().toLocaleString('vi-VN')}
                </p>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }
  
  // Generate receipt for order
  static async generateOrderReceipt(orderId: string): Promise<string> {
    try {
      // This would fetch actual order data from database
      const receiptData: ReceiptData = {
        receiptNumber: `RC-${Date.now()}`,
        orderNumber: orderId,
        date: new Date().toLocaleDateString('vi-VN'),
        customer: {
          name: 'Le Van C',
          email: 'customer@gmail.com',
          phone: '+84 123 456 789',
          address: '123 Main Street, Ho Chi Minh City'
        },
        pharmacy: {
          name: 'Long Chau Pharmacy',
          address: '456 Nguyen Trai, District 5, Ho Chi Minh City',
          phone: '+84 28 1234 5678',
          email: 'info@longchau.com',
          license: 'GPP-2024-001'
        },
        items: [
          {
            name: 'Paracetamol 500mg',
            quantity: 2,
            unitPrice: 25000,
            totalPrice: 50000,
            prescription: false
          },
          {
            name: 'Amoxicillin 250mg',
            quantity: 1,
            unitPrice: 75000,
            totalPrice: 75000,
            prescription: true
          }
        ],
        payment: {
          method: 'vnpay',
          subtotal: 125000,
          tax: 0,
          discount: 0,
          total: 125000,
          status: 'completed'
        },
        notes: 'Please take medications as prescribed by your doctor. Store in a cool, dry place.'
      };
      
      return this.generateHTMLReceipt(receiptData);
      
    } catch (error) {
      console.error('Receipt generation error:', error);
      throw new Error('Failed to generate receipt');
    }
  }
  
  // Helper method to display payment method
  private static getPaymentMethodDisplay(method: string): string {
    const methods: { [key: string]: string } = {
      'cod': 'Cash on Delivery',
      'vnpay': 'VNPay',
      'momo': 'MoMo E-Wallet',
      'zalopay': 'ZaloPay',
      'bank_transfer': 'Bank Transfer',
      'card': 'Credit/Debit Card'
    };
    
    return methods[method] || method.toUpperCase();
  }
  
  // Generate simple text receipt for SMS/Email
  static generateTextReceipt(data: ReceiptData): string {
    return `
🏥 ${data.pharmacy.name}
Receipt #${data.receiptNumber}
Order #${data.orderNumber}
Date: ${data.date}

👤 Customer: ${data.customer.name}
📧 Email: ${data.customer.email}

📦 Items:
${data.items.map(item => 
  `${item.name} x${item.quantity} - ₫${item.totalPrice.toLocaleString('vi-VN')}${item.prescription ? ' (Rx)' : ''}`
).join('\n')}

💰 Total: ₫${data.payment.total.toLocaleString('vi-VN')}
💳 Payment: ${this.getPaymentMethodDisplay(data.payment.method)}
✅ Status: ${data.payment.status.toUpperCase()}

Thank you for choosing ${data.pharmacy.name}!
For support: ${data.pharmacy.phone}
    `.trim();
  }
}
