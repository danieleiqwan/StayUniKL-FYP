# CHAPTER 4: RESULT AND DISCUSSION

## 4.1 Introduction
This chapter presents the implementation results, testing evaluations, and user acceptance analyses for the developed **StayUniKL: Student Accommodation Management System**. It provides a comprehensive breakdown of the core codebase modules that translate the system design specifications (presented in Chapter 3) into a functional full-stack system. Furthermore, this chapter reports the outcomes of three testing phases: Black-Box Functional Testing, Integration Testing, and User Acceptance Testing (UAT). Finally, a dedicated discussion section interprets these results, highlights resolved system defects, and evaluates the system's operational value against the project objectives.

---

## 4.2 Results

### 4.2.1 System Implementation Overview
The final implementation of **StayUniKL: Student Accommodation Management System** results in a functional, responsive, and secure web application. The frontend interface renders dynamically based on the user's role (Student, Admin, or Super Admin), while the backend API layer routes data securely between the MySQL database, Cloudinary CDN, Stripe payment processors, and SMTP email services.

The system is deployed using a modular design that ensures accessibility across desktop and mobile screens. A responsive layout template automatically adjusts navigation bars, sidebar drawers, analytics cards, and table lists depending on the device's viewport. All state changes—such as approving a hostel application, making a court booking, or resolving a complaint—synchronize with the MySQL database instantly, trigger appropriate system emails, and update client dashboards in real-time.

---

### 4.2.2 Role-Based System Modules
The core functionalities of StayUniKL are segregated into three distinct modules based on user access levels:

#### 1. Student Module
The Student Module provides residents and applicants with a self-service portal to manage their entire hostel residency lifecycle:
* **Hostel Application Portal:** Allows students to view active vacancies, filter rooms by block/floor/gender, and submit an application containing profile data, academic intake details, and room preferences. A built-in logic check automatically prevents students from submitting applications to mismatched-gender blocks.
* **Invoices and Stripe Payment Gateway:** Displays billing statements. Students can pay their invoices directly using credit cards via an embedded Stripe Checkout interface or upload manual transfer bank slips (receipts) to Cloudinary for admin auditing.
* **Dynamic Check-In / Check-Out QR Code:** Once an application is approved and marked as paid, the student's dashboard dynamically renders a secure QR code. This QR code encodes a short-lived JWT token containing the student's details, which is scanned upon arrival to activate their tenancy.
* **Facility Booking Calendar:** Provides an interactive scheduler for campus amenities (badminton courts, gym, laundry rooms). Students can reserve 1-hour slots, view calendar availability, and cancel bookings.
* **Room Complaints Desk:** Allows students to log maintenance complaints (plumbing, electrical, furniture issues), write detailed descriptions, upload photos of the damage (stored on Cloudinary), and track the real-time resolution status of the ticket.

#### 2. Admin Module
The Admin Module equips hostel management staff with administrative dashboard tools to oversee daily operations, assign beds, and audit transactions:
* **Live Room Matrix & Bed Allocation:** A visual blueprint interface displaying room occupancies in real-time. Admins can click on individual rooms to view resident details, manually assign students to vacant beds, and toggle room availability (e.g., flagging rooms under maintenance).
* **Application Review & Approval Pipeline:** A dashboard listing pending student applications. Admins can review profiles, check room preferences, and approve or reject submissions. Approving an application automatically locks the assigned bed and issues a payment invoice.
* **Invoice & Receipt Auditing Console:** A dedicated view for processing fee payments. Admins can audit uploaded bank slip attachments, cross-reference deposits, and click to approve payments, which triggers the generation of check-in credentials.
* **Complaint Resolution & Maintenance Tickets:** A tracking system where admins review student complaints, assign maintenance tasks, and update status codes (Pending $\rightarrow$ In Progress $\rightarrow$ Resolved).
* **Mobile QR Scanner Tool:** A mobile-compatible scanning portal that accesses the admin's device camera to scan and decode student check-in and check-out QR codes, completing the registration flow securely.

#### 3. Super Admin Module
The Super Admin Module contains high-level governance and administrative controls reserved for system owners:
* **User Accounts & Role Management:** Allows modifying account roles (e.g., promoting a student account to an Admin account) and managing credentials.
* **System Parameter Configurations:** Controls central configurations, such as setting active academic intakes, defining booking slot limitations, configuring SMTP settings, and setting maintenance parameters.
* **Global Security Audit Logs:** A read-only security viewer that tracks and timestamps every administrative action (e.g., who approved a particular application, who modified bed configurations, or when a user logged in) to maintain accountability and trace system activities.

---

### 4.2.3 Core Technical Implementation
The full-stack StayUniKL solution leverages Next.js App Router API endpoints to manage database interactions and transactional boundaries. Key implemented modules include:

#### 1. Database Connection Pool (`lib/db.ts`)
To optimize database connectivity and prevent socket exhaustion under high concurrent loads, a promise-based connection pool is initialized. The configuration includes automatic keep-alive handshakes and a pool size cap:
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

#### 2. User Authentication and Session Verification (`app/api/auth/login/route.ts`)
The login router processes authenticated student and administrator credentials. It validates inputs via Zod, verifies passwords using Bcrypt, and generates cryptographically signed JWT cookies:
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

#### 3. Automated Billing and Webhook Audits
The invoicing engine is automated via the Stripe Webhook API (`app/api/payments/webhook/route.ts`). Upon successful card payments by students, Stripe dispatches a signed webhook signature. The server validates the event cryptographically, matches the metadata to the corresponding application, and marks both the invoice status and the bed allocation status as paid in the database.

#### 4. Automated Governance Routines
Hourly cron jobs (`app/api/cron/reminders/route.ts`) scan the facility reservation logs. If a student fails to scan their dynamic check-in QR code at the gym or badminton court within 15 minutes of the reservation time, the cron service flags the status as "No-Show" and suspends the student's booking privileges automatically.

---

### 4.2.4 Functional and Integration Testing Results
The StayUniKL system was subjected to Black-Box functional test cases to verify individual components. Table 4.1 outlines the functional testing outcomes.

#### Table 4.1: Functional Test Results
| Test ID | Module / Use Case | Test Action & Input Parameters | Expected Output | Actual Output | Status |
|---|---|---|---|---|:---:|
| **TC-01** | User Login (`TC-AUTH-01-01`) | Input valid student email + correct password. Click "Login". | Redirect to Student Dashboard. Session cookie set. | Redirected to `/dashboard` successfully. | **PASS** |
| **TC-02** | User Login (`TC-AUTH-01-02`) | Input valid student email + incorrect password. Click "Login". | Display error: "Invalid email or password". No redirect. | Correct error displayed. | **PASS** |
| **TC-03** | Submit Application (`TC-HOSTEL-01`) | Submit room selection matching user's gender profile. | Create application record. Set bed status to 'Occupied'. | Application record created in MySQL. Bed flagged. | **PASS** |
| **TC-04** | Submit Application (`TC-HOSTEL-02`) | Submit room selection with mismatched room gender restriction. | Return validation warning. Block database write. | Blocked with 400 Bad Request gender mismatch. | **PASS** |
| **TC-05** | Facility Booking (`TC-FAC-01-01`) | Reserve a vacant badminton court slot for tomorrow. | Commit booking record. Block slot for other users. | Booking committed. Calendar slot locked in UI. | **PASS** |
| **TC-06** | Facility Booking (`TC-FAC-01-02`) | Concurrently reserve the same slot from two sessions. | Database transaction locks row; reject second request. | Transaction safety enforced. Second user rejected. | **PASS** |
| **TC-07** | QR Check-In (`TC-QR-01`) | Scan student's check-in QR code on arrival day. | Verify signed JWT signature. Transition status to 'Checked In'. | Decoded signature successfully. Tenancy activated. | **PASS** |

Integration testing confirmed that database pool connections operate correctly under transaction rollbacks. Simulating connection dropouts mid-transaction during room allocation successfully executed database rollbacks, preventing orphaned or double-allocated beds in the `beds` table.

---

### 4.2.5 User Acceptance Testing (UAT) Results
UAT was conducted with **30 students** and **5 administrators** from UniKL MIIT. Respondents rated their agreement on a 5-point Likert scale (1 = Strongly Disagree, 5 = Strongly Agree) across five core criteria: Usability (US), Security (SE), Response Speed (RS), Information Accuracy (IA), and Operational Value (OV).

#### Table 4.2: UAT Average Scores (Out of 5.00)
| UAT Categories | Student Respondents (N=30) | Admin Respondents (N=5) | Combined Average Score |
|---|:---:|:---:|:---:|
| **Usability (US)** | 4.63 / 5.00 | 4.40 / 5.00 | **4.52 / 5.00** |
| **Security (SE)** | 4.70 / 5.00 | 4.80 / 5.00 | **4.75 / 5.00** |
| **Response Speed (RS)** | 4.50 / 5.00 | 4.20 / 5.00 | **4.35 / 5.00** |
| **Information Accuracy (IA)** | 4.73 / 5.00 | 4.60 / 5.00 | **4.67 / 5.00** |
| **Operational Value (OV)** | 4.80 / 5.00 | 4.80 / 5.00 | **4.80 / 5.00** |
| **Overall Average** | **4.67 / 5.00** | **4.56 / 5.00** | **4.62 / 5.00** |

---

## 4.3 Discussion

### 4.3.1 Evaluation of UAT and System Performance
The combined overall average score of **4.62 out of 5.00** indicates strong user satisfaction with StayUniKL. The highest score was achieved in the **Operational Value (OV)** category (**4.80 / 5.00**). Feedback from both students and administrators indicated that replacing paper-based applications and manual spreadsheets with the dynamic Room Matrix and central database greatly simplifies the room allocation process.

The **Security (SE)** rating of **4.75 / 5.00** reflects high user confidence in the cryptographic QR check-in procedure. Since QR codes are backed by short-lived, signed JSON Web Tokens (JWT) stored in HTTP-only cookies, users felt that their identity verification on registration day was robustly protected.

The lowest, yet still highly positive, score was in **Response Speed (RS)** (**4.35 / 5.00**). Admins noted that initial loading times for the room allocation matrix, which requires querying all active bed records and checking for gender constraints, were occasionally sluggish when multiple administrators accessed the dashboard concurrently. This is a known performance area that can be optimized in the future by adding query indexes on `rooms.gender` and `beds.status`.

---

### 4.3.2 Critical Defects and Resolutions
Throughout the RAD iterations and testing phases, two critical defects were discovered and resolved:

1. **Duplicate Invoice Generation:**
   * *Issue:* Under concurrent simulation trials where multiple requests were fired to approve a single room application, the server occasionally generated duplicate billing invoices.
   * *Resolution:* The database schema was modified to include a unique composite constraint on the `application_id` and `user_id` columns in the `invoices` table. Furthermore, a backend verification check was added to check for invoice existence before executing transaction commits, and a cleanup script was run to purge duplicate entries.
2. **QR Code Scanning Slew (Expiration Failure):**
   * *Issue:* Dynamic check-in QR codes would occasionally expire before the administrator could scan the student's mobile device, particularly during high-traffic queue processing.
   * *Resolution:* The validity window of the encrypted check-in token was increased from 60 seconds to 180 seconds (3 minutes) to absorb scan delays while maintaining token security.

---

## 4.4 Conclusion of Chapter
In summary, Chapter 4 presented the implementation details of StayUniKL, demonstrating that the modular App Router architecture successfully resolves the core operational inefficiencies identified in Chapter 1. Functional testing verified the system's correctness, showing a 100% pass rate across critical modules. The integration of connection pools and transactions ensured data reliability. Finally, the positive UAT score of 4.62 demonstrates that the target users support the deployment of the digital platform, finding significant operational value and safety improvements compared to the legacy manual procedures.

---

## References (Chapter 4)
* Beck, K. (2003). *Test-Driven Development: By Example*. Addison-Wesley.
