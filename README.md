# GearUp - Sports & Outdoor Gear Rental Backend

A full-featured RESTful backend API for a sports and outdoor gear rental platform. Built with Node.js, Express.js, TypeScript, Prisma ORM, and PostgreSQL.

Customers can browse, rent, pay for, and review sports/outdoor equipment. Providers can list their gear for rent and manage incoming rental orders. Admins can manage users, gear, and rental orders.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js |
| Language | TypeScript (v6, strict mode) |
| Framework | Express.js v5 |
| Database | PostgreSQL |
| ORM | Prisma v7.8 (`@prisma/adapter-pg`) |
| Authentication | JWT (access + refresh tokens), bcryptjs, cookie-based |
| Payments | Stripe (PaymentIntent + Webhooks), SSLCommerz (placeholder) |
| Deployment | Vercel (serverless) |

## Project Structure

```
gear-up-backend/
├── api/
│   └── index.ts                    # Vercel serverless entry point
├── prisma/
│   ├── schema/                     # Split Prisma schema files
│   │   ├── schema.prisma           # Generator + datasource config
│   │   ├── enums.prisma            # All enum definitions
│   │   ├── user.prisma             # User model
│   │   ├── gearItem.prisma         # GearItem model
│   │   ├── category.prisma         # Category model
│   │   ├── rentalOrder.prisma      # RentalOrder model
│   │   ├── payment.prisma          # Payment model
│   │   └── review.prisma           # Review model
│   └── migrations/                 # Database migrations
├── src/
│   ├── app.ts                      # Express app setup, middleware, route mounting
│   ├── server.ts                   # Server bootstrap (DB connect + listen)
│   ├── config/
│   │   └── index.ts                # Environment variable configuration
│   ├── lib/
│   │   ├── prisma.ts               # Prisma client instance
│   │   └── stripe.ts               # Stripe client (lazy Proxy pattern)
│   ├── middlewares/
│   │   ├── auth.ts                 # JWT auth + role-based access control
│   │   ├── globalErrorHandler.ts   # Prisma-aware global error handler
│   │   └── notFound.ts             # 404 handler
│   ├── utils/
│   │   ├── catchAsync.ts           # Async error wrapper
│   │   ├── jwt.ts                  # JWT create/verify utilities
│   │   └── sendResponse.ts         # Standardized JSON response helper
│   └── modules/
│       ├── auth/                   # Registration, login, profile, token refresh
│       ├── gear/                   # Browse gear (public, search/filter/pagination)
│       ├── category/               # List and create categories
│       ├── rental/                 # Create rental, view my rentals
│       ├── payment/                # Stripe payments, webhooks, confirmation
│       ├── review/                 # Create review (post-return only)
│       ├── provider/               # Provider gear CRUD, order management
│       └── admin/                  # Admin user/gear/rental management
├── dist/                           # Compiled JS output
├── vercel.json                     # Vercel deployment config
└── package.json
```

## Architecture

This project follows a **layered architecture** with three main tiers:

- **Routes** define API endpoints, HTTP methods, and apply role-based authentication middleware.
- **Controllers** handle HTTP request/response concerns — extracting input, calling services, setting cookies, and sending standardized responses.
- **Services** contain all business logic and database operations via Prisma — no HTTP awareness.

Each feature module is self-contained under `src/modules/` with its own route, controller, service, and interface files.

## Environment Variables

Create a `.env` file in the project root with the following variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: 5000) |
| `APP_URL` | Application URL (e.g., `http://localhost:5000`) |
| `BCRYPT_SALT_ROUNDS` | Salt rounds for bcrypt hashing (e.g., `10`) |
| `JWT_ACCESS_SECRET` | Secret key for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret key for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token expiry (e.g., `1d`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry (e.g., `7d`) |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |

## Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL database
- Stripe account (for payment features)

### Installation

```bash
npm install
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```

### Development

```bash
npm run dev
```

The server starts at `http://localhost:5000`.

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Stripe Webhook (Local Development)

```bash
npm run stripe:webhook
```

This forwards Stripe webhook events to your local server.

## Data Models

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String | UUID, primary key |
| name | String | |
| email | String | unique |
| password | String | hashed with bcrypt |
| role | Role | `CUSTOMER`, `PROVIDER`, or `ADMIN` (default: CUSTOMER) |
| status | UserStatus | `ACTIVE` or `BLOCKED` (default: ACTIVE) |
| profilePhoto | String? | optional |
| phone | String? | optional |
| address | String? | optional |
| createdAt | DateTime | auto-generated |
| updatedAt | DateTime | auto-updated |

### GearItem
| Field | Type | Notes |
|-------|------|-------|
| id | String | UUID, primary key |
| name | String | |
| description | String | text |
| brand | String | |
| pricePerDay | Float | rental price per day |
| image | String? | optional |
| quantity | Int | available stock (default: 1) |
| isAvailable | Boolean | availability flag (default: true) |
| providerId | String | FK to User (provider) |
| categoryId | String | FK to Category |
| createdAt | DateTime | auto-generated |
| updatedAt | DateTime | auto-updated |

### Category
| Field | Type | Notes |
|-------|------|-------|
| id | String | UUID, primary key |
| name | String | unique |
| description | String? | optional |
| createdAt | DateTime | auto-generated |
| updatedAt | DateTime | auto-updated |

### RentalOrder
| Field | Type | Notes |
|-------|------|-------|
| id | String | UUID, primary key |
| quantity | Int | number of items rented |
| startDate | DateTime | rental start date |
| endDate | DateTime | rental end date |
| totalAmount | Float | total rental cost |
| status | RentalStatus | default: `PLACED` |
| customerId | String | FK to User (customer) |
| gearItemId | String | FK to GearItem |
| createdAt | DateTime | auto-generated |
| updatedAt | DateTime | auto-updated |

### Payment
| Field | Type | Notes |
|-------|------|-------|
| id | String | UUID, primary key |
| transactionId | String? | unique, set after confirmation |
| amount | Float | payment amount |
| method | PaymentMethod | `STRIPE` or `SSLCOMMERZ` |
| status | PaymentStatus | `PENDING`, `COMPLETED`, or `FAILED` |
| stripePaymentIntentId | String? | Stripe PaymentIntent ID |
| paidAt | DateTime? | payment timestamp |
| rentalOrderId | String | FK to RentalOrder (unique, 1-to-1) |
| userId | String | FK to User |
| createdAt | DateTime | auto-generated |

### Review
| Field | Type | Notes |
|-------|------|-------|
| id | String | UUID, primary key |
| rating | Int | review rating |
| comment | String | text |
| customerId | String | FK to User (customer) |
| gearItemId | String | FK to GearItem |
| createdAt | DateTime | auto-generated |

## Enums

| Enum | Values |
|------|--------|
| `Role` | `CUSTOMER`, `PROVIDER`, `ADMIN` |
| `UserStatus` | `ACTIVE`, `BLOCKED` |
| `RentalStatus` | `PLACED`, `CONFIRMED`, `PAID`, `PICKED_UP`, `RETURNED`, `CANCELLED` |
| `PaymentStatus` | `PENDING`, `COMPLETED`, `FAILED` |
| `PaymentMethod` | `STRIPE`, `SSLCOMMERZ` |

## API Endpoints

Base URL: `http://localhost:5000/api`

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register a new user (CUSTOMER or PROVIDER) |
| POST | `/auth/login` | Public | Login and get access/refresh tokens (set as cookies) |
| GET | `/auth/me` | Any role | Get logged-in user's profile |
| POST | `/auth/refresh-token` | Public (refresh token cookie) | Refresh access token |

### Gear (Public)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/gear` | Public | Browse all gear with search, filter, and pagination |
| GET | `/gear/:id` | Public | Get a single gear item by ID |

**Query Parameters for `GET /gear`:**
- `search` — full-text search across name, description, brand
- `category` — filter by category ID
- `brand` — filter by brand (case-insensitive)
- `minPrice` — minimum price per day
- `maxPrice` — maximum price per day
- `sortBy` — sort field (default: `createdAt`)
- `sortOrder` — `asc` or `desc` (default: `desc`)
- `page` — page number (default: 1)
- `limit` — items per page (default: 10)

### Categories

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/categories` | Public | Get all categories |
| POST | `/categories` | ADMIN, PROVIDER | Create a new category |

### Rentals

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/rentals` | CUSTOMER | Create a new rental order |
| GET | `/rentals` | CUSTOMER | Get current user's rentals |
| GET | `/rentals/:id` | CUSTOMER | Get a specific rental by ID |

### Payments

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payments/webhook` | None (Stripe signature verified) | Stripe webhook handler |
| POST | `/payments/create` | CUSTOMER | Create a Stripe PaymentIntent |
| POST | `/payments/confirm` | CUSTOMER | Confirm payment after client-side processing |
| GET | `/payments` | CUSTOMER | Get current user's payment history |
| GET | `/payments/:id` | CUSTOMER | Get a specific payment by ID |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews` | CUSTOMER | Create a review for a returned gear item |

### Provider

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/provider/gear` | PROVIDER | Add a new gear item |
| GET | `/provider/gear` | PROVIDER | Get provider's own gear items |
| PUT | `/provider/gear/:id` | PROVIDER | Update a gear item |
| DELETE | `/provider/gear/:id` | PROVIDER | Delete a gear item |
| GET | `/provider/orders` | PROVIDER | View incoming rental orders |
| PATCH | `/provider/orders/:id` | PROVIDER | Update order status (state machine) |

**Order Status Transitions:**
```
PLACED → CONFIRMED → PAID → PICKED_UP → RETURNED
                 ↘       ↘        ↘
                CANCELLED (from PLACED, CONFIRMED, PAID, or PICKED_UP)
```

When an order is CANCELLED or RETURNED from a PAID or PICKED_UP state, the gear item quantity is automatically restored.

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/users` | ADMIN | Get all users |
| PATCH | `/admin/users/:id` | ADMIN | Update user status (ACTIVE/BLOCKED) |
| GET | `/admin/gear` | ADMIN | Get all gear items |
| GET | `/admin/rentals` | ADMIN | Get all rental orders |

## Authentication

- JWT access tokens (1 day expiry) and refresh tokens (7 day expiry)
- Tokens are sent via HTTP-only cookies and also returned in the JSON response body
- The `auth()` middleware supports token extraction from cookies, `Bearer` token in Authorization header, or raw Authorization header
- Role-based access control enforced per route

## Payment Flow

1. Customer creates a rental order
2. Customer calls `POST /payments/create` to create a Stripe PaymentIntent
3. Client-side Stripe.js collects payment
4. Customer calls `POST /payments/confirm` to confirm payment server-side
5. Payment status updates to `COMPLETED`, rental status updates to `PAID`, gear quantity is decremented atomically via Prisma transaction
6. Stripe webhook (`POST /payments/webhook`) also processes payment events as a fallback/confirmation

## Error Handling

A global error handler categorizes errors into appropriate HTTP status codes:
- **Prisma validation errors** → 400 Bad Request
- **Known request errors** (e.g., duplicate email) → 400 Bad Request
- **Database initialization errors** → 503 Service Unavailable
- **Unknown errors** → 500 Internal Server Error

All errors are returned in a standardized format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description",
  "errorSources": []
}
```

## Deployment

The project is configured for Vercel deployment as a serverless function:

- Entry point: `api/index.ts`
- All API routes are handled by the single serverless function via catch-all routing
- The `postinstall` script runs `prisma generate && tsc` to ensure Prisma client and TypeScript are built during deployment
