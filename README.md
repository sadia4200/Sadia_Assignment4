# FixItNow API — Home Services Marketplace

FixItNow is a comprehensive backend REST API built for a home services marketplace platform. It supports three distinct user roles (Customers, Technicians, and Admins) to manage category listings, home services, bookings, technician profiles, Stripe card payments, customer reviews, and administrative platform oversight.

---

## 🛠️ Tech Stack

- **Runtime Environment:** [Node.js](https://nodejs.org/) (v18+)
- **Programming Language:** [TypeScript](https://www.typescriptlang.org/)
- **Web Framework:** [Express.js](https://expressjs.com/)
- **Database ORM:** [Prisma ORM](https://www.prisma.io/) (with Multi-file schema folder configuration)
- **Database:** PostgreSQL
- **Payments Gateway:** [Stripe API](https://stripe.com/)
- **Validation:** [Zod](https://zod.dev/) (Schema-based request validation)
- **Security & Utilities:** `bcrypt` (password hashing), `jsonwebtoken` (JWT auth), `helmet` (security headers), `cors` (Cross-Origin Resource Sharing)

---

## 🚀 Setup & Installation

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Fahim7600/Assignment4_ProgrammingHero.git
cd Assignment4_ProgrammingHero
npm install
```

### 2. Environment Variables Configuration
Copy the `.env.example` file to create your own local environment file:
```bash
cp .env.example .env
```
Fill in the correct secrets:
- `DATABASE_URL`: Your PostgreSQL database connection string.
- `JWT_SECRET`: A secure signing key for authentication tokens.
- `STRIPE_SECRET_KEY`: Your Stripe developer secret test key.
- `STRIPE_WEBHOOK_SECRET`: The signing secret generated when running the Stripe CLI listener (`stripe listen`).

### 3. Database Migration
Deploy schemas and generate the Prisma Client:
```bash
npx prisma db push
```

### 4. Seed Sample Demo Data
Populate the database with the default admin account and service categories:
```bash
npx prisma db seed
```

### 5. Running the Application
* **Development Server (watches for changes):**
  ```bash
  npm run dev
  ```
* **Production Build & Start:**
  ```bash
  npm run build
  ```
  ```bash
  npm run start
  ```

---

## 🔑 Default Admin Credentials

The database seed script populates the following admin account automatically:

| Role | Email | Password | Details / Usage |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@fixitnow.com` | `admin123` | Can ban/unban users, oversee all platform bookings, and manage service categories. |

*Note: You can register Customers and Technicians using the public `/api/auth/register` endpoint.*

---

## 💳 Testing Stripe Checkout & Webhooks

FixItNow supports integrated Stripe card checkouts:
1. **Submit Booking:** As a registered Customer, submit a booking request for a service via `POST /api/bookings`.
2. **Accept Booking:** As the assigned Technician (or an Admin), accept the booking via `PATCH /api/technician/bookings/:id` (set status to `ACCEPTED`).
3. **Initiate Payment:** As the Customer, generate a Stripe checkout session via `POST /api/payments/create`. Copy the returned Stripe checkout `url`.
4. **Start Webhook listener:** In another terminal, run the Stripe CLI forwarder to capture checkout confirmation webhooks:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/confirm
   ```
5. **Submit Payment:** Open the checkout URL in a browser and submit using the standard Stripe test card:
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry / CVC / Name:** Any future date, any 3-digit CVC, and name.
6. **Lifecycle Shift:** The webhook signature will verify, marking the Payment record as `COMPLETED` and the Booking status as `PAID` automatically.

---

## 📋 API Endpoints Reference

### 🔐 Authentication Module (`/api/auth`)
* `POST /register` — Register a new account (`CUSTOMER` or `TECHNICIAN`).
* `POST /login` — Login and receive a JWT. Banned users are blocked.
* `GET /me` — Retrieve the currently authenticated user's profile.

### 📂 Public Modules (`/api/categories`, `/api/services`, `/api/technicians`)
* `GET /categories` — Public list of all service categories.
* `GET /services` — Public filtered list of services (filter by type, location, rating, price).
* `GET /technicians` — Public list of technicians (search and filter by location, skills, rating).
* `GET /technicians/:id` — View specific technician profile.

### 📅 Bookings Module (`/api/bookings`)
* `POST /bookings` — Submit a booking request (Customer only).
* `GET /bookings` — List bookings for the authenticated customer.
* `GET /bookings/:id` — Retrieve booking details (Restricted to Customer, Technician, and Admin).

### 💳 Payments Module (`/api/payments`)
* `POST /payments/create` — Create a Stripe Checkout session (Customer only, status must be `ACCEPTED`).
* `POST /payments/confirm` — Stripe Webhook receiver (Public raw endpoint, validates signature).
* `GET /payments` — Paginated list of payments (Customer or Technician).
* `GET /payments/:id` — Retrieve payment details.

### 🔧 Technician Module (`/api/technician`)
* `PUT /technician/profile` — Update private profile details (Technician only).
* `PUT /technician/availability` — Toggle availability status (Technician only).
* `GET /technician/bookings` — List assigned bookings (Technician only).
* `PATCH /technician/bookings/:id` — Update booking status (Technician or Customer).

### ✍️ Reviews Module (`/api/reviews`)
* `POST /reviews` — Submit a booking review (Customer only, status must be `COMPLETED`).

### 👑 Admin Module (`/api/admin`)
* `GET /admin/users` — List and filter platform users.
* `PATCH /admin/users/:id` — Ban or unban users (prevents self-ban).
* `GET /admin/bookings` — Oversee all bookings across the platform.
* `GET /admin/categories` — List all categories.
* `POST /admin/categories` — Create a new service category.

---

## 📖 API Documentation

FixItNow uses Swagger / OpenAPI to compile interactive API documentation. You can access the UI endpoint locally at:
* **Local API Docs URL:** [http://localhost:5000/api/docs](http://localhost:5000/api/docs)