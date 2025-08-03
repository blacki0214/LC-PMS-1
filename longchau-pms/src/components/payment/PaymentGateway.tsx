import React, { useState, useEffect } from 'react';
import { PaymentService, PaymentRequest, PaymentResponse } from '../../services/PaymentService';

interface PaymentGatewayProps {
  orderId: string;
  customerId: string;
  amount: number;
  orderDetails: {
    items: any[];
    total: number;
    customerInfo: {
      name: string;
      email: string;
      phone: string;
    };
  };
  onPaymentSuccess: (transactionId: string) => void;
  onPaymentError: (error: string) => void;
  onCancel: () => void;
}

export const PaymentGateway: React.FC<PaymentGatewayProps> = ({
  orderId,
  customerId,
  amount,
  orderDetails,
  onPaymentSuccess,
  onPaymentError,
  onCancel
}) => {
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [processing, setProcessing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);

  const paymentMethods = [
    {
      id: 'cod',
      name: 'Cash on Delivery',
      icon: '💵',
      description: 'Pay when you receive your order',
      available: true
    },
    {
      id: 'vnpay',
      name: 'VNPay',
      icon: '🏦',
      description: 'Vietnamese payment gateway',
      available: true
    },
    {
      id: 'momo',
      name: 'MoMo E-Wallet',
      icon: '📱',
      description: 'Pay with MoMo mobile wallet',
      available: true
    },
    {
      id: 'zalopay',
      name: 'ZaloPay',
      icon: '⚡',
      description: 'Pay with ZaloPay e-wallet',
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Bank Transfer',
      icon: '🏧',
      description: 'Direct bank transfer',
      available: true
    }
  ];

  const handlePayment = async () => {
    if (!selectedMethod) {
      onPaymentError('Please select a payment method');
      return;
    }

    setProcessing(true);

    try {
      const paymentRequest: PaymentRequest = {
        orderId,
        customerId,
        amount,
        paymentMethod: selectedMethod,
        gatewayProvider: selectedMethod === 'cod' ? undefined : selectedMethod,
        returnUrl: `${window.location.origin}/payment/return`,
        description: `Payment for order ${orderId}`,
        customerInfo: orderDetails.customerInfo
      };

      const response: PaymentResponse = await PaymentService.initiatePayment(paymentRequest);

      if (response.success) {
        if (selectedMethod === 'cod') {
          onPaymentSuccess(response.transactionId);
        } else if (selectedMethod === 'bank_transfer') {
          setBankDetails(response);
        } else if (response.paymentUrl) {
          // Redirect to payment gateway
          window.location.href = response.paymentUrl;
        } else if (response.qrCode) {
          setShowQR(true);
        }
      } else {
        onPaymentError(response.error || 'Payment failed');
      }
    } catch (error) {
      onPaymentError(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Complete Your Payment</h2>
        <p className="text-gray-600 mt-1">Order #{orderId}</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>
        <div className="space-y-2">
          {orderDetails.items.map((item, index) => (
            <div key={index} className="flex justify-between text-sm">
              <span>{item.name} x{item.quantity}</span>
              <span>₫{(item.price * item.quantity).toLocaleString('vi-VN')}</span>
            </div>
          ))}
          <div className="border-t pt-2 mt-2">
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>₫{amount.toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      {!bankDetails && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-4">Select Payment Method</h3>
          <div className="grid grid-cols-1 gap-3">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!method.available ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={selectedMethod === method.id}
                  onChange={(e) => setSelectedMethod(e.target.value)}
                  disabled={!method.available}
                  className="sr-only"
                />
                <div className="flex items-center w-full">
                  <span className="text-2xl mr-3">{method.icon}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{method.name}</div>
                    <div className="text-sm text-gray-500">{method.description}</div>
                  </div>
                  {selectedMethod === method.id && (
                    <div className="text-blue-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Bank Transfer Details */}
      {bankDetails && (
        <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">🏦 Bank Transfer Instructions</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Bank Name:</span>
              <span>Vietcombank</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Number:</span>
              <span className="font-mono">1234567890</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Account Name:</span>
              <span>Long Chau Pharmacy</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Amount:</span>
              <span className="font-semibold">₫{amount.toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Transfer Content:</span>
              <span className="font-mono">PAYMENT {bankDetails.transactionId}</span>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-800">
              ⚠️ Please include the exact transfer content to ensure your payment is processed correctly.
              Your order will be confirmed once we receive the transfer.
            </p>
          </div>
        </div>
      )}

      {/* QR Code Display */}
      {showQR && (
        <div className="mb-6 text-center bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">📱 Scan QR Code to Pay</h3>
          <div className="inline-block p-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
              QR Code Placeholder
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            Open your mobile wallet app and scan this QR code to complete payment
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={processing}
        >
          Cancel
        </button>
        
        {!bankDetails && (
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || processing}
            className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
              selectedMethod && !processing
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {processing ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              selectedMethod === 'cod' ? 'Confirm Order' : 'Proceed to Payment'
            )}
          </button>
        )}
        
        {bankDetails && (
          <button
            onClick={() => onPaymentSuccess(bankDetails.transactionId)}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            I've Made the Transfer
          </button>
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center text-sm text-gray-500">
        <p>🔒 Your payment information is secure and encrypted</p>
      </div>
    </div>
  );
};

export default PaymentGateway;
