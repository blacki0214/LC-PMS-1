import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';
import { eq } from 'drizzle-orm';

// Directly use the database URL from the .env file
const DATABASE_URL = 'postgresql://neondb_owner:npg_Ft5wrU2equCd@ep-dry-breeze-a15awvf5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

// Simple password hashing (same as in UserService)
function hashPassword(password: string): string {
  return btoa(password + 'longchau-salt');
}

async function changeUserPassword() {
  console.log('🔐 Database Password Change Tool');
  console.log('=================================');

  try {
    // Get all users first
    const users = await db.select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role
    }).from(schema.users);

    console.log('\n📋 Current Users:');
    users.forEach((user, index) => {
      const roleIcon = user.role === 'pharmacist' ? '👨‍⚕️' : user.role === 'manager' ? '👔' : '👤';
      console.log(`   ${index + 1}. ${roleIcon} ${user.name} (${user.email}) - ${user.role}`);
    });

    // Example password changes - modify these as needed
    const passwordChanges = [
      {
        email: 'pharmacist@longchau.com',
        newPassword: 'newpass123', // Change this to desired password
        reason: 'Admin password reset'
      },
      {
        email: 'manager@longchau.com', 
        newPassword: 'manager456', // Change this to desired password
        reason: 'Security update'
      },
      {
        email: 'customer@gmail.com',
        newPassword: 'customer789', // Change this to desired password
        reason: 'Password recovery'
      }
    ];

    console.log('\n🔄 Processing Password Changes:');

    for (const change of passwordChanges) {
      console.log(`\n🔐 Changing password for: ${change.email}`);
      console.log(`   New Password: ${change.newPassword}`);
      console.log(`   Reason: ${change.reason}`);

      // Hash the new password
      const hashedPassword = hashPassword(change.newPassword);

      // Update password in database
      const result = await db.update(schema.users)
        .set({ 
          password: hashedPassword,
          updatedAt: new Date()
        })
        .where(eq(schema.users.email, change.email))
        .returning({ email: schema.users.email, name: schema.users.name });

      if (result.length > 0) {
        console.log(`   ✅ Password updated successfully for ${result[0].name}`);
      } else {
        console.log(`   ❌ User not found: ${change.email}`);
      }
    }

    console.log('\n🎉 Password change process completed!');
    console.log('\n📝 Updated Login Credentials:');
    passwordChanges.forEach(change => {
      console.log(`   • ${change.email} / ${change.newPassword}`);
    });

    console.log('\n💡 Important Notes:');
    console.log('   • These password changes take effect immediately');
    console.log('   • Users currently logged in will need to log in again');
    console.log('   • Customer passwords can also be changed through the app');
    console.log('   • Staff passwords should be changed through database only');

  } catch (error) {
    console.error('❌ Error changing passwords:', error);
  }
}

changeUserPassword().then(() => {
  console.log('✅ Password change process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Password change process failed:', error);
  process.exit(1);
});
