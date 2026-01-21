# real-estate-microservices
Microservices-based real estate application using .NET Core, Spring Boot, and MySQL.
# Real Estate Microservices Project

## Project Overview

This project is a **Real Estate Management System** built using a **microservices architecture**.
The system is divided into multiple backend services, where **each service is responsible for a specific business capability**.

In this project:

* **Spring Boot** is used for the majority of business and admin functionalities
* **ASP.NET Core** is used exclusively for the **Payment microservice**

The project is designed to follow **industry-level architecture practices** and is suitable for learning, portfolio, and interview purposes.

---

## Architecture Overview

This repository follows a **monorepo structure** containing multiple independent microservices.

```
real-estate-microservices
 ├── payment-dotnet-service      # Payment microservice (.NET)
 ├── springboot-services         # All other backend services (Spring Boot)
 ├── frontend                    # Frontend application (planned)
 └── README.md                   # Project documentation
```

---

## Backend Services

### 1. Payment Microservice (.NET)

**Technology Stack:**

* ASP.NET Core Web API
* Entity Framework Core
* MySQL

**Responsibilities:**

* Payment processing
* Transaction management
* Payment status tracking

**Reason for using .NET:**

* Strong type safety
* Reliable handling of financial transactions
* Clean and secure API design

**Folder:**

```
payment-dotnet-service/
```

---

### 2. Spring Boot Services

**Technology Stack:**

* Spring Boot
* Spring Data JPA
* MySQL

**Responsibilities:**

* Customer Management
* Admin Management
* Owner Management
* Real Estate Projects
* Bookings
* Referrals
* Documents
* Feedbacks

Each service is designed following **separation of concerns** and can be scaled independently if required.

**Folder:**

```
springboot-services/
```

---

## Frontend (Planned)

**Technology (planned):**

* React / Angular / HTML, CSS, JavaScript

**Responsibilities:**

* User interface for customers and admins
* Communication with backend services via REST APIs

**Folder:**

```
frontend/
```

The frontend will be added after backend services are stable.

---

## Database Design

* Database: MySQL
* Each microservice owns its **own database schema**
* No direct database sharing between microservices

---

## Running the Services (High-Level)

### Payment Microservice (.NET)

1. Open the project in Visual Studio
2. Configure `appsettings.json`
3. Run the application
4. Access Swagger UI for API testing

### Spring Boot Services

1. Open the project in IntelliJ IDEA / Eclipse
2. Configure `application.yml` or `application.properties`
3. Run the services
4. Test APIs using Swagger or Postman

---

## Learning Objectives

* Understand microservices architecture
* Implement service-to-service communication
* Apply clean backend project structure
* Work with multiple backend technologies in a single system

---

## Contributors

* Project Developer(s): Repository Owner / Team

---

## Notes

* This project is built for learning and portfolio purposes
* The architecture follows real-world backend development practices
* Services are designed to be independently developed and maintained

---

Status: Backend development in progress

