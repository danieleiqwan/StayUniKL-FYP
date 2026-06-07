# CHAPTER 5: CONCLUSION AND FUTURE WORK

## 5.1 Project Summary
The primary goal of this Final Year Project was to resolve the operational inefficiencies, data fragmentation, and security vulnerabilities associated with the legacy student housing practices at Universiti Kuala Lumpur (UniKL MIIT) by developing **StayUniKL: Student Accommodation Management System**. 

The project progressed through a structured Agile Scrum lifecycle. The requirements gathering phase established a clear understanding of administrative struggles, particularly manual spreadsheet entry, double-booking occurrences, and receipt auditing. In response, a modern, multi-tier web application architecture was designed and implemented using Next.js 15, React 19, TypeScript, and a relational MySQL database. 

The developed system integrates room selections, transaction-safe booking allocations, dynamic check-in QR codes, Nodemailer notifications, Cloudinary static hosting, and Stripe billing pipelines. Finally, the system underwent functional, integration, and User Acceptance Testing (UAT). The UAT results, gathered from 30 students and 5 admin staff, showed high user satisfaction, scoring an average of **4.62 out of 5.00** across usability, security, speed, and operational metrics.

---

## 5.2 Achievements
The development of StayUniKL successfully accomplished the following milestones:
* **Centralization of Hostel Governance:** Replaced paper forms and Google Forms with a unified, role-based dashboard. This dashboard manages the entire residency lifecycle, from applications to check-out.
* **Concurrency Conflict Prevention:** Integrated SQL database transaction locks (`SELECT ... FOR UPDATE`), preventing double-booking of beds and facility slots during high-traffic enrollment windows.
* **Hardened Check-In Security:** Implemented a secure, dynamic check-in system using JSON Web Tokens (JWT) embedded inside QR codes, simplifying verification on arrival day and reducing manual administration.
* **Automated Booking Enforcement:** Formulated a cron-job scheduler that automatically flags "No-Show" bookings and suspends facility privileges for students who violate reservation limits, promoting fair resource sharing.
* **Real-time Complaint and Asset Sync:** Linked maintenance reporting directly to room inventories, giving administrators real-time visibility into hostel asset conditions.

---

## 5.3 Limitations
Despite its successful implementation, StayUniKL has several technical and operational limitations:
* **Dependency on External Third-Party APIs:** The system relies on Cloudinary for document hosting, Stripe for payment processing, and Gmail SMTP for notifications. Changes to these services' pricing plans or rate limits could affect system functionality.
* **Internet Connectivity Constraints:** Because it is a web-based client-server application, students and admins must have an active internet connection to access their dashboards, submit complaints, or scan check-in QR codes.
* **Lack of Direct SIS Integration:** StayUniKL operates as a standalone student accommodation portal. It is not currently integrated with UniKL's official Student Information System (SIS), meaning student academic records must be imported or verified manually.

---

## 5.4 Future Enhancements
To build on the foundation of StayUniKL, several future enhancements are proposed:
1. **IoT Smart Lock Integration:** Connect the QR check-in module to IoT-enabled physical door locks, allowing students to unlock their room doors directly using their dashboard QR codes.
2. **Native Mobile Applications:** Develop native iOS and Android applications to enable instant push notifications, replacing standard emails for system alerts.
3. **UniKL SIS API Integration:** Establish a central API pipeline with UniKL’s central database to automatically pull student enrollment details, academic standings, and disciplinary records.
4. **AI-Driven Room Allocations:** Implement Machine Learning allocation algorithms to assign rooms based on student preferences, compatibility questionnaires, and academic levels.
