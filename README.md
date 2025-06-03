# 🚗 Car Dealership Management System

A comprehensive REST API for managing car dealership operations, built with TypeScript, Express.js, and MongoDB.

## 🎯 Project Philosophy

This project was designed with several key principles in mind:

### **Domain-Driven Design (DDD)**
The codebase is organized around business domains rather than technical layers. Each module ([`cars`](src/modules/cars/), [`customers`](src/modules/customers/), [`managers`](src/modules/managers/), [`orders`](src/modules/orders/)) represents a distinct business capability with its own models, services, controllers, and validation logic.

### **Clean Architecture**
I maintained strict separation of concerns:
- **Controllers** handle HTTP requests/responses
- **Services** contain business logic
- **Models** define data structures and persistence
- **Middleware** handles cross-cutting concerns
- **Utilities** provide reusable functionality

### **Type Safety First**
Every aspect of the application is strongly typed, from database schemas to API endpoints, ensuring compile-time error detection and better developer experience.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- npm

### Installation
```bash
# Clone and install
git clone git@github.com:Skywonda/vobb-backend-assesment.git
cd vobb-backend-assesment
npm install

# Environment setup
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Database seeding
npm run seed

# Start development server
npm run dev
```


### Testing
```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

---

## 🏗️ Architecture Overview

### **Modular Monolith Structure**

Each module follows the same internal structure pattern. For example, the [`cars` module](src/modules/cars/):

```
cars/
├── models/                 # Data schemas
│   ├── car.model.ts       # Car document schema
│   └── category.model.ts  # Category document schema
├── services/              # Business logic
│   ├── cars.service.ts    # Car operations
│   └── category.service.ts
├── types/                 # TypeScript definitions
├── validations/           # Input validation schemas
├── tests/                 # Module-specific tests
├── cars.controller.ts     # HTTP request handlers
└── cars.routes.ts         # Route definitions
```

This structure provides:
- **High Cohesion**: Related functionality is grouped together
- **Loose Coupling**: Modules interact through well-defined interfaces
- **Scalability**: Easy to extract modules into microservices later
- **Maintainability**: Clear boundaries make the codebase easier to navigate

### **Data Flow Architecture**

```
Request → Middleware → Controller → Service → Model → Database
                ↓
Response ← ResponseHandler ← Controller ← Service ← Model ← Database
```

See the [request flow implementation](src/app.ts#L30-L50) in the main application file.


- **Customers**: Can browse cars, place orders, manage their profiles
- **Managers**: Full CRUD operations on inventory, order management, category management

### **JWT-Based Authentication**
The authentication implementation in [`auth.middleware.ts`](src/shared/middleware/auth.middleware.ts) provides:
- **Stateless**: No server-side session storage required
- **Scalable**: Easy to distribute across multiple servers
- **Flexible**: Separate authentication flows for different user types

### **Security Middleware Pipeline**
Example from [`cars.routes.ts`](src/modules/cars/cars.routes.ts#L35-L41):
```typescript
// Manager-only endpoint
router.post('/',
  authenticateManager,           // Verify JWT & extract user
  validateRequest(createCarSchema), // Validate input data
  asHandler(carController.create)   // Type-safe handler
);
```

The middleware chain ensures:
1. **Authentication**: Valid JWT token with correct user type
2. **Validation**: Input data matches expected schema
3. **Type Safety**: Request handlers are properly typed

I initially attempted to use [`AuthenticatedRequest`](src/shared/types/express.types.ts) and [`asHandler`](src/shared/types/express.types.ts) for stronger typing, but opted for standard Express `Request` interface for simplicity when encountering type conflicts during development.


## 🛡️ Error Handling Strategy

### **Centralized Error Management**
Custom error classes in [`common.errors.ts`](src/shared/errors/common.errors.ts) provide:
- **Consistent API responses**
- **Proper HTTP status codes**
- **Detailed error messages**
- **Stack trace management**

```typescript
// Custom error hierarchy
AppError (base)
├── NotFoundException (404)
├── ConflictException (409)
├── UnauthorizedException (401)
├── ForbiddenException (403)
└── ValidationException (422)
```

### **Global Response Handler**
The [ResponseHandler utility](src/shared/utils/response.handler.ts#L65-L85) ensures all api response and errors flow through a single handler:
- **Consistent response format**
- **Security**: No sensitive data leakage
- **Development feedback**: Stack traces in dev mode


### **Validation at Startup**
Environment variables are validated using [`env.validation.ts`](src/shared/config/env.validation.ts) on application start:
- **Required variables**: Fail fast if missing
- **Type checking**: Ensure correct data types using Zod
- **Default values**: Sensible fallbacks for development

## 📊 API Design Principles

### **RESTful Resource Design**
Route definitions in files like [`cars.routes.ts`](src/modules/cars/cars.routes.ts) follow REST conventions:
- **Consistent naming**: Plural nouns for collections
- **HTTP methods**: Semantic usage (GET, POST, PUT, DELETE)
- **Status codes**: Proper HTTP semantics
- **Resource nesting**: Logical relationships (`/orders/:id/payment`)

### **Response Format Standardization**
The [ResponseHandler](src/shared/utils/response.handler.ts#L13-L23) ensures consistent API responses:
```typescript
interface ApiResponse<T = any> {
  status: boolean;
  data?: T;
  message?: string;
  metadata?: {
    pagination?: PaginationInfo;
  };
}
```

### **Input Validation Pipeline**
Every endpoint validates input using Zod schemas. See [`car.validation.ts`](src/modules/cars/validations/car.validation.ts) for examples:
- **Type safety**: Runtime type checking
- **Custom validation**: Business rule enforcement
- **Error messages**: Clear, actionable feedback
- **Request/Response typing**: Full TypeScript coverage

The [validation middleware](src/shared/middleware/validation.middleware.ts) processes these schemas.

## 🚀 Performance Considerations

### **Pagination Strategy**

Large datasets use cursor-based pagination implemented in [`CarService.findAll`](src/modules/cars/services/cars.service.ts#L48-L67):

- **Memory efficient**: No skip() operations on large offsets
- **Consistent results**: Stable ordering during concurrent modifications
- **Metadata**: Total counts and page information

### **Database Query Optimization**

- **Selective population**: Only populate needed fields as seen in [order queries](src/modules/orders/services/orders.service.ts#L90-L95)
- **Lean queries**: Return plain objects when possible
- **Strategic indexing**: Basic indexes defined in [car.model.ts](src/modules/cars/models/car.model.ts#L72-L74) for common query patterns

**Indexing Strategy**: I Kept this minimal for current dataset size. For production systems with large datasets, more comprehensive indexing would be essential for query performance, though this comes with the trade-off of slower write operations.

## 🔄 Order Processing Design

### **State Machine Pattern**
Orders follow a well-defined state flow defined in [`order.constants.ts`](src/modules/orders/constants/order.constants.ts#L1-L11):
```
PENDING_PAYMENT → PAID → CONFIRMED/REJECTED
```

### **Transaction Safety**
Critical operations use MongoDB transactions, as implemented in [`processPayment`](src/modules/orders/services/orders.service.ts#L31-L70):
- **Inventory updates**: Atomic quantity adjustments
- **Payment processing**: Consistent state changes
- **Order status**: Coordinated updates across collections

### **Payment Simulation**
Realistic payment processing simulation with configurable parameters in [`order.constants.ts`](src/modules/orders/constants/order.constants.ts#L13-L17):
- **Async processing**: Simulated network delays
- **Failure scenarios**: Configurable success rates
- **Transaction IDs**: Unique payment references

## 🛠️ Development Experience

### **Type-Safe Everything**
- **API contracts**: Request/response types in [`express.types.ts`](src/shared/types/express.types.ts)
- **Database models**: Schema to TypeScript interfaces
- **Middleware**: Typed request handlers using [`asHandler`](src/shared/types/express.types.ts#L12-L20)
- **Utilities**: Generic helper functions

### **Developer Tools**
- **Structured logging**: JSON formatted logs via [logger service](src/shared/utils/logger.service.ts)
- **Request tracing**: Request logger middleware in [`request-logger.middleware.ts`](src/shared/middleware/request-logger.middleware.ts)
- **Health checks**: System status endpoints in [`app.ts`](src/app.ts#L25-L32)

### **Seeding System**
The [database seeding system](src/shared/seeds/) provides realistic test data:
- **Category seeding**: [Pre-defined categories](src/shared/seeds/category.seed.ts)
- **Car seeding**: [Comprehensive car inventory](src/shared/seeds/car.seed.ts)
- **Relationship handling**: Proper foreign key references

## 🔮 Future Enhancements

### **Event-Driven Order Processing**

The current order system uses direct method calls, but implementing an event-driven architecture would significantly improve the order flow:

- **Order Events**: `OrderCreated`, `PaymentProcessed`, `OrderConfirmed`
- **Decoupled Processing**: Each event triggers independent handlers for inventory, notifications, auditing
- **Reliability**: Event queues ensure no order state changes are lost
- **Scalability**: Asynchronous processing handles order volume spikes

### **Car Image Management**

Image upload functionality for cars was a strong consideration but couldn't I couldn't implemented it within the time constraints. This would include:

- **Multi-image support**: Primary and gallery images per car
- **Image optimization**: Automatic resizing and format conversion
- **CDN integration**: Fast global image delivery
- **Upload validation**: File type, size, and content verification

### **Enhanced Order Processing**

The current payment simulation provides only a glimpse of my thought process. A production-ready order system would require:

- **Security**: Payment gateway integration with PCI compliance
- **Validation**: Fraud detection and risk assessment
- **Integrity**: Transaction rollback mechanisms and order state consistency
- **Notifications**: Email/SMS confirmations and status updates throughout the order lifecycle

### **Notification System**

A comprehensive notification system would greatly enhance user experience:

- **Real-time updates**: WebSocket connections for instant order status changes
- **Multi-channel delivery**: Email, SMS, push notifications
- **Delivery tracking**: Confirmation and retry mechanisms for failed notifications

### **Additional Considerations**

- **Advanced search**: Full-text search with filters and sorting
- **Analytics dashboard**: Sales metrics and inventory insights
- **Containerization**: Docker deployment for consistent environments

---
Thanks for reading through. Goodluck to me!
