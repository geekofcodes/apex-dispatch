# ApexDispatch

> A modern, microservices-based order management and courier dispatch system with real-time tracking, event-driven architecture, and comprehensive admin observability.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-required-blue.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Authentication & Authorization](#authentication--authorization)
- [Event Bus System](#event-bus-system)
- [Admin Observability](#admin-observability)
- [Development](#development)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

ApexDispatch is a production-ready order management and courier dispatch system built with a microservices architecture. It provides real-time order tracking, automated courier assignment, event-driven communication between services, and comprehensive admin tools for monitoring and managing deliveries.

### Key Highlights

- **Microservices Architecture**: 7 independent services with clear separation of concerns
- **Event-Driven Communication**: Reliable event bus with delivery tracking and replay capabilities
- **Real-Time Tracking**: Live order status updates and location tracking
- **Role-Based Access Control**: Admin, Operator, and Viewer roles with granular permissions
- **Admin Observability**: Event log UI with filters, search, and delivery metrics
- **Modern UI**: Premium React dashboard with Tailwind CSS
- **Containerized Deployment**: Docker Compose for easy setup and scaling

## ✨ Features

### Core Functionality

- **Order Management**
  - Create, view, and track orders
  - Automated courier assignment
  - Real-time status updates
  - Order history and analytics

- **Courier Management**
  - Courier availability tracking
  - Automated dispatch based on location
  - Performance metrics

- **Tracking Service**
  - Real-time location updates
  - Delivery status tracking
  - Historical tracking data

### Admin Features

- **Event Log UI** (Admin Only)
  - View all system events
  - Filter by status (Delivered, Failed, Partially Delivered)
  - Filter by event type
  - Search by Event ID
  - View event details and delivery attempts
  - Replay failed deliveries

- **Dashboard Metrics** (Admin Only)
  - Total Events count
  - Failed Deliveries count
  - Dead Letter Queue (DLQ) count
  - Average delivery attempts

- **User Management**
  - JWT-based authentication
  - Role-based access control (RBAC)
  - Secure password hashing with bcrypt

### UI/UX Features

- Premium, modern interface
- Responsive design (mobile-friendly)
- Dark mode support
- Smooth animations and transitions
- Loading states and error handling
- Accessible components

## 🏗️ Architecture

ApexDispatch follows a microservices architecture with the following services:

```
┌─────────────┐
│   Frontend  │ (React + Vite + Tailwind)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ API Gateway │ (Express - Port 3000)
└──────┬──────┘
       │
       ├─────────────┬─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│  Auth    │  │  Order   │  │ Courier  │  │ Tracking │  │ Dispatch │
│ Service  │  │ Service  │  │ Service  │  │ Service  │  │ Service  │
│ (4000)   │  │ (5000)   │  │ (6000)   │  │ (8000)   │  │ (7000)   │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │             │
     ▼             ▼             ▼             ▼             ▼
┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐
│ MongoDB │   │ MongoDB │   │ MongoDB │   │ MongoDB │   │ MongoDB │
│  Auth   │   │  Order  │   │ Courier │   │ Tracking│   │ Dispatch│
└─────────┘   └─────────┘   └─────────┘   └─────────┘   └─────────┘
                     │             │             │
                     └──────┬──────┴──────┬──────┘
                            ▼             ▼
                     ┌──────────┐  ┌──────────┐
                     │ Event    │  │Notification│
                     │  Bus     │  │ Service  │
                     │ (10000)  │  │ (9000)   │
                     └────┬─────┘  └──────────┘
                          │
                          ▼
                     ┌─────────┐
                     │ MongoDB │
                     │EventBus │
                     └─────────┘
```

### Service Responsibilities

| Service | Port | Database | Purpose |
|---------|------|----------|---------|
| **API Gateway** | 3000 | - | Request routing, JWT verification, RBAC enforcement |
| **Auth Service** | 4000 | mongo-auth | User authentication, JWT token generation |
| **Order Service** | 5000 | mongo-order | Order CRUD operations, order lifecycle management |
| **Courier Service** | 6000 | mongo-courier | Courier management, availability tracking |
| **Dispatch Service** | 7000 | mongo-dispatch | Automated courier assignment logic |
| **Tracking Service** | 8000 | mongo-tracking | Real-time location and status tracking |
| **Notification Service** | 9000 | - | Email/SMS notifications (webhook consumer) |
| **Event Bus** | 10000 | mongo-event-bus | Event publishing, delivery tracking, replay |

## 🛠️ Tech Stack

### Backend

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcrypt
- **HTTP Client**: Axios
- **Logging**: Morgan

### Frontend

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Routing**: Client-side navigation

### DevOps

- **Containerization**: Docker & Docker Compose
- **Database**: MongoDB (containerized)
- **Reverse Proxy**: API Gateway (Express)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **Docker** and **Docker Compose**
- **Git**

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/apex-dispatch.git
cd apex-dispatch
```

2. **Set up environment variables**

Create a `.env` file in the root directory:

```bash
# Generate a secure JWT secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. **Start all services with Docker Compose**

```bash
docker compose up --build
```

This will start:
- All 7 microservices
- 5 MongoDB instances
- API Gateway on port 3000

4. **Start the frontend development server**

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

5. **Access the application**

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:3000

### Default Users

The system comes with pre-seeded users:

| Email | Password | Role |
|-------|----------|------|
| admin@example.com | admin123 | Admin |
| operator@example.com | operator123 | Operator |
| viewer@example.com | viewer123 | Viewer |

## 📁 Project Structure

```
apex-dispatch/
├── api-gateway/           # API Gateway service
│   ├── index.js          # Main gateway logic, routing, auth
│   ├── package.json
│   └── Dockerfile
├── services/
│   ├── auth-service/     # Authentication service
│   ├── order-service/    # Order management
│   ├── courier-service/  # Courier management
│   ├── dispatch-service/ # Courier assignment logic
│   ├── tracking-service/ # Real-time tracking
│   ├── notification-service/ # Notifications
│   └── event-bus/        # Event bus system
├── frontend/             # React frontend
│   ├── src/
│   │   ├── api/         # API client modules
│   │   ├── components/  # Reusable UI components
│   │   ├── pages/       # Page components
│   │   ├── styles/      # Global styles
│   │   └── utils/       # Utility functions
│   ├── package.json
│   └── vite.config.js
├── docker-compose.yml    # Docker orchestration
├── .env                  # Environment variables
└── README.md            # This file
```

## 📡 API Documentation

### Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Auth Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### Verify Token
```http
POST /api/auth/verify
Authorization: Bearer <token>

Response:
{
  "valid": true,
  "user": { ... }
}
```

### Order Endpoints

#### Create Order (Admin, Operator)
```http
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": "customer123",
  "pickupLocation": "123 Main St",
  "deliveryLocation": "456 Oak Ave",
  "items": [...]
}
```

#### Get All Orders (All Roles)
```http
GET /api/orders
Authorization: Bearer <token>
```

### Tracking Endpoints

#### Get Order Tracking (All Roles)
```http
GET /api/tracking/:orderId
Authorization: Bearer <token>
```

### Event Bus Endpoints (Admin Only)

#### Get Events
```http
GET /api/events?limit=50
Authorization: Bearer <token>
```

#### Get Event Details
```http
GET /api/events/:eventId
Authorization: Bearer <token>
```

#### Get Event Metrics
```http
GET /api/events/metrics
Authorization: Bearer <token>

Response:
{
  "totalEvents": 123,
  "failedEvents": 7,
  "dlqCount": 3,
  "avgAttempts": 1.4
}
```

#### Replay Failed Event
```http
POST /api/events/:eventId/replay
Authorization: Bearer <token>
```

## 🔐 Authentication & Authorization

### JWT Authentication

ApexDispatch uses JWT (JSON Web Tokens) for stateless authentication:

1. User logs in with email/password
2. Auth Service validates credentials and generates JWT
3. JWT contains user ID, email, and role
4. Frontend stores JWT in localStorage
5. All API requests include JWT in Authorization header
6. API Gateway verifies JWT on every request

### Role-Based Access Control (RBAC)

Three roles with different permissions:

| Feature | Admin | Operator | Viewer |
|---------|-------|----------|--------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Orders | ✅ | ✅ | ✅ |
| Create Orders | ✅ | ✅ | ❌ |
| View Tracking | ✅ | ✅ | ✅ |
| View Events | ✅ | ❌ | ❌ |
| View Metrics | ✅ | ❌ | ❌ |
| Replay Events | ✅ | ❌ | ❌ |

## 🔄 Event Bus System

The Event Bus provides reliable, asynchronous communication between services.

### Event Flow

1. **Service publishes event** → Event Bus
2. **Event Bus stores event** → MongoDB
3. **Event Bus delivers to subscribers** → Target services
4. **Delivery tracking** → Success/Failure recorded
5. **Failed deliveries** → Retry with exponential backoff
6. **Admin can replay** → Failed events manually

### Event Types

- `ORDER_CREATED` - New order created
- `ORDER_UPDATED` - Order status changed
- `COURIER_ASSIGNED` - Courier assigned to order
- `DELIVERY_COMPLETED` - Order delivered
- `LOCATION_UPDATED` - Tracking location updated

### Event Structure

```json
{
  "eventId": "uuid-v4",
  "type": "ORDER_CREATED",
  "payload": {
    "orderId": "...",
    "customerId": "...",
    "timestamp": "2026-02-11T10:00:00Z"
  },
  "status": "DELIVERED",
  "createdAt": "2026-02-11T10:00:00Z",
  "updatedAt": "2026-02-11T10:00:01Z"
}
```

### Delivery Tracking

Each event tracks deliveries to target services:

```json
{
  "targetService": "notification-service",
  "status": "DELIVERED",
  "attempts": 1,
  "lastError": null,
  "updatedAt": "2026-02-11T10:00:01Z"
}
```

## 📊 Admin Observability

### Event Log UI

Admins can monitor all system events through a dedicated UI:

**Features:**
- View all events with pagination
- Filter by status (Delivered, Failed, Partially Delivered, Received)
- Filter by event type (dynamically populated)
- Search by Event ID (partial match)
- View detailed event information
- See delivery attempts and errors
- Replay failed deliveries

**Access:** Login as admin → Click "Events" in sidebar

### Dashboard Metrics

Real-time metrics displayed on the admin dashboard:

- **Total Events**: Count of all events in the system
- **Failed Deliveries**: Events with at least one failed delivery
- **DLQ Count**: Events in the Dead Letter Queue
- **Avg Attempts**: Average delivery attempts across all events

## 💻 Development

### Running Services Individually

You can run services independently for development:

```bash
# Auth Service
cd services/auth-service
npm install
npm start

# Order Service
cd services/order-service
npm install
npm start

# Frontend
cd frontend
npm install
npm run dev
```

### Hot Reload

- **Frontend**: Vite provides instant hot module replacement
- **Backend**: Use `nodemon` for auto-restart on file changes

### Database Access

MongoDB instances are exposed on localhost:

- mongo-auth: `mongodb://localhost:27017/auth`
- mongo-order: `mongodb://localhost:27018/orders`
- mongo-courier: `mongodb://localhost:27019/couriers`
- mongo-tracking: `mongodb://localhost:27020/tracking`
- mongo-event-bus: `mongodb://localhost:27021/events`

Use MongoDB Compass or any MongoDB client to connect.

### Adding a New Service

1. Create service directory in `services/`
2. Add `index.js`, `package.json`, `Dockerfile`
3. Add service to `docker-compose.yml`
4. Add routes to API Gateway
5. Subscribe to relevant events in Event Bus

## 🚢 Deployment

### Production Checklist

- [ ] Change `JWT_SECRET` to a strong, random value
- [ ] Use environment-specific MongoDB URIs
- [ ] Enable MongoDB authentication
- [ ] Set up HTTPS/TLS for API Gateway
- [ ] Configure CORS for production domain
- [ ] Set up logging and monitoring
- [ ] Configure backup strategy for databases
- [ ] Set resource limits in Docker Compose
- [ ] Use Docker secrets for sensitive data
- [ ] Set up CI/CD pipeline

### Docker Production Build

```bash
# Build all services
docker compose build

# Start in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Scaling Services

To scale a specific service:

```bash
docker compose up -d --scale order-service=3
```

## 🔧 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `JWT_SECRET` | Secret key for JWT signing | `your-super-secret-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | Service-specific |
| `MONGO_URI` | MongoDB connection string | `mongodb://mongo-{service}:27017/{db}` |
| `NODE_ENV` | Environment | `development` |

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use ESLint for JavaScript linting
- Follow Airbnb JavaScript Style Guide
- Use Prettier for code formatting
- Write meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with modern microservices best practices
- Inspired by real-world dispatch and logistics systems
- UI/UX inspired by premium SaaS dashboards

## 📞 Support

For questions or issues:
- Open an issue on GitHub
- Email: support@apexdispatch.com
- Documentation: [docs.apexdispatch.com](https://docs.apexdispatch.com)

---

**Made with ❤️ by the ApexDispatch Team**
