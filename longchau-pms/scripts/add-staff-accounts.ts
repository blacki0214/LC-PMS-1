import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '../src/lib/schema';

// Directly use the database URL from the .env file
const DATABASE_URL = 'postgresql://neondb_owner:npg_Ft5wrU2equCd@ep-dry-breeze-a15awvf5-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

// Simple password hashing (same as in UserService)
function hashPassword(password: string): string {
  return btoa(password + 'longchau-salt');
}

async function addStaffAccount() {
  console.log('👨‍⚕️ Staff Account Creation Tool');
  console.log('=====================================');

  // Example: Add a new pharmacist
  const newPharmacist = {
    email: 'pharmacist2@longchau.com',
    password: 'pharmacist123', // Will be hashed
    name: 'Dr. Le Thi Minh',
    role: 'pharmacist' as const,
    branchId: 'branch-2',
    professionalInfo: {
      licenseNumber: 'PH-VN-67890',
      specializations: ['Pediatric Pharmacy', 'Oncology Pharmacy'],
      yearsOfExperience: 6,
      education: {
        degree: 'Doctor of Pharmacy (PharmD)',
        institution: 'University of Medicine and Pharmacy at Ho Chi Minh City',
        graduationYear: 2018
      },
      certifications: ['Pediatric Pharmacy Specialist', 'Oncology Pharmacy Certified'],
      branch: {
        id: 'branch-2',
        name: 'Long Châu District 3',
        address: '456 Le Van Sy Street, District 3, Ho Chi Minh City',
        phone: '028-3824-9999'
      },
      hireDate: '2020-06-01',
      position: 'Clinical Pharmacist',
      department: 'Specialized Services'
    }
  };

  // Example: Add a new manager
  const newManager = {
    email: 'manager2@longchau.com',
    password: 'manager123', // Will be hashed
    name: 'Nguyen Van Duc',
    role: 'manager' as const,
    branchId: 'branch-2',
    professionalInfo: {
      licenseNumber: 'MG-VN-11111',
      specializations: ['Operations Management', 'Quality Assurance', 'Staff Training'],
      yearsOfExperience: 15,
      education: {
        degree: 'Master of Pharmacy Management',
        institution: 'Ho Chi Minh City University of Economics',
        graduationYear: 2010
      },
      certifications: ['Pharmacy Operations Certificate', 'Quality Management System'],
      branch: {
        id: 'branch-2',
        name: 'Long Châu District 3',
        address: '456 Le Van Sy Street, District 3, Ho Chi Minh City',
        phone: '028-3824-9999'
      },
      hireDate: '2012-03-15',
      position: 'Regional Manager',
      department: 'Operations'
    }
  };

  try {
    console.log('🔐 Creating staff accounts...');

    // Create pharmacist account
    console.log(`\n👨‍⚕️ Creating Pharmacist Account:`);
    console.log(`   Email: ${newPharmacist.email}`);
    console.log(`   Name: ${newPharmacist.name}`);
    console.log(`   Password: ${newPharmacist.password} (will be hashed)`);
    
    try {
      const hashedPassword = hashPassword(newPharmacist.password);
      const pharmacistResult = await db.insert(schema.users).values({
        id: `user_${Date.now()}_pharmacist`,
        email: newPharmacist.email,
        name: newPharmacist.name,
        password: hashedPassword,
        role: 'pharmacist' as const,
        branchId: newPharmacist.branchId,
        professionalInfo: newPharmacist.professionalInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: schema.users.id, email: schema.users.email });
      
      console.log(`   ✅ Pharmacist account created successfully! ID: ${pharmacistResult[0].id}`);
    } catch (error: any) {
      console.log(`   ❌ Failed to create pharmacist: ${error.message}`);
    }

    // Create manager account
    console.log(`\n👔 Creating Manager Account:`);
    console.log(`   Email: ${newManager.email}`);
    console.log(`   Name: ${newManager.name}`);
    console.log(`   Password: ${newManager.password} (will be hashed)`);
    
    try {
      const hashedPassword = hashPassword(newManager.password);
      const managerResult = await db.insert(schema.users).values({
        id: `user_${Date.now() + 1}_manager`,
        email: newManager.email,
        name: newManager.name,
        password: hashedPassword,
        role: 'manager' as const,
        branchId: newManager.branchId,
        professionalInfo: newManager.professionalInfo,
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning({ id: schema.users.id, email: schema.users.email });
      
      console.log(`   ✅ Manager account created successfully! ID: ${managerResult[0].id}`);
    } catch (error: any) {
      console.log(`   ❌ Failed to create manager: ${error.message}`);
    }

    // List all users
    console.log('\n📊 All Users in Database:');
    const allUsers = await db.select({
      id: schema.users.id,
      email: schema.users.email,
      name: schema.users.name,
      role: schema.users.role
    }).from(schema.users);
    
    allUsers.forEach((user: any) => {
      const roleIcon = user.role === 'pharmacist' ? '👨‍⚕️' : user.role === 'manager' ? '👔' : '👤';
      console.log(`   ${roleIcon} ${user.name} (${user.email}) - ${user.role}`);
    });

    console.log('\n🎉 Staff account creation completed!');
    console.log('\n📝 Login Instructions:');
    console.log('   • Pharmacist: pharmacist2@longchau.com / pharmacist123');
    console.log('   • Manager: manager2@longchau.com / manager123');
    console.log('   • Customer accounts can be created through the registration form');

  } catch (error) {
    console.error('❌ Error creating staff accounts:', error);
  }
}

addStaffAccount().then(() => {
  console.log('✅ Staff account creation process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Staff account creation failed:', error);
  process.exit(1);
});
