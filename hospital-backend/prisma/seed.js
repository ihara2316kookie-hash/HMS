const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding demo database...');

  const demoUsers = [
    {
      name: 'Dr. Sarah Mitchell (Admin)',
      email: 'admin@hospital.com',
      password: 'Admin@123',
      role: 'ADMIN',
    },
    {
      name: 'Dr. James Wilson (Physician)',
      email: 'doctor@hospital.com',
      password: 'Doctor@123',
      role: 'DOCTOR',
      doctorData: {
        specialization: 'Cardiology',
        phone: '+1-555-0101',
        department: 'Cardiology',
      },
    },
    {
      name: 'Elena Rostova (Nurse)',
      email: 'nurse@hospital.com',
      password: 'Nurse@123',
      role: 'NURSE',
      staffData: {
        employeeId: 'EMP-N001',
        phone: '+1-555-0102',
        department: 'Inpatient Care',
        designation: 'Head Nurse',
      },
    },
    {
      name: 'Marcus Vance (Receptionist)',
      email: 'reception@hospital.com',
      password: 'Reception@123',
      role: 'RECEPTIONIST',
      staffData: {
        employeeId: 'EMP-R001',
        phone: '+1-555-0103',
        department: 'Front Desk',
        designation: 'Lead Receptionist',
      },
    },
    {
      name: 'Dr. Lisa Patel (Lab Technician)',
      email: 'lab@hospital.com',
      password: 'Lab@123',
      role: 'LAB_TECHNICIAN',
      staffData: {
        employeeId: 'EMP-L001',
        phone: '+1-555-0104',
        department: 'Pathology Lab',
        designation: 'Senior Lab Specialist',
      },
    },
    {
      name: 'Oliver Queen (Pharmacist)',
      email: 'pharmacy@hospital.com',
      password: 'Pharmacy@123',
      role: 'PHARMACIST',
      staffData: {
        employeeId: 'EMP-P001',
        phone: '+1-555-0105',
        department: 'Hospital Pharmacy',
        designation: 'Chief Pharmacist',
      },
    },
    {
      name: 'Rachel Zane (Accountant)',
      email: 'accountant@hospital.com',
      password: 'Accountant@123',
      role: 'ACCOUNTANT',
      staffData: {
        employeeId: 'EMP-A001',
        phone: '+1-555-0106',
        department: 'Finance & Billing',
        designation: 'Chief Financial Officer',
      },
    },
  ];

  for (const item of demoUsers) {
    const existing = await prisma.user.findUnique({
      where: { email: item.email },
    });

    const hashedPassword = await bcrypt.hash(item.password, 10);

    let user;
    if (existing) {
      user = await prisma.user.update({
        where: { email: item.email },
        data: {
          name: item.name,
          password: hashedPassword,
          role: item.role,
        },
      });
      console.log(`Updated user: ${item.email}`);
    } else {
      user = await prisma.user.create({
        data: {
          name: item.name,
          email: item.email,
          password: hashedPassword,
          role: item.role,
        },
      });
      console.log(`Created user: ${item.email}`);
    }

    if (item.doctorData) {
      await prisma.doctor.upsert({
        where: { userId: user.id },
        update: item.doctorData,
        create: {
          ...item.doctorData,
          userId: user.id,
        },
      });
    }

    if (item.staffData) {
      await prisma.staff.upsert({
        where: { userId: user.id },
        update: item.staffData,
        create: {
          ...item.staffData,
          userId: user.id,
        },
      });
    }
  }

  // Seed initial Lab Tests if none exist
  const labCount = await prisma.labTest.count();
  if (labCount === 0) {
    await prisma.labTest.createMany({
      data: [
        { name: 'Complete Blood Count (CBC)', category: 'Hematology', price: 45.0, description: 'Standard red & white cell panel' },
        { name: 'Comprehensive Metabolic Panel (CMP)', category: 'Biochemistry', price: 65.0, description: 'Electrolytes and kidney/liver biomarkers' },
        { name: 'Lipid Panel', category: 'Biochemistry', price: 50.0, description: 'Cholesterol, HDL, LDL, Triglycerides' },
        { name: 'Chest X-Ray (PA & Lateral)', category: 'Radiology', price: 120.0, description: 'Dual view thoracic radiography' },
        { name: 'Urinalysis Routine', category: 'Pathology', price: 25.0, description: 'Macroscopic and microscopic urine evaluation' },
      ],
    });
    console.log('Seeded standard laboratory tests');
  }

  // Seed initial Medicines if none exist
  const medCount = await prisma.medicine.count();
  if (medCount === 0) {
    await prisma.medicine.createMany({
      data: [
        { name: 'Amoxicillin 500mg', category: 'Antibiotic', stock: 120, minStock: 20, price: 12.5, expiryDate: new Date('2027-06-30') },
        { name: 'Paracetamol 500mg', category: 'Analgesic', stock: 350, minStock: 50, price: 5.0, expiryDate: new Date('2028-01-15') },
        { name: 'Metformin 850mg', category: 'Antidiabetic', stock: 80, minStock: 15, price: 18.0, expiryDate: new Date('2027-11-20') },
        { name: 'Atorvastatin 20mg', category: 'Cardiovascular', stock: 45, minStock: 10, price: 24.0, expiryDate: new Date('2026-12-01') },
        { name: 'Omeprazole 20mg', category: 'Gastrointestinal', stock: 14, minStock: 20, price: 15.0, expiryDate: new Date('2026-08-15') }, // Low stock alert
      ],
    });
    console.log('Seeded initial medicines');
  }

  // Seed sample wards and beds if none exist
  const wardCount = await prisma.ward.count();
  if (wardCount === 0) {
    const wardICU = await prisma.ward.create({
      data: { name: 'Intensive Care Unit (ICU)', floor: '3rd Floor', capacity: 10 },
    });
    const wardGeneral = await prisma.ward.create({
      data: { name: 'General Ward North', floor: '2nd Floor', capacity: 20 },
    });

    await prisma.bed.createMany({
      data: [
        { bedNumber: 'ICU-101', wardId: wardICU.id, status: 'AVAILABLE', pricePerDay: 500 },
        { bedNumber: 'ICU-102', wardId: wardICU.id, status: 'AVAILABLE', pricePerDay: 500 },
        { bedNumber: 'GW-201', wardId: wardGeneral.id, status: 'AVAILABLE', pricePerDay: 150 },
        { bedNumber: 'GW-202', wardId: wardGeneral.id, status: 'AVAILABLE', pricePerDay: 150 },
      ],
    });
    console.log('Seeded wards and beds');
  }

  console.log('Database seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
