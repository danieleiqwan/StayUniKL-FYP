# CHAPTER 4: SYSTEM ANALYSIS AND DESIGN

## 4.1 System Architecture
The system architecture of **StayUniKL** follows a modern, multi-tier full-stack layout designed to decouple user interactions from backend database operations and third-party API integrations. The architecture is composed of three primary layers:
1. **Client Layer (Frontend Presentation):** Built with React 19 and styled with Tailwind CSS, this layer renders the responsive user interface. It communicates asynchronously with the logic layer using standard HTTP clients (fetch) and manages local state updates in client-side React components.
2. **Logic Layer (API and Middleware):** Built using Next.js App Router API endpoints written in TypeScript. This layer handles user request validation (via Zod), role authorization middleware, cryptographic routines (bcrypt/jose), email notifications (Nodemailer), and third-party integrations (Stripe, Cloudinary).
3. **Data Layer (Storage and Persistence):** Composed of a relational MySQL database server. Static assets, profile pictures, and payment receipts are stored on Cloudinary's cloud infrastructure, with only their corresponding URLs saved in MySQL.

```mermaid
graph TD
    Client[Client UI: React + Tailwind CSS] <-->|HTTPS / REST API| NextJS[Logic Layer: Next.js API Routes]
    NextJS <-->|MySQL Connection Pool| MySQL[(MySQL Relational Database)]
    NextJS <-->|Media Upload API| Cloudinary[Cloudinary CDN Storage]
    NextJS <-->|SMTP Protocol| Nodemailer[Nodemailer Email Server]
    NextJS <-->|Payment API| Stripe[Stripe Payment Gateway]
```
*Figure 4.1: StayUniKL System Architecture*

---

## 4.2 Context Diagram
The Context Diagram represents the high-level boundary of the StayUniKL system, showing how external entities exchange data with the core system.

```mermaid
flowchart TD
    Student[Student Actor]
    Admin[Admin Actor]
    SuperAdmin[Super Admin Actor]
    System[StayUniKL System]
    
    Student -->|Submit room application, submit complaint, book facility, upload payment| System
    System -->|Invoice notifications, application status, check-in QR, booking alerts| Student
    
    Admin -->|Approve/reject application, assign beds, resolve complaint, verify payment| System
    System -->|System analytics, active occupancy dashboard, maintenance tickets| Admin
    
    SuperAdmin -->|Configure system parameters, manage student profiles, monitor audit trails| System
    System -->|Global system status, security logs, activity reports| SuperAdmin
```
*Figure 4.2: Context Diagram of StayUniKL*

---

## 4.3 Use Case Diagram
The behavioral requirements of the StayUniKL system are modeled in the following Use Case Diagram, separating user-facing modules from administrative management tasks.

```mermaid
flowchart LR
    Student([Student])
    Admin([System Admin])
    System([Automated System])

    subgraph StayUniKL System Boundary
        direction TB
        subgraph Authentication & Security
            UC1(UC01: User Authentication)
            UC2(UC02: Profile Settings)
            UC14(UC14: Security Governance)
        end
        subgraph Hostel Core Processes
            UC3(UC03: Submit Application)
            UC20(UC20: Approve/Reject Application)
            UC4(UC04: Allocate Bed)
            UC5(UC05: Verify Payment)
            UC21(UC21: QR Check-In)
            UC22(UC22: QR Check-Out)
        end
        subgraph Daily Operations
            UC7(UC07: Facility Booking)
            UC8(UC08: File Room Complaint)
            UC9(UC09: Manage Assets & Tickets)
            UC11(UC11: Generate Occupancy Reports)
            UC15(UC15: Notification Dispatch)
        end
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC5
    Student --> UC21
    Student --> UC7
    Student --> UC8
    Student --> UC15

    Admin --> UC1
    Admin --> UC4
    Admin --> UC5
    Admin --> UC21
    Admin --> UC22
    Admin --> UC7
    Admin --> UC9
    Admin --> UC11
    Admin --> UC20

    System --> UC14
    System --> UC15
```
*Figure 4.3: StayUniKL Use Case Diagram*

---

## 4.4 User Flow Diagram
To clarify the integration of different operations, Figure 4.4 traces a student's lifecycle from initial registration to room check-in:

```mermaid
sequenceDiagram
    autonumber
    actor Student
    actor Admin
    participant Server as Next.js API
    participant DB as MySQL Database
    
    Student->>Server: Register and Login (GET JWT Cookie)
    Student->>Server: Request Room Vacancy
    Server->>DB: Query rooms with active beds
    DB-->>Server: Return vacancy details
    Server-->>Student: Render vacancy list
    Student->>Server: Submit Application (Room Preference + Profile Data)
    Server->>DB: Transaction-safe INSERT Application, set bed status 'Occupied'
    DB-->>Server: Commit success
    Server-->>Student: Application Received (Status: Pending)
    Admin->>Server: Approve Application
    Server->>DB: UPDATE Application status 'Payment Pending', generate Invoice
    Server-->>Student: Email notification with invoice detail
    Student->>Server: Upload Payment Proof (receipt via Cloudinary)
    Admin->>Server: Approve Payment Proof
    Server->>DB: UPDATE Application status 'Approved', generate JWT check-in token
    Server-->>Student: Display check-in QR Code on dashboard
    Student->>Admin: Present QR Code on arrival
    Admin->>Server: Scan QR Code (decode JWT payload)
    Server->>DB: UPDATE Application status 'Checked In', log tenancy start
    Server-->>Admin: Show verification success message
```
*Figure 4.4: End-to-End Room Allocation & Check-In Sequence*

---

## 4.5 Entity-Relationship Diagram (ERD)
The database structure is designed to support high transactional consistency and relational integrity.

```mermaid
erDiagram
    USERS {
        VARCHAR id PK
        VARCHAR name
        VARCHAR email UNIQUE
        VARCHAR password
        ENUM role
        ENUM gender
        VARCHAR student_id
        VARCHAR phone
        TIMESTAMP created_at
    }
    ROOMS {
        VARCHAR id PK
        VARCHAR room_number
        VARCHAR block
        VARCHAR floor
        ENUM gender
        ENUM room_type
    }
    BEDS {
        VARCHAR id PK
        VARCHAR room_id FK
        VARCHAR bed_number
        ENUM status
    }
    APPLICATIONS {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR room_id FK
        VARCHAR bed_id FK
        ENUM status
        ENUM payment_status
        ENUM payment_method
        VARCHAR intake
        TIMESTAMP created_at
    }
    INVOICES {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR application_id FK
        DECIMAL amount
        ENUM status
        VARCHAR evidence_url
        TIMESTAMP created_at
    }
    BOOKINGS {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR facility_id FK
        DATE date
        TIME start_time
        TIME end_time
        ENUM status
        TIMESTAMP created_at
    }
    COMPLAINTS {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR room_id FK
        VARCHAR category
        TEXT description
        ENUM status
        VARCHAR file_url
        TIMESTAMP created_at
    }
    AUDIT_LOGS {
        VARCHAR id PK
        VARCHAR user_id FK
        VARCHAR action
        VARCHAR details
        TIMESTAMP created_at
    }

    USERS ||--o{ APPLICATIONS : submits
    USERS ||--o{ INVOICES : owns
    USERS ||--o{ BOOKINGS : reserves
    USERS ||--o{ COMPLAINTS : reports
    USERS ||--o{ AUDIT_LOGS : performs
    ROOMS ||--|{ BEDS : contains
    APPLICATIONS ||--|| BEDS : allocates
    APPLICATIONS ||--o| ROOMS : assigns
    COMPLAINTS }o--|| ROOMS : linked_to
    INVOICES }o--|| APPLICATIONS : references
```
*Figure 4.5: StayUniKL Entity-Relationship Diagram (ERD)*

---

## 4.6 Database Design (Data Dictionary)

### Table 4.1: `users` Table
| Column Name | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | Primary Key | Unique UUID generated on registration |
| `name` | VARCHAR(255) | NOT NULL | Full name of the user |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | University email address |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt-hashed password string |
| `role` | ENUM('student', 'admin', 'superadmin') | NOT NULL | Access privileges assigned to the user |
| `gender` | ENUM('male', 'female') | NOT NULL | Gender for room assignment checks |
| `student_id` | VARCHAR(50) | NULL | Student registration number |
| `phone` | VARCHAR(50) | NULL | Contact phone number |

### Table 4.2: `applications` Table
| Column Name | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | Primary Key | Unique UUID of the application |
| `user_id` | VARCHAR(50) | Foreign Key (users.id) | Student submitting the application |
| `room_id` | VARCHAR(50) | Foreign Key (rooms.id) | Requested room identifier |
| `bed_id` | VARCHAR(50) | Foreign Key (beds.id) | Specific assigned bed |
| `status` | ENUM('Pending', 'Payment Pending', 'Approved', 'Rejected', 'Checked In', 'Checked Out', 'Cancelled') | Default: 'Pending' | Stage of application process |
| `payment_status` | ENUM('Unpaid', 'Pending Verification', 'Paid', 'Refunded') | Default: 'Unpaid' | Invoice payment tracking |
| `payment_method` | ENUM('Stripe', 'Manual Transfer', 'Installment') | Default: 'Manual Transfer' | Selected invoice payment channel |
| `intake` | VARCHAR(100) | NOT NULL | Enrollment intake cohort (e.g., 'May 2026') |

### Table 4.3: `bookings` Table
| Column Name | Data Type | Constraint | Description |
|---|---|---|---|
| `id` | VARCHAR(50) | Primary Key | Unique reservation identifier |
| `user_id` | VARCHAR(50) | Foreign Key (users.id) | Resident booking the facility |
| `facility_id` | VARCHAR(100) | NOT NULL | Identifier of court, gym, or laundry machine |
| `date` | DATE | NOT NULL | Reserved booking calendar date |
| `start_time` | TIME | NOT NULL | Start of reservation (1-hour constraint) |
| `end_time` | TIME | NOT NULL | End of reservation |
| `status` | ENUM('Confirmed', 'Cancelled', 'No-Show', 'Completed') | Default: 'Confirmed' | Booking status |

---

## 4.7 UI Design
The UI design of StayUniKL employs a responsive grid system constructed with Tailwind CSS. Key design paradigms include:
* **Dashboard Split-Views:** Students view active rooms, facility calendars, and complaints on a single unified page, styled in a dashboard layout.
* **Dynamic Room Matrix:** Admins access a visual blueprint representation of rooms. Rooms are color-coded dynamically based on capacity status (Green = Vacant, Yellow = Partially Vacant, Red = Full, Grey = Under Maintenance).
* **Mobile-Responsive Calendar Grid:** The facility scheduler renders dynamic hours based on screen dimensions, adapting from full tables to single-column carousels on mobile screens.

---

## 4.8 Security Design
To prevent security leaks, StayUniKL implements a layered security defense model:
1. **JWT in HttpOnly Cookies:** Access tokens are signed using the `jose` library with an environment-stored secret (`JWT_SECRET`). Tokens are saved as cookies with `HttpOnly`, `Secure`, and `SameSite=Strict` flags. This prevents Client-side script reading (XSS mitigation) and cross-site request forgery (CSRF mitigation).
2. **Row-Level Transaction Safety:** Critical database modifications (e.g., locking a room allocation bed or reserving a booking slot) are enclosed in SQL transactions using raw pool queries. The engine uses `SELECT ... FOR UPDATE` locks to prevent race conditions during concurrent requests.
3. **Zod Validation Schemas:** Inputs to Next.js API handlers are validated using strict Zod schemas. Any payload with incorrect formats, sizes, or SQL Injection attempts is rejected immediately at the application boundary, returning a 400 Bad Request error.
4. **API Rate Limiting:** Auth routes (login/register) are wrapped with serverless ip-bound rate limit headers (5 requests per minute limit) to prevent dictionary and brute-force attacks on student passwords.

---

## References (Chapter 4)
* Silberschatz, A., Korth, H. F., & Sudarshan, S. (2019). *Database System Concepts* (7th ed.). McGraw-Hill.
