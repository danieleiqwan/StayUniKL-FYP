# StayUniKL — UniKL Accommodation Management System

> A centralized web platform for streamlining student hostel applications, room allocations, payments, and facility management at Universiti Kuala Lumpur.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Visit_App-007ACC?style=for-the-badge&logo=vercel&logoColor=white)](https://your-demo-url.com)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-008CDD?style=for-the-badge&logo=stripe&logoColor=white)

## About

StayUniKL is a web-based accommodation management system engineered to simplify campus hostel operations for Universiti Kuala Lumpur students and administrators. The platform automates room allocations, payment processing, QR-based check-ins, and maintenance complaint management within a unified digital portal. Designed to replace manual processes, it improves operational efficiency and provides students with a seamless housing experience.

## Key Features

- **Student Accommodation Booking**: Streamlined online hostel applications with real-time bed availability tracking and automated room assignments.
- **Payment Gateway Integration**: Secure processing of accommodation fees and instant receipt generation powered by Stripe.
- **Digital QR Check-In / Check-Out**: Fast student identity verification and room entry validation using integrated QR scanning.
- **Maintenance & Complaint Ticketing**: Comprehensive maintenance request system with status tracking and media attachments.
- **Administrative Portal & Analytics**: Central dashboard for hostel administrators to manage room inventories, review applications, export records, and oversee operations.
- **Automated Notifications**: Email and system notifications keeping users informed on application status updates, invoices, and ticket progress.

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide Icons
- **Backend & APIs**: Next.js API Routes, Node.js, JWT Authentication (`jsonwebtoken`, `jose`), Zod Validation
- **Database**: MySQL (using `mysql2`)
- **Third-Party Services & Libraries**:
  - **Payment Gateway**: Stripe API (`@stripe/stripe-js`)
  - **Cloud Media Storage**: Cloudinary API
  - **Email Service**: Nodemailer (SMTP)
  - **QR Engine**: `html5-qrcode` & `react-qr-code`
  - **Data Export**: SheetJS (`xlsx`)

## Getting Started

### Prerequisites

- **Node.js**: `v18.x` or higher
- **Package Manager**: `npm`, `yarn`, or `pnpm`
- **Database**: MySQL Server `v8.0` or higher

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/danieleiqwan/StayUniKL-FYP.git
   cd StayUniKL-FYP
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory and define the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=stayunikl_db

# Authentication
JWT_SECRET=your_jwt_secret_key

# Stripe Payments
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary File Storage
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# SMTP Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
ADMIN_EMAIL=admin@stayunikl.edu.my
```

### Run Locally

1. **Setup Database:**
   Import the database schema into your local MySQL database (`stayunikl_db`).

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Access the Application:**
   Open [http://localhost:3000](http://localhost:3000) in your web browser.

## Screenshots

> *Note: Replace the placeholder image URLs below with your project screenshots.*

| Student Dashboard | Accommodation Booking |
| :---: | :---: |
| ![Student Dashboard](https://via.placeholder.com/600x350?text=Student+Dashboard) | ![Accommodation Booking](https://via.placeholder.com/600x350?text=Accommodation+Booking) |

| Admin Control Panel | QR Verification |
| :---: | :---: |
| ![Admin Control Panel](https://via.placeholder.com/600x350?text=Admin+Control+Panel) | ![QR Verification](https://via.placeholder.com/600x350?text=QR+Verification) |

## License

Distributed under the MIT License. See `LICENSE` for details.
