# RentNest API — Rental Property Marketplace

RentNest is a comprehensive backend REST API built for a rental property marketplace platform. It supports three distinct user roles (Tenants, Landlords, and Admins) to manage property listings, rental requests, Stripe card payments, tenant reviews, and administrative platform oversight.

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
Populate the database with default accounts, categories, listings, completed rental flows, and mock payments:
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
  npm run start
  ```

---

## 🔑 Default Admin & Test Credentials

The database seed script populates the following accounts automatically:

| Role | Email | Password | Details / Usage |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@rentnest.com` | `Admin@123` | Can ban/unban users, manage categories, oversee all platform data logs. |
| **LANDLORD** | `landlord1@rentnest.com` | `Password123` | Owns Gulshan Penthouse & Banani Studio. |
| **LANDLORD** | `landlord2@rentnest.com` | `Password123` | Owns Dhanmondi Lakefront House & Uttara Condo. |
| **TENANT** | `tenant1@rentnest.com` | `Password123` | Has one pending request and one approved request. |
| **TENANT** | `tenant2@rentnest.com` | `Password123` | Has a completed rental request, completed Stripe payment, and review. |

---

## 💳 Testing Stripe Checkout & Webhooks

RentNest supports fully-integrated Stripe card checkouts:
1. **Initiate Payment:** As a Tenant with an `APPROVED` booking, hit `POST /api/payments/create`. Copy the returned Stripe `url`.
2. **Start Webhook listener:** In another terminal, run Stripe CLI forwarder to capture the raw confirmation webhook event:
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/confirm
   ```
3. **Submit Payment:** Open the copied URL in a browser and submit using the standard Stripe test card:
   - **Card Number:** `4242 4242 4242 4242`
   - **Expiry / CVC / Name:** Any future date, arbitrary 3-digit CVC, and name.
4. **Lifecycle Shift:** The webhook signature will verify, marking the Payment record as `COMPLETED` and the RentalRequest status as `ACTIVE` automatically.

---

## 📋 API Endpoints Reference

### 🔐 Authentication Module (`/api/auth`)
* `POST /register` — Register a new account (`TENANT` or `LANDLORD` only).
* `POST /login` — Login and receive a JWT. Banned users are blocked.
* `GET /me` — Retrieve the currently authenticated user's profile.

### 📁 Categories Module (`/api/categories`)
* `GET /` — Public list of all property categories.

### 🏠 Properties Module (`/api/properties` & `/api/landlord/properties`)
* `GET /properties` — Public paginated & filtered list of `AVAILABLE` properties (location, price, type, amenities, category).
* `GET /properties/:id` — Public property details.
* `GET /properties/:id/reviews` — Public paginated reviews of a property.
* `GET /landlord/properties` — Landlord's list of their own property listings.
* `POST /landlord/properties` — Create a new property listing (Landlord only).
* `PUT /landlord/properties/:id` — Update own property details (Landlord only).
* `DELETE /landlord/properties/:id` — Delete own listing (Landlord only, blocked if active/approved booking requests exist).

### 📅 Rental Requests Module (`/api/rentals` & `/api/landlord/requests`)
* `POST /rentals` — Submit rental request (Tenant only, checks availability & duplicate pending requests).
* `GET /rentals` — List own rental requests (Tenants see theirs, Landlords see requests for their properties).
* `GET /rentals/:id` — Retrieve booking request details (access restricted to requester tenant and property landlord).
* `GET /landlord/requests` — Landlord's view of requests submitted for their properties.
* `PATCH /landlord/requests/:id` — Process rental request (Landlord only, actions: `APPROVE` or `REJECT`).

### 💳 Payments Module (`/api/payments`)
* `POST /payments/create` — Create a Stripe Checkout session (Tenant only, request status must be `APPROVED`).
* `POST /payments/confirm` — Stripe Webhook receiver (Public raw endpoint, validates signature, completes payment, activates booking).
* `GET /payments` — Paginated list of payments history.
* `GET /payments/:id` — Retrieve payment details (restricted to payer tenant and property landlord).

### ✍️ Reviews Module (`/api/reviews`)
* `POST /reviews` — Submit property review (Tenant only, request status must be `COMPLETED`, only one review per request).

### 👑 Admin Module (`/api/admin`)
* `GET /admin/users` — List all users (filter by role/status).
* `PATCH /admin/users/:id` — Ban/unban users (prevent self-ban).
* `GET /admin/properties` — List all platform properties.
* `GET /admin/rentals` — List all platform rental requests.
* `GET /admin/payments` — List all platform payments.
* `POST /admin/categories` — Create category (enforces name uniqueness).
* `PUT /admin/categories/:id` — Update category details.
* `DELETE /admin/categories/:id` — Delete category (blocked if properties reference it).

---

## 🔗 Deployment & Demo Links

* **Live API Production URL:** *[To be filled in after hosting]*
* **E2E Demo Walkthrough Video:** *[To be filled in after recording]*