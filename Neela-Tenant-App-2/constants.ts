
import { Tenant, TenantStatus, Payment, MaintenanceRequest, MaintenanceStatus, Listing, Invoice } from './types';

export const MOCK_TENANTS: Tenant[] = [
  {
    id: 't1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '(512) 555-0101',
    status: TenantStatus.ACTIVE,
    propertyUnit: '101 - Sunset Apts',
    leaseStart: '2023-01-01',
    leaseEnd: '2024-01-01',
    rentAmount: 1200,
    deposit: 1200,
    balance: 0,
    creditScore: 720,
    backgroundCheckStatus: 'Clear'
  },
  {
    id: 't2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    phone: '(512) 555-0102',
    status: TenantStatus.EVICTION_PENDING,
    propertyUnit: '102 - Sunset Apts',
    leaseStart: '2023-03-01',
    leaseEnd: '2024-03-01',
    rentAmount: 1350,
    deposit: 1350,
    balance: 2750, // 2 months overdue + fees
    creditScore: 580,
    backgroundCheckStatus: 'Flagged'
  },
  {
    id: 't3',
    name: 'Charlie Davis',
    email: 'charlie@example.com',
    phone: '(512) 555-0103',
    status: TenantStatus.APPLICANT,
    propertyUnit: '103 - Sunset Apts',
    leaseStart: '2024-06-01',
    leaseEnd: '2025-06-01',
    rentAmount: 1250,
    deposit: 1250,
    balance: 0,
    creditScore: 690,
    backgroundCheckStatus: 'Pending',
    applicationData: {
      submissionDate: '2024-05-15',
      employment: {
        employer: 'Tech Solutions Inc.',
        jobTitle: 'Software Engineer',
        monthlyIncome: 5800,
        duration: '2 years'
      },
      references: [
        { name: 'Sarah Connor', relation: 'Previous Landlord', phone: '(512) 555-9999' },
        { name: 'John Doe', relation: 'Manager', phone: '(512) 555-8888' }
      ],
      documents: [
        { name: 'PayStub_April.pdf', url: '#', type: 'Income' },
        { name: 'DriverLicense_Front.jpg', url: '#', type: 'ID' }
      ],
      internalNotes: 'Met during showing. Seemed very responsible. Verify move-in date flexibility.'
    }
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: 'p1', tenantId: 't1', amount: 1200, date: '2024-05-01', status: 'Paid', type: 'Rent', method: 'Stripe (ACH)' },
  { id: 'p2', tenantId: 't2', amount: 1350, date: '2024-04-01', status: 'Failed', type: 'Rent', method: 'Credit Card' },
  { id: 'p3', tenantId: 't1', amount: 1200, date: '2024-04-01', status: 'Paid', type: 'Rent', method: 'Stripe (ACH)' },
];

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    tenantId: 't1',
    date: '2024-05-01',
    dueDate: '2024-05-01',
    amount: 1200,
    period: 'May 2024',
    status: 'Paid',
    items: [{ description: 'Rent May 2024', amount: 1200 }]
  },
  {
    id: 'inv-002',
    tenantId: 't2',
    date: '2024-05-01',
    dueDate: '2024-05-01',
    amount: 1350,
    period: 'May 2024',
    status: 'Overdue',
    items: [{ description: 'Rent May 2024', amount: 1350 }]
  },
  {
    id: 'inv-003',
    tenantId: 't2',
    date: '2024-05-05',
    dueDate: '2024-05-05',
    amount: 50,
    period: 'May 2024',
    status: 'Overdue',
    items: [{ description: 'Late Fee', amount: 50 }]
  }
];

export const MOCK_MAINTENANCE: MaintenanceRequest[] = [
  {
    id: 'm1',
    tenantId: 't1',
    category: 'Plumbing',
    description: 'Leaking faucet in the bathroom sink. Water is dripping constantly.',
    status: MaintenanceStatus.OPEN,
    priority: 'Medium',
    createdAt: '2024-05-10'
  },
  {
    id: 'm2',
    tenantId: 't2',
    category: 'HVAC',
    description: 'AC is blowing warm air. Temperature inside is 82 degrees.',
    status: MaintenanceStatus.IN_PROGRESS,
    priority: 'Emergency',
    createdAt: '2024-05-12'
  }
];

export const MOCK_LISTINGS: Listing[] = [
  {
    id: 'l1',
    title: 'Luxury Downtown Loft',
    address: '101 Sunset Blvd, Unit 304, Austin, TX',
    price: 1850,
    beds: 2,
    baths: 2,
    sqft: 1100,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Modern loft in the heart of the city. Features high ceilings, exposed brick, and floor-to-ceiling windows. Includes access to rooftop pool and gym.',
    amenities: ['Rooftop Pool', 'Gym Access', 'Covered Parking', 'Pet Friendly']
  },
  {
    id: 'l2',
    title: 'Cozy Suburban Family Home',
    address: '452 Oak Lane, Round Rock, TX',
    price: 2200,
    beds: 3,
    baths: 2.5,
    sqft: 1800,
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Spacious family home with a large backyard, perfect for entertaining. Recently updated kitchen with stainless steel appliances.',
    amenities: ['Large Backyard', '2-Car Garage', 'Fireplace', 'Smart Home Features']
  },
  {
    id: 'l3',
    title: 'Riverside Condo',
    address: '888 River Rd, Unit 12, Austin, TX',
    price: 1600,
    beds: 1,
    baths: 1,
    sqft: 850,
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    description: 'Quiet condo overlooking the river. Walking distance to hike and bike trails.',
    amenities: ['River View', 'Balcony', 'In-unit Washer/Dryer', 'Reserved Parking']
  }
];