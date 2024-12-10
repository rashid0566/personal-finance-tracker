# ECS781PFinanceTracker
CLOUD COMPUTING Personal Finance Tracker

## About
In today's digital age, where financial data is scattered across multiple platforms, managing and analyzing personal finances can be overwhelming. The use of the Plaid API is instrumental in simplifying this process, offering seamless access to aggregated financial data from diverse institutions. It provides not only detailed insights into transactions and balances but also contextual information to empower better financial decision-making.

This project, the Personal Finance Tracker, is a financial application that enables secure user interactions with financial data by integrating a front-end, a back-end application server hosted on Google Cloud, a lightweight SQLite database, and the Plaid API. The front-end acts as the user interface, allowing users to input data, make requests, and view results. It communicates with the back-end using secure HTTPS protocols and standard HTTP methods such as GET, POST, PUT, and DELETE. The back-end application server, built with Node.js and Express.js, serves as the processing core of the application. It manages the business logic, processes incoming requests, and routes them to the appropriate services. The back-end also uses tools like Ngrok during development to expose local servers to the internet to create a secure tunnel.

A key feature of the project is its integration with the Plaid API, a financial data aggregation service. Using tokens such as PUBLIC_TOKEN for authorization and ACCESS_TOKEN for secure data access, the application retrieves financial data like bank account information, transactions, and balances. The Plaid API integration ensures that sensitive user data is securely accessed and processed. The application server also interacts with a SQLite database hosted on Google Cloud, which serves as a lightweight, serverless solution for storing persistent data, such as user credentials, financial records, and transaction details.

### Pre-requisites:

●	Late version of Javascript

●	Google Cloud Platform Account

●	Plaid API Account

## Node.js & Express.js Structure
``` JavaScript
.
|──────Personal_Finance_Tracker/ 
| |────public/
| | |────js/
| | |──────client.js
| | |──────client(copy).js
| | |──────link.js
| | |──────signin.js
| | |──────utils.js
| | |────index.html
| |────server
| | |────routs
| | |──────db.js
| | |──────plaid.js
| | |──────server.js
| | |──────simpleTransactionObject.js
| | |──────utils.js
| | |──────webhookServer.js
| |────node_modules
| | |────100+_folders
```
## System Overview 
The entire workflow begins with the front-end sending requests (e.g., fetching user financial data) to the back-end server. The server processes these requests by communicating with the database and the Plaid API as needed. The results are then returned to the front-end, where they are presented to the user in a clear, user-friendly format. This architecture supports real-time processing, secure data handling, and efficient database operations, making it ideal for applications like personal finance dashboards, budgeting tools, and expense trackers.

### Cloud account
A Google Cloud account provides access to Google Cloud Platform (GCP) services for building and managing applications and infrastructure. Upon creating an account, it is possible to organize resources into projects, which act as containers for billing, APIs, and resource management.

Each project is linked to a billing account, ensuring costs are tracked and invoiced. Users can manage access through roles and permissions using Identity and Access Management (IAM). GCP services are accessed via the console, APIs, or SDKs, and resources are billed based on usage, offering scalability and flexibility.

### Terms used for Personal Finance Tracker
The Plaid API is primarily used for account aggregation, allowing users to link multiple bank accounts to retrieve and consolidate financial data, such as balances and transactions, in one place. It is also ideal for personal finance management applications, enabling users to track spending, manage budgets, and monitor financial health. Additionally, the API supports expense categorization, automatically classifying transactions into categories like groceries, utilities, or entertainment, making budgeting and expense tracking seamless. These features make Plaid a powerful tool for creating efficient, user-focused financial applications.

### Plaid public key and private key 
The Plaid API employs a public and private key system to securely handle sensitive data. The public key is used to encrypt data transmitted from the client to Plaid's servers. It is safe to share the public key, as it cannot decrypt data. The private key, stored securely on Plaid's servers, is used to decrypt the data encrypted with the public key, ensuring only Plaid can access sensitive information.
This asymmetric encryption process protects data from interception during transmission. In addition to encryption, API requests are authenticated using credentials like a client_id and secret. Together, these mechanisms ensure secure and authorized communication.
Public keys are exposed on the frontend, while private keys remain confidential. This system supports data security and compliance, safeguarding users' financial information when interacting with Plaid services.

## System Architecture 
![image](https://github.com/user-attachments/assets/ddbbe21c-fdd5-42d1-90d4-bd12c17e4bb6)

## Application Overview 
Homepage
![Homepage](https://github.com/user-attachments/assets/68602dee-e7b8-4955-b063-089c01318dd0)

Create Account Page
![Logged_in](https://github.com/user-attachments/assets/561a1808-436b-47b4-978e-c47658491e60)

Logged in Page
![Logged_In](https://github.com/user-attachments/assets/bf426253-329d-4c05-943c-25abf2455a9e)

Displayed transactions
![Transactions](https://github.com/user-attachments/assets/64cc0b9b-3c4f-44fe-9e7a-0e16f5c6dae6)


## Application Architecture

### JavaScript
JavaScript is a programming language used to create dynamic and interactive effects within web browsers. It enables client-side functionality, allowing for things like form validation, animations, and content updates without reloading the page. JavaScript interacts with HTML to manipulate page elements and CSS to control styling. It runs on the user's device, improving web application performance.

### node.js and express framework
Node.js is a robust and efficient JavaScript runtime designed to simplify the process of building server-side applications. It provides a powerful non-blocking I/O model and an event-driven architecture, making web development in JavaScript highly scalable and performant. Its versatility and asynchronous nature make it a preferred choice for developing a dynamic, real-time applications.
The Express framework, built on top of Node.js, enhances its capabilities by offering a lightweight yet powerful framework for building web applications and APIs. Express simplifies routing and middleware integration while remaining flexible and unopinionated, allowing developers to structure their applications as they see fit. Together, Node.js and Express provide a comprehensive toolkit for creating efficient, fast, and scalable web applications.

### RESTful-API get post
A REST API, or Representational State Transfer Application Programming Interface, is designed based on REST architectural principles. It facilitates communication with RESTful web services, adhering to the foundational concepts outlined by computer scientist Roy Fielding. The term REST emphasizes the concept of representational state transfer as the core methodology.

### CRUD Operations 
CRUD, an acronym for Create, Read, Update, and Delete, represents the fundamental operations for managing data in a database. Many HTTP-based services implement CRUD functionalities using REST or REST-like APIs.
These operations align with specific HTTP methods as follows:

●	GET: Retrieves the representation of a resource at a given URI. It is a read-only operation with no side effects on the server.

●	PUT: Updates an existing resource at a specified URI. It can also create a resource if the server permits clients to define new URIs. However, in this context, the API will not support resource creation via PUT.

●	POST: Adds a new resource, allowing the server to generate a URI for the new object and return it in the response.

●	DELETE: Removes a resource at the specified URI.

### External APIs Used
An API, or Application Programming Interface, is a collection of guidelines and specifications designed to facilitate the creation and integration of software applications. It acts as a contract between the provider of information and the consumer, defining the data needed from the requester (the call) and the information to be delivered by the provider (the response).
The project leverages several APIs, including the Plaid API, detailed below.

### The Plaid API
The Plaid API is a specialized tool designed to provide streamlined access to financial data from multiple institutions, enabling developers to create applications for personal finance management, payment processing, and more. It ensures secure handling of user authentication and facilitates the retrieval of information related to bank accounts, transactions, balances, and financial insights.
Using encrypted connections to financial institutions, the Plaid API delivers a structured approach to accessing and managing financial data. Its endpoints support functions such as authentication, account and transaction data retrieval, balance inquiries, and data categorization. This enables developers to build robust financial applications, allowing users to securely link their bank accounts, track spending habits, verify income, and simplify payment workflows.

## Cloud Infrastructure 
Cloud computing infrastructure refers to the combination of hardware and software components required to support cloud computing. This includes computing power, networking capabilities, storage solutions, and user interfaces that provide access to virtualized resources. These virtual resources replicate traditional physical infrastructure, encompassing elements like servers, network switches, memory, and storage systems.
### Advantages of Cloud Computing Infrastructure
Cloud infrastructure delivers the same functionalities as physical systems but with added advantages such as reduced ownership costs, enhanced flexibility, and improved scalability.
Cloud computing infrastructure is versatile, supporting private, public, and hybrid cloud environments. Additionally, businesses can opt to rent these components from a cloud service provider through Infrastructure as a Service (IaaS). Such systems integrate hardware and software seamlessly, often offering centralized management tools for overseeing multiple cloud environments.
### Google Cloud 
#### Why Choose Google Cloud?
Google Cloud Platform (GCP) offers a more focused range of services compared to AWS and Azure, which boast a broader global data center network. However, GCP excels in three key areas: big data, machine learning, and analytics. It provides robust scalability, reliable load balancing, and exceptionally low response times. Notably, Google’s pioneering work in developing Kubernetes gives its container services a distinct edge, which is now a standard adopted by competitors like AWS and Azure.
GCP is often used as a secondary provider in hybrid cloud solutions but has gained traction among organizations that compete directly with Amazon and prefer not to rely on AWS. Its strong orientation toward open-source technologies and DevOps practices makes it a favorite among developers, though it may not integrate seamlessly with Microsoft Azure.
GCP's distributed architecture offers significant benefits, including redundancy to ensure resilience during failures and reduced latency by positioning resources closer to users. However, this distribution also necessitates adherence to specific rules for resource utilization and management.

### VM database 
A VM (Virtual Machine) database refers to a database system running on a virtualized environment instead of physical hardware. Virtual machines allow multiple operating systems to run on a single physical machine, enabling database instances to operate independently while sharing the underlying hardware.
This approach offers flexibility and scalability, as database instances can be easily provisioned, replicated, or migrated between virtual machines. It is cost-effective, reducing the need for dedicated hardware and maximizing resource utilization. VMs provide isolation, ensuring that each database environment remains secure and unaffected by others running on the same hardware.
A VM database can benefit from backup and snapshot capabilities inherent to virtual machines, simplifying disaster recovery and maintenance tasks. However, performance might be slightly reduced compared to running databases on dedicated physical hardware due to resource sharing.
Common use cases include development, testing environments, or applications requiring flexibility in deployment without investing in dedicated infrastructure. VM databases are compatible with popular virtualization platforms like VMware, Hyper-V, and cloud services such as AWS, Azure, and Google Cloud.
### SQLite
SQLite is a lightweight, self-contained, serverless database engine widely used in applications where simplicity and efficiency are crucial. It stores data in a single file, making it portable and easy to manage. As an embedded database, it requires no setup or configuration and supports standard SQL syntax.
SQLite is highly reliable, with ACID-compliant transactions ensuring data integrity. It’s ideal for small to medium-sized applications, mobile apps, and prototyping. Its open-source nature makes it free to use and integrate into various projects. Despite its simplicity, it delivers robust performance for many use cases.

### NFS
NFS (Network File System) is a distributed file system protocol that allows users to access and interact with files on a remote server as if they were on their local machine. Developed by Sun Microsystems, it operates over a network, enabling file sharing across UNIX, Linux, and other systems.
NFS provides a centralized storage solution, simplifying data management and reducing duplication. It uses the client-server model, where a server hosts the files, and clients mount the server's file systems to access the data. NFS supports various authentication and security mechanisms to protect data during transmission.
It is commonly used in environments requiring shared access to files, such as enterprise networks and cloud storage solutions. While convenient, NFS performance may be affected by network latency, and its reliability depends on proper configuration and infrastructure stability.

## Security 

### Ngrok 
Ngrok is a useful tool for developers in need of accessing their local development. Server or testing integrations that require internet access without deploying to a production server.
Ngrok provides a public URL to create a secure tunnel to a local development server with others. Ngrok is mainly used to test APIs, webhooks or remote access of the local server from a different machine over the internet. 

### Hashing using bcrypt
Hashing is a one-way process that converts input data into a fixed-length string of characters, typically a hash value. It is commonly used for storing passwords securely, as the original data cannot be easily recovered from the hash. bcrypt is a widely used hashing algorithm designed specifically for password security. It includes a salt, which is random data added to the password before hashing to prevent attacks like rainbow table attacks.

