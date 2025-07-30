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

async function seedUserPasswords() {
  console.log('🔑 Setting up user passwords...');

  try {
    const hashedPassword = hashPassword('password');
    
    // Update existing users with hashed passwords
    const userUpdates = [
      { email: 'pharmacist@longchau.com', password: hashedPassword },
      { email: 'manager@longchau.com', password: hashedPassword },
      { email: 'customer@gmail.com', password: hashedPassword }
    ];

    for (const update of userUpdates) {
      await db.update(schema.users)
        .set({ password: update.password })
        .where(eq(schema.users.email, update.email));
      
      console.log(`✅ Updated password for: ${update.email}`);
    }

    // Verify the updates
    const users = await db.select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role,
      hasPassword: schema.users.password
    }).from(schema.users);

    console.log('📊 Users with passwords:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role} - Password set: ${user.hasPassword !== 'changeme'}`);
    });

    console.log('🎉 Password setup completed! All users can now log in with password: "password"');

  } catch (error) {
    console.error('❌ Error setting up passwords:', error);
  }
}

seedUserPasswords().then(() => {
  console.log('✅ Password seed completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Password seed failed:', error);
  process.exit(1);
});
