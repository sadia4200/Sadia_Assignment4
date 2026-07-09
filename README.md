# FixItNow API — Home Services Marketplace

FixItNow is a comprehensive, production-ready backend REST API built for a home services marketplace platform. It allows **Customers** to search for home services and book **Technicians** for specialized tasks. Payments are processed securely via Stripe Checkout, and customers can review completed bookings. The platform is guarded by robust role-based access control and admin oversight.

---

## 🛠️ Tech Stack & Architecture

| Tech Layer | Technology Used | Description |
| :--- | :--- | :--- |
| **Runtime Environment** | Node.js (v18+) | JavaScript execution engine |
| **Language** | TypeScript | Strong typing, compilation safety |
| **Web Framework** | Express.js | Core routing and middleware pipeline |
| **Database ORM** | Prisma ORM | Multi-schema architecture, PostgreSQL access |
| **Database** | PostgreSQL | Relational database engine |
| **Payments Gateway** | Stripe API | Dynamic amount checkout sessions and webhook processing |
| **Request Validation** | Zod | Zod schemas validating query, params, and body |
| **Security & Utilities** | JWT, bcrypt, helmet, cors | Token authorization, secure password hashing, security headers |

---

## 🚀 Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Fahim7600/Assignment4_ProgrammingHero.git
cd Assignment4_ProgrammingHero
npm install
```

### 2. Environment Variables Configuration
Create a `.env` file in the root directory and populate it with the following keys:
```env
PORT=5000
NODE_ENV=development
APP_BASE_URL="http://localhost:5000"
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-secure-jwt-signing-secret"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="your-stripe-secret-test-key"
STRIPE_WEBHOOK_SECRET="your-stripe-cli-webhook-signing-secret"
```
*(Refer to `.env.example` for baseline placeholders)*

### 3. Database Sync & Seeding
Sync your schema models and seed the initial configuration (Admin account + default categories):
```bash
npx prisma db push
npx prisma db seed
```

### 4. Running the Server
* **Development Mode (Auto-reload):**
  ```bash
  npm run dev
  ```
* **Production Mode (Build & Run):**
  ```bash
  npm run build
  npm run start
  ```

---

## 🔑 Seeded Admin Credentials

The database seed command generates a default Admin account:

* **Email:** `admin@fixitnow.com`
* **Password:** `admin123`

---

## 🚦 Booking Status State Machine

The status of a service booking progresses strictly according to the following state machine logic:

```mermaid
state-diagram-v2
    [*] --> REQUESTED : Customer Creates Booking
    REQUESTED --> ACCEPTED : Technician Accepts
    REQUESTED --> DECLINED : Technician Declines
    ACCEPTED --> CANCELLED : Customer Cancels
    ACCEPTED --> PAID : Customer Completes Payment (Stripe Webhook)
    PAID --> IN_PROGRESS : Technician Starts Service
    IN_PROGRESS --> COMPLETED : Technician Marks Completed
    
    note right of CANCELLED
      Customer can cancel only before IN_PROGRESS status
    end note
```

---

## 🔒 Roles & Permissions Matrix

| Module | Route Endpoint | Method | Allowed Roles | Authentication |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Public | None |
| | `/api/auth/login` | `POST` | Public | None |
| | `/api/auth/me` | `GET` | All Roles | Bearer JWT |
| **Public** | `/api/categories` | `GET` | Public | None |
| | `/api/services` | `GET` | Public | None |
| | `/api/technicians` | `GET` | Public | None |
| | `/api/technicians/:id` | `GET` | Public | None |
| **Bookings**| `/api/bookings` | `POST` | `CUSTOMER` | Bearer JWT |
| | `/api/bookings` | `GET` | `CUSTOMER` | Bearer JWT |
| | `/api/bookings/:id` | `GET` | `CUSTOMER`, `TECHNICIAN`, `ADMIN` | Bearer JWT |
| **Payments**| `/api/payments/create` | `POST` | `CUSTOMER` | Bearer JWT |
| | `/api/payments/confirm`| `POST` | Public (Stripe Webhook) | Stripe Signature |
| | `/api/payments` | `GET` | `CUSTOMER`, `TECHNICIAN` | Bearer JWT |
| | `/api/payments/:id` | `GET` | `CUSTOMER`, `TECHNICIAN` | Bearer JWT |
| **Technician**| `/api/technician/profile`| `PUT` | `TECHNICIAN` | Bearer JWT |
| | `/api/technician/availability`| `PUT`| `TECHNICIAN` | Bearer JWT |
| | `/api/technician/bookings`| `GET`| `TECHNICIAN` | Bearer JWT |
| | `/api/technician/bookings/:id`| `PATCH`| `CUSTOMER`, `TECHNICIAN` | Bearer JWT |
| **Reviews** | `/api/reviews` | `POST` | `CUSTOMER` | Bearer JWT |
| **Admin** | `/api/admin/users` | `GET` | `ADMIN` | Bearer JWT |
| | `/api/admin/users/:id` | `PATCH`| `ADMIN` | Bearer JWT |
| | `/api/admin/bookings` | `GET` | `ADMIN` | Bearer JWT |
| | `/api/admin/categories`| `GET` | `ADMIN` | Bearer JWT |
| | `/api/admin/categories`| `POST` | `ADMIN` | Bearer JWT |

---

## 📋 API Endpoints Reference

### 🔐 Auth Module (`/api/auth`)
* `POST /register` — Register a `CUSTOMER` or `TECHNICIAN` account. (Admins cannot self-register).
* `POST /login` — Login with credentials. Blocks banned users. Returns JWT token.
* `GET /me` — Returns JWT owner user object.

### 🌍 Public / Listings Module (`/api/categories`, `/api/services`, `/api/technicians`)
* `GET /categories` — List all categories.
* `GET /services` — List services. Query filters: `type`, `location`, `rating`, `price` (max price filter).
* `GET /technicians` — List technician profiles. Query filters: `search`, `location`, `skills`, `rating`.
* `GET /technicians/:id` — View specific technician profile details.

### 📅 Bookings Module (`/api/bookings`)
* `POST /bookings` — Create a new booking request. Body: `{ serviceId, scheduledAt }`. Enforces `CUSTOMER` role.
* `GET /bookings` — Retrieve the customer's own booking requests.
* `GET /bookings/:id` — Retrieve details of a booking. Accessible only to owner Customer, assigned Technician, or Admin.

### 💳 Payments Module (`/api/payments`)
* `POST /payments/create` — Initiates card payment for an `ACCEPTED` booking. Returns Stripe Checkout URL and session ID.
* `POST /payments/confirm` — Stripe Webhook Endpoint. Parses signature and processes completed (`COMPLETED`) or expired (`FAILED`) sessions.
* `GET /payments` — List payments (Customers/Technicians view their logs).
* `GET /payments/:id` — View specific payment record.

### 🔧 Technician Module (`/api/technician`)
* `PUT /technician/profile` — Update details (bio, skills list, experience years, hourly rate).
* `PUT /technician/availability` — Toggle boolean availability.
* `GET /technician/bookings` — List bookings assigned to the technician.
* `PATCH /technician/bookings/:id` — Update booking status. State validation constraints apply.

### ✍️ Reviews Module (`/api/reviews`)
* `POST /reviews` — Leave a review for a booking. Body: `{ bookingId, rating, comment }`. Permitted only for the booking owner, only once, and only when the booking status is `COMPLETED`.

### 👑 Admin Module (`/api/admin`)
* `GET /admin/users` — List and filter platform users.
* `PATCH /admin/users/:id` — Ban/unban users (status: `ACTIVE`/`BANNED`). Prevents self-banning.
* `GET /admin/bookings` — Inspect all bookings.
* `GET /admin/categories` — List all categories.
* `POST /admin/categories` — Create a new service category.

---

## 💳 Testing Payments & Webhooks
1. **Initiate Payment:** With a booking in `ACCEPTED` status, call `/api/payments/create`. Retrieve the checkout `url`.
2. **Forward Webhooks:** Open another terminal and run Stripe CLI forwarder:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/confirm
   ```
3. **Pay:** Open the URL, input test card `4242 4242 4242 4242` to complete payment. Webhook updates database payment status to `COMPLETED` and booking status to `PAID`.
4. **Test Expiration/Failure:** Generate a session and let it expire or simulate `checkout.session.expired` webhook. Payment status updates to `FAILED`.

---

## 🔗 Submission Details & Links

* **Live Production URL:** `[Placeholder - Live URL]`
* **API Docs URL (Swagger UI):** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)
* **E2E Demo Walkthrough Video:** `[Placeholder - Demo Video Link]`

---

## ⚠️ Known Limitations

1. **Service Creation Endpoint:** The current API design does not expose a public service listing creation endpoint (`POST /services`). Service listings are directly linked to `Technician` profiles and database seeds. In a production scenario, an additional service creation route for Technicians would be added.
2. **Synchronous Card Decline Webhook:** Stripe handles card failures synchronously on the Stripe checkout form itself and doesn't send webhook events for immediate card declines. Webhook failures are handled when checkout sessions expire, transitioning payment status records to `FAILED`.