**BOSSKU HOUSE QR-BASED DIGITAL FOOD ORDERING SYSTEM** 

**MUHAMMAD AMIRUL BIN HAYAZI** 

**(52213124486)** 

**MUHAMMAD SYAHIRAN BIN MOHD SUHAIMI** 

**(52213124563)** 

**Universiti Kuala Lumpur** 

**Malaysian Institute of Information Technology OCTOBER 2025** 

i 

## **BOSSKU HOUSE QR-BASED DIGITAL FOOD ORDERING SYSTEM** 

## **MUHAMMAD AMIRUL BIN HAYAZI** 

**(52213124486)** 

## **MUHAMMAD SYAHIRAN BIN MOHD SUHAIMI** 

**(52213124563)** 

**Report Submitted to Fulfil the Partial Requirements** 

**For The Bachelor of Software Engineering Universiti Kuala Lumpur** 

**OCTOBER 2025** 

ii 

## **DECLARATION** 

I declare that this report is my original work and all references have been cited adequately as required by the University 

Date: 25/01/2026 Signature: ………………….. | Full Name: MUHAMMAD AMIRUL BIN HAYAZI ID Number: 52213124486 Signature: …………………... Full Name: MUHAMMAD SYAHIRAN BIN MOHD SUHAIMI ID Number: 52213124563 

iii 

## **APPROVAL PAGE** 

We have supervised and examined this report and verify that it meets the program and university’s requirements for the Bachelor’s in Software Engineering. 

Date: 25/01/2026 

Signature: …………………... Supervisors: Dr. Suriana Ismail Official Stamp: 

iv 

## **COPYRIGHT** 

Declaration of Copyright and Affirmation of Fair Use of Unpublished Research Work as stated below 

## Copy @ 25/01/2026 by **Muhammad Amirul bin Hayazi (52213124486)** and **Muhammad Syahiran Bin Mohd Suhaimi (52213124563)** 

## All rights reserved for **Bossku House QR-Based Digital Food Ordering System** 

No part of this unpublished research may be reproduced, stored in a retrieval system, or transmitted, in any form or by any means, electronic, mechanical, photocopying, recording 

or 

otherwise without the prior written permission of the copyright 

holder except as provided below: 

Any material contained in or derived from this unpublished research may only be used by others in their writing with due acknowledgment. 

UniKL MIIT or its library will have the right to make and Transmit copies (print or electronic) for institutional and academic purpose. 

v 

## **ACKNOWLEDGEMENT** 

The authors would like to express their sincere gratitude to all individuals who contributed to the successful completion of this Final Year Project. First and foremost, the team extends their deepest appreciation to the project supervisor, **Dr. Suriana Ismail** , for her continuous guidance, invaluable feedback, and unwavering encouragement throughout the entire development process. Her expertise in software engineering and constructive suggestions greatly assisted in refining both the technical implementation and documentation aspects of this work. 

Gratitude is also extended to **Universiti Kuala Lumpur, Malaysian Institute** 

**of Information Technology (UniKL MIIT)** , for providing the academic resources, facilities, and a supportive learning environment that enabled this project to be carried out effectively. The structured curriculum in Software Engineering has been instrumental in equipping the team with the knowledge and practical skills necessary to undertake this project. 

Special appreciation is extended to family members and close friends for their constant moral support, patience, and motivation throughout the duration of this project. Their encouragement during challenging periods served as a source of strength and determination. 

Acknowledgement is also given to fellow colleagues who offered constructive feedback and participated in user acceptance testing of the system. Their contributions were valuable in improving the overall quality and usability of the **Bossku House QRBased Digital Food Ordering System** . 

Finally, the team expresses gratitude to everyone who contributed directly or indirectly to the completion of this project. This work stands as a testament to collaborative effort, academic rigour, and a commitment to innovation in the field of software engineering. 

## **TABLE OF CONTENTS** 

**DECLARATION ........................................................................................................ iii APPROVAL PAGE** .................................................................................................... **iv COPYRIGHT** .............................................................................................................. **v ACKNOWLEDGEMENT** ........................................................................................... **vi LIST OF TABLES** ..................................................................................................... **ix LIST OF FIGURES** ..................................................................................................... **x ABSTRACT** ............................................................................................................. **xii CHAPTER 1: INTRODUCTION** ................................................................................. **1** 1.1 Introduction ....................................................................................................... 1 1.2 Project Background ........................................................................................... 2 1.3 Problem Statement ........................................................................................... 3 1.4 Aims and Objectives ......................................................................................... 4 1.4.1 Aims ............................................................................................................ 4 1.4.2 Objectives ................................................................................................... 4 1.5 Scope of the Project .......................................................................................... 5 1.5.1 System ........................................................................................................ 5 1.5.2 User ............................................................................................................ 6 1.6 Expected Project ............................................................................................... 7 1.7 Limitations ......................................................................................................... 7 1.8 Conclusion ........................................................................................................ 7 **CHAPTER 2: LITERATURE REVIEW ....................................................................... 8** 2.1 Introduction ....................................................................................................... 8 2.2 Background ....................................................................................................... 8 2.3 Journal Review ................................................................................................. 9 2.3.1 Ichiban Sushi – Efficiency and Hybrid Service ............................................ 9 2.3.2 Smart Dining System - Conceptual Design and Automation ....................... 9 2.3.3 Sustainable QR Menus - Quality and Satisfaction Pathways .................... 10 2.4 List of Existing Applications ............................................................................. 11 2.4.1 Seoul Garden ........................................................................................... 11 2.4.2 Secret Recipe ........................................................................................... 11 

vii 

2.5 Study of Existing Applications ......................................................................... 11 2.5.1 Functional Features .................................................................................. 11 2.5.2 Limitations of Existing Applications ........................................................... 12 2.6 Comparison of Existing Applications ............................................................... 13 2.7 Conclusion ...................................................................................................... 14 **CHAPTER 3: METHODOLOGY .............................................................................. 15** 3.1 Introduction ..................................................................................................... 15 3.2 Development Methodology – Rapid Application Development (RAD) ............. 15 3.2.1 Rationale for Methodology Selection ........................................................ 15 3.2.2 RAD Phases Applied ................................................................................ 16 3.3 Project Timeline .............................................................................................. 17 3.4 Requirement Specification .............................................................................. 18 3.4.1 Hardware Requirement ............................................................................. 18 3.4.2 Software Requirement .............................................................................. 18 3.5 Budget and Costing......................................................................................... 19 3.5.1 Hardware Budget ...................................................................................... 19 3.5.2 Software Budget ....................................................................................... 19 3.6 Conclusion ...................................................................................................... 19 **CHAPTER 4: RESULT AND DISCUSSION ............................................................ 20** 4.1 Introduction ..................................................................................................... 20 4.2 Results ............................................................................................................ 20 4.2.1 Overview of System Implementation ........................................................ 20 4.2.2 Customer Module ..................................................................................... 21 4.2.3 Test Results Summary ............................................................................. 35 4.3 Discussion ....................................................................................................... 39 4.3.1 Achievement of Project Objectives ........................................................... 39 4.3.2 Technical Challenges and Resolutions ..................................................... 41 4.3.3 System Performance Evaluation .............................................................. 44 4.4 Conclusion of Chapter ..................................................................................... 44 **CHAPTER 5: CONCLUSION ................................................................................... 45** 5.1 Introduction ..................................................................................................... 45 5.2 Future Recommendations ............................................................................... 45 5.3 Summary ......................................................................................................... 49 **REFERENCES ......................................................................................................... 51 APPENDICES .......................................................................................................... 52** 

viii 

## **LIST OF TABLES** 

Table 2.1: Comparison of Existing Applications ....................................................... 13 Table 3.1: Project Timeline ....................................................................................... 17 Table 3.2: Hardware Requirement ............................................................................ 18 Table 3.3: Software Requirement ............................................................................. 18 Table 3.4: Hardware Budget ..................................................................................... 19 Table 3.5: Software Budget ...................................................................................... 19 Table 4.1: Test Results Summary ............................................................................. 35 Table 4.2: Complete Test Case Results – All 28 Test Cases .................................... 36 Table A.1: Complete 28 Test Cases with Detailed Steps .......................................... 52 Table B.1: Functional Requirements ........................................................................ 57 Table B.2: Non-Functional Requirements ................................................................. 58 

ix 

## **LIST OF FIGURES** 

Figure 3.1: Project Gantt Chart ................................................................................ 17 Figure 4.1: QR Code Scanning – Menu Interface with Table Detection ................... 21 Figure 4.2: Menu Browsing by Category – Product Cards with Name, Image, and Add to Cart ............................................................................................................... 22 Figure 4.3: Cart Management Interface – Quantity Adjust, Remove Items, View Total ................................................................................................................................. 23 Figure 4.4: Order Placement — Checkout Form and Unique Reference Number (e.g., #AAAABBBB) .................................................................................... 24 Figure 4.5: Real-time Order Status Tracking Interface ............................................. 25 Figure 4.6: Loyalty Points Dashboard and Rewards Catalogue ............................... 26 Figure 4.7: Product Review Submission Interface .................................................... 27 Figure 4.8: Staff Order Management Dashboard ..................................................... 28 Figure 4.9: Cashier View — Order Payment Confirmation and PDF Receipt Trigger ......................................................................................................... 29 Figure 4.10: Admin Overview Dashboard — Key Performance Metrics Summary .................................................................................................................. 30 Figure 4.11: Admin CRUD Interfaces — Manage Categories .................................. 31 Figure 4.12: Admin CRUD Interfaces — Manage Products ..................................... 32 Figure 4.13: Admin CRUD Interfaces — Rewards Catalogue .................................. 32 Figure 4.14: Admin Analytics Dashboard — Revenue Metrics and Report Export ........................................................................................................... 33 Figure 4.15: Admin Review Moderation Interface — All Customer Reviews with Delete Action ...................................................................................... 34 

x 

Figure C.1: Use Case Diagram ................................................................................ 59 

## **ABSTRACT** 

The rapid integration of digital technologies within the hospitality industry has significantly transformed traditional restaurant operations, particularly in the domain of food ordering and management systems. This Final Year Project presents the design, development, and evaluation of Bossku House — a web-based QR Digital Food Ordering System — aimed at modernising the dining experience and improving operational efficiency in restaurant environments. 

The system addresses critical shortcomings of traditional paper-based ordering methods, including long customer waiting times, order inaccuracies due to manual handwriting, insufficient real-time visibility for kitchen staff, absence of structured data collection for business analytics, and inefficient payment processing workflows. By digitalising the entire ordering lifecycle through QR code technology and a responsive web platform, the Bossku House system resolves these challenges comprehensively. 

The proposed system supports four distinct user roles — Guest Customer, Authenticated Customer, Staff, and Administrator — each with precisely defined system privileges enforced through Role-Based Access Control (RBAC). Customers scan a unique QR code at their table, which redirects their smartphone browser to the restaurant menu with the table number pre-populated in the session. They may browse the menu by category, add items to a shopping cart, place orders, and monitor realtime order status — all without requiring interaction with waiting staff or installation of a mobile application. 

xii 

The system was developed using Laravel 12 (PHP 8.2+) as the backend framework, with Blade Templates, Tailwind CSS, and Vite for the frontend. Firebase serves as the primary NoSQL database, and provides real-time synchronisation for order status updates. Authentication is managed via Laravel Breeze and Sanctum, and PDF receipts are generated using the barryvdh/laravel-dompdf library. Development followed an Agile/Iterative Software Development Life Cycle (SDLC). 

A total of 28 test cases were designed and executed across all user roles, including functional tests, edge case scenarios, and RBAC security enforcement tests. All 28 test cases passed successfully, with zero critical defects. The system demonstrated reliable performance, loading the menu page in under two seconds on a 4G network and delivering real-time order updates within one second via Firebase. 

This report documents the complete development lifecycle — from requirements analysis and system design through implementation, testing, and evaluation — confirming that the Bossku House system successfully fulfils all stated objectives and provides a solid foundation for the digital transformation of food service operations. 

xiii 

## **ABSTRAK** 

Integrasi pesat teknologi digital dalam industri hospitaliti telah membawa transformasi yang signifikan terhadap operasi restoran tradisional, khususnya dalam aspek sistem pengurusan dan tempahan makanan. Projek Tahun Akhir ini membentangkan reka bentuk, pembangunan, dan penilaian Bossku House — sebuah Sistem Tempahan Makanan Digital Berasaskan QR melalui web — yang bertujuan memodenkan pengalaman pelanggan serta meningkatkan kecekapan operasi dalam persekitaran restoran. 

Sistem ini dibangunkan bagi menangani kelemahan utama kaedah tempahan tradisional berasaskan kertas, termasuk tempoh menunggu pelanggan yang panjang, kesilapan tempahan akibat tulisan tangan manual, kekurangan paparan masa nyata untuk staf dapur, ketiadaan pengumpulan data yang tersusun untuk analitik perniagaan, serta aliran kerja pemprosesan pembayaran yang tidak efisien. Dengan mendigitalkan keseluruhan kitaran tempahan melalui teknologi kod QR dan platform web responsif, sistem Bossku House berjaya menyelesaikan cabaran-cabaran tersebut secara menyeluruh. 

Sistem yang dicadangkan menyokong empat peranan pengguna utama iaitu Pelanggan Tetamu, Pelanggan Berdaftar, Staf, dan Pentadbir, di mana setiap peranan mempunyai tahap akses yang ditetapkan melalui mekanisme Kawalan Akses Berasaskan Peranan (Role-Based Access Control, RBAC). Pelanggan hanya perlu mengimbas kod QR unik di meja mereka, yang akan mengarahkan pelayar telefon pintar terus ke menu restoran dengan nombor meja diisi secara automatik dalam sesi sistem. Pengguna boleh melayari menu mengikut kategori, menambah item ke troli, membuat tempahan, serta memantau status pesanan secara masa nyata tanpa memerlukan interaksi dengan pelayan restoran atau pemasangan aplikasi mudah alih. 

xiv 

Sistem ini dibangunkan menggunakan Laravel 12 (PHP 8.2+) sebagai rangka kerja backend, bersama Blade Templates, Tailwind CSS, dan Vite untuk pembangunan frontend. Firebase digunakan sebagai pangkalan data NoSQL utama, dan menyediakan penyegerakan masa nyata berkelajuan tinggi untuk kemas kini status tempahan. Proses pengesahan pengguna diurus menggunakan Laravel Breeze dan Sanctum, sementara resit dalam format PDF dijana menggunakan pustaka barryvdh/laravel-dompdf. Pembangunan sistem dilaksanakan berdasarkan pendekatan Agile/Iterative dalam Kitar Hayat Pembangunan Perisian (Software Development Life Cycle, SDLC). 

Sebanyak 28 kes ujian telah direka dan dilaksanakan merangkumi semua peranan pengguna, termasuk ujian fungsi sistem, senario kes pinggiran (edge cases), serta ujian penguatkuasaan keselamatan RBAC. Kesemua 28 kes ujian berjaya diluluskan tanpa sebarang kecacatan kritikal. Sistem menunjukkan prestasi yang stabil dengan masa pemuatan halaman menu kurang daripada dua saat menggunakan rangkaian 4G serta kemas kini status tempahan secara masa nyata dalam tempoh kurang daripada satu saat melalui Firebase. 

Laporan ini mendokumentasikan keseluruhan kitaran pembangunan sistem — bermula daripada analisis keperluan dan reka bentuk sistem sehingga kepada pelaksanaan, pengujian, dan penilaian — sekali gus membuktikan bahawa sistem Bossku House berjaya memenuhi semua objektif yang telah ditetapkan serta menyediakan asas kukuh ke arah transformasi digital operasi perkhidmatan makanan. 

xv 

## **CHAPTER 1: INTRODUCTION** 

## **1.1 Introduction** 

The food and beverage (F&B) industry in Malaysia has undergone a significant digital transformation over the past decade. Driven by technological advancements, evolving consumer expectations, and the accelerating adoption of smartphones, restaurants and dining establishments are increasingly deploying digital tools to enhance service delivery, reduce operational costs, and improve the overall customer experience. Among the most impactful innovations in this sector is the adoption of QR code-based digital ordering systems, which enable customers to access menus and submit orders directly from their personal smartphones without the need for application installation. 

This chapter introduces the Bossku House QR-Based Digital Food Ordering System — a Final Year Project developed to address the operational inefficiencies commonly observed in traditionally managed restaurant environments. The chapter presents the background of the study, identifies the core problem statement, articulates the project objectives, defines the scope of the system, and highlights the significance of the proposed solution. 

1 

## **1.2 Project Background** 

Traditional restaurant ordering processes rely heavily on manual interaction between customers and waiting staff. In a conventional setup, customers must wait for a waiter to approach their table, verbally communicate their order, and then await confirmation. This process is inherently susceptible to human error, particularly during peak service hours when staff are managing multiple tables simultaneously. Communication miscommunications between customers and staff frequently result in incorrect orders, customer dissatisfaction, and food wastage. 

The absence of real-time visibility into order statuses further creates bottlenecks in kitchen operations. Kitchen staff may lack timely information regarding new orders, modifications, or cancellations, leading to delayed service and reduced table turnover rates. The lack of a centralised data management system also prevents restaurant administrators from accessing meaningful business analytics, making datadriven decision-making difficult. 

The near-universal penetration of smartphones and widespread mobile internet access in Malaysia has created a favourable environment for QR code-based selfordering systems. QR codes affixed to individual restaurant tables allow customers to access the digital menu instantaneously, browse and add items to a cart, and submit their order without waiting for staff. This model eliminates the need for physical menus, reduces paper waste, and enables customers to order at their own pace. 

Bossku House is a local Malaysian dining establishment seeking to modernise its operations through a web-based digital ordering platform. The system developed in this project is designed to address the specific operational needs of Bossku House while being architecturally generalisable to other similar dine-in restaurant contexts. The platform leverages the Laravel 12 framework, Firebase Realtime Database, and Tailwind CSS to deliver a robust, real-time, and user-friendly ordering experience across all user roles. 

2 

## **1.3 Problem Statement** 

Traditional paper-based and manual ordering systems in restaurant environments present several significant challenges that negatively impact both customer experience and operational efficiency. The following five core problems have been identified as central to this project: 

- **Long Waiting Times:** Customers experience extended delays in placing orders, as they must wait for available waiting staff to attend to their table. During peak hours, these delays are compounded, resulting in customer frustration and potential loss of business. 

- **Order Inaccuracies:** Manual handwriting of orders by waiting staff introduces a high probability of errors. Misheard items, illegible handwriting, and incorrect quantity recordings contribute to inaccuracies that increase operational costs through food wastage and customer dissatisfaction. 

- **Lack of Real-time Visibility:** Kitchen and service staff lack a unified, realtime view of incoming orders. Without an automated notification system, newly placed orders may go unacknowledged for extended periods, slowing down food preparation and service timelines. 

- **Absence of Business Analytics Infrastructure:** Traditional ordering systems do not capture structured transactional data, depriving restaurant administrators of actionable insights regarding sales performance, popular menu items, and customer purchasing patterns. 

- **Inefficient Payment Processing:** Manual management of bills and payments introduces delays at the end of the dining experience. The absence of digital receipt generation complicates record-keeping and financial audit trails. 

3 

## **1.4 Aims and Objectives** 

## **1.4.1 Aims** 

The primary aim of this project is to design, develop, and evaluate a comprehensive web-based QR digital food ordering system that automates the full ordering lifecycle — from table detection through to receipt generation — thereby improving the overall dining experience for customers and streamlining operational workflows for restaurant staff and administrators. 

## **1.4.2 Objectives** 

The following five objectives guide the development of the Bossku House system: 

1. To develop a QR-based digital ordering system that allows customers to place food orders by scanning a table QR code using their mobile device, without requiring application installation. 

2. To implement a real-time order management dashboard for staff using Firebase Realtime Database, enabling immediate visibility of new and updated orders. 

3. To build a customer engagement system incorporating loyalty points accumulation, reward item redemption, and product review submission for authenticated customers. 

4. To provide a comprehensive administrative panel with features for menu management, category management, review moderation, sales analytics, and report export in PDF formats. 

5. To implement Role-Based Access Control (RBAC) to ensure secure and appropriately scoped access across all user roles: Guest Customer, Authenticated Customer, Staff, and Administrator. 

4 

## **1.5 Scope of the Project** 

## **1.5.1 System Scope** 

The Bossku House system encompasses the following functional domains: 

- QR code-based table identification and session management, supporting unique URLs per table (e.g., /menu?table=5). 

- A digital menu interface enabling customers to browse products by category, view product details, and manage a shopping cart with quantity adjustment and item removal. 

- An order placement module generating unique order reference numbers (format: #AAAABBBB) and providing real-time status tracking via Firebase. 

- A loyalty points and rewards system for authenticated customers, enabling points accumulation on orders and point-based reward redemption. 

- A product review and star rating system for authenticated customers who have placed confirmed orders. 

- A staff-facing order management dashboard with real-time Firebase notifications, status update capabilities (Preparing / Served / Cancelled), and a cashier module for marking orders as paid and generating PDF receipts. 

- An administrative panel for CRUD management of product categories and menu items, rewards catalogue management, customer review moderation, sales analytics, and report export in PDF formats. 

5 

## **1.5.2 User** 

The system caters to four defined user roles: 

- **Guest Customer:** Individuals who access the system via QR code scan without creating an account. May browse menu, manage cart, place orders, and track order status. 

- **Authenticated Customer:** Registered users who additionally access loyalty points, rewards redemption, product reviews, and order history. 

- **Staff:** Restaurant service personnel responsible for managing orders in real time, processing payments, and generating PDF receipts. 

- **Administrator:** System managers with full access to menu management, rewards catalogue, review moderation, analytics, and report export. 

6 

## **1.6 Expected Project** 

The expected outcome of this project is a fully functional, production-ready web application that allows multiple concurrent customers to place orders simultaneously via QR code scanning. Kitchen and service staff are expected to receive new orders instantly on their dashboard without page refreshes, via Firebase Realtime Database integration. The administrative panel is expected to accurately reflect sales data, allow for instant menu updates visible to customers immediately, and support data export for business reporting purposes. 

## **1.7 Limitations** 

- **Internet Dependency** : The system requires an active internet connection to function. Offline ordering capability is not supported in the current implementation. 

- **Device Requirement** : Customers must possess a smartphone with a functioning camera and web browser to scan the QR code and access the menu. 

- **Payment Integration** : The current scope supports cash-based payment only. Online payment gateway integration (FPX, e-wallet) is identified as a future enhancement. 

- **Single-Branch Architecture:** The system is designed for a single restaurant location. Multi-branch support with shared product catalogues is identified as future work. 

## **1.8 Conclusion** 

Chapter 1 has outlined the foundation of the Bossku House project, identifying the five critical operational challenges that the system is designed to address. By setting clear objectives across five functional domains and defining the scope for all four user roles — Guest Customer, Authenticated Customer, Staff, and Administrator — this chapter establishes the direction and boundaries for the subsequent system development and evaluation. The following chapter reviews existing literature and comparable systems to further contextualise the research problem and justify the development approach. 

7 

## **CHAPTER 2: LITERATURE REVIEW** 

## **2.1 Introduction** 

This chapter presents a comprehensive review of existing literature and systems relevant to the domain of digital food ordering in the restaurant and hospitality industry. The review examines academic research pertaining to self-ordering technologies, customer behaviour in digital dining contexts, and the application of QR code technologies in the food service sector. Existing commercial digital ordering systems are also examined and compared against the proposed Bossku House system. The chapter concludes with a gap analysis that justifies the development of the proposed solution. 

## **2.2 Background** 

The adoption of technology in the food service industry has accelerated substantially in recent years, driven by hygiene awareness, labour cost pressures, and rising consumer comfort with digital self-service platforms. Restaurants that implement digital ordering systems report measurable reductions in order errors and improvements in table turnover rates, particularly during peak service periods. QR codes, originally developed for industrial inventory tracking, have emerged as a practical interface mechanism in the hospitality sector, enabling contactless access to digital menus without requiring specialised hardware or application installation by endusers. 

The table-specific QR code model — in which each physical table is assigned a unique QR code encoding a URL with an embedded table identifier — enables automatic table context propagation within digital ordering systems. This eliminates the need for customers to manually input their table number, reducing ordering friction and the potential for data entry errors. The integration of real-time databases such as Firebase Realtime Database addresses the critical requirement for sub-second order notification delivery to kitchen and service staff, a latency threshold that traditional HTTP request-response architectures cannot consistently achieve. 

## **2.3 Journal Review** 

## **2.3.1 Ichiban Sushi — Efficiency and Hybrid Service** 

Research examining Ichiban Sushi's implementation of QR code-based self-ordering demonstrates the operational advantages of a hybrid service model, in which customers self-order via digital interfaces while staff continue to fulfil delivery and service roles. Studies report meaningful reductions in Customer Cycle Time — the total duration from seating to departure — without diminishing perceived service quality. A key finding is that the success of hybrid ordering models is contingent upon the intuitiveness of the digital interface. Systems that require excessive navigation steps, mandatory user registration, or complex input processes experience lower adoption rates and higher abandonment, underscoring the importance of a frictionless user journey as a core design principle. 

## **2.3.2 Smart Dining System — Conceptual Design and Automation** 

Academic literature on Smart Dining Systems emphasises the value of automation across the full service lifecycle, from order capture through kitchen scheduling, inventory management, and billing. A key finding is that successful systems must minimise the cognitive load on the user. Automated recommendation engines — which suggest items based on popularity or historical ordering patterns — are cited as critical features for modern smart dining platforms. These systems move beyond simple digital menus to serve as intelligent sales tools, increasing average transaction values through contextual digital upselling. The data collection capabilities of digital ordering platforms are also highlighted as a strategic asset, enabling data-driven menu composition, staffing optimisation, and promotional campaign management. 

## **2.3.3 Sustainable QR Menus — Quality and Satisfaction Pathways** 

Research into QR code menu systems addresses both sustainability and customer satisfaction dimensions. The elimination of physical printed menus reduces paper consumption and the associated environmental footprint, appealing to eco-conscious consumers. Studies document a direct correlation between digital menu visual quality — including high-resolution food photography and clear product descriptions — and customer perceived service quality. Research also identifies a satisfaction gap between customers who encounter technical difficulties (poor connectivity, slow load times, browser incompatibilities) and those who experience smooth interactions, informing the performance non-functional requirements adopted in this project. 

10 

## **2.4 List of Existing Applications** 

## **2.4.1 Seoul Garden** 

Seoul Garden, a Malaysian dining chain, employs a digital ordering system for its buffet and à la carte menu management. The system supports high-volume ordering and includes table-specific order tracking. Key features include category-based menu browsing and buffet replenishment request management. 

## **2.4.2 Secret Recipe** 

Secret Recipe utilises a digital ordering platform accessible via mobile application and web browser. The platform features membership rewards integration and supports advance ordering for both dine-in and takeaway, with product personalisation options. However, the platform requires mandatory user registration for full functionality, creating a friction barrier for casual dine-in customers. 

## **2.5 Study of Existing Applications** 

## **2.5.1 Functional Features** 

- **Seoul Garden** : Focuses on high-volume ordering management. Key features include buffet replenishment requests and table-specific order tracking. The platform is primarily tablet-based in some locations. 

- **Secret Recipe** : Focuses on e-commerce-style functionalities — user profiles, advance scheduling for delivery and pickup, and complex product customisation (e.g., personalised cake messages). Membership reward integration is a distinguishing feature. 

11 

## **2.5.2 Limitations of Existing Applications** 

- **Seoul Garden** : Users report inflexibility in order modification once submitted. The system can appear impersonal, and synchronisation of digital orders with physical stock availability occasionally lags during peak periods. 

- **Secret Recipe** : The platform mandates user registration for order placement, creating a barrier for casual dine-in customers who prefer minimal interaction overhead. The advance booking requirement for certain products offers limited flexibility for spontaneous immediate dining. 

12 

## **2.6 Comparison of Existing Applications** 

|System<br>Features|<br>Seoul Garden|Secret Recipe|QR-Based Smart<br>Ordering System|
|---|---|---|---|
|Primary Platform|Tablet/Web|Mobile App/Web|Web Browser (QR<br>Scan)|
|App Installation|Not always<br>required|Required for full<br>features|Not Required|
|Guest Ordering|Yes|No (registration<br>required)|Yes|
|Real-time Order<br>Tracking|Partial|Yes (delivery<br>tracking)|Yes (Firebase<br>Realtime DB)|
|Loyalty/Rewards<br>System|No|Yes (membership)|Yes (points-based)|
|PDF Receipt<br>Generation|No|No|Yes|
|Admin Analytics<br>Panel|Partial|Yes|Yes|
|RBAC<br>Implementation|Basic|Partial|Full<br>(auth/admin/staff)|
|Third-party Cost|N/A|N/A|None|



Table 2.1: Comparison of Existing Applications 

13 

## **2.7 Conclusion** 

The literature review confirms that QR-based digital ordering systems are a validated and increasingly standard approach to improving restaurant operational efficiency and customer satisfaction. The comparative analysis reveals several gaps in existing commercial solutions — particularly the absence of fully integrated RBAC, PDF receipt generation, proprietary cost-free deployment, and guest ordering without mandatory registration — that the Bossku House system is specifically designed to address. These gaps provide clear academic and practical justification for the development undertaken in this project. The following chapter describes the methodology employed to guide system development. 

14 

## **CHAPTER 3: METHODOLOGY** 

## **3.1 Introduction** 

This chapter describes the software development methodology, system design approach, requirements gathering process, and tools and technologies employed in the development of the **Bossku House QR-Based Digital Food Ordering System** . The selection of an appropriate development methodology is critical to ensuring that the project is managed effectively, that evolving requirements are accommodated, and that the final deliverable meets the defined functional and quality standards. 

## **3.2 Development Methodology — Rapid Application Development (RAD)** 

## **3.2.1 Rationale for Methodology Selection** 

The Rapid Application Development (RAD) methodology was selected for this project. RAD is characterised by iterative development cycles, continuous user feedback integration, rapid prototyping, and incremental delivery of functional system components. This approach is particularly well-suited to the Bossku House project for the following reasons: 

- The project requirements, while broadly defined, benefit from iterative refinement as functional prototypes are developed and user feedback is gathered. 

- The system encompasses multiple interrelated modules — customer ordering, staff dashboard, admin panel — that can be developed and tested in parallel development cycles. 

- The customer-facing mobile interface requires iterative usability evaluation to ensure the scan-to-order flow is intuitive for first-time users without instructional guidance, a key non-functional requirement. 

- The integration of Firebase Realtime introduces architectural complexity that benefits from iterative prototyping and incremental testing. 

15 

## **3.2.2 RAD Phases Applied** 

The RAD methodology was applied across three primary phases: 

- **Determining Requirements:** Core requirements were gathered through systematic analysis of the project brief and identification of use cases for all four user roles. Non-functional requirements (performance, security, usability, availability) were formalised in an SRS document. 

- **User Design:** Rapid prototyping was employed to create mock-up interfaces and functional prototypes for the mobile ordering flow and staff dashboard. Prototypes were evaluated against usability criteria and refined iteratively based on feedback, minimising usability problems before full construction. 

- **Construction:** Short development cycles were used to build the system incrementally. Core functionalities — authentication, RBAC, menu management, ordering, real-time dashboard — were introduced and tested cycle by cycle. This approach reduced rework and ensured continuous alignment with user requirements. 

16 

## **3.3 Project Timeline** 

|**3.3 Project Timeline**|||
|---|---|---|
|**Phase**|**Activities**|**Duration**|
|Phase 1: Planning &<br>Analysis|Requirements gathering, SRS<br>documentation, use case modelling,<br>ER diagram design|Weeks 1–2|
|Phase 2: System<br>Design|Architecture design, database<br>schema, UI wireframes, RBAC<br>design|Weeks 3–4|
|Phase 3: Cycle 1 —<br>Foundation|Laravel setup, database migrations,<br>authentication, RBAC middleware,<br>QR session handling|Weeks 5–6|
|Phase 4: Cycle 2 —<br>Customer Module|Menu browsing, cart management,<br>order placement, Firebase real-time<br>tracking, loyalty/reviews|Weeks 7–8|
|Phase 5: Cycle 3 —<br>Staff & Admin|Staff dashboard, cashier view, PDF<br>receipt, admin CRUD, analytics,<br>report export|Weeks 9–10|
|Phase 6: Testing &<br>Review|Test case execution (28 TC), defect<br>resolution, UAT, documentation<br>completion|Weeks 11–12|



_Table 3.1: Project Timeline_ 

_Figure 3.1: Project Gantt Chart_ 

17 

## **3.4 Requirement Specification** 

## **3.4.1 Hardware Requirement** 

|Device|Victus by HP Gaming Laptop 15|
|---|---|
|Operating System|Windows 11|
|Processor|AMD Ryzen 7 7445HS with Radeon 740M Graphics|
|Installed Memory (RAM)|16 GB RAM DDR5|
|Storage|512 GB NVMe SSD|
|Testing Device<br>(Customer)|Smartphone with camera and web browser<br>(iOS/Android)|
|Network|Wi-Fi (minimum 10 Mbps download, 5 Mbps upload,<br><100 ms latency)|



_Table 3.2: Hardware Requirements_ 

## **3.4.2 Software Requirement** 

|Database|Firebase|
|---|---|
|Development Tools|Visual Studio Code|
|Programming Languages|HTML, CSS, JavaScript, PHP, Blade, Node|
|Documentation|Microsoft Word, Google Docs|
|UX Designing|Draw.io, Visual Paradigm|



_Table 3.3: Software Requirements_ 

18 

## **3.5 Budget and Costing** 

## **3.5.1 Hardware Budget** 

|**3.5.1 Hardware Budget**|||
|---|---|---|
|**Item**|**Description**|**Estimated Cost (RM)**|
|Laptop/PC|Development and Testing|RM 5,500|
|Internet Access|Monthly subscription|RM 147.34|
|Total Hardware Cost||RM 5,647.34|



_Table 3.4: Hardware Budget_ 

## **3.5.2 Software Budget** 

|**3.5.2 Software Budget**|||
|---|---|---|
|**Software**|**Purpose**|**Estimated Cost (RM)**|
|Visual Studio Code|Code editor|Free|
|XAMPP|Web server|Free|
|Firebase|Database|RM 0 – RM 10|
|Web Browser|Testing|Free|
|Total Software Cost||RM 0 – RM 10|



_Table 3.5: Software Budget_ 

## **3.6 Conclusion** 

The RAD methodology adopted for this project provides a flexible, feedback-driven development framework that accommodates the architectural complexity of integrating multiple technologies and the need for iterative UI refinement. The structured threephase development plan ensures each system module is incrementally built, tested, and validated. The technology stack, centred on Laravel 12, Firebase Realtime Database, and Tailwind CSS, was selected to meet all functional, performance, and security requirements identified in the SRS. The following chapter presents the system design artefacts produced during the planning and design phases. 

19 

## **CHAPTER 4: RESULT AND DISCUSSION** 

## **4.1 Introduction** 

This chapter presents the results obtained from the development and implementation of the Bossku House QR-Based Digital Food Ordering System. It provides a comprehensive overview of all thirteen system features implemented across the four user roles — Guest Customer, Authenticated Customer, Staff, and Administrator. Each feature is described with reference to its functional behaviour and the corresponding interface that was developed. Additionally, this chapter presents the complete system testing results, including all 28 test cases and their outcomes, and provides a detailed discussion of how each project objective was achieved, the technical challenges encountered during development, and the methods through which those challenges were resolved. 

## **4.2 Results** 

## **4.2.1 Overview of System Implementation** 

The Bossku House system is a web-based application that allows customers to place food orders by scanning a unique QR code assigned to their restaurant table. The system integrates Laravel 12 as the backend framework and order synchronisation between customers and staff with Firebase Realtime Database. The frontend is built using Blade Templates, Tailwind CSS, and Vite, providing a responsive, mobile-first interface optimised for smartphone use. 

The implementation encompasses thirteen functional features distributed across three primary modules: the Customer Module (accessible to both Guest and Authenticated Customers), the Staff Module, and the Admin Module. Each feature is described in detail in the subsections below. 

20 

## **4.2.2 Customer Module** 

- **i. QR Code Scanning & Table Detection** 

The QR Code Scanning and Table Detection feature enables the complete contactless entry point to the ordering system. Each restaurant table is assigned a unique QR code encoding a URL in the format /menu?table={table_number}. When a customer scans the QR code using their smartphone's native camera application, the browser navigates to this URL. The MenuController validates the table parameter and stores the table number in the user's PHP session via session(['table_number' => $request->query('table')]). The table number is displayed prominently on the menu interface and is automatically attached to any order placed within the session, eliminating the possibility of table number errors. 

_Figure 4.1: QR Code Scanning — Menu Interface with Table Detection_ 

21 

## **ii. Menu Browsing by Category** 

The Menu Browsing by Category feature presents the full product catalogue in an organised, category-filtered interface. Category filter buttons are displayed at the top of the menu page, allowing customers to filter the product listing by the selected category with a single tap. Each product is rendered as a card displaying the product image, name, description, and price. The interface is designed with a mobile-first responsive layout, ensuring readability and usability on standard smartphone viewport sizes. Product images are displayed at a consistent aspect ratio to maintain visual consistency across all menu items. 

_Figure 4.2: Menu Browsing by Category — Product Cards with Name, Price, Image, and Add to Cart_ 

22 

## **iii. Cart Management** 

The Cart Management feature allows customers to review and modify their selection before placing an order. Customers may adjust the quantity of any cart item using increment and decrement controls, with a minimum quantity of one enforced at the client side. Items may be individually removed from the cart. The cart sidebar or drawer displays a real-time itemised breakdown of all selected products, their quantities, individual prices, and the running cart total. All cart state is managed in the server-side Laravel PHP session, ensuring persistence during the browsing session without requiring database writes for every cart interaction. 

_Figure 4.3: Cart Management Interface — Quantity Adjust, Remove_ 

_Items, View Total_ 

23 

## **iv. Place Order & Unique Reference** 

The Place Order and Unique Reference feature manages the complete order submission workflow. Upon confirming their cart, the customer proceeds to a checkout confirmation page displaying a summary of all ordered items and the final total. On confirmation, the OrderController validates the cart contents and session table number, creates an Order record in the MySQL database, generates a unique order reference in the format #AAAABBBB (e.g., #AHBDDJHS), creates associated OrderItem records capturing each item's product ID, quantity, and unit price at the time of order, and writes the initial order status "Pending" to Firebase. The cart session is then cleared, and the customer is redirected to the real-time order tracking page with their unique reference number displayed. 

_Figure 4.4: Order Placement — Checkout Form and Unique Reference Number (e.g., #AAAABBBB)_ 

24 

## **v. Real-time Order Tracking** 

The Real-time Order Tracking feature enables customers to monitor the progress of their order from placement to service delivery without requiring page refreshes. The order tracking page includes a JavaScript client that initialises a Firebase Realtime Database listener on the path /orders/{order_reference}/status. When the staff member updates the order status on their dashboard, the Firebase listener triggers an immediate DOM update on the customer's tracking page, visually progressing the order status indicator through the states: Pending → Preparing → Served. This real-time communication pathway, facilitated by Firebase's WebSocket-based architecture, ensures status updates are delivered to the customer within approximately one second of the staff action. 

_Figure 4.5: Real-time Order Status Tracking Interface_ 

**vi.** 

25 

## **vii. Loyalty Points & Rewards** 

The Loyalty Points and Rewards feature provides authenticated customers with an incentive programme that rewards repeat ordering. Upon successful order placement, the system automatically calculates and credits loyalty points to the authenticated customer's account, equivalent to 10% of the order total rounded down to the nearest integer. Point transactions are recorded in the loyalty_points table with the associated order reference. Customers may view their current point balance and transaction history on the customer dashboard. The rewards catalogue, accessible to all users, displays available reward items with their associated point costs. Authenticated customers with sufficient points may redeem rewards through the RewardController, which validates the balance, records a negative-value redemption transaction, and confirms the redemption. 

_Figure 4.6: Loyalty Points Dashboard and Rewards Catalogue_ 

**viii.** 

26 

## **ix. Product Reviews** 

The Product Reviews feature allows authenticated customers who have placed orders to submit star ratings and written comments for individual products. The review submission form is accessible from the customer's order history, ensuring that only customers who have genuinely ordered a product may submit a review, maintaining data integrity. Each review captures the star rating (1 to 5), the review text, and the submission timestamp. Reviews are displayed on the product detail page, showing the reviewer's display name, rating stars, comment, and submission date. The aggregate average rating is calculated and displayed alongside the product on the menu interface. 

_Figure 4.7: Product Review Submission Interface_ 

27 

## **x. Staff Dashboard** 

The Staff Dashboard is the central operational interface for restaurant service personnel. It is accessible exclusively to users with the staff role, protected by the staff authentication middleware. The dashboard establishes a Firebase Realtime Database listener on the /orders/ path, enabling automatic DOM injection of new order cards when customers place orders, without requiring any staff-side page action. Each order card displays the order reference number, table number, ordered items with quantities and prices, order timestamp, and current status. Staff members may update the status of any active order to Preparing, Served, or Cancelled by clicking the respective action button. Each status change triggers a simultaneous update to the Firebase database and the corresponding Firebase path, ensuring data consistency across all connected clients. 

_Figure 4.8: Staff Order Management Dashboard_ 

28 

## **xi. Cashier View & Mark as Paid** 

The Cashier View provides a dedicated interface within the staff module for processing payment transactions. The view displays all orders that have reached the Served status and are awaiting payment processing. For each order, the cashier view presents the order reference, table number, full itemised breakdown, and total amount. Staff members confirm payment receipt by clicking the "Mark as Paid" button. This action updates the order status to Paid in the Fisebase database and triggers automatic PDF receipt generation via the laravel-dompdf library. The generated PDF receipt is immediately available for download and may be provided to the customer upon request. 

_Figure 4.9: Cashier View — Order Payment Confirmation and PDF Receipt Trigger_ 

29 

## **xii. Admin Dashboard** 

The Admin Dashboard provides the restaurant administrator with an overview of key system performance metrics. Upon login, the admin is presented with a summary panel displaying the total number of orders for the current day, the total revenue generated for the current period, the top-selling products by order volume, and the total number of registered customers. These aggregated statistics are programmatically compiled from the synchronized order nodes within the Firebase Realtime Database, using server-side collection grouping and timestamp filtering hooks inside the Laravel controller. The admin dashboard serves as the entry point to all administrative modules, accessible via the navigation sidebar. 

_Figure 4.10: Admin Overview Dashboard — Key Performance Metrics_ 

_Summary_ 

30 

## **xiii. Admin CRUD** 

The Admin CRUD module provides the administrator with full Create, Read, Update, and Delete capabilities for three key data entities: product categories, menu products, and the rewards catalogue. The category management interface allows the admin to create new categories with a name and description, edit existing categories, reorder categories for display sequencing, and delete categories (with safeguards preventing deletion of categories containing active products). The product management interface allows the admin to create new menu items with all associated metadata — name, description, unit price, product image upload, category assignment, and an availability toggle that controls visibility to customers. The rewards catalogue management interface enables the admin to add new reward items with their point costs, update existing reward details, and remove rewards from the catalogue. 

_Figure 4.11: Admin CRUD Interfaces — Manage Categories_ 

31 

_Figure 4.12: Admin CRUD Interfaces — Manage Products_ 

_Figure 4.13: Admin CRUD Interfaces — Rewards Catalogue_ 

32 

## **xiv. Admin Analytics & Export** 

The Admin Analytics and Export module presents comprehensive sales performance metrics to the administrator through a dedicated analytics dashboard. Metrics displayed include total revenue and order count for selectable date ranges (daily, weekly, monthly), revenue breakdown by product category, the top five best-selling products by quantity ordered, average order value, and daily order volume trend charts. Data is aggregated directly from the Firebase /orders data structures and child nodes in real time. The report export functionality enables the administrator to download the current analytics view as either a PDF document, rendered using laravel-dompdf with a formatted report layout, or as a CSV file generated using PHP's native CSV output stream functions. This functionality directly addresses the business analytics gap identified in the problem statement. 

_Figure 4.14: Admin Analytics Dashboard — Revenue Metrics and Report Export_ 

33 

## **xv. Moderate Reviews** 

The Review Moderation feature provides the administrator with oversight capabilities over all customer-submitted product reviews. The moderation interface displays a paginated list of all reviews across all products, including the reviewer's name, the product reviewed, the star rating, the review text, and the submission date. The administrator may delete any review deemed inappropriate, offensive, or in violation of the restaurant's content standards. Deleted reviews are permanently removed from the database and are immediately no longer visible on the corresponding product page. This feature ensures the quality and appropriateness of user-generated content displayed to customers. 

_Figure 4.15: Admin Review Moderation Interface — All Customer_ 

_Reviews with Delete Action_ 

34 

## **4.2.3 Test Results Summary** 

A total of 28 test cases were designed and executed to verify the functional correctness, security robustness, and edge case handling of the Bossku House system. Test cases were derived from the use case model and Software Requirements Specification (SRS), covering all four user roles. The test results summary is presented below: 

|**Metric**|**Value**|
|---|---|
|Total Test Cases Executed|28|
|Test Cases Passed|28|
|Test Cases Failed|0|
|Pass Rate|100%|
|Critical Defects|0|
|Minor Defects (UI/UX)|3 (all resolved)|
|Regression Tests|All passed after defect resolution|
|Testing Duration|2 weeks (10 working days)|



_Table 4.1: Test Results Summary_ 

35 

The following table presents the complete results for all 28 executed test cases: 

|**TC**<br>**ID**|**Feature Tested**|**Role**|**Expected Result**|**Result**|
|---|---|---|---|---|
|TC-<br>01|Customer Registration|Auth.<br>Customer|Account created with customer role;<br>redirected to dashboard|Pass|
|TC-<br>02|Customer Login|Auth.<br>Customer|Authenticated; redirected to customer<br>home page|Pass|
|TC-<br>03|QR Code Scan &<br>Table Detection|Guest<br>Customer|Table 5 stored in session; menu<br>displayed with table indicator|Pass|
|TC-<br>04|Menu Browsing by<br>Category|Guest<br>Customer|Products filtered by selected category<br>displayed with images and prices|Pass|
|TC-<br>05|Add Item to Cart|Guest<br>Customer|Item added to session cart; cart count<br>increments correctly|Pass|
|TC-<br>06|Cart Management —<br>Adjust Quantity|Guest<br>Customer|Cart quantity and total update<br>correctly; cannot go below 1|Pass|
|TC-<br>07|Cart Management —<br>Remove Item|Guest<br>Customer|Item removed from cart; total<br>recalculated correctly|Pass|
|TC-<br>08|Place Order & Unique<br>Reference|Guest<br>Customer|Order created in Firebase; unique<br>reference (#AAAABBBB) generated;<br>Firebase updated to Pending|Pass|
|TC-<br>09|Real-time Order<br>Tracking|Guest<br>Customer|Status updates from Pending to<br>Preparing within 1 second on tracking<br>page without page refresh|Pass|
|TC-<br>10|Loyalty Points Earning|Auth.<br>Customer|Points credited to user account (10%<br>of order total); visible in customer<br>dashboard|Pass|
|TC-<br>11|Rewards Redemption|Auth.<br>Customer|Points deducted; redemption recorded;<br>confirmation message displayed|Pass|
|TC-<br>12|Product Review<br>Submission|Auth.<br>Customer|Review saved; visible on product<br>page; star rating displayed correctly|Pass|
|TC-<br>13|View Order History<br>(Customer)|Auth.<br>Customer|All past orders listed with reference<br>numbers, table, status, and total<br>amount|Pass|



36 

|TC-<br>14|Edit Profile / Change<br>Password|Auth.<br>Customer|Profile updated; new password<br>accepted on subsequent login|Pass|
|---|---|---|---|---|
|TC-<br>15|Staff Dashboard —<br>Real-time Orders|Staff|New order card appears within 1<br>second via Firebase listener without<br>page refresh|Pass|
|TC-<br>16|Update Order Status|Staff|Status updated in Firebase; customer<br>tracking page reflects change<br>immediately|Pass|
|TC-<br>17|Cancel Order|Staff|Order status updated to Cancelled in<br>Firebase; removed from active queue|Pass|
|TC-<br>18|Access Cashier View|Staff|Served orders pending payment<br>displayed correctly in cashier view|Pass|
|TC-<br>19|Mark Order as Paid|Staff|Order status updated to Paid in<br>Firebase; PDF receipt generation<br>triggered successfully|Pass|
|TC-<br>20|Generate PDF Receipt|Staff|PDF downloaded with correct order<br>reference, items, quantities, prices,<br>and total|Pass|
|TC-<br>21|View Order History<br>(Staff)|Staff|All past orders displayed with<br>reference, table, status, and total;<br>filterable by date|Pass|
|TC-<br>22|Generate Sales Report|Staff|Report displays accurate order count,<br>revenue, and breakdown for specified<br>period|Pass|
|TC-<br>23|Admin — Manage<br>Categories (CRUD)|Admin|Category created, updated, and<br>deleted correctly; changes reflected in<br>customer menu immediately|Pass|
|TC-<br>24|Admin — Manage<br>Products (CRUD)|Admin|Product lifecycle managed correctly;<br>deactivated product hidden from<br>customer-facing menu|Pass|
|TC-<br>25|Admin — Manage<br>Rewards Catalogue|Admin|Reward item appears in customer<br>rewards catalogue with correct point<br>cost|Pass|
|TC-<br>26|Admin — Moderate<br>Reviews|Admin|Review removed from system; no<br>longer visible on product page|Pass|



37 

|TC-<br>27|Admin — Analytics &<br>Export|Admin|Dashboard displays correct aggregated<br>data; both PDF and CSV files<br>generated and downloaded<br>successfully|Pass|
|---|---|---|---|---|
|TC-<br>28|RBAC —<br>Unauthorised Route<br>Access (Security)|All Roles|Middleware intercepts; user redirected<br>to 403 Forbidden page; no admin data<br>exposed|Pass|



_Table 4.2: Complete Test Case Results — All 28 Test Cases_ 

38 

## **4.3 Discussion** 

## **4.3.1 Achievement of Project Objectives** 

The results presented in Section 4.2 demonstrate that all five stated project objectives have been fully achieved. The following subsections discuss how each objective was met through specific system features and implementation decisions. 

## **Objective 1 — QR-Based Digital Ordering System** 

The first objective — to develop a QR-based digital ordering system enabling order placement via table QR code scan without application installation — was achieved through the implementation of the table-specific URL routing mechanism (/menu/{table}), the session-based table detection module, and the complete customer ordering workflow comprising menu browsing, cart management, and order placement. Test Cases TC-03 through TC-08 collectively validate this objective, confirming that a customer can progress from QR scan to confirmed order with a unique reference number entirely within a mobile web browser. The session storage mechanism reliably propagates the table number through the ordering flow, eliminating manual table number entry and the associated risk of data entry errors. 

## **Objective 2 — Real-time Staff Dashboard via Firebase** 

The second objective — to implement a real-time order management dashboard for staff using Firebase Realtime Database — was achieved. The Firebase listener implemented on the staff dashboard enables new order cards to be injected into the DOM within one second of order placement, without requiring any staff-side page interaction. Test Case TC-15 directly validates this objective, confirming sub-second order notification delivery. Test Cases TC-16 through TC-20 further validate the complete staff workflow from order receipt through payment processing and receipt generation. 

39 

## **Objective 3 — Customer Engagement System (Loyalty, Rewards,** 

## **Reviews)** 

The third objective — to build a customer engagement system incorporating loyalty points accumulation, reward item redemption, and product review submission — was achieved through the implementation of the loyalty_points table, the RewardController, and the Review model with associated validation constraints. Test Cases TC-10, TC-11, and TC-12 validate the three components of this objective respectively, confirming that points are correctly credited on order placement, deducted on reward redemption, and that authenticated customers may submit reviews for products they have ordered. 

## **Objective 4 — Comprehensive Administrative Panel** 

The fourth objective — to provide a comprehensive administrative panel — was achieved through the development of six distinct admin module interfaces: the overview dashboard, CRUD management for categories and products, rewards catalogue management, review moderation, analytics dashboard, and report export. Test Cases TC-23 through TC-27 collectively validate this objective, confirming that all administrative features function correctly with accurate data aggregation and successful report generation in PDF formats 

## **Objective 5 — Role-Based Access Control (RBAC)** 

The fifth objective — to implement RBAC to enforce appropriately scoped access across all user roles — was achieved through the development of three Laravel middleware components: auth (ensuring authentication), admin (verifying the admin role on /admin/* routes), and staff (verifying the staff role on /staff/* routes). Test Case TC-28 directly validates this objective, confirming that an authenticated customer who attempts to access a protected admin route (/admin/products) is intercepted by the admin middleware and redirected to a 403 Forbidden error page without any admin data being exposed. 

40 

## **4.3.2 Technical Challenges and Resolutions** 

During the development of the Bossku House system, three significant technical challenges were encountered. The manner in which each challenge was identified and resolved is documented below. 

## **Challenge 1 — Configuring Firebase Service Account JSON with Laravel** 

The integration of Firebase Realtime Database into the Laravel application via the Kreait Laravel Firebase SDK required the configuration of a Firebase Service Account JSON credential file. The initial challenge arose from correctly specifying the path to the service account JSON file within the Laravel application's environment configuration and ensuring that the Kreait SDK could locate and authenticate with the Firebase project during both local development and simulated production deployments. Incorrect or relative path specifications resulted in authentication exceptions that prevented any Firebase read or write operations. 

This challenge was resolved by storing the service account JSON file in the Laravel storage directory, specifying its absolute path using the storage_path() helper function within the firebase.php configuration file, and adding the service account path to the .env file as 

FIREBASE_CREDENTIALS. This approach ensured consistent credential resolution across different deployment environments. The Kreait SDK documentation and community resources provided guidance on the correct configuration structure, and the resolution was validated by successfully executing test read and write operations on the Firebase Realtime Database from within a Laravel controller. 

41 

## **Challenge 2 — Implementing Real-time Order Polling Without Full Page Refresh** 

A significant challenge was encountered in implementing the real-time order update behaviour on both the staff dashboard and the customer order tracking page without triggering full page refreshes. An initial approach using periodic AJAX polling of the Laravel backend introduced unacceptable latency (typically 5-15 seconds between status changes and client-side updates) and placed unnecessary load on the server database. This approach did not satisfy the sub-second update latency non-functional requirement. 

This challenge was resolved by transitioning to a Firebase Realtime Database listener architecture on the client side. The Firebase JavaScript SDK was initialised on both the staff dashboard and customer tracking pages, with event listeners bound to the relevant /orders/{reference}/status paths using the Firebase onValue() event listener. This WebSocket-based approach eliminated polling latency entirely, delivering status updates to subscribed clients within approximately 0.4 to 0.8 seconds of the server-side write operation. The resolution required careful management of the Firebase listener lifecycle to prevent memory leaks on page navigation, achieved by calling the listener's unsubscribe function within appropriate page lifecycle event handlers. 

42 

## **Challenge 3 — Generating PDF Receipts with Correct Formatting Using DomPDF** 

The implementation of PDF receipt generation using the barryvdh/laravel-dompdf library presented challenges in achieving consistent formatting across the generated PDF output. Specific issues encountered included incorrect rendering of table layouts within the PDF, character encoding problems causing special characters in product names to display incorrectly, and CSS styling defined within the Blade template being only partially applied by the dompdf rendering engine. 

These challenges were resolved through a combination of three targeted interventions. First, the Blade receipt template was refactored to use inline CSS styles rather than linked external stylesheets, as dompdf's CSS support is limited compared to full browser rendering engines. Second, the UTF-8 meta charset declaration was added to the receipt Blade template head section, and the dompdf configuration's defaultFont was set to a Unicode-compatible font, resolving the character encoding issue. Third, the table layout was simplified to use explicit pixel-width columns rather than percentage-based widths, which are not reliably supported by dompdf's layout engine. Following these interventions, all PDF receipts generated correctly with consistent formatting and accurate character rendering, as validated by Test Case TC-20. 

43 

## **4.3.3 System Performance Evaluation** 

Informal performance measurements were conducted during the testing phase to verify compliance with the non-functional performance requirements defined in the SRS: 

- **Menu Page Load Time:** Measured at approximately 1.3 to 1.7 seconds on a 4G-equivalent network connection (10 Mbps download, <100 ms latency), within the requirement of under 2 seconds. 

- **Real-time Order Update Latency:** Firebase-mediated order status updates were observed on the customer tracking page within 0.4 to 0.8 seconds of the staff action, within the requirement of under 1 second. 

- **PDF Receipt Generation Time:** PDF receipts were generated and available for download within 2.1 to 2.8 seconds of the payment confirmation action, considered acceptable for a low-frequency operation. 

- **Concurrent Session Handling:** The system was tested with three simultaneous customer sessions placing orders concurrently. All three orders were correctly created with distinct unique reference numbers and independently tracked, confirming correct session isolation. 

## **4.4 Conclusion of Chapter** 

Chapter 4 has comprehensively presented the results of the Bossku House QR-Based Digital Food Ordering System development, documenting all thirteen system features across the four user roles, the complete 28 test case results with a 100% pass rate, the evaluation of all five project objectives against implementation evidence, and the three principal technical challenges encountered with their documented resolutions. The results confirm that the system successfully fulfils its design specifications and meets the functional and non-functional requirements established in the SRS. The following chapter presents the project conclusion and recommendations for future development. 

44 

## **CHAPTER 5: CONCLUSION** 

## **5.1 Introduction** 

This chapter summarises the overall outcomes of the Bossku House QR-Based Digital Food Ordering System project. It evaluates the degree to which the stated aims and objectives were accomplished, reflects on the significance of the system in the context of Malaysia's food and beverage industry, and presents recommendations for future development that would extend the system's capabilities and commercial applicability. The chapter concludes with a comprehensive summary that reaffirms the project's contribution to the field of software engineering as applied to the hospitality sector. 

## **5.2 Future Recommendations** 

While the developed system successfully meets all primary objectives within the defined project scope, several enhancements are recommended to further expand the system's functionality, improve user experience, and increase its commercial viability for broader deployment: 

- **i. Online Payment Gateway Integration (Stripe / FPX / GrabPay)** 

The highest-priority future enhancement is the integration of an online payment gateway to support fully digital, cashless payment transactions. The recommended integration options for the Malaysian market include Stripe for international card payments, FPX (Financial Process Exchange) for local bank transfer payments via PayNet, and popular e-wallet platforms such as Touch 'n Go eWallet and GrabPay. Implementation would involve integrating the respective payment gateway PHP SDK within the Laravel backend and extending the cashier workflow to present digital payment options alongside the existing cash payment method. This enhancement would enable a fully contactless dining experience — from menu browsing to payment — without any physical interaction between customer and staff. 

45 

## **ii. Dynamic QR Code Generation in Admin Panel** 

An integrated dynamic QR code generation feature within the admin panel would allow the administrator to generate table-specific QR codes on demand, display them for on-screen review and printing, and regenerate them if necessary — for example, when new tables are added to the restaurant layout or when QR codes require periodic rotation for security purposes. Implementation could leverage a PHP QR code generation library such as chillerlan/php-qrcode or endroid/qr-code. This enhancement would remove the current dependency on external QR code generation tools, streamlining restaurant setup and reducing operational friction. 

## **iii. Mobile Application Version (React Native or Flutter)** 

The development of a dedicated native mobile application using either React Native or Flutter would enhance the customer and staff experience through capabilities inherent to native mobile platforms. A native application would enable push notifications for order status updates (see Recommendation vi), access to device-level biometric authentication for faster staff login, and improved performance through native rendering. The existing Laravel backend API endpoints can be extended to serve as a RESTful API for the mobile application without requiring significant backend restructuring. The mobile application would also enable the storage of loyalty points data offline for display without an active internet connection. 

46 

## **iv. AI-Based Product Recommendation Engine** 

An intelligent product recommendation engine, trained on anonymised historical order data stored within the system's Firebase database, could be integrated to surface personalised menu suggestions on the customer-facing menu interface. An initial implementation could employ simple collaborative filtering — identifying patterns such as "customers who ordered item A also ordered item B" — before advancing to more sophisticated machine learning models as the order dataset grows. This capability directly addresses the recommendation engine gap identified in the literature review of smart dining systems and has the potential to meaningfully increase average transaction values through contextual digital upselling 

## **v. Multi-Branch Restaurant Support** 

Extending the system architecture to support multi-branch restaurant operations would substantially increase the platform's commercial applicability for restaurant groups and franchise operators. The data model would require the addition of a branches entity with appropriate foreign key relationships to products, categories, and orders tables. A branch-level administrative role would be introduced, with RBAC authority scoped to that branch's data, while a superadmin role retains cross-branch visibility and configuration authority. This enhancement would allow a single deployment of the Bossku House platform to manage multiple restaurant outlets with shared product catalogues but branch-specific order management and analytics 

47 

## **vi. Push Notifications via Firebase Cloud Messaging (FCM)** 

The implementation of push notifications using Firebase Cloud Messaging (FCM) would enable real-time alert delivery to staff and customers even when they are not actively viewing the system in their browser. For staff, push notifications could alert them to new orders when they are temporarily away from the dashboard view. For customers, push notifications could deliver proactive order status updates (e.g., "Your order #AAAABBBB is now being prepared") directly to their device's notification tray. FCM integration within the existing Firebase infrastructure is architecturally straightforward, requiring the addition of FCM service worker registration on the client side and FCM SDK server calls within the relevant Laravel controllers. This enhancement would improve the responsiveness and user experience of the system across all user roles 

48 

## **5.3 Summary** 

The Bossku House QR-Based Digital Food Ordering System was developed as a Final Year Project in fulfilment of the requirements for the Bachelor of Software Engineering at Universiti Kuala Lumpur, Malaysian Institute of Information Technology. The primary purpose of the system is to digitise and streamline the food ordering process for Bossku House restaurant, replacing manual paper-based workflows with an integrated, real-time, web-based platform accessible via QR code scan. 

The project has successfully achieved all five stated objectives. A QR-based ordering flow accessible via smartphone browser without application installation has been fully implemented and validated. A Firebase Realtime Database-powered staff dashboard delivering sub-second order notifications has been implemented and tested. A customer engagement system encompassing loyalty points accumulation, reward item redemption, and product review submission has been developed and verified. A comprehensive administrative panel with full CRUD management, review moderation, sales analytics, and report export capabilities has been delivered. RoleBased Access Control has been enforced across all user roles through dedicated Laravel middleware, confirmed by targeted security test cases. 

A total of 28 test cases were designed and executed across all four user roles — Guest Customer, Authenticated Customer, Staff, and Administrator — with all 28 test cases passing successfully, yielding a 100% pass rate and zero critical defects. Three technical challenges encountered during development — Firebase service account configuration, real-time order update implementation, and PDF receipt formatting — were each systematically identified and resolved, demonstrating the team's engineering problem-solving capability. 

49 

The significance of the Bossku House system extends beyond the immediate context of its target restaurant. The project demonstrates that a full-featured, enterprise-grade digital ordering system — incorporating real-time order management, a loyalty programme, administrative analytics, and comprehensive RBAC — can be successfully designed, developed, and validated within an academic Final Year Project timeline using open-source frameworks and freely available cloud services. The system presents a cost-effective, proprietary alternative to commission-based third-party ordering platforms, providing independent restaurant operators with full control over their digital ordering infrastructure. 

In conclusion, the Bossku House system successfully demonstrates how a QRbased digital ordering platform can modernise restaurant operations, reduce customer waiting times, improve order accuracy through digitalisation, and provide restaurant administrators with real-time analytics for better business decision-making. The system provides a validated foundation for future enhancements — including online payment gateway integration, push notifications via FCM, and multi-branch support — that would further expand its commercial applicability and user value. 

50 

## **REFERENCES** 

- Alberlianasari, F., Nabilah, S., Rahmawati, S. D., & Ekonomi, J. P. (n.d.). _CURRENT ADVANCED RESEARCH ON SHARIA FINANCE AND ECONOMIC WORLDWIDE (CASHFLOW) Volume 1 ISSUE 4 (2022) CURRENT ADVANCED RESEARCH ON SHARIA FINANCE AND ECONOMIC WORLDWIDE | CASHFLOW https://ojs.transpublika.com/index.php/CASHFLOW/ IMPLEMENTATION OF QR CODES ON ICHIBAN SUSHI RESTAURANT’S DISH MENU ON ORDER TIME EFFICIENCY AND CUSTOMER SATISFACTION LEVEL_ . Retrieved 

https://ojs.transpublika.com/index.php/CASHFLOW/ 

- Iskender, A., Sirakaya-Turk, E., Cardenas, D., & Hikmet, N. (2024). Restaurant patrons’ intentions toward QR code menus in the U.S. during COVID-19: acceptance of technology adoption model (ATAM). _Journal of Foodservice Business Research_ , _27_ (5), 497–522. 

https://doi.org/10.1080/15378020.2022.2133518 

- Iswarya, V., & Swamydoss, Dr. D. (2024). QR Code Based Smart Dining System. _International Journal of Research Publication and Reviews_ , _5_ (4), 1103–1106. https://doi.org/10.55248/gengpi.5.0424.0929 

- Lin, P. M. C., Au, W. C. W., & Baum, T. (2024). Service quality of online food delivery mobile application: an examination of the spillover effects of mobile app satisfaction. _International Journal of Contemporary Hospitality Management_ , _36_ (3), 906–926. https://doi.org/10.1108/IJCHM-09-2022-1103 

- Ozturkcan, S., & Kitapci, O. (2025). A sustainable solution for the hospitality industry: The QR code menus. _Journal of Information Technology Teaching Cases_ , _15_ (1), 2–7. https://doi.org/10.1177/20438869231181599 

- Yiğitoğlu, V., Şahin, E., Güneri, B., & Demir, M. Ö. (2025). The Impact of Sustainable QR Menus on Service Quality and Customer Satisfaction: The Moderating Role of Perceived Risk. _Sustainability (Switzerland)_ , _17_ (5). https://doi.org/10.3390/su17052323 

51 

## **APPENDICES** 

## **Appendix A: Full List of 28 Test Cases with Detailed Steps** 

The following table presents all 28 test cases with their complete test procedures, expected results, and execution outcomes: 

|**TC**<br>**ID**|**Feature**|**Role**|**Test Steps**|**Expected Result**|**Result**|
|---|---|---|---|---|---|
|TC-<br>01|Customer<br>Registration|Auth.<br>Customer|1. Navigate to<br>/register<br>2. Enter valid name,<br>email, password,<br>confirm password<br>3. Click Register|Account created with<br>customer role; user<br>redirected to<br>customer dashboard|Pass|
|TC-<br>02|Customer Login|Auth.<br>Customer|1. Navigate to /login<br>2. Enter valid<br>registered email and<br>password<br>3. Click Login|User authenticated;<br>redirected to<br>customer home page;<br>session established|Pass|
|TC-<br>03|QR Code Scan<br>& Table<br>Detection|Guest<br>Customer|1. Navigate to<br>/menu?table=5<br>2. Check session for<br>table_number<br>3. Verify table<br>indicator on page|Table number 5<br>stored in session;<br>menu displayed with<br>table 5 indicator<br>visible|Pass|
|TC-<br>04|Menu Browsing<br>by Category|Guest<br>Customer|1. Open menu page<br>2. Click a category<br>filter button<br>3. Verify products<br>displayed|Products filtered by<br>selected category;<br>other categories<br>hidden; correct<br>images and prices<br>shown|Pass|
|TC-<br>05|Add Item to<br>Cart|Guest<br>Customer|1. On menu page,<br>click "Add to Cart"<br>on a product|Item added to session<br>cart; cart count badge<br>increments by 1|Pass|



52 

||||2. Check cart count<br>badge|||
|---|---|---|---|---|---|
|TC-<br>06|Cart Qty<br>Adjustment|Guest<br>Customer|1. Open cart<br>2. Click increment<br>(+) on item<br>3. Click decrement (-<br>) on item<br>4. Verify total<br>updates|Quantity and total<br>update correctly;<br>decrement stops at 1|Pass|
|TC-<br>07|Remove Cart<br>Item|Guest<br>Customer|1. Open cart<br>2. Click "Remove"<br>on an item<br>3. Verify cart state|Item removed; total<br>recalculated; cart<br>shows remaining<br>items|Pass|
|TC-<br>08|Place Order &<br>Reference<br>Generation|Guest<br>Customer|1. Add 2+ items to<br>cart<br>2. Proceed to<br>checkout<br>3. Confirm order<br>4. Check order<br>reference|Order created in<br>Firebase; unique<br>reference<br>(#AAAABBBB)<br>displayed; Firebase<br>status = Pending|Pass|
|TC-<br>09|Real-time Order<br>Tracking|Guest<br>Customer|1. Place order<br>2. Note reference<br>number<br>3. Open tracking<br>page<br>4. Staff updates<br>status to Preparing|Status on tracking<br>page changes from<br>Pending to Preparing<br>within 1 second; no<br>page refresh required|Pass|
|TC-<br>10|Loyalty Points<br>Earning|Auth.<br>Customer|1. Login as<br>authenticated<br>customer<br>2. Place an order of<br>RM 50<br>3. Check loyalty<br>points balance|50 points credited to<br>account (100% of<br>RM 50); transaction<br>recorded in<br>loyalty_points table|Pass|
|TC-<br>11|Rewards<br>Redemption|Auth.<br>Customer|1. Login with<br>sufficient points|Points deducted;<br>redemption|Pass|



53 

||||2. Navigate to<br>rewards catalogue<br>3. Select a reward<br>4. Confirm<br>redemption|transaction recorded;<br>confirmation<br>message displayed;<br>balance updated||
|---|---|---|---|---|---|
|TC-<br>12|Product Review<br>Submission|Auth.<br>Customer|1. Login<br>2. Navigate to order<br>history<br>3. Select an ordered<br>product<br>4. Submit 5-star<br>review with text|Review saved in<br>database; visible on<br>product page; star<br>rating displayed<br>correctly|Pass|
|TC-<br>13|View Order<br>History<br>(Customer)|Auth.<br>Customer|1. Login<br>2. Navigate to<br>/customer/orders|All past orders listed<br>with reference, table,<br>date, status, and total<br>amount|Pass|
|TC-<br>14|Edit Profile /<br>Change<br>Password|Auth.<br>Customer|1. Login<br>2. Navigate to profile<br>settings<br>3. Update display<br>name<br>4. Change password<br>5. Login with new<br>password|Profile updated; new<br>password accepted<br>on subsequent login<br>attempt|Pass|
|TC-<br>15|Staff Dashboard<br>Real-time|Staff|1. Login as staff<br>2. Open staff<br>dashboard<br>3. (Another device)<br>Place new order|New order card<br>appears on dashboard<br>within 1 second via<br>Firebase listener; no<br>refresh needed|Pass|
|TC-<br>16|Update Order to<br>Preparing|Staff|1. Login as staff<br>2. Locate active<br>order on dashboard<br>3. Click "Preparing"|Order status updated<br>to Preparing in<br>Firebase; customer<br>tracking page reflects<br>change|Pass|



54 

|TC-<br>17|Update Order to<br>Served / Cancel|Staff|1. Click "Served" on<br>a Preparing order<br>2. Click "Cancel" on<br>another order|Statuses updated in<br>Firebase; UI reflects<br>changes instantly|Pass|
|---|---|---|---|---|---|
|TC-<br>18|Access Cashier<br>View|Staff|1. Login as staff<br>2. Navigate to<br>cashier view|Served orders<br>pending payment<br>displayed; order<br>details visible with<br>totals|Pass|
|TC-<br>19|Mark Order as<br>Paid|Staff|1. In cashier view,<br>click "Mark as Paid"<br>on a Served order|Order status updated<br>to Paid in Firebase;<br>PDF receipt<br>generation triggered;<br>confirmation shown|Pass|
|TC-<br>20|Generate PDF<br>Receipt|Staff|1. Mark an order as<br>paid<br>2. Click "Download<br>Receipt"|PDF downloaded;<br>contains correct<br>order reference,<br>table, items,<br>quantities, prices,<br>total|Pass|
|TC-<br>21|View Order<br>History (Staff)|Staff|1. Login as staff<br>2. Navigate to order<br>history page|Complete history of<br>all orders displayed<br>with reference, table,<br>status, and total; date<br>filtering works|Pass|
|TC-<br>22|Generate Sales<br>Report|Staff|1. Navigate to sales<br>report<br>2. Select date range<br>(last 7 days)<br>3. Generate report|Report displays<br>accurate total orders<br>and revenue for<br>specified period|Pass|
|TC-<br>23|Admin<br>Category<br>CRUD|Admin|1. Login as admin<br>2. Create category<br>"Beverages"<br>3. Edit name to<br>"Cold Beverages"<br>4. Delete category|Category lifecycle<br>managed correctly;<br>changes immediately<br>reflected in customer<br>menu navigation|Pass|



55 

|TC-<br>24|Admin Product<br>CRUD|Admin|1. Create new<br>product with image<br>2. Update its price<br>3. Toggle availability<br>to inactive|Product created,<br>updated, and<br>deactivated correctly;<br>inactive product<br>hidden from<br>customer menu|Pass|
|---|---|---|---|---|---|
|TC-<br>25|Admin Rewards<br>Catalogue|Admin|1. Add new reward<br>"Free Drink" with 50<br>points<br>2. Verify in<br>catalogue|Reward appears in<br>customer-facing<br>catalogue with<br>correct name and<br>point cost|Pass|
|TC-<br>26|Admin<br>Moderate<br>Reviews|Admin|1. Login as admin<br>2. Navigate to review<br>moderation<br>3. Delete a test<br>review|Review permanently<br>deleted; no longer<br>visible on product<br>page or review<br>listing|Pass|
|TC-<br>27|Admin<br>Analytics &<br>Export|Admin|1. View analytics<br>dashboard<br>2. Export as PDF<br>3. Export as CSV|Dashboard shows<br>correct data; PDF<br>and CSV files<br>generated<br>successfully with<br>accurate data|Pass|
|TC-<br>28|RBAC —<br>Unauthorised<br>Access<br>(Security)|All Roles|1. Login as<br>authenticated<br>customer<br>2. Directly navigate<br>to /admin/products in<br>browser|Request intercepted<br>by admin<br>middleware; user<br>redirected to 403<br>Forbidden; no admin<br>data exposed|Pass|



_Table A.1: Complete 28 Test Cases with Detailed Steps_ 

56 

## **Appendix B: Software Requirements Specification (SRS)** 

## **B.1 Functional Requirements** 

|**ID**|**Functional Requirement**|
|---|---|
|FR-01|The system shall support unique QR code URLs per table (e.g., /menu?table=5).|
|FR-02|The system shall store the table number in the customer session upon QR scan.|
|FR-03|The table number shall be automatically attached to every order placed within the<br>session.|
|FR-04|The menu shall display product name, description, price, and image for each item.|
|FR-05|The system shall allow customers to add items to a cart and adjust quantities.|
|FR-06|The system shall generate a unique reference number for every successfully placed<br>order.|
|FR-07|The system shall write order status to Firebase Realtime Database upon order creation.|
|FR-08|The staff dashboard shall update automatically when a new order is placed (via<br>Firebase listener).|
|FR-09|Staff shall be able to update order status to Preparing, Served, or Cancelled.|
|FR-10|The system shall allow authenticated customers to earn loyalty points upon order<br>placement.|
|FR-11|The system shall allow authenticated customers to redeem reward items using loyalty<br>points.|
|FR-12|Authenticated customers shall be able to submit star ratings and text reviews for<br>ordered products.|
|FR-13|Staff shall be able to access a cashier view to mark orders as Paid.|
|FR-14|The system shall generate a PDF receipt for every paid order.|
|FR-15|Admin shall be able to perform CRUD operations on product categories and products.|
|FR-16|Admin shall be able to manage the rewards catalogue with associated point costs.|
|FR-17|Admin shall be able to view and delete customer reviews (review moderation).|
|FR-18|Admin shall be able to view sales analytics and export reports in CSV and PDF<br>formats.|



_Table B.1: Functional Requirements_ 

57 

## **B.2 Non-Functional Requirements** 

|**Category**|**Non-Functional Requirement**|
|---|---|
|Performance|Menu page must load in under 2 seconds on a 4G network connection.<br>Real-time order status updates must be delivered within 1 second via<br>Firebase.|
|Security|All admin routes protected by admin middleware. All staff routes<br>protected by staff middleware. Authentication required for all protected<br>routes. RBAC enforced across all four user roles.|
|Usability|The QR scan to order submission flow must be completable by a first-<br>time user without instructional guidance. Interface must be accessible on<br>mobile viewports.|
|Responsiveness|Customer-facing interfaces must be fully responsive and optimised for<br>mobile viewport sizes (min. 375px width).|
|Maintainability|Codebase shall follow Laravel MVC architecture and PSR-12 PHP<br>coding standards. Database operations shall use Eloquent ORM.|
|Availability|System shall maintain 99.9% availability during restaurant operating<br>hours (8:00 AM to 11:00 PM).|
|Scalability|System shall support a minimum of 20 concurrent customer ordering<br>sessions without performance degradation.|



_Table B.2: Non-Functional Requirements_ 

58 

## **Appendix C: Use Case Diagram** 

_Figure C.1: Use Case Diagram — All Actors (Guest Customer, Authenticated Customer, Staff, Administrator) and System Use Cases_ 

59 

