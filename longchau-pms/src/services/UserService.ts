import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { User } from '../contexts/AuthContext';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'pharmacist' | 'manager' | 'customer' | 'shipper';
  branchId?: string;
  professionalInfo?: any;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export class UserService {
  // Simple password hashing (in production, use bcrypt or similar)
  private static hashPassword(password: string): string {
    // For demo purposes - in production use proper hashing like bcrypt
    return btoa(password + 'longchau-salt');
  }

  private static verifyPassword(password: string, hash: string): boolean {
    return this.hashPassword(password) === hash;
  }

  // Create a new user account (customers, shippers, and managers can be created)
  static async createUser(userData: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Allow customer, shipper, and manager registration through the app
      if (userData.role !== 'customer' && userData.role !== 'shipper' && userData.role !== 'manager') {
        return { success: false, error: 'Only customer, shipper, and manager accounts can be created through registration.' };
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email));
      
      if (existingUser.length > 0) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Generate user ID
      const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Hash password
      const hashedPassword = this.hashPassword(userData.password);

      // Insert new user
      const newUser = await db.insert(users).values({
        id: userId,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        branchId: userData.branchId || null,
        professionalInfo: userData.professionalInfo || null,
      }).returning();

      if (newUser.length === 0) {
        return { success: false, error: 'Failed to create user' };
      }

      // Convert to User interface (excluding password)
      const user: User = {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role as any,
        branchId: newUser[0].branchId || undefined,
        professionalInfo: newUser[0].professionalInfo as any || undefined,
      };

      console.log('✅ User created successfully:', user.email);
      return { success: true, user };

    } catch (error) {
      console.error('❌ Error creating user:', error);
      return { success: false, error: 'Database error occurred' };
    }
  }

  // Authenticate user login
  static async loginUser(email: string, password: string): Promise<LoginResult> {
    try {
      // Find user by email
      const userRecord = await db.select().from(users).where(eq(users.email, email));
      
      if (userRecord.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const dbUser = userRecord[0];

      // Verify password
      if (!this.verifyPassword(password, dbUser.password)) {
        return { success: false, error: 'Invalid password' };
      }

      // Convert to User interface (excluding password)
      const user: User = {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        role: dbUser.role as any,
        branchId: dbUser.branchId || undefined,
        professionalInfo: dbUser.professionalInfo as any || undefined,
      };

      console.log('✅ User logged in successfully:', user.email);
      return { success: true, user };

    } catch (error) {
      console.error('❌ Error during login:', error);
      return { success: false, error: 'Database error occurred' };
    }
  }

  // Get all users (admin function)
  static async getAllUsers(): Promise<User[]> {
    try {
      const userRecords = await db.select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        branchId: users.branchId,
        professionalInfo: users.professionalInfo,
        createdAt: users.createdAt,
      }).from(users);

      return userRecords.map(record => ({
        id: record.id,
        email: record.email,
        name: record.name,
        role: record.role as any,
        branchId: record.branchId || undefined,
        professionalInfo: record.professionalInfo as any || undefined,
      }));

    } catch (error) {
      console.error('❌ Error fetching users:', error);
      return [];
    }
  }

  // Change user password (only for customers)
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user record
      const userRecord = await db.select().from(users).where(eq(users.id, userId));
      
      if (userRecord.length === 0) {
        return { success: false, error: 'User not found' };
      }

      const user = userRecord[0];

      // Only allow customers to change their own passwords
      if (user.role !== 'customer') {
        return { success: false, error: 'Only customer accounts can change passwords through the app. Staff password changes must be done by administrators.' };
      }

      // Verify current password
      if (!this.verifyPassword(currentPassword, user.password)) {
        return { success: false, error: 'Current password is incorrect' };
      }

      // Hash new password
      const hashedNewPassword = this.hashPassword(newPassword);

      // Update password
      await db.update(users)
        .set({ 
          password: hashedNewPassword, 
          updatedAt: new Date() 
        })
        .where(eq(users.id, userId));

      console.log('✅ Password changed successfully for user:', user.email);
      return { success: true };

    } catch (error) {
      console.error('❌ Error changing password:', error);
      return { success: false, error: 'Database error occurred' };
    }
  }

  // Admin function to create staff accounts (pharmacist/manager)
  static async createStaffAccount(userData: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      // Only allow pharmacist and manager roles
      if (!['pharmacist', 'manager'].includes(userData.role)) {
        return { success: false, error: 'This function is only for creating staff accounts (pharmacist/manager)' };
      }

      // Check if user already exists
      const existingUser = await db.select().from(users).where(eq(users.email, userData.email));
      
      if (existingUser.length > 0) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Generate user ID
      const userId = 'staff_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

      // Hash password
      const hashedPassword = this.hashPassword(userData.password);

      // Insert new staff user
      const newUser = await db.insert(users).values({
        id: userId,
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role,
        branchId: userData.branchId || null,
        professionalInfo: userData.professionalInfo || null,
      }).returning();

      if (newUser.length === 0) {
        return { success: false, error: 'Failed to create staff account' };
      }

      // Convert to User interface (excluding password)
      const user: User = {
        id: newUser[0].id,
        email: newUser[0].email,
        name: newUser[0].name,
        role: newUser[0].role as any,
        branchId: newUser[0].branchId || undefined,
        professionalInfo: newUser[0].professionalInfo as any || undefined,
      };

      console.log('✅ Staff account created successfully:', user.email, '-', user.role);
      return { success: true, user };

    } catch (error) {
      console.error('❌ Error creating staff account:', error);
      return { success: false, error: 'Database error occurred' };
    }
  }

  // Delete user
  static async deleteUser(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await db.delete(users).where(eq(users.id, userId));
      console.log('✅ User deleted successfully:', userId);
      return { success: true };

    } catch (error) {
      console.error('❌ Error deleting user:', error);
      return { success: false, error: 'Database error occurred' };
    }
  }
}
