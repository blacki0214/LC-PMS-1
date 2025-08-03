# 🏥 Long Châu Pharmacy Management System (LC-PMS)

<div align="center">

![Long Châu PMS](https://img.shields.io/badge/Long%20Ch%C3%A2u-PMS-blue)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue)
![Vite](https://img.shields.io/badge/Vite-Latest-green)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4.1-cyan)
![Neon Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-orange)

**A comprehensive pharmacy management system built with modern web technologies**

[🚀 Live Demo](#) | [📖 Documentation](#documentation) | [🐛 Report Bug](https://github.com/blacki0214/LC-PMS-1/issues) | [💡 Request Feature](https://github.com/blacki0214/LC-PMS-1/issues)

</div>

## 📋 Table of Contents

- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🚀 Quick Start](#-quick-start)
- [📦 Installation](#-installation)
- [⚙️ Configuration](#️-configuration)
- [💾 Database Setup](#-database-setup)
- [🎯 Usage](#-usage)
- [👥 User Roles](#-user-roles)
- [🔧 Development](#-development)
- [📱 API Reference](#-api-reference)
- [🧪 Testing](#-testing)
- [🚢 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## ✨ Features

### 🏪 **Pharmacy Operations**
- **Inventory Management**: Real-time stock tracking, low stock alerts, batch management
- **Prescription Processing**: Digital prescription validation, medication dispensing workflow
- **Order Management**: Customer orders, prescription orders, status tracking
- **Product Catalog**: 25+ pharmaceutical products with detailed information

### 👥 **Multi-Role System**
- **Customer Portal**: Product browsing, cart management, order tracking, prescription uploads
- **Pharmacist Interface**: Order validation, prescription review, inventory management
- **Manager Dashboard**: Analytics, staff management, system oversight
- **Shipper Module**: Delivery management, route optimization, real-time tracking

### 💳 **Payment Integration**
- **Vietnamese Payment Gateways**: VNPay, MoMo, ZaloPay integration
- **Multiple Payment Methods**: Cash on Delivery, Bank Transfer, Credit/Debit Cards
- **Receipt Generation**: Professional PDF-style receipts with detailed transaction information

### 🤖 **AI-Powered Features**
- **Smart Recommendations**: AI-driven product suggestions based on customer history
- **Health Analytics**: Customer health profile tracking and medication recommendations
- **Inventory Optimization**: Predictive stock management

### 🗺️ **Advanced Logistics**
- **Real-time Tracking**: Live order tracking with Vietnam map integration
- **Route Optimization**: Efficient delivery route planning
- **Shipper Management**: Assignment and performance tracking

### 📊 **Analytics & Reporting**
- **Sales Analytics**: Revenue tracking, popular products, customer insights
- **Inventory Reports**: Stock levels, turnover rates, expiration tracking
- **Performance Metrics**: Staff performance, delivery times, customer satisfaction

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React + TypeScript)              │
├─────────────────────────────────────────────────────────────────┤
│  Components  │  Contexts   │  Services   │  Utils             │
│  ├─customers │  ├─Auth     │  ├─Payment  │  ├─Notifications   │
│  ├─pharmacy  │  ├─Data     │  ├─User     │  ├─Activity        │
│  ├─orders    │  ├─Notify   │  ├─Receipt  │  └─Storage         │
│  ├─inventory │  └─Activity │  └─Rec.     │                    │
│  └─shipping  │             │             │                    │
├─────────────────────────────────────────────────────────────────┤
│                    Database Layer (Drizzle ORM)                │
├─────────────────────────────────────────────────────────────────┤
│                   Neon PostgreSQL Database                     │
│  ├─users        ├─orders      ├─recommendations               │
│  ├─products     ├─payments    ├─customer_health               │
│  ├─customers    ├─receipts    └─health_recommendations        │
│  └─prescriptions└─shippers                                    │
└─────────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn**
- **Git**
- **Neon Database Account** (for production)

### 1-Minute Setup

```bash
# Clone the repository
git clone https://github.com/blacki0214/LC-PMS-1.git
cd LC-PMS-1/longchau-pms

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Initialize database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

🎉 **Your pharmacy management system is now running at `http://localhost:5173`**

## 📦 Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/blacki0214/LC-PMS-1.git
cd LC-PMS-1/longchau-pms
```

### Step 2: Install Dependencies
```bash
# Using npm
npm install

# Or using yarn
yarn install
```

### Step 3: Environment Setup
Create a `.env` file in the root directory:
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host/database?sslmode=require"

# Payment Gateway Keys (Optional for development)
VNPAY_TMN_CODE="your_vnpay_tmn_code"
VNPAY_HASH_SECRET="your_vnpay_hash_secret"
MOMO_PARTNER_CODE="your_momo_partner_code"
MOMO_ACCESS_KEY="your_momo_access_key"
ZALOPAY_APP_ID="your_zalopay_app_id"
ZALOPAY_KEY1="your_zalopay_key1"

# Application Settings
NODE_ENV="development"
VITE_APP_NAME="Long Châu PMS"
```

## ⚙️ Configuration

### Database Configuration

The system uses **Neon PostgreSQL** with **Drizzle ORM** for type-safe database operations.

```typescript
// Database connection is configured in:
// src/lib/database.ts

import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

### Payment Gateway Setup

Configure payment gateways in the environment file. The system supports:

- **VNPay**: Vietnam's leading payment gateway
- **MoMo**: Popular e-wallet in Vietnam  
- **ZaloPay**: Zalo's payment solution
- **Cash on Delivery**: Traditional payment method
- **Bank Transfer**: Direct bank payments

## 💾 Database Setup

### Initial Setup
```bash
# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed

# Verify database connection
npm run db:verify
```

### Database Scripts
```bash
# Open Drizzle Studio (Database GUI)
npm run db:studio

# Add sample products
npm run db:add-products

# Sync mock data to database
npm run db:sync

# Drop all tables (⚠️ Use with caution)
npm run db:drop
```

### Schema Overview

```sql
-- Core Tables
users              -- Authentication and user management
customers          -- Customer profiles and health data
products           -- Pharmaceutical product catalog
orders             -- Order management and tracking
prescriptions      -- Digital prescription handling
payments           -- Payment transaction records
shippers           -- Delivery personnel management

-- AI & Analytics Tables
customer_health           -- Health profiles for recommendations
health_recommendations   -- AI-generated health suggestions
recommendations          -- Product recommendation engine
```

## 🎯 Usage

### Customer Workflow

1. **Registration/Login**
   ```
   Customer registers → Email verification → Profile setup
   ```

2. **Shopping Experience**
   ```
   Browse products → Add to cart → Review order → Place order
   ```

3. **Order Management**
   ```
   Order placed → Pharmacist confirmation → Payment → Shipping → Delivery
   ```

### Pharmacist Workflow

1. **Order Processing**
   ```
   Review new orders → Validate prescriptions → Confirm order → Prepare for shipping
   ```

2. **Inventory Management**
   ```
   Check stock levels → Update inventory → Manage expiration dates → Reorder products
   ```

### Manager Workflow

1. **System Overview**
   ```
   Monitor sales → Review analytics → Manage staff → System configuration
   ```

## 👥 User Roles

### 🛍️ Customer
- Browse pharmaceutical products
- Manage shopping cart
- Place and track orders
- Upload prescriptions
- View order history
- Receive AI recommendations

### 💊 Pharmacist
- Review and validate prescriptions
- Confirm customer orders
- Manage inventory
- Process medication dispensing
- Handle customer consultations

### 👔 Manager
- Access comprehensive analytics
- Manage staff and roles
- Oversee system operations
- Configure system settings
- Monitor business performance

### 🚚 Shipper
- View assigned deliveries
- Update delivery status
- Navigate with map integration
- Manage delivery routes
- Report delivery issues

## 🔧 Development

### Project Structure
```
longchau-pms/
├── src/
│   ├── components/          # React components
│   │   ├── auth/           # Authentication components
│   │   ├── customers/      # Customer-facing components
│   │   ├── dashboard/      # Dashboard and analytics
│   │   ├── inventory/      # Inventory management
│   │   ├── orders/         # Order management
│   │   ├── prescriptions/  # Prescription handling
│   │   ├── reports/        # Reporting components
│   │   └── shipping/       # Shipping and logistics
│   ├── contexts/           # React context providers
│   ├── services/           # Business logic and API calls
│   ├── lib/               # Database and utilities
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Helper functions
├── scripts/               # Database and utility scripts
├── public/               # Static assets
└── docs/                 # Documentation
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Code Style

The project follows these conventions:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **Tailwind CSS** for styling
- **React Functional Components** with hooks

## 📱 API Reference

### Authentication Endpoints
```typescript
// User registration
POST /api/auth/register
{
  email: string;
  password: string;
  name: string;
  role: 'customer' | 'pharmacist' | 'manager' | 'shipper';
}

// User login
POST /api/auth/login
{
  email: string;
  password: string;
}
```

### Order Management
```typescript
// Create order
POST /api/orders
{
  customerId: string;
  items: OrderItem[];
  paymentMethod: string;
  shippingAddress: string;
}

// Update order status
PUT /api/orders/:id
{
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
}
```

### Payment Processing
```typescript
// Process payment
POST /api/payments/process
{
  orderId: string;
  paymentMethod: 'vnpay' | 'momo' | 'zalopay' | 'cod' | 'bank_transfer';
  amount: number;
}
```

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
npm run test

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/              # Unit tests
├── integration/       # Integration tests
├── e2e/              # End-to-end tests
└── fixtures/         # Test data
```

## 🚢 Deployment

### Production Build
```bash
# Build for production
npm run build

# The build artifacts will be stored in the `dist/` directory
```

### Deployment Platforms

#### Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

#### Traditional VPS
```bash
# Build the project
npm run build

# Copy dist/ folder to your server
# Configure your web server (nginx, apache) to serve the static files
```

### Environment Variables for Production
```env
NODE_ENV=production
DATABASE_URL=your_production_database_url
VNPAY_TMN_CODE=your_production_vnpay_code
MOMO_PARTNER_CODE=your_production_momo_code
# ... other production credentials
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

### 1. Fork the Repository
```bash
git clone https://github.com/your-username/LC-PMS-1.git
```

### 2. Create a Feature Branch
```bash
git checkout -b feature/amazing-feature
```

### 3. Make Your Changes
- Follow the existing code style
- Add tests for new features
- Update documentation as needed

### 4. Submit a Pull Request
```bash
git add .
git commit -m "Add amazing feature"
git push origin feature/amazing-feature
```

### Development Guidelines
- Use TypeScript for all new code
- Follow the existing component structure
- Write tests for business logic
- Update documentation for new features
- Ensure all tests pass before submitting

## 📚 Documentation

### Additional Resources
- [🏗️ Architecture Guide](docs/ARCHITECTURE.md)
- [🔧 API Documentation](docs/API.md)
- [🎨 UI Components](docs/COMPONENTS.md)
- [💾 Database Schema](docs/DATABASE.md)
- [🚀 Deployment Guide](docs/DEPLOYMENT.md)

### Feature Documentation
- [💊 Prescription Management](docs/PRESCRIPTIONS.md)
- [🛒 Order Processing](docs/ORDERS.md)
- [💳 Payment Integration](docs/PAYMENTS.md)
- [🚚 Shipping & Logistics](docs/SHIPPING.md)
- [🤖 AI Recommendations](docs/AI_RECOMMENDATIONS.md)

## 🔧 Troubleshooting

### Common Issues

#### Database Connection Issues
```bash
# Check database connection
npm run db:verify

# Reset database
npm run db:drop
npm run db:push
npm run db:seed
```

#### Build Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Vite cache
rm -rf .vite
npm run dev
```

#### Authentication Issues
```typescript
// Check localStorage for stored user data
localStorage.getItem('lcpms-user')

// Clear authentication state
localStorage.removeItem('lcpms-user')
```

## 📊 Performance

### Optimization Features
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Optimized product images
- **Caching**: Intelligent data caching strategies
- **Bundle Analysis**: Webpack bundle analyzer for optimization

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Security

### Security Features
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control
- **Data Validation**: Input sanitization and validation
- **HTTPS**: Enforced secure connections
- **Environment Variables**: Secure credential management

### Security Best Practices
- Regular dependency updates
- SQL injection prevention with parameterized queries
- XSS protection with sanitized inputs
- CSRF protection for state-changing operations

## 📈 Roadmap

### Upcoming Features
- [ ] **Mobile App**: React Native mobile application
- [ ] **Advanced Analytics**: Machine learning-powered insights
- [ ] **Multi-language Support**: Vietnamese and English interfaces
- [ ] **Integration APIs**: Third-party pharmacy system integrations
- [ ] **Telemedicine**: Video consultation features
- [ ] **Blockchain**: Prescription verification using blockchain

### Version History
- **v1.0.0** (Current): Core pharmacy management system
- **v1.1.0** (Q2 2025): Enhanced AI recommendations
- **v1.2.0** (Q3 2025): Mobile app release
- **v2.0.0** (Q4 2025): Advanced analytics and ML features

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Long Châu Pharmacy Management System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

## 👨‍💻 Authors

- **Nguyen Van Quoc** - *Initial work* - [@blacki0214](https://github.com/blacki0214)

See also the list of [contributors](https://github.com/blacki0214/LC-PMS-1/contributors) who participated in this project.

## 🙏 Acknowledgments

- **Long Châu Pharmacy** for inspiration and domain expertise
- **React Team** for the amazing frontend framework
- **Tailwind CSS** for the utility-first CSS framework
- **Neon Database** for reliable PostgreSQL hosting
- **Drizzle ORM** for type-safe database operations
- **Vite** for lightning-fast development experience

## 📞 Support

### Getting Help
- 📧 Email: support@longchau-pms.com
- 💬 Discord: [Join our community](https://discord.gg/longchau-pms)
- 📱 Issue Tracker: [GitHub Issues](https://github.com/blacki0214/LC-PMS-1/issues)
- 📖 Documentation: [Wiki](https://github.com/blacki0214/LC-PMS-1/wiki)

### Business Inquiries
For commercial licensing and enterprise support:
- 📧 business@longchau-pms.com
- 📞 +84 (28) 1234-5678

---

<div align="center">

**Made with ❤️ by the Long Châu PMS Team**

[![GitHub Stars](https://img.shields.io/github/stars/blacki0214/LC-PMS-1?style=social)](https://github.com/blacki0214/LC-PMS-1)
[![GitHub Forks](https://img.shields.io/github/forks/blacki0214/LC-PMS-1?style=social)](https://github.com/blacki0214/LC-PMS-1)
[![GitHub Issues](https://img.shields.io/github/issues/blacki0214/LC-PMS-1)](https://github.com/blacki0214/LC-PMS-1/issues)
[![GitHub License](https://img.shields.io/github/license/blacki0214/LC-PMS-1)](https://github.com/blacki0214/LC-PMS-1/blob/main/LICENSE)

</div>
