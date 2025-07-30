import { db } from '../src/lib/db';
import { users } from '../src/lib/schema';
import { UserService } from '../src/services/UserService';

async function seedUsers() {
  console.log('🌱 Seeding users...');

  try {
    // Create demo users
    const demoUsers = [
      {
        email: 'pharmacist@longchau.com',
        password: 'password',
        name: 'Dr. Nguyen Van A',
        role: 'pharmacist' as const,
        branchId: 'branch-1',
        professionalInfo: {
          licenseNumber: 'PH-VN-12345',
          specializations: ['Clinical Pharmacy', 'Medication Therapy Management', 'Pharmacovigilance'],
          yearsOfExperience: 8,
          education: {
            degree: 'Doctor of Pharmacy (PharmD)',
            institution: 'University of Medicine and Pharmacy at Ho Chi Minh City',
            graduationYear: 2016
          },
          certifications: ['Board Certified Pharmacotherapy Specialist', 'Immunization Certified'],
          branch: {
            id: 'branch-1',
            name: 'Long Châu District 1',
            address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
            phone: '028-3824-5678'
          },
          hireDate: '2018-03-15',
          position: 'Senior Clinical Pharmacist',
          department: 'Prescription Services'
        }
      },
      {
        email: 'manager@longchau.com',
        password: 'password',
        name: 'Tran Thi B',
        role: 'manager' as const,
        branchId: 'branch-1',
        professionalInfo: {
          licenseNumber: 'MG-VN-67890',
          specializations: ['Pharmacy Operations', 'Staff Management', 'Business Development'],
          yearsOfExperience: 12,
          education: {
            degree: 'Master of Business Administration (MBA)',
            institution: 'Ho Chi Minh City University of Economics',
            graduationYear: 2012
          },
          certifications: ['Pharmacy Management Certificate', 'Leadership Excellence Program'],
          branch: {
            id: 'branch-1',
            name: 'Long Châu District 1',
            address: '123 Nguyen Hue Street, District 1, Ho Chi Minh City',
            phone: '028-3824-5678'
          },
          hireDate: '2015-01-10',
          position: 'Branch Manager',
          department: 'Operations'
        }
      },
      {
        email: 'customer@gmail.com',
        password: 'password',
        name: 'Le Van C',
        role: 'customer' as const,
      }
    ];

    for (const userData of demoUsers) {
      console.log(`Creating user: ${userData.email}`);
      const result = await UserService.createUser(userData);
      
      if (result.success) {
        console.log(`✅ Created user: ${userData.email}`);
      } else {
        console.log(`⚠️ User may already exist: ${userData.email} - ${result.error}`);
      }
    }

    console.log('🎉 User seeding completed!');
    
    // List all users
    const allUsers = await UserService.getAllUsers();
    console.log(`📊 Total users in database: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ${user.role}`);
    });

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  }
}

// Run the seed function
seedUsers().then(() => {
  console.log('✅ Seed process completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Seed process failed:', error);
  process.exit(1);
});
