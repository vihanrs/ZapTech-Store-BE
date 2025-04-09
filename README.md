# ZapTech Store - E Commerce Backend

A robust Node.js/Express backend service for e-commerce operations with product management, order processing, and promotional code features.

## 🌐 Live Demo

Take a look the live demo 👉[here](https://fed-storefront-frontend-vihan.netlify.app/) 

## 🌟 Features

### Product Management
- Product CRUD operations
- Category management
- Stock tracking
- Admin-protected operations

### Order Processing
- Order creation and management
- Multiple order statuses (PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED)
- Payment status tracking (PENDING, PAID)

### Promotional System
- Create and validate promo codes
- First-order-only promotions
- Time-based expiration
- Percentage-based discounts

### Security
- Authentication using Clerk
- Role-based access control (Admin/User)
- CORS protection
- Error handling middleware

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Clerk
- **Type Safety**: TypeScript
- **Other Tools**:
  - CORS for cross-origin resource sharing
  - dotenv for environment variable management

## 📚 API Documentation

### Products API
```typescript
GET    /api/v1/products      // Get all products
POST   /api/v1/products      // Create new product (Admin only)
GET    /api/v1/products/:id  // Get specific product
DELETE /api/v1/products/:id  // Delete product (Admin only)
PATCH  /api/v1/products/:id  // Update product (Admin only)
```

### Categories API
```typescript
GET    /api/v1/categories      // Get all categories
POST   /api/v1/categories      // Create category (Admin only)
GET    /api/v1/categories/:id  // Get specific category
DELETE /api/v1/categories/:id  // Delete category (Admin only)
PATCH  /api/v1/categories/:id  // Update category (Admin only)
```

### Promo Codes API
```typescript
POST   /api/v1/promocodes        // Create promo code (Admin only)
POST   /api/v1/promocodes/validate // Validate promo code (Authenticated users)
```

### Orders API
```typescript
/api/v1/orders     // Order management endpoints
```

### Payments API
```typescript
/api/v1/payments   // Payment processing endpoints
```

## 🏗️ Project Structure

![Capture](https://github.com/user-attachments/assets/fd1513b0-bfe5-4ccc-b449-9c316606b333)

src/

├── api/ # Route definitions and controllers

├── application/ # Business logic

├── domain/ # Domain models and DTOs

└── infrastructure/# Database schemas and connections

## 🧩 Challenges and How I Overcame Them

### 1. Authentication and Authorization
**Challenge:**
Needed to implement secure role-based access while keeping the code maintainable and scalable:
- Protecting admin routes
- Managing user sessions
- Handling authentication errors

**Solution:**
✅ Created middleware-based authentication using Clerk with custom authorization:

![Capture](https://github.com/user-attachments/assets/119dc5f8-6cfe-4afe-8c1e-fc078d62831d)

```typescript
// Separation of authentication and authorization concerns
// Authentication middleware
export const isAuthenticated = ClerkExpressRequireAuth();

// Authorization middleware
export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  // Admin validation logic
};

// Usage in routes
productRouter
  .route("/")
  .get(getProducts)
  .post(isAuthenticated, isAdmin, createProduct);
```

**Benefits:**
- Clean separation of concerns
- Reusable middleware
- Easy to extend for new roles
- Consistent security across routes

### 2. Server Reliability
**Challenge:**
Dealing with free-tier hosting limitations:
- Server sleep on inactivity
- Connection timeouts
- Database connection management

**Solution:**
✅ Implemented intelligent server management:

```typescript
// Self-ping mechanism to prevent server sleep
setInterval(() => {
  fetch(`https://fed-storefront-backend-vihan.onrender.com/ping`)
    .then((res) => res.json())
    .then((data) => console.log("Self Ping Success:", data))
    .catch((err) => console.log("Self Ping Error:", err));
}, 600000); // Every 10 minutes

// Robust database connection
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

**Benefits:**
- Improved uptime
- Better reliability
- Automatic recovery
- Monitoring capability
