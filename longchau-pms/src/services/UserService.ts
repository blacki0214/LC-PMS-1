import { db } from '../lib/db';
import { users } from '../lib/schema';
import { eq } from 'drizzle-orm';
import { User } from '../contexts/AuthContext';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  role: 'pharmacist' | 'manager' | 'customer';
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

  // Create a new user account
  static async createUser(userData: CreateUserData): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
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

  // Update user information
  static async updateUser(userId: string, updates: Partial<CreateUserData>): Promise<{ success: boolean; error?: string }> {
    try {
      const updateData: any = {};
      
      if (updates.email) updateData.email = updates.email;
      if (updates.name) updateData.name = updates.name;
      if (updates.role) updateData.role = updates.role;
      if (updates.branchId !== undefined) updateData.branchId = updates.branchId;
      if (updates.professionalInfo !== undefined) updateData.professionalInfo = updates.professionalInfo;
      if (updates.password) updateData.password = this.hashPassword(updates.password);

      updateData.updatedAt = new Date();

      await db.update(users).set(updateData).where(eq(users.id, userId));

      console.log('✅ User updated successfully:', userId);
      return { success: true };

    } catch (error) {
      console.error('❌ Error updating user:', error);
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
