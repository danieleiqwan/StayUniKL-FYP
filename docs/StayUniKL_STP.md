# SOFTWARE TEST PLAN DOCUMENT

**System Name:** StayUniKL — Digital Hostel Management System for UniKL MIIT

| | |
|---|---|
| **ORGANISATION:** | UniKL MIIT |
| **AREA BASED ON:** | Jalan Sultan Ismail, Kuala Lumpur |
| **DOCUMENT TITLE:** | **ACCEPTANCE TEST PLAN** FOR StayUniKL — Digital Hostel Management System |

---

## VERSION HISTORY

| Version Number | Date | Amended By | Role in Project | Amendment Reason |
|---|---|---|---|---|
| 1.0 | 21/05/2026 | Danial Iwan | Tester / Developer | First Draft – Software Test Plan (FYP 2) |
| 2.0 | 28/05/2026 | Danial Iwan | Tester / Developer | Revised test cases and risk analysis update |

---

## DOCUMENT APPROVALS

| Name of Approver | Role in Project | Signature / Electronic Approval | Date |
|---|---|---|---|
| | FYP Supervisor | Approved | |

---

## I. Software Test Plan Document Purpose

The purpose of this document is to ensure that the software developed will meet client satisfaction and expectations as per requirements defined clearly. To validate that the system has robustness, efficiency, and adaptability, this document intends to show that all the requirements of the clients are duly met. Besides, it ensures that the plan is practical enough to meet the standards and regulations to comply with. At the final level, the Software Testing Plan (STP) would also act as a framework and planning guide in executing and applying the tests.

## II. Software Test Plan Contents

A test plan provides a testing execution strategy during the testing session. It gives an overall view of almost all aspects, including objectives, scope, risks, strategy, approach/technique, participating teams, test objects, resources, entry and exit criteria, test prioritisation, and tool support. Moreover, it also describes the modules as well as their functionalities.

## III. Software Test Plan Document Topics

This document brings together several vital elements, including the testing strategy, scope, risks and contingencies, entry and exit criteria, and item pass or fail criteria. It will also offer a description of the Test Specification, which simplifies and portrays the existing test cases being developed. The Test Environment will show all necessary facilities, hardware, software, and other requirements to ensure seamless execution during the tests. Finally, this includes the Test Schedule, Staff Responsibilities, and Training needs focusing on the roles of those personnel in the overall schedule.

All items in this document are designed to align with and address the planning and design details outlined in the Software Requirement Specification (SRS), ensuring the project meets its defined objectives.

---

## TABLE OF CONTENTS

1. TEST POLICY
   - 1.1 Software Testing Term Definition
   - 1.2 Advantages of Testing
   - 1.3 Testing Principles
   - 1.4 Test Missions & Objectives
   - 1.5 Communication Among Stakeholders
   - 1.6 SDLC Identification

2. INTRODUCTION TO TEST PLAN
   - 2.1 System Description
   - 2.2 Assumptions
   - 2.3 References
   - 2.4 Document Overview

3. TEST STRATEGY
   - 3.1 Test Objective
   - 3.2 Scope
   - 3.3 Features Tested
   - 3.4 Test Process
   - 3.5 Item Pass/Fail Criteria
   - 3.6 Suspension Criteria and Resumption Requirements
   - 3.7 Entry and Exit Criteria
   - 3.8 Risks and Contingencies
   - 3.9 Test Level

4. TEST CASES
   - 4.1 Use Case: Authentication & Role-Based Access Control
   - 4.2 Use Case: Hostel Application Management
   - 4.3 Use Case: QR Check-In / Check-Out
   - 4.4 Use Case: Facility Booking Management
   - 4.5 Use Case: Complaint Management
   - 4.6 Use Case: Finance & Invoice Management
   - 4.7 Use Case: Room & Asset Management
   - 4.8 Use Case: Admin Dashboard & Audit Log

5. TEST ENVIRONMENT
   - 5.1 Test Site
   - 5.2 Facilities Required
   - 5.3 Hardware and Software Specifications
   - 5.4 Testing Group – Testers Involved
   - 5.5 Training Required

6. TEST SCHEDULE

7. DEFINITIONS, ACRONYMS AND ABBREVIATIONS

---

# 1. TEST POLICY

This section explains the major philosophy of UniKL MIIT regarding software testing, including its terms, meaning, and practices. The test policy aspects are aligned with ISTQB (worldwide standard) and applied specifically to the StayUniKL hostel management project.

## 1.1 Software Testing Term Definition

Testing is a development activity that involves the process of finding and identifying defects by performing tests and checking whether the actual results match the expected results. It is also known as the process of verification and validation, which is based on the ISO-9000 standard as shown below:

- **Validation** — Confirmation by examination and through the provision of objective evidence that specified requirements have been fulfilled. In summary, validation confirms that the product was built with the correct requirements that satisfy the customer's expectations.

- **Verification** — Confirmation by examination and through the provision of objective evidence that the requirements for a specific intended use or application have been fulfilled. In summary, verification confirms that the software has been created and fulfilled as designed.

Testing also defines what will happen once a defect occurs (failure). Testing is performed by the testing team, after which the report/result is forwarded to the developer team so that they can commence debugging.

## 1.2 Advantages of Testing

Several significant advantages of testing can produce a magnificent software application with supreme quality:

- Testing **increases quality** in terms of software attributes, as defects can be detected and corrected earlier prior to delivery. Testing also **increases process quality** since defects are documented, which means solutions can be analysed and reused to prevent the same error from occurring again.
- Testing **boosts confidence** of all stakeholders, which positively affects the perception of team management regarding software quality and robustness, due to very few or no failures being found.
- Testing is like **liability insurance** — it costs resources, but it ensures all stakeholders can be at ease as it covers and mitigates all possible risks.
- Testing that is successfully conducted leads to **major reductions in cost**, as defects left undetected can cause significantly greater costs to rectify post-deployment.

## 1.3 Testing Principles

There are seven testing principles applied in this project, based on the ISTQB standard:

**Principle 1: Testing shows presence of defects.**
Testing can determine and reveal defects that are present but is unable to verify or confirm that there are no defects at all. As stated by Edger W. Dijkstra (1970): *"Program testing can be used to show presence of bugs, but never to show their absence!"*

**Principle 2: Exhaustive testing is impossible.**
Full/exhaustive testing is truly not feasible except for trivial situations. Risk-based testing will be used to produce risk analysis and determine priorities of feature modules that need to be tested.

**Principle 3: Early testing.**
Testing should start as early as possible in the software development life cycle. Early testing (such as static testing and review) takes place in parallel with development activities, so defects are detected earlier and cost less to fix.

**Principle 4: Defect clustering.**
Testing effort shall be focused proportionally on the expected and observed defect density of modules. A small number of modules often contain most of the defects discovered during pre-release testing or are responsible for most operational failures.

**Principle 5: Pesticide Paradox.**
Repeating the same tests produces no new insight; therefore, test cases need to be regularly reviewed, revised, and modified. New test cases should be introduced to detect new defects.

**Principle 6: Testing is context dependent.**
Testing depends on the context of software usage. For example, security-critical systems such as hostel authentication and financial management modules are tested more intensively than general UI features.

**Principle 7: Absence of errors fallacy.**
A system without failures does not imply that the system will meet user expectations. The system may have no technical defects yet still fail to deliver the functionalities users need.

## 1.4 Test Missions & Objectives

Delivering the StayUniKL software product at its finest quality is the primary goal, where functional and quality attributes are satisfactory, defect presence is minimal, and testing activities are conducted systematically. The mission is to confirm that all modules function correctly, securely, and in alignment with requirements defined in the SRS.

## 1.5 Communication Among Stakeholders

It is important for all related stakeholders to participate in the testing process and provide insight and feedback regarding the software product. Open, professional, analytical, and straightforward communication is required for testing to proceed smoothly according to what has been planned. Stakeholders include the FYP supervisor, developer/tester, and representative end-users (students and admin staff of UniKL MIIT).

## 1.6 SDLC Identification

The **Rapid Application Development (RAD)** model, as the methodology in the Systems Development Life Cycle (SDLC), is adopted by StayUniKL in developing the Digital Hostel Management System.

RAD was chosen primarily because of the iterative nature of the project and the need for quick prototyping across multiple functional modules including Hostel Application Management, Complaint Management, Facility Booking, QR Check-In/Check-Out, and Finance Management. RAD allows requirements to change as new needs emerge so that a project may progress even when all major details are not fully known at the beginning.

RAD is designed to be faster in development and will yield early feedback from stakeholders. This approach fits perfectly within the StayUniKL project because the system contains modules with high user interaction — such as court booking and hostel application submission. This is achieved through early involvement of end-users in the testing of modules.

Furthermore, RAD's empirical approach to development and testing enables early integration of activities such as preparation, planning, and execution within the first development stages. Rapid prototyping and allowing user evaluation during each iteration increases opportunities for developer–stakeholder collaboration with relevant insights for system improvement.

| **Phase** | **Description** |
|---|---|
| Requirement Planning | This phase focuses on gathering high-level requirements for the StayUniKL project. Research is conducted to understand the system's objectives, scope, and resources required. Key features identified include hostel application management, room allocation, complaint handling, facility booking, and financial records. Testing also begins here through the creation of a high-level test plan aligned with the SRS. |
| User Design (Prototype, Test, Refine) | Prototypes of core modules such as **Student Hostel Application** and **Facility Booking** are developed and shared with representative users. Feedback is gathered via User Acceptance Testing (UAT). Issues identified during prototype testing are documented and used to refine the system iteratively until it meets user expectations. |
| Construction | Once the prototype is validated, all modules — including Authentication, QR Check-In, Complaint Management, Finance, Room Management, and Audit Logs — are fully coded and integrated. Functional Testing and UAT are performed extensively in this phase. Results are documented and the system is revised accordingly. |
| Cutover | The final phase involves deployment of the StayUniKL system into a production environment (Vercel). Final testing is performed to ensure live functionality is stable. Maintenance routines are set up to monitor system performance, address issues, and provide ongoing support. |

*Table 1: RAD Phases Description*

---

# 2. INTRODUCTION TO TEST PLAN

This document outlines an Acceptance Test Plan (ATP) to test the developed StayUniKL web application. The ATP will be used by the acceptance test team to plan, conduct, and document the acceptance testing process. In this context, black-box testing is used as it is a specification-based testing technique that refers to the SRS to conduct a functional test. Test cases are derived through use case testing, which is based on use case specifications from the SRS.

## 2.1 System Description

StayUniKL is a comprehensive digital hostel management platform designed to serve the needs of students, administrators, and superadministrators at UniKL MIIT. The system modernises traditional hostel administration by digitising key processes — from hostel application and room allocation to facility bookings, complaints, and financial transactions.

The platform is a web-based application built using **Next.js 15**, deployed on **Vercel**, and powered by a **TiDB Cloud (MySQL-compatible)** database. It implements a role-based access control system that distinguishes between three user roles: **Student**, **Admin**, and **Superadmin**.

**Modules for Students:**

- **Register Account:** Students can create an account by providing personal details including name, NRIC, email, gender, phone number, and password.
- **Login / Logout:** Students log in securely using email and password. JWT-based session management is implemented.
- **Hostel Application:** Students can submit an online hostel application specifying room type, stay duration, and payment method. Application status (Pending, Approved, Checked In, etc.) is tracked in real-time.
- **QR Check-In / Check-Out:** Students use the system-generated QR code to check in and out of the hostel. Check-in status is automatically updated.
- **Facility Booking:** Students can browse and book available facilities (sports court, gym, laundry) and view their booking history.
- **Complaint Submission:** Students can raise maintenance or service complaints with descriptions, photos, and severity levels. They can track resolution status.
- **Room Change Request:** Students may submit requests to change their current room, specifying reasons and preferred alternatives.
- **Finance & Invoices:** Students can view their payment history, hostel fee invoices, and make online payments.
- **Notifications:** In-system notifications inform students about application status updates, booking confirmations, complaints resolved, and more.
- **Profile & Settings:** Students can view and update personal profile information and manage account settings.

**Modules for Admin:**

- **Login / Logout:** Secure admin login with role verification.
- **Hostel Application Management:** Admins review and approve or reject student hostel applications. They can assign bed IDs and track application statuses.
- **Room & Bed Management:** Admins manage room availability, room types, and bed assignments across all floors.
- **QR Check-In Management:** Admins can view real-time check-in/check-out logs.
- **Facility Booking Management:** Admins manage court and gym booking schedules, approve or reject bookings, and configure facility availability.
- **Complaint Management:** Admins review submitted complaints, assign technician appointments, and update resolution statuses.
- **Asset Management:** Admins manage hostel asset inventory, including furniture, appliances, and fixtures.
- **Finance & Payment Management:** Admins manage student invoices, track payments, and view financial summaries.
- **Announcement Management:** Admins publish and manage announcements visible to students.
- **Duty Scheduling:** Admins assign SRC and Fellow member duty shifts per floor and date.
- **Audit Log:** Admins and superadmins can access a full history of system actions performed across all modules.
- **Notifications Management:** Admins can send targeted notifications to specific students or all users.

**Modules for Superadmin:**

- **Manage Staff Accounts:** Superadmins can create, update, activate/deactivate admin accounts.
- **Audit Log Access:** Full visibility into all system actions across all roles and modules.

## 2.2 Assumptions

To conduct and execute the test, it is assumed that:

| **Ref** | **Assumption** |
|---|---|
| 1. | Functional requirements have been reviewed and acknowledged. |
| 2. | There is a Software Requirements Specification (SRS) as reference containing all functional requirements. |
| 3. | Static test has been conducted via observation, reading, and review of the tested document (SRS). |
| 4. | The test resources and test environment described in Section 5 are available. |
| 5. | System, database (TiDB Cloud), and server (Vercel) are able to run at stable performance. |
| 6. | Identified defects and bugs are expected to be fixed/resolved before the commencement of formal testing. |
| 7. | All changes to requirements will be notified and communicated to the test team. |
| 8. | Test users have valid credentials created for both student and admin roles. |
| 9. | Internet connectivity is available throughout the test session. |

*Table 2: Assumptions*

## 2.3 References

| **Reference** | **Description** |
|---|---|
| **SRS (Software Requirements Specification)** | Contains all functional requirements for StayUniKL. Referenced for deriving all test cases. |
| **IEEE Standard 829-1983** | IEEE Standard for Software Test Plans. |
| **StayUniKL FYP Proposal** | Defines the overall project scope during early planning. |
| **ISTQB Syllabus (Chapters 1–7)** | Numerous principles and testing techniques referenced from the ISTQB Foundation Level course. |
| **ISO/IEC 25010:2011** | Referenced to define quality requirements and quality attributes including functionality, reliability, and security. |

*Table 3: References*

## 2.4 Document Overview

The STP document consists of six sections as described below:

- **Section 1** contains **Test Policy** components, explaining the major philosophy of the organization regarding testing, its terms, SOPs, meaning, and practices.
- **Section 2** explains **Introduction to Test Plan**, giving an overview of the current acceptance test plan purpose, system description, references, and document structure.
- **Section 3** contains **Test Strategy**, describing the testing approach, objectives, scope, test process, test level, risk and contingency, entry and exit criteria, item pass/fail criteria, and suspension/resumption requirements.
- **Section 4** contains **Test Case Specification**, describing use case diagrams and detailed test case tables for each module.
- **Section 5** contains **Test Environment**, describing all required facilities, hardware, software, and other requirements for smooth test execution.
- **Section 6** contains **Test Schedule**, discussing an overall schedule plan including testing activities.

---

# 3. TEST STRATEGY

A test strategy is an outline that describes the testing approach of the software development cycle and defines how testing activities will be conducted. It is the main core part of this test plan.

## 3.1 Test Objective

The main objective of this test plan for **StayUniKL** is to ensure the application runs smoothly, is reliable, and delivers the intended features without issues. The testing process focuses on finding and fixing any bugs or defects to ensure the system works properly for all users — students, administrators, and superadmins. The testing also ensures that the system meets the goals outlined in the Software Requirements Specification (SRS) and satisfies stakeholder expectations.

1. **Verify Requirements Compliance** — Confirm the system matches all requirements listed in the SRS.
2. **Test All Features** — Ensure every module works, including Authentication, Hostel Application, QR Check-In/Check-Out, Facility Booking, Complaint Management, Finance & Invoices, Room & Asset Management, and Audit Log.
3. **Validate Role-Based Access Control** — Confirm that students, admins, and superadmins can only access functionalities appropriate to their roles.
4. **User-Friendly Design** — Ensure the system is easy to use and provides a smooth experience for all user roles.
5. **Obtain Stakeholder Approval** — Gather feedback and approval from the supervisor and representative users to confirm the system meets their needs.
6. **Follow Testing Guidelines** — Use standardised testing methods to ensure the process is organised and effective.
7. **Test Performance** — Check that the system handles multiple concurrent operations and responds within acceptable time limits.
8. **Security Verification** — Perform security checks to ensure sensitive data such as user credentials and financial records are protected.
9. **Regression Testing** — Test the system after updates to ensure new changes do not break existing features.
10. **Prepare for Live Deployment** — Ensure the system passes all tests and is ready for public/institutional deployment.

## 3.2 Scope

The scope of this Acceptance Test Plan is to ensure that all functional requirements defined in the SRS are met and tested accurately. The item to be tested is the **StayUniKL Web Application Prototype**, hosted and deployed on Vercel, connected to TiDB Cloud.

## 3.3 Features Tested

The features to be tested are determined through risk-based analysis. Features with higher likelihood of failure, higher business impact, or greater complexity are assigned higher testing priority. The following modules are in scope:

| **Module** | **Testing Priority** |
|---|---|
| Authentication & Role-Based Access Control | High |
| Hostel Application Management | High |
| QR Check-In / Check-Out | High |
| Facility Booking Management | High |
| Complaint Management | Medium |
| Finance & Invoice Management | High |
| Room & Asset Management | Medium |
| Admin Dashboard & Audit Log | Medium |
| Duty Scheduling | Low |
| Notification System | Low |

## 3.4 Test Process

The test process for StayUniKL follows five main phases:

### 1. Planning and Control
**Planning:**
- Define test objectives, test scope, and testing strategy aligned with project requirements.
- Review the Software Requirements Specification (SRS) to identify testable requirements and potential test cases.
- Develop a comprehensive test plan document detailing: test objectives, test scope, test strategy and schedule, risks and mitigation plans, and resources required (personnel, tools, hardware, software).
- Construct test cases based on use cases identified in the SRS.

**Control:**
- Monitor progress to ensure planned testing activities align with the schedule.
- Adjust test plans dynamically based on project updates or identified risks.
- Ensure quality and efficiency by reviewing and refining test cases and procedures.

### 2. Analysis and Design
**Analysis:**
- Evaluate the system and its requirements for testability.
- Review identified test cases to ensure comprehensive coverage of functional and non-functional requirements.

**Design:**
- Prepare the testing environment, ensuring tools, software, and hardware are available and functional.
- Arrange entry criteria and ensure all dependencies (e.g., database seeding, mock data) are prepared.
- Finalise test cases, scripts, and test data, ensuring clarity and traceability to requirements.

### 3. Implementation and Execution
**Implementation:**
- Develop detailed test procedures based on finalised test cases.
- Verify readiness of the test environment (browser, network, database connection).

**Execution:**
- Run tests according to the defined plan.
- Compare actual results with expected outcomes to determine pass or fail status.
- Record actions taken, inputs, outputs, and any incidents encountered.

### 4. Evaluation and Report
**Evaluation:**
- Analyse all identified incidents and defects, prioritising them by severity and impact.
- Reassess test results against expectations to identify gaps or issues.

**Report:**
- Share incident and defect reports with relevant stakeholders.
- Ensure issues are addressed and retested to verify fixes.
- Document all results, lessons learned, and challenges faced.

### 5. Test Closure
- Evaluate exit criteria to determine if testing objectives have been met.
- Confirm all deliverables have been produced.
- Close all incident reports and archive documentation for future reference.
- Evaluate overall testing outcomes and record lessons learned.

## 3.5 Item Pass/Fail Criteria

The test oracle to determine pass or fail at each test level is the functional requirements and use case specifications defined in the StayUniKL SRS.

- **PASS:** The test execution produces the actual result that matches the expected result as stated in the use case or functional requirement.
- **FAIL:** The test execution produces an actual result that does not match the expected result. A defect/incident report will be documented and forwarded to the developer for resolution.

## 3.6 Suspension Criteria and Resumption Requirements

### 3.6.1 Suspension Criteria

Testing will be suspended under the following conditions:
- The StayUniKL web application becomes unavailable (e.g., server downtime, Vercel deployment failure).
- The TiDB Cloud database connection is lost and cannot be re-established within 15 minutes.
- A critical system-wide defect is discovered that renders multiple modules non-functional.
- Physical disturbances or disasters occur in the test environment (e.g., power failure, network outage).

### 3.6.2 Resumption Requirements

Testing may be resumed when:
- The application becomes available again and stability is confirmed.
- The database connection is restored and verified.
- The critical defect discovered has been resolved and the fix has been confirmed by the developer.
- The test environment is stable and all prerequisites are met.

## 3.7 Entry and Exit Criteria

### 3.7.1 Entry Criteria

Testing may commence when the following conditions are met:
- The StayUniKL application has been successfully deployed on the test/staging environment.
- All identified defects from the prior development cycle have been resolved or acknowledged.
- Test data (user accounts, room data, booking data) have been prepared and loaded.
- The Software Test Plan (STP) document has been reviewed and approved.
- All hardware, software, and network requirements listed in Section 5 are available.
- Use case specification and SRS documents have been reviewed by the test team.

### 3.7.2 Exit Criteria

Testing shall be concluded and considered complete when:
- All planned test cases have been executed.
- All critical and high-severity defects have been resolved and re-tested.
- Test results have been documented and a final test report has been produced.
- Stakeholders have reviewed and acknowledged the test results.
- All pass criteria have been met for high-priority modules.

## 3.8 Risks and Contingencies

| **Ref** | **Risk** | **Likelihood** | **Impact** | **Priority** | **Contingency** |
|---|---|---|---|---|---|
| R1 | Database connection failure (TiDB Cloud) | Medium | High | High | Use local MySQL fallback; monitor connection pool |
| R2 | JWT token expiry causing unexpected logouts | High | Medium | High | Implement refresh token mechanism and handle session expiry gracefully |
| R3 | QR code scanning failure on mobile browsers | Medium | High | High | Provide manual check-in fallback for admin |
| R4 | File upload failure for complaint images | Medium | Medium | Medium | Validate file types and sizes; provide error messages |
| R5 | Payment processing timeout | Low | High | Medium | Implement timeout handling with retry prompts |
| R6 | Role access breach (student accessing admin routes) | Low | Critical | High | Enforce middleware-level role checks on all protected routes |
| R7 | Data loss during hostel application submission | Low | Critical | High | Implement form auto-save and database transaction rollback |
| R8 | Test environment differs from production environment | Medium | Medium | Medium | Mirror production environment variables in test setup |
| R9 | Insufficient test data | Medium | Medium | Medium | Prepare comprehensive seed data scripts before testing begins |
| R10 | Time constraints affecting test coverage | High | Medium | Medium | Prioritise high-risk modules first using risk-based testing approach |

*Table 4: Project Risks and Contingencies*

## 3.9 Test Level

### 3.9.1 Black Box Testing

Black box testing (specification-based) is the primary technique used in this Acceptance Test Plan. Test cases are derived from use case specifications without knowledge of the internal implementation. All test cases are based on the functional requirements outlined in the SRS.

The technique employed is **Use Case Testing**, where each use case in the SRS forms the basis of one or more test cases, covering:
- **Functionality Tests** — Valid inputs that should trigger the expected system behaviour.
- **Robustness Tests** — Invalid or boundary inputs that should trigger appropriate error handling.
- **Catastrophic Tests** — Simulated system failures (e.g., network drop, database unavailability) to verify graceful degradation.

### 3.9.2 Risk-Based Testing

Risk-based testing is applied to determine the order in which modules are tested, ensuring the highest-risk areas receive the most testing attention. The risk classification is as follows:

| **Risk Level** | **Likelihood Score** | **Impact Score** | **Total Risk Score** |
|---|---|---|---|
| Critical | 5 | 5 | 25 |
| High | 4 | 4 | 16 |
| Medium | 3 | 3 | 9 |
| Low | 1-2 | 1-2 | 1-4 |

*Table 5: Risk Classification for Prioritisation*

| **Feature / Module** | **Likelihood (1-5)** | **Impact (1-5)** | **Total Risk** | **Priority** |
|---|---|---|---|---|
| Authentication & RBAC | 4 | 5 | 20 | 1 |
| Hostel Application Management | 4 | 5 | 20 | 1 |
| QR Check-In / Check-Out | 3 | 5 | 15 | 2 |
| Finance & Invoice Management | 3 | 5 | 15 | 2 |
| Facility Booking Management | 3 | 4 | 12 | 3 |
| Complaint Management | 3 | 4 | 12 | 3 |
| Room & Asset Management | 2 | 4 | 8 | 4 |
| Audit Log | 2 | 3 | 6 | 5 |
| Duty Scheduling | 1 | 3 | 3 | 6 |
| Notifications | 2 | 2 | 4 | 6 |

*Table 6: Risk Analysis for Risk-Based Testing*

---

# 4. TEST CASES

## 4.1 Use Case: Authentication & Role-Based Access Control

### Use Case Statement – UC-AUTH-01: Student Login

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-AUTH-01 |
| **Use Case Name** | Student Login |
| **Actor** | Student |
| **Pre-condition** | Student has a registered account. The login page is accessible. |
| **Post-condition** | Student is authenticated and redirected to the student dashboard. |
| **Main Flow** | 1. Student navigates to the login page. 2. Student enters email and password. 3. System validates credentials against the database. 4. System generates a JWT session token. 5. Student is redirected to `/dashboard`. |
| **Alternative Flow** | If credentials are incorrect, system displays "Invalid email or password." |

*Table 7: Use Case Statement – Student Login*

### Use Case Statement – UC-AUTH-02: Admin Login

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-AUTH-02 |
| **Use Case Name** | Admin Login |
| **Actor** | Admin / Superadmin |
| **Pre-condition** | Admin account exists with role set to `admin` or `superadmin`. |
| **Post-condition** | Admin is authenticated and redirected to the admin dashboard at `/admin`. |
| **Main Flow** | 1. Admin navigates to the login page. 2. Admin enters credentials. 3. System validates and checks role. 4. System creates session. 5. Admin is redirected to `/admin`. |
| **Alternative Flow** | If role is `student`, access to `/admin` is denied with a 403 response. |

*Table 8: Use Case Statement – Admin Login*

### Use Case Statement – UC-AUTH-03: Logout

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-AUTH-03 |
| **Use Case Name** | Logout |
| **Actor** | Student / Admin |
| **Pre-condition** | User is currently logged in with an active session. |
| **Post-condition** | Session token is cleared. User is redirected to the login page. |
| **Main Flow** | 1. User clicks logout. 2. System clears JWT cookie/session. 3. User is redirected to `/login`. |

*Table 9: Use Case Statement – Logout*

---

### Test Case Specification – UC-AUTH-01: Login Functionality

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-AUTH-01-01 | Successful student login | Valid email + password | Redirected to `/dashboard`, session cookie set | Functionality |
| TC-AUTH-01-02 | Invalid password | Valid email, wrong password | Error: "Invalid email or password" | Robustness |
| TC-AUTH-01-03 | Non-existent email | Unknown email, any password | Error: "Invalid email or password" | Robustness |
| TC-AUTH-01-04 | Empty email field | Blank email, valid password | Validation error: "Email is required" | Robustness |
| TC-AUTH-01-05 | Empty password field | Valid email, blank password | Validation error: "Password is required" | Robustness |
| TC-AUTH-01-06 | Admin accessing student routes | Admin JWT, GET `/dashboard` | Redirected appropriately or allowed per RBAC | Functionality |
| TC-AUTH-01-07 | Student accessing admin routes | Student JWT, GET `/admin` | Redirect to `/login` or 403 Forbidden | Robustness |
| TC-AUTH-01-08 | Database unavailable during login | Valid credentials, DB offline | Error: "Service temporarily unavailable" | Catastrophic |
| TC-AUTH-01-09 | Successful admin login | Admin email + password | Redirected to `/admin`, admin session established | Functionality |
| TC-AUTH-01-10 | Successful logout | Click logout button | Session cleared, redirected to `/login` | Functionality |

*Table 10: Test Case Specification – Authentication*

---

## 4.2 Use Case: Hostel Application Management

### Use Case Statement – UC-APP-01: Submit Hostel Application

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-APP-01 |
| **Use Case Name** | Submit Hostel Application |
| **Actor** | Student |
| **Pre-condition** | Student is logged in. Student does not already have an active application. |
| **Post-condition** | Application is saved with status `Pending`. Admin is notified. |
| **Main Flow** | 1. Student navigates to Apply page. 2. Student selects room type, stay duration. 3. Student submits form. 4. System validates and saves application. 5. Confirmation is displayed. |
| **Alternative Flow** | If student has an existing active application, system displays "You already have an active application." |

*Table 11: Use Case Statement – Submit Hostel Application*

### Use Case Statement – UC-APP-02: Admin Approve/Reject Application

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-APP-02 |
| **Use Case Name** | Approve or Reject Hostel Application |
| **Actor** | Admin |
| **Pre-condition** | Admin is logged in. A student application with status `Pending` exists. |
| **Post-condition** | Application status is updated to `Approved` or `Rejected`. Student receives notification. |
| **Main Flow** | 1. Admin views list of pending applications. 2. Admin selects application. 3. Admin chooses Approve or Reject. 4. System updates status. 5. Notification is sent to student. |

*Table 12: Use Case Statement – Admin Approve/Reject Application*

### Use Case Statement – UC-APP-03: Admin Assign Bed

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-APP-03 |
| **Use Case Name** | Assign Bed to Approved Application |
| **Actor** | Admin |
| **Pre-condition** | Application status is `Approved`. Available beds exist. |
| **Post-condition** | Bed is assigned to student. Status updated to `Payment Pending`. |
| **Main Flow** | 1. Admin selects approved application. 2. Admin selects available bed from list. 3. System assigns bed and updates status. |
| **Alternative Flow** | If no beds available, system displays "No beds available for the selected room type." |

*Table 13: Use Case Statement – Assign Bed*

---

### Test Case Specification – Hostel Application Management

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-APP-01-01 | Submit valid hostel application | Room type: Shared (4), duration: 1 semester | Application saved with status `Pending` | Functionality |
| TC-APP-01-02 | Submit application with missing fields | Empty room type | Validation error displayed | Robustness |
| TC-APP-01-03 | Submit duplicate application | Student with existing active application | Error: "You already have an active application" | Robustness |
| TC-APP-01-04 | Database failure during submission | Valid form, DB offline | Error message; no record created | Catastrophic |
| TC-APP-02-01 | Admin approves pending application | Admin clicks Approve on Pending app | Status updated to `Approved`; student notified | Functionality |
| TC-APP-02-02 | Admin rejects application with reason | Admin clicks Reject, enters reason | Status updated to `Rejected`; reason recorded | Functionality |
| TC-APP-02-03 | Admin attempts to approve already-approved app | Approve action on `Approved` app | Error: action not permitted on current status | Robustness |
| TC-APP-03-01 | Assign bed to approved application | Admin selects bed ID | Bed marked `Occupied`; status → `Payment Pending` | Functionality |
| TC-APP-03-02 | Assign already-occupied bed | Admin selects occupied bed | Error: "This bed is already occupied" | Robustness |
| TC-APP-03-03 | Assign bed when no beds available | No available beds in room type | Error: "No beds available" | Robustness |
| TC-APP-04-01 | Student views own application status | Student logs in and navigates to apply page | Current application with status displayed correctly | Functionality |
| TC-APP-04-02 | Admin filters applications by status | Filter: Pending | Only pending applications shown | Functionality |

*Table 14: Test Case Specification – Hostel Application Management*

---

## 4.3 Use Case: Check-In / Check-Out Management

### Use Case Statement – UC-QR-01: Student QR Check-In

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-QR-01 |
| **Use Case Name** | QR Code Check-In |
| **Actor** | Student |
| **Pre-condition** | Student has an approved and paid application. A QR code has been generated for their application. |
| **Post-condition** | Application status updated to `Checked In`. Check-in timestamp recorded. |
| **Main Flow** | 1. Student presents QR code. 2. System scans and validates QR code. 3. System updates application status to `Checked In`. 4. Confirmation displayed. |
| **Alternative Flow** | If QR code is invalid or expired, system displays "Invalid QR code." |

*Table 15: Use Case Statement – QR Check-In*

### Use Case Statement – UC-QR-02: Student QR Check-Out

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-QR-02 |
| **Use Case Name** | Student QR Check-Out |
| **Actor** | Student |
| **Pre-condition** | Student is currently in `Checked In` status. |
| **Post-condition** | Application status updated to `Checked Out`. Check-out timestamp recorded, and bed status reset to `Available`. |
| **Main Flow** | 1. Student generates check-out QR code. 2. Student presents QR code at check-out terminal. 3. System scans and validates token. 4. Status updated to `Checked Out` and bed is freed. |

*Table 16: Use Case Statement – Student QR Check-Out*

---

### Test Case Specification – Check-In / Check-Out Management

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-QR-01-01 | Valid QR check-in | Valid QR code for approved+paid application | Status → `Checked In`; timestamp recorded | Functionality |
| TC-QR-01-02 | Invalid QR code scan | Corrupted or unknown QR code | Error: "Invalid QR code" | Robustness |
| TC-QR-01-03 | Check-in with status not Payment Pending | QR for Pending application | Error: "Check-in not permitted at current status" | Robustness |
| TC-QR-01-04 | Database failure during check-in | Valid QR, DB offline | Error message; status not changed | Catastrophic |
| TC-QR-02-01 | Valid QR check-out | Student presents valid checkout QR | Status → `Checked Out`; timestamp recorded, bed freed | Functionality |
| TC-QR-02-02 | Expired checkout QR scan | Expired check-out QR token | Error: "Check-out token has expired" | Robustness |
| TC-QR-02-03 | Checkout QR scan with wrong status | Check-out QR scan when status is not `Checked in` | Error: "Must be 'Checked in' to process checkout." | Robustness |
| TC-QR-03-01 | Admin views check-in logs | Admin navigates to check-in log page | All check-in/out records listed with timestamps | Functionality |

*Table 17: Test Case Specification – Check-In / Check-Out Management*

---

## 4.4 Use Case: Facility Booking Management

### Use Case Statement – UC-BOOK-01: Student Books Facility

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-BOOK-01 |
| **Use Case Name** | Book Facility Slot |
| **Actor** | Student |
| **Pre-condition** | Student is logged in. The facility (court/gym) is open. The selected time slot is available. |
| **Post-condition** | Booking is created with status `Pending`. Admin is notified. |
| **Main Flow** | 1. Student selects facility and date. 2. Student selects available time slot. 3. Student submits booking. 4. System saves booking as `Pending`. |
| **Alternative Flow** | If slot is already booked, system displays "This slot is no longer available." |

*Table 18: Use Case Statement – Book Facility Slot*

### Use Case Statement – UC-BOOK-02: Admin Approves/Rejects Booking

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-BOOK-02 |
| **Use Case Name** | Approve or Reject Facility Booking |
| **Actor** | Admin |
| **Pre-condition** | A booking with status `Pending` exists. |
| **Post-condition** | Booking status updated to `Approved` or `Rejected`. Student notified. |
| **Main Flow** | 1. Admin views pending bookings. 2. Admin approves or rejects. 3. System updates status. 4. Notification sent. |

*Table 19: Use Case Statement – Admin Approve/Reject Booking*

### Use Case Statement – UC-BOOK-03: Student Cancels Booking

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-BOOK-03 |
| **Use Case Name** | Cancel Facility Booking |
| **Actor** | Student |
| **Pre-condition** | Student has a booking with status `Pending` or `Approved`. |
| **Post-condition** | Booking status updated to `Cancelled`. Time slot is released. |
| **Main Flow** | 1. Student views booking history. 2. Student selects booking to cancel. 3. System cancels booking and releases slot. |

*Table 20: Use Case Statement – Cancel Booking*

---

### Test Case Specification – Facility Booking Management

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-BOOK-01-01 | Book available time slot | Valid date, available slot, sport type | Booking created with status `Pending` | Functionality |
| TC-BOOK-01-02 | Book already-taken slot | Date + slot already booked | Error: "This slot is no longer available" | Robustness |
| TC-BOOK-01-03 | Book when facility is closed | Date when facility is set to closed | Error: "Facility is not available on this date" | Robustness |
| TC-BOOK-01-04 | Database failure during booking | Valid input, DB offline | Error; booking not created | Catastrophic |
| TC-BOOK-02-01 | Admin approves booking | Admin approves pending booking | Status → `Approved`; student notified | Functionality |
| TC-BOOK-02-02 | Admin rejects booking | Admin rejects pending booking | Status → `Rejected`; student notified | Functionality |
| TC-BOOK-03-01 | Student cancels pending booking | Student cancels own pending booking | Status → `Cancelled`; slot released | Functionality |
| TC-BOOK-03-02 | Student cancels approved booking | Student cancels approved booking | Status → `Cancelled`; slot released | Functionality |
| TC-BOOK-04-01 | Student views booking history | Navigate to booking history page | All past bookings listed with status | Functionality |
| TC-BOOK-04-02 | Admin marks attendance – Show | Admin marks student as Show for booking | Attendance status → `Show` | Functionality |
| TC-BOOK-04-03 | Admin marks attendance – No-Show | Admin marks student as No-Show | Attendance status → `No-Show`; no-show count incremented | Functionality |

*Table 21: Test Case Specification – Facility Booking Management*

---

## 4.5 Use Case: Complaint Management

### Use Case Statement – UC-COMP-01: Student Submits Complaint

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-COMP-01 |
| **Use Case Name** | Submit Maintenance Complaint |
| **Actor** | Student |
| **Pre-condition** | Student is logged in. |
| **Post-condition** | Complaint saved with status `Pending`. Admin is notified. |
| **Main Flow** | 1. Student navigates to Complaint page. 2. Student enters title, description, and optionally attaches images. 3. Student submits. 4. System saves complaint as `Pending`. |
| **Alternative Flow** | If title or description is empty, system displays validation error. |

*Table 22: Use Case Statement – Submit Complaint*

### Use Case Statement – UC-COMP-02: Admin Resolves Complaint

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-COMP-02 |
| **Use Case Name** | Update Complaint Status |
| **Actor** | Admin |
| **Pre-condition** | A complaint with status `Pending` or `In Progress` exists. |
| **Post-condition** | Complaint status is updated. Technician appointment may be set. |
| **Main Flow** | 1. Admin views all complaints. 2. Admin updates status to `In Progress` or `Resolved`. 3. Admin may set a technician appointment date. 4. System saves changes. |

*Table 23: Use Case Statement – Resolve Complaint*

---

### Test Case Specification – Complaint Management

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-COMP-01-01 | Submit valid complaint | Title + description provided | Complaint saved as `Pending` | Functionality |
| TC-COMP-01-02 | Submit with missing title | Empty title field | Validation error: "Title is required" | Robustness |
| TC-COMP-01-03 | Submit with image attachment | Valid image file (JPG/PNG) | Complaint saved with image URL stored | Functionality |
| TC-COMP-01-04 | Submit with oversized image | File > 5MB | Error: "File size exceeds limit" | Robustness |
| TC-COMP-02-01 | Admin updates status to In Progress | Admin selects `In Progress` | Status updated; student notified | Functionality |
| TC-COMP-02-02 | Admin marks complaint as Resolved | Admin selects `Resolved` | Status updated to `Resolved`; resolution timestamp recorded | Functionality |
| TC-COMP-02-03 | Admin sets technician appointment | Admin selects date | Appointment date saved and displayed to student | Functionality |
| TC-COMP-03-01 | Student views complaint history | Navigate to complaints page | All submitted complaints with status shown | Functionality |
| TC-COMP-03-02 | Database failure during complaint submission | Valid form, DB offline | Error message; complaint not saved | Catastrophic |

*Table 24: Test Case Specification – Complaint Management*

---

## 4.6 Use Case: Finance & Invoice Management

### Use Case Statement – UC-FIN-01: Student Makes Payment

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-FIN-01 |
| **Use Case Name** | Make Hostel Fee Payment |
| **Actor** | Student |
| **Pre-condition** | Student has an approved application with status `Payment Pending`. |
| **Post-condition** | Payment recorded as `Success`. Application status updated to `Approved → Checked In` pathway enabled. |
| **Main Flow** | 1. Student navigates to Financials page. 2. Student selects outstanding invoice. 3. Student chooses payment method and confirms. 4. System records payment as `Success`. 5. Invoice is generated and downloadable. |
| **Alternative Flow** | If payment fails, status is set to `Failed` and student is prompted to retry. |

*Table 25: Use Case Statement – Student Payment*

### Use Case Statement – UC-FIN-02: Admin Views Payment Records

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-FIN-02 |
| **Use Case Name** | View Payment Records |
| **Actor** | Admin |
| **Pre-condition** | Admin is logged in. |
| **Post-condition** | Payment records are displayed filtered by date, status, or student. |
| **Main Flow** | 1. Admin navigates to Finance module. 2. Admin views all payments. 3. Admin may filter by status (Pending, Success, Failed). |

*Table 26: Use Case Statement – View Payment Records*

---

### Test Case Specification – Finance & Invoice Management

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-FIN-01-01 | Successful payment | Valid payment method, correct amount | Payment status → `Success`; invoice generated | Functionality |
| TC-FIN-01-02 | Payment with invalid method | Null payment method | Validation error: "Please select a payment method" | Robustness |
| TC-FIN-01-03 | Payment failure simulation | Payment gateway timeout | Status → `Failed`; user prompted to retry | Catastrophic |
| TC-FIN-01-04 | Student views invoice history | Navigate to financials page | All invoices with amount, date, and status listed | Functionality |
| TC-FIN-02-01 | Admin views all payments | Admin navigates to finance page | Full list of payment records displayed | Functionality |
| TC-FIN-02-02 | Admin filters by Success status | Filter: Success | Only successful payments shown | Functionality |
| TC-FIN-02-03 | Admin filters by Failed status | Filter: Failed | Only failed payments shown | Functionality |
| TC-FIN-03-01 | Invoice download | Student clicks Download Invoice | PDF/invoice file downloaded | Functionality |
| TC-FIN-03-02 | DB failure during payment recording | Valid payment, DB offline | Error message; payment not recorded | Catastrophic |

*Table 27: Test Case Specification – Finance & Invoice Management*

---

## 4.7 Use Case: Room & Asset Management

### Use Case Statement – UC-ROOM-01: Admin Views Room Status

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-ROOM-01 |
| **Use Case Name** | View Room and Bed Availability |
| **Actor** | Admin |
| **Pre-condition** | Admin is logged in. |
| **Post-condition** | Room and bed availability status is displayed. |
| **Main Flow** | 1. Admin navigates to Room Management. 2. System displays all rooms grouped by floor. 3. Each room shows capacity and bed statuses (Available/Occupied/Maintenance). |

*Table 28: Use Case Statement – View Room Status*

### Use Case Statement – UC-ASSET-01: Admin Manages Assets

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-ASSET-01 |
| **Use Case Name** | Manage Hostel Asset Inventory |
| **Actor** | Admin |
| **Pre-condition** | Admin is logged in. |
| **Post-condition** | Asset record is created, updated, or deleted in the database. |
| **Main Flow** | 1. Admin navigates to Asset Management. 2. Admin creates a new asset (name, type, status, location). 3. Admin may edit or delete existing assets. |
| **Alternative Flow** | If required fields are missing, system displays a validation error. |

*Table 29: Use Case Statement – Manage Assets*

---

### Test Case Specification – Room & Asset Management

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-ROOM-01-01 | View all rooms and beds | Admin navigates to room management | All rooms listed with bed statuses | Functionality |
| TC-ROOM-01-02 | View room filtering by gender | Filter: Female | Only female-assigned rooms displayed | Functionality |
| TC-ROOM-01-03 | Bed status updates after assignment | Bed assigned to student | Bed status changes from `Available` to `Occupied` | Functionality |
| TC-ASSET-01-01 | Add new asset | Name, Type, Status, Location provided | Asset saved and visible in list | Functionality |
| TC-ASSET-01-02 | Add asset with missing name | Empty name field | Validation error: "Asset name is required" | Robustness |
| TC-ASSET-01-03 | Edit existing asset status | Change status to `Damaged` | Asset record updated to `Damaged` | Functionality |
| TC-ASSET-01-04 | Delete asset | Admin deletes asset record | Asset removed from database and list | Functionality |
| TC-ASSET-01-05 | DB failure during asset creation | Valid input, DB offline | Error message; asset not created | Catastrophic |

*Table 30: Test Case Specification – Room & Asset Management*

---

## 4.8 Use Case: Admin Dashboard & Audit Log

### Use Case Statement – UC-AUDIT-01: View Audit Logs

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-AUDIT-01 |
| **Use Case Name** | View System Audit Log |
| **Actor** | Admin / Superadmin |
| **Pre-condition** | Admin or Superadmin is logged in. |
| **Post-condition** | Audit log entries are displayed with actor, action, entity type, and timestamp. |
| **Main Flow** | 1. Admin navigates to Audit Log. 2. System retrieves all log entries. 3. Admin may filter by actor, action type, or date range. |

*Table 31: Use Case Statement – View Audit Log*

### Use Case Statement – UC-ADMIN-01: Superadmin Manages Staff

| **Field** | **Description** |
|---|---|
| **Use Case ID** | UC-ADMIN-01 |
| **Use Case Name** | Manage Admin Staff Accounts |
| **Actor** | Superadmin |
| **Pre-condition** | Superadmin is logged in. |
| **Post-condition** | Admin account is created, updated, activated, or deactivated. |
| **Main Flow** | 1. Superadmin navigates to Staff Management. 2. Superadmin creates new admin account or edits existing one. 3. Superadmin may toggle account active/inactive status. |

*Table 32: Use Case Statement – Superadmin Manage Staff*

---

### Test Case Specification – Admin Dashboard & Audit Log

| **Test Case ID** | **Test Case Name** | **Test Input** | **Expected Result** | **Type** |
|---|---|---|---|---|
| TC-AUDIT-01-01 | View audit log entries | Admin navigates to audit log | All system actions listed with actor, action, timestamp | Functionality |
| TC-AUDIT-01-02 | Filter audit log by actor | Filter by specific admin name | Only that admin's actions shown | Functionality |
| TC-AUDIT-01-03 | Filter audit log by date range | Date from – date to | Only logs within date range shown | Functionality |
| TC-AUDIT-01-04 | Student attempts to access audit log | Student JWT, GET `/admin/audit` | Redirect to login or 403 Forbidden | Robustness |
| TC-ADMIN-01-01 | Superadmin creates new admin | Valid name, email, password | New admin account created; visible in staff list | Functionality |
| TC-ADMIN-01-02 | Create admin with duplicate email | Existing email used | Error: "Email already in use" | Robustness |
| TC-ADMIN-01-03 | Superadmin deactivates admin account | Toggle active status to inactive | Admin can no longer log in | Functionality |
| TC-ADMIN-01-04 | Admin views dashboard summary | Admin logs in and views dashboard | Summary cards showing pending apps, complaints, bookings displayed | Functionality |
| TC-ADMIN-01-05 | DB failure during staff creation | Valid form, DB offline | Error message; account not created | Catastrophic |

*Table 33: Test Case Specification – Admin Dashboard & Audit Log*

---

# 5. TEST ENVIRONMENT

## 5.1 Test Site

### 5.1.1 Developer Site

Testing is conducted at the developer's workstation and connected remotely to the deployed Vercel instance. Both local development server (`npm run dev`) and the live production deployment on Vercel are used for testing. Database operations are verified against the TiDB Cloud (Singapore region) instance.

## 5.2 Facilities Required

### 5.2.1 Lab / Workspace

Testing is performed at the developer's personal workspace. A dedicated desk with sufficient space for hardware setup is required.

### 5.2.2 Furniture

Standard desk and chair setup required for extended testing sessions.

### 5.2.3 Power Infrastructure

Continuous power supply with UPS (Uninterruptible Power Supply) or surge protector recommended to prevent data loss during testing.

### 5.2.4 Communication Facilities

- Email access for receiving test notifications and system-generated emails.
- Messaging platform (e.g., WhatsApp, Teams) for stakeholder communication during UAT.

### 5.2.5 Network Connectivity

- Stable broadband internet connection (minimum 10 Mbps) required for all testing.
- VPN access is not required; all endpoints are publicly accessible via Vercel.
- Firewall settings must permit outbound HTTPS traffic on port 443.

## 5.3 Required Hardware and Software Specifications

### 5.3.1 Hardware Requirements

| **Hardware** | **Minimum Specification** | **Purpose** |
|---|---|---|
| Laptop / Desktop PC | Intel Core i5 / AMD Ryzen 5, 8GB RAM, 256GB SSD | Primary testing machine |
| Smartphone (Android/iOS) | Android 10+ or iOS 14+ | QR scanning and mobile browser testing |
| Monitor | 1080p display, 15" minimum | Visual inspection of UI |
| Wi-Fi Router | 802.11n or higher, stable connection | Network connectivity for testing |
| Webcam (optional) | Any standard webcam | Virtual meeting / UAT sessions |

*Table 34: Hardware Requirements*

### 5.3.2 Software Requirements

| **Software / Tool** | **Version** | **Purpose** |
|---|---|---|
| Google Chrome | Latest stable version | Primary test browser |
| Mozilla Firefox | Latest stable version | Cross-browser testing |
| Microsoft Edge | Latest stable version | Cross-browser testing |
| Node.js | v18 or above | Running local development server |
| npm | v9 or above | Dependency management |
| Git | v2.x | Version control and code management |
| VS Code | Latest | Code editing and review |
| TablePlus / MySQL Workbench | Latest | Direct database inspection and verification |
| Postman | Latest | API endpoint testing |
| TiDB Cloud Console | N/A (web-based) | Cloud database monitoring |
| Vercel Dashboard | N/A (web-based) | Deployment monitoring and logs |

*Table 35: Software Requirements*

## 5.4 Testing Group – Testers Involved

### 5.4.1 Test Sequences and Assigned Testers

Below is the detailed test sequence mapping for each feature module in the StayUniKL system, established based on the risk-based testing priority:

| **Test Sequence (Based on Risk Analysis)** | **Tester** |
|---|---|
| <p>**Feature 1:** Student Login (Authentication & Role-Based Access Control)<br>**Test Sequence:** 01</p> | Danial Iwan |
| <p>**Feature 2:** Admin Login (Authentication & Role-Based Access Control)<br>**Test Sequence:** 02</p> | Danial Iwan |
| <p>**Feature 3:** Logout (Authentication & Role-Based Access Control)<br>**Test Sequence:** 03</p> | Danial Iwan |
| <p>**Feature 4:** Submit Hostel Application (Hostel Application Management)<br>**Test Sequence:** 04</p> | Danial Iwan / Representative Student User (UAT) |
| <p>**Feature 5:** Approve or Reject Hostel Application (Hostel Application Management)<br>**Test Sequence:** 05</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 6:** Assign Bed to Approved Application (Hostel Application Management)<br>**Test Sequence:** 06</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 7:** Student QR Check-In (Check-In / Check-Out Management)<br>**Test Sequence:** 07</p> | Danial Iwan / Representative Student User (UAT) |
| <p>**Feature 8:** Student QR Check-Out (Check-In / Check-Out Management)<br>**Test Sequence:** 08</p> | Danial Iwan / Representative Student User (UAT) |
| <p>**Feature 9:** Make Hostel Fee Payment (Finance & Invoice Management)<br>**Test Sequence:** 09</p> | Danial Iwan / Representative Student User (UAT) |
| <p>**Feature 10:** View Payment Records (Finance & Invoice Management)<br>**Test Sequence:** 10</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 11:** Book Facility Slot (Facility Booking Management)<br>**Test Sequence:** 11</p> | Danial Iwan / Representative Student User (UAT) |
| <p>**Feature 12:** Approve or Reject Facility Booking (Facility Booking Management)<br>**Test Sequence:** 12</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 13:** Cancel Facility Booking (Facility Booking Management)<br>**Test Sequence:** 13</p> | Danial Iwan / Representative Student User (UAT) |
| <p>**Feature 14:** Submit Maintenance Complaint (Complaint Management)<br>**Test Sequence:** 14</p> | Danial Iwan / Representative Student User (UAT) |
| <p>**Feature 15:** Update Complaint Status (Complaint Management)<br>**Test Sequence:** 15</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 16:** View Room and Bed Availability (Room & Asset Management)<br>**Test Sequence:** 16</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 17:** Manage Hostel Asset Inventory (Room & Asset Management)<br>**Test Sequence:** 17</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 18:** View System Audit Log (Admin Dashboard & Audit Log)<br>**Test Sequence:** 18</p> | Danial Iwan / Representative Admin User (UAT) |
| <p>**Feature 19:** Manage Admin Staff Accounts (Admin Dashboard & Audit Log)<br>**Test Sequence:** 19</p> | Danial Iwan |

*Table 36: Test Sequence and Assigned Testers*

### 5.4.2 Roles and High-Level Responsibilities

The testing group is comprised of various stakeholders, each performing critical roles throughout the testing life cycle:

| **No.** | **Name** | **Role** | **Responsibilities** |
|---|---|---|---|
| 1 | Danial Iwan | Developer / Primary Tester | Designs and executes all test cases; documents results; logs and resolves defects. |
| 2 | FYP Supervisor | Observer / Reviewer | Reviews test plan; provides approval; observes UAT sessions. |
| 3 | Representative Student User | UAT Participant | Participates in User Acceptance Testing for student-facing modules (hostel application, complaint, booking). |
| 4 | Representative Admin User | UAT Participant | Participates in User Acceptance Testing for admin modules (approval, room management, asset). |

*Table 37: Testing Group Roles and Responsibilities*

## 5.5 Preparation and Training Required

### 5.5.1 Roles and Technical Responsibilities of the Test Team

Below are the key testing roles and their corresponding technical responsibilities established to ensure comprehensive coverage throughout the testing life cycle:

| **Roles** | **Responsibilities** |
|---|---|
| <p>**Test Planner / Controller**<br>- Danial Iwan<br>- FYP Supervisor (Observer / Reviewer)</p> | <p>- Ensure each testing phase is delivered to schedule and quality.<br>- Produce high-level and detailed test conditions and strategy.<br>- Produce expected results and review test specification.<br>- Report progress at regular status reporting milestones.<br>- Coordinate review and sign-off of test conditions.<br>- Manage individual test cycles and resolve UAT queries/problems.</p> |
| <p>**Lead Tester**<br>- Danial Iwan<br>- Representative Student User (UAT)<br>- Representative Admin User (UAT)</p> | <p>- Identify test data and prepare test environments.<br>- Execute test conditions and mark-off actual results against expected results.<br>- Prepare software error and defect logs.<br>- Administrate defect measurement system and tracking.<br>- Ensure test systems outages/problems are reported immediately.<br>- Ensure entrance criteria are achieved prior to the start of system test execution.<br>- Ensure exit criteria are achieved prior to final system test sign-off.</p> |
| <p>**Test Designer**<br>- Danial Iwan</p> | <p>- Design test components such as test cases, test data, test sequences, test procedures, and scenarios.<br>- Determine appropriate techniques, tools, and guidelines to implement and automate tests.</p> |

*Table 38: Roles and Responsibilities of the Test Team*

### 5.5.2 Preparation and Training Requirements

In order to ensure that all testers are fully equipped to conduct their testing tasks, the following training schedule is established:

| **Role** | **Training Required** | **Duration** |
|---|---|---|
| Primary Tester | Review of SRS, STP, and use case specifications. Familiarity with Postman for API testing. | 1–2 days |
| UAT Participants (Students) | Brief walkthrough of the student dashboard; explanation of tasks to be performed during UAT. | 30 minutes |
| UAT Participants (Admin) | Walkthrough of admin dashboard; explanation of approval and management workflows. | 30 minutes |
| Supervisor | Review of STP document; briefing on test objectives and schedule. | 1 hour |

*Table 39: Preparation and Training Requirements*

---

# 6. TEST SCHEDULE

The following schedule outlines the planned testing activities for StayUniKL, aligned with the FYP 2 submission timeline.

| **No.** | **Testing Activity** | **Start Date** | **End Date** | **Responsible** |
|---|---|---|---|---|
| 1 | Test Plan Document Preparation | 21/05/2026 | 23/05/2026 | Danial Iwan |
| 2 | Test Environment Setup | 23/05/2026 | 24/05/2026 | Danial Iwan |
| 3 | Test Data Preparation (seed data, mock accounts) | 24/05/2026 | 25/05/2026 | Danial Iwan |
| 4 | Authentication & RBAC Testing | 25/05/2026 | 25/05/2026 | Danial Iwan |
| 5 | Hostel Application Management Testing | 25/05/2026 | 26/05/2026 | Danial Iwan |
| 6 | QR Check-In / Check-Out Testing | 26/05/2026 | 26/05/2026 | Danial Iwan |
| 7 | Finance & Invoice Management Testing | 26/05/2026 | 27/05/2026 | Danial Iwan |
| 8 | Facility Booking Management Testing | 27/05/2026 | 27/05/2026 | Danial Iwan |
| 9 | Complaint Management Testing | 27/05/2026 | 28/05/2026 | Danial Iwan |
| 10 | Room & Asset Management Testing | 28/05/2026 | 28/05/2026 | Danial Iwan |
| 11 | Admin Dashboard & Audit Log Testing | 28/05/2026 | 29/05/2026 | Danial Iwan |
| 12 | User Acceptance Testing (UAT) – Student | 29/05/2026 | 30/05/2026 | Danial Iwan + Student Users |
| 13 | User Acceptance Testing (UAT) – Admin | 30/05/2026 | 31/05/2026 | Danial Iwan + Admin Users |
| 14 | Defect Resolution & Regression Testing | 01/06/2026 | 03/06/2026 | Danial Iwan |
| 15 | Final Test Report Compilation | 03/06/2026 | 05/06/2026 | Danial Iwan |
| 16 | Supervisor Review & Sign-Off | 05/06/2026 | 07/06/2026 | Supervisor |

*Table 40: Test Schedule*

---

# 7. DEFINITIONS, ACRONYMS AND ABBREVIATIONS

## 7.1 Definitions

| **Term** | **Definition** |
|---|---|
| Acceptance Test Plan (ATP) | A formal document that describes the approach, resources, and schedule of the acceptance testing activities. |
| Black Box Testing | A software testing technique where the tester does not have knowledge of the internal structure of the system. Tests are derived from specifications and requirements. |
| Defect | A flaw, bug, or error in the software that causes it to produce an incorrect or unexpected result. |
| Entry Criteria | The set of conditions that must be met before a test activity can be commenced. |
| Exit Criteria | The set of conditions that must be met before a test activity can be declared complete. |
| Functionality Test | A test case designed to verify that a specific feature or function operates as expected with valid inputs. |
| Robustness Test | A test case designed to verify that the system handles invalid, unexpected, or boundary inputs gracefully without crashing. |
| Catastrophic Test | A test case designed to simulate extreme failure conditions (e.g., database offline) and verify that the system responds gracefully. |
| Risk-Based Testing | A testing approach that prioritises test cases based on the likelihood and impact of potential failure in each module. |
| Role-Based Access Control (RBAC) | A security mechanism that restricts system access based on the authenticated user's role (Student, Admin, Superadmin). |
| Test Oracle | The mechanism used to determine whether the outcome of a test is pass or fail. In this project, it is the SRS and use case specifications. |
| UAT | User Acceptance Testing — testing performed by end-users to verify the system meets their needs before final deployment. |
| Use Case Testing | A black-box testing technique where test cases are derived from use case specifications. |

*Table 41: Definitions*

## 7.2 Abbreviations

| **Abbreviation** | **Full Form** |
|---|---|
| ATP | Acceptance Test Plan |
| DB | Database |
| FYP | Final Year Project |
| IEEE | Institute of Electrical and Electronics Engineers |
| ISO | International Organisation for Standardisation |
| ISTQB | International Software Testing Qualifications Board |
| JWT | JSON Web Token |
| MIIT | Malaysia Institute of Information Technology |
| RBAC | Role-Based Access Control |
| SRS | Software Requirements Specification |
| STP | Software Test Plan |
| TC | Test Case |
| TiDB | Titanium Database (cloud-native MySQL-compatible distributed database) |
| UAT | User Acceptance Testing |
| UC | Use Case |
| UniKL | Universiti Kuala Lumpur |

*Table 42: Abbreviations*

---

## APPENDIX A – StayUniKL Project Gantt Chart

*(Refer to the FYP 2 project Gantt Chart submitted separately as part of the project documentation.)*

---

*End of Software Test Plan Document — StayUniKL Digital Hostel Management System*
*Version 1.0 | Prepared by: Danial Iwan | Date: 21 May 2026*
