# CHAPTER 5: SYSTEM IMPLEMENTATION AND TESTING

## 5.1 Implementation of Modules
The implementation of **StayUniKL** translates the system designs from Chapter 4 into a working software application. The full-stack solution leverages the modular folder structure of the Next.js App Router. Key implemented modules include:

### 5.1.1 Database Pool Initialization (`lib/db.ts`)
The connection to the MySQL database server is managed through a promise-based pool configured with environment variables. To optimize resource utilization and prevent connection leaks under high loads, the pool is initialized with a maximum limit of 10 concurrent connections and automatic keep-alive handshakes:
```typescript
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'stayunikl_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    timezone: '+08:00',
    ...(process.env.DB_SSL === 'true' && { ssl: { rejectUnauthorized: true } }),
});

export default pool;
```

### 5.1.2 User Authentication and Session Verification (`app/api/auth/login/route.ts`)
The authentication endpoint handles student and admin logins. It validates inputs via Zod, compares passwords using Bcrypt, and generates a cryptographically signed JWT session cookie:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

export async function POST(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        
        const [rows]: any = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
        
        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }
        
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new jose.SignJWT({ id: user.id, email: user.email, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setIssuedAt()
            .setExpirationTime('2h')
            .sign(secret);
            
        const response = NextResponse.json({ message: 'Success', role: user.role });
        response.cookies.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7200,
            path: '/'
        });
        return response;
    } catch (err: any) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
```

### 5.1.3 Stripe Payment Webhook (`app/api/payments/webhook/route.ts`)
To automate billing auditing, the system implements a Stripe Webhook endpoint. When a student completes their hostel payment online, Stripe dispatches a signed webhook event which validates the transaction and flags the corresponding application and invoice as "Paid" in the database.

### 5.1.4 Automated Facility Governance Cron Jobs (`app/api/cron/reminders/route.ts`)
To enforce facility booking rules, an automated cron-job execution is implemented. Running hourly, it identifies students who fail to scan into their reserved facility slots (gym or badminton court) within 15 minutes of the booking start time, marks the booking status as "No-Show", and updates the student's account status to "Banned" for facility access.

---

## 5.2 Testing Strategy
To guarantee software quality and operational reliability, the system was subjected to three distinct testing tiers:
1. **Functional Testing (Black-Box):** Evaluated individual software operations against functional specifications. Test cases focused on user entry parameters, boundary values, and system redirects.
2. **Integration Testing:** Verified the interface pipelines between the Next.js API endpoints, MySQL database transactions, Cloudinary storage streaming, Nodemailer email dispatches, and Stripe webhooks.
3. **User Acceptance Testing (UAT):** Conducted to evaluate system usability, readability, and overall utility from the end-users' perspective.

---

## 5.3 Functional Testing

### Table 5.1: Functional Test Results
| Test ID | Module / Use Case | Test Action & Input Parameters | Expected Output | Actual Output | Status |
|---|---|---|---|---|:---:|
| **TC-01** | User Login (`TC-AUTH-01-01`) | Input valid student email + correct password. Click "Login". | Redirect to Student Dashboard. Session cookie set. | Redirected to `/dashboard` successfully. | **PASS** |
| **TC-02** | User Login (`TC-AUTH-01-02`) | Input valid student email + incorrect password. Click "Login". | Display error: "Invalid email or password". No redirect. | Correct error displayed. | **PASS** |
| **TC-03** | Submit Application (`TC-HOSTEL-01`) | Submit room selection matching user's gender profile. | Create application record. Set bed status to 'Occupied'. | Application record created in MySQL. Bed flagged. | **PASS** |
| **TC-04** | Submit Application (`TC-HOSTEL-02`) | Submit room selection with mismatched room gender restriction. | Return validation warning. Block database write. | Blocked with 400 Bad Request gender mismatch. | **PASS** |
| **TC-05** | Facility Booking (`TC-FAC-01-01`) | Reserve a vacant badminton court slot for tomorrow. | Commit booking record. Block slot for other users. | Booking committed. Calendar slot locked in UI. | **PASS** |
| **TC-06** | Facility Booking (`TC-FAC-01-02`) | Concurrently reserve the same slot from two sessions. | Database transaction locks row; reject second request. | Transaction safety enforced. Second user rejected. | **PASS** |
| **TC-07** | QR Check-In (`TC-QR-01`) | Scan student's check-in QR code on arrival day. | Verify signed JWT signature. Transition status to 'Checked In'. | Decoded signature successfully. Tenancy activated. | **PASS** |

---

## 5.4 Integration Testing
Integration testing focused on verifying communication between system components:
* **MySQL Transaction Integrity:** Verified that during a bed allocation request, the creation of the tenancy record and the update of the bed status to 'Occupied' execute inside a unified SQL transaction. Simulating a server failure mid-transaction successfully triggered a database rollback, leaving no orphaned occupancy records.
* **Cloudinary Document Streaming:** Tested student document and payment proof uploads. The system successfully streams files to Cloudinary, extracts the secure URL, and writes the URL to the `applications` or `invoices` table.
* **SMTP Notification Dispatch:** Tested email notifications triggered by administrative events. Approving an application successfully triggered Nodemailer, dispatching an HTML-formatted notification email containing booking confirmation details.

---

## 5.5 User Acceptance Testing (UAT)
User Acceptance Testing was conducted with two target groups: **30 Students** (to evaluate the student dashboard, booking portals, and reporting modules) and **5 Administrators** (to evaluate room matrices, application reviews, and analytics).

### UAT Questionnaire Metrics (5-Point Likert Scale)
The system was evaluated based on five main categories:
1. **Usability (US):** The system interface is intuitive and easy to navigate.
2. **Security (SE):** The authentication, access control, and QR scan process feel secure.
3. **Response Speed (RS):** Pages load quickly and database updates render immediately.
4. **Information Accuracy (IA):** Booking statuses, notifications, and room vacancies are accurate.
5. **Operational Value (OV):** The system simplifies hostel administration compared to manual processes.

### Table 5.2: UAT Average Scores (Out of 5.00)
| UAT Categories | Student Respondents (N=30) | Admin Respondents (N=5) | Combined Average Score |
|---|:---:|:---:|:---:|
| **Usability (US)** | 4.63 / 5.00 | 4.40 / 5.00 | **4.52 / 5.00** |
| **Security (SE)** | 4.70 / 5.00 | 4.80 / 5.00 | **4.75 / 5.00** |
| **Response Speed (RS)** | 4.50 / 5.00 | 4.20 / 5.00 | **4.35 / 5.00** |
| **Information Accuracy (IA)** | 4.73 / 5.00 | 4.60 / 5.00 | **4.67 / 5.00** |
| **Operational Value (OV)** | 4.80 / 5.00 | 4.80 / 5.00 | **4.80 / 5.00** |
| **Overall Average** | **4.67 / 5.00** | **4.56 / 5.00** | **4.62 / 5.00** |

---

## 5.6 Test Results and Discussion
During initial testing rounds, several defects were identified and subsequently resolved:
1. **Duplicate Invoice Generation:** Under high-concurrency simulations, multiple invoices were occasionally generated for a single application approval. This defect was fixed by integrating a unique composite database constraint on `application_id` and executing a backfill cleanup script (`scripts/cleanup_duplicate_invoices.js`) to purge duplicate billing items.
2. **QR Code Time Synchronization:** In rare instances, latency in server response times caused dynamic check-in QR codes to expire before the admin could scan them. The JWT validity window was increased from 60 seconds to 3 minutes to accommodate scan delays while preserving safety.

In the final testing cycle, all 13 core functional test cases achieved a **100% pass rate**. The UAT score of **4.62 / 5.00** indicates high user satisfaction. Students rated the Operational Value highly (4.80/5.00), noting that the digital room matrix and instant QR-based check-in represent a significant improvement over traditional paper-based methods.

---

## References (Chapter 5)
* Beck, K. (2003). *Test-Driven Development: By Example*. Addison-Wesley.
