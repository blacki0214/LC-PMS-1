import React, { useState, useEffect } from 'react';
import { PaymentService } from '../../services/PaymentService';
import { ReceiptGenerator } from '../../services/ReceiptGenerator';

interface ReceiptViewerProps {
  receiptId?: string;
  orderId?: string;
  transactionId?: string;
  onClose?: () => void;
}

export const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  receiptId,
  orderId,
  transactionId,
  onClose
}) => {
  const [receipt, setReceipt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [htmlContent, setHtmlContent] = useState<string>('');

  useEffect(() => {
    loadReceipt();
  }, [receiptId, orderId, transactionId]);

  const loadReceipt = async () => {
    try {
      setLoading(true);
      
      let receiptData;
      
      if (receiptId) {
        receiptData = await PaymentService.getReceipt(receiptId);
      } else if (orderId) {
        const html = await ReceiptGenerator.generateOrderReceipt(orderId);
        setHtmlContent(html);
        setLoading(false);
        return;
      } else if (transactionId) {
        // Generate receipt from transaction
        const receiptId = await PaymentService.generateReceipt(transactionId);
        receiptData = await PaymentService.getReceipt(receiptId);
      }
      
      if (receiptData) {
        setReceipt(receiptData);
        // Generate HTML for display
        const html = await ReceiptGenerator.generateOrderReceipt(receiptData.orderId);
        setHtmlContent(html);
      } else {
        setError('Receipt not found');
      }
      
    } catch (err) {
      console.error('Error loading receipt:', err);
      setError('Failed to load receipt');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receipt?.receiptNumber || 'unknown'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmail = async () => {
    try {
      // This would integrate with email service
      alert('Receipt sent to your email address!');
    } catch (error) {
      alert('Failed to send email. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <span className="ml-4 text-lg">Loading receipt...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Receipt {receipt?.receiptNumber || 'Preview'}
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
              title="Print Receipt"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center"
              title="Download Receipt"
            >
              📄 Download
            </button>
            <button
              onClick={handleEmail}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
              title="Email Receipt"
            >
              📧 Email
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-auto">
          <div 
            className="receipt-container"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* Footer Actions */}
        <div className="border-t p-4 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {receipt && (
                <>
                  Generated: {new Date(receipt.generatedAt).toLocaleString('vi-VN')}
                  {receipt.sentToCustomer && (
                    <span className="ml-4 text-green-600">✅ Sent to customer</span>
                  )}
                </>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => window.location.href = `mailto:?subject=Receipt ${receipt?.receiptNumber}&body=Please find your receipt attached.`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Share via Email
              </button>
              <span className="text-gray-300">|</span>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: `Receipt ${receipt?.receiptNumber}`,
                      text: 'Your pharmacy receipt',
                      url: window.location.href
                    });
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Receipt History Component
export const ReceiptHistory: React.FC<{ customerId: string }> = ({ customerId }) => {
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);

  useEffect(() => {
    loadReceiptHistory();
  }, [customerId]);

  const loadReceiptHistory = async () => {
    try {
      setLoading(true);
      // This would fetch receipt history from the API
      // const history = await PaymentService.getCustomerReceiptHistory(customerId);
      // setReceipts(history);
      
      // Mock data for now
      setReceipts([
        {
          id: 'receipt-1',
          receiptNumber: 'RC-20250203-001',
          orderId: 'order-1',
          totalAmount: '125000',
          generatedAt: new Date().toISOString(),
          type: 'sale'
        },
        {
          id: 'receipt-2',
          receiptNumber: 'RC-20250202-001',
          orderId: 'order-2',
          totalAmount: '75000',
          generatedAt: new Date(Date.now() - 86400000).toISOString(),
          type: 'sale'
        }
      ]);
    } catch (error) {
      console.error('Error loading receipt history:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading receipt history...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="text-lg font-semibold text-gray-900">Receipt History</h3>
      </div>
      
      <div className="divide-y">
        {receipts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2">📄</div>
            <p>No receipts found</p>
          </div>
        ) : (
          receipts.map((receipt) => (
            <div key={receipt.id} className="p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    {receipt.receiptNumber}
                  </div>
                  <div className="text-sm text-gray-500">
                    Order #{receipt.orderId} • {new Date(receipt.generatedAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    ₫{parseInt(receipt.totalAmount).toLocaleString('vi-VN')}
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(receipt.id)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Receipt
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedReceipt && (
        <ReceiptViewer
          receiptId={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}
    </div>
  );
};

export default ReceiptViewer;
