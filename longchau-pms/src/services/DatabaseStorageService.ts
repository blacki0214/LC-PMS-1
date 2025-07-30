import { DatabaseService } from '../lib/database';
import { Order, Prescription, Product, Customer } from '../contexts/DataContextWithDB';

export interface StorageResult {
  success: boolean;
  stored: 'database' | 'local' | 'both';
  error?: string;
}

export class DatabaseStorageService {
  private static pendingOperations: Array<{
    type: 'order' | 'prescription' | 'product' | 'customer';
    operation: 'create' | 'update';
    data: any;
    id?: string;
  }> = [];

  // Enhanced order storage with retry logic
  static async storeOrder(order: Omit<Order, 'id'> | Order): Promise<StorageResult> {
    const id = 'id' in order ? order.id : `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const orderWithId = { ...order, id };

    try {
      // Attempt database storage
      await DatabaseService.createOrder({
        id,
        customerId: order.customerId,
        customerName: order.customerName,
        items: order.items as any,
        total: order.total.toString(),
        status: order.status,
        shippingAddress: order.shippingAddress,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus
      });

      console.log(`✅ Order ${id} successfully stored in database`);
      return { success: true, stored: 'database' };
    } catch (error) {
      console.warn(`⚠️ Database storage failed for order ${id}, storing locally:`, error);
      
      // Store in pending operations for retry
      this.pendingOperations.push({
        type: 'order',
        operation: 'create',
        data: orderWithId
      });

      return { success: true, stored: 'local', error: (error as Error).message };
    }
  }

  // Enhanced prescription storage with retry logic
  static async storePrescription(prescription: Omit<Prescription, 'id'> | Prescription): Promise<StorageResult> {
    const id = 'id' in prescription ? prescription.id : `pres-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const prescriptionWithId = { ...prescription, id };

    try {
      // Attempt database storage
      await DatabaseService.createPrescription({
        id,
        customerId: prescription.customerId,
        customerName: prescription.customerName,
        pharmacistId: prescription.pharmacistId,
        pharmacistName: prescription.pharmacistName,
        medications: prescription.medications as any,
        status: prescription.status,
        notes: prescription.notes,
        imageUrl: prescription.imageUrl,
        totalAmount: prescription.totalAmount?.toString()
      });

      console.log(`✅ Prescription ${id} successfully stored in database`);
      return { success: true, stored: 'database' };
    } catch (error) {
      console.warn(`⚠️ Database storage failed for prescription ${id}, storing locally:`, error);
      
      // Store in pending operations for retry
      this.pendingOperations.push({
        type: 'prescription',
        operation: 'create',
        data: prescriptionWithId
      });

      return { success: true, stored: 'local', error: (error as Error).message };
    }
  }

  // Update order with database-first approach
  static async updateOrder(order: Order): Promise<StorageResult> {
    try {
      await DatabaseService.updateOrder(order.id, {
        status: order.status,
        paymentStatus: order.paymentStatus
      });

      console.log(`✅ Order ${order.id} successfully updated in database`);
      return { success: true, stored: 'database' };
    } catch (error) {
      console.warn(`⚠️ Database update failed for order ${order.id}, updating locally:`, error);
      
      // Store in pending operations for retry
      this.pendingOperations.push({
        type: 'order',
        operation: 'update',
        data: order,
        id: order.id
      });

      return { success: true, stored: 'local', error: (error as Error).message };
    }
  }

  // Update prescription with database-first approach
  static async updatePrescription(prescription: Prescription): Promise<StorageResult> {
    try {
      await DatabaseService.updatePrescription(prescription.id, {
        pharmacistId: prescription.pharmacistId,
        pharmacistName: prescription.pharmacistName,
        status: prescription.status,
        notes: prescription.notes,
        totalAmount: prescription.totalAmount?.toString(),
        validationDate: prescription.validationDate ? new Date(prescription.validationDate) : undefined
      });

      console.log(`✅ Prescription ${prescription.id} successfully updated in database`);
      return { success: true, stored: 'database' };
    } catch (error) {
      console.warn(`⚠️ Database update failed for prescription ${prescription.id}, updating locally:`, error);
      
      // Store in pending operations for retry
      this.pendingOperations.push({
        type: 'prescription',
        operation: 'update',
        data: prescription,
        id: prescription.id
      });

      return { success: true, stored: 'local', error: (error as Error).message };
    }
  }

  // Retry pending operations when database becomes available
  static async retryPendingOperations(): Promise<{ completed: number; failed: number }> {
    let completed = 0;
    let failed = 0;
    const operationsToRetry = [...this.pendingOperations];
    this.pendingOperations = [];

    for (const operation of operationsToRetry) {
      try {
        switch (operation.type) {
          case 'order':
            if (operation.operation === 'create') {
              await DatabaseService.createOrder(operation.data);
            } else {
              await DatabaseService.updateOrder(operation.id!, operation.data);
            }
            break;
          case 'prescription':
            if (operation.operation === 'create') {
              await DatabaseService.createPrescription(operation.data);
            } else {
              await DatabaseService.updatePrescription(operation.id!, operation.data);
            }
            break;
        }
        completed++;
        console.log(`✅ Retried ${operation.type} ${operation.operation} successfully`);
      } catch (error) {
        failed++;
        console.warn(`❌ Failed to retry ${operation.type} ${operation.operation}:`, error);
        // Put it back in pending operations
        this.pendingOperations.push(operation);
      }
    }

    return { completed, failed };
  }

  // Get pending operations count
  static getPendingOperationsCount(): number {
    return this.pendingOperations.length;
  }

  // Get pending operations summary
  static getPendingOperationsSummary(): { orders: number; prescriptions: number; total: number } {
    const orders = this.pendingOperations.filter(op => op.type === 'order').length;
    const prescriptions = this.pendingOperations.filter(op => op.type === 'prescription').length;
    return { orders, prescriptions, total: this.pendingOperations.length };
  }

  // Clear all pending operations (use with caution)
  static clearPendingOperations(): void {
    this.pendingOperations = [];
    console.log('🗑️ Cleared all pending operations');
  }

  // Sync all pending operations to database
  static async syncToDatabase(): Promise<StorageResult> {
    if (this.pendingOperations.length === 0) {
      return { success: true, stored: 'database' };
    }

    const result = await this.retryPendingOperations();
    
    if (result.failed === 0) {
      console.log(`✅ Successfully synced ${result.completed} operations to database`);
      return { success: true, stored: 'database' };
    } else {
      console.warn(`⚠️ Partially synced: ${result.completed} succeeded, ${result.failed} failed`);
      return { 
        success: true, 
        stored: 'both',
        error: `${result.failed} operations still pending`
      };
    }
  }
}
