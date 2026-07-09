import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "FixItNow API",
      version: "1.0.0",
      description: "Comprehensive REST API backend for FixItNow - a home service marketplace platform.",
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter your JWT token to authorize requests.",
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          description: "Registers a customer or technician user. Self-registering admins is blocked.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name", "email", "password", "role"],
                  properties: {
                    name: { type: "string" },
                    email: { type: "string", format: "email" },
                    password: { type: "string", minLength: 6 },
                    phone: { type: "string" },
                    role: { type: "string", enum: ["CUSTOMER", "TECHNICIAN"] },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
            },
            400: {
              description: "Bad Request / Validation errors",
            },
            409: {
              description: "Email already exists",
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Authenticate user & get token",
          description: "Performs login validation using email/password. Banned users are blocked.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", format: "email" },
                    password: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful, returns token and profile",
            },
            400: {
              description: "Validation / Incorrect credentials",
            },
            403: {
              description: "Forbidden: Account is BANNED",
            },
          },
        },
      },
      "/api/auth/me": {
        get: {
          tags: ["Auth"],
          summary: "Get profile details",
          description: "Returns currently logged in user details.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Profile loaded",
            },
            401: {
              description: "Unauthorized / Missing or invalid token",
            },
          },
        },
      },
      "/api/categories": {
        get: {
          tags: ["Public"],
          summary: "List all categories",
          description: "Public endpoint to retrieve all service categories.",
          responses: {
            200: {
              description: "Success",
            },
          },
        },
      },
      "/api/services": {
        get: {
          tags: ["Public"],
          summary: "List all services",
          description: "Public endpoint listing services with filters (type, location, rating, price).",
          parameters: [
            { name: "type", in: "query", schema: { type: "string" } },
            { name: "location", in: "query", schema: { type: "string" } },
            { name: "rating", in: "query", schema: { type: "string" } },
            { name: "price", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Success",
            },
          },
        },
      },
      "/api/technicians": {
        get: {
          tags: ["Public"],
          summary: "Search technicians",
          description: "Public endpoint listing technicians with search and filter parameters.",
          parameters: [
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "location", in: "query", schema: { type: "string" } },
            { name: "skills", in: "query", schema: { type: "string" } },
            { name: "rating", in: "query", schema: { type: "string" } },
          ],
          responses: {
            200: {
              description: "Success",
            },
          },
        },
      },
      "/api/technicians/{id}": {
        get: {
          tags: ["Public"],
          summary: "View technician by ID",
          description: "Public endpoint returning a single technician profile.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            200: { description: "Success" },
            404: { description: "Technician not found" },
          },
        },
      },
      "/api/bookings": {
        get: {
          tags: ["Bookings"],
          summary: "Get customer bookings",
          description: "Returns bookings list for the authenticated customer.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden - Role must be CUSTOMER" },
          },
        },
        post: {
          tags: ["Bookings"],
          summary: "Submit booking request",
          description: "Submits a booking request for a service (Customer only).",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["serviceId", "scheduledAt"],
                  properties: {
                    serviceId: { type: "string", format: "uuid" },
                    scheduledAt: { type: "string", format: "date-time", description: "ISO datetime string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Bad Request" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/bookings/{id}": {
        get: {
          tags: ["Bookings"],
          summary: "Get booking details",
          description: "Returns booking details. Restricted to customer, technician, and admin.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden - Access denied" },
            404: { description: "Not found" },
          },
        },
      },
      "/api/payments/create": {
        post: {
          tags: ["Payments"],
          summary: "Create Stripe Checkout session",
          description: "Customer initiates payment for an ACCEPTED booking.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["bookingId"],
                  properties: {
                    bookingId: { type: "string", format: "uuid" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Checkout session generated" },
            400: { description: "Booking status is not ACCEPTED" },
            409: { description: "Already paid" },
          },
        },
      },
      "/api/payments/confirm": {
        post: {
          tags: ["Payments"],
          summary: "Stripe webhook confirm",
          description: "Public raw webhook receiver confirming transactions. Validates Stripe signature.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: { type: "object" },
              },
            },
          },
          responses: {
            200: { description: "Received" },
            400: { description: "Invalid signature" },
          },
        },
      },
      "/api/payments": {
        get: {
          tags: ["Payments"],
          summary: "List payments",
          description: "Returns payments log. Customers or technicians see their relevant payments log.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "COMPLETED", "FAILED"] } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
          },
        },
      },
      "/api/payments/{id}": {
        get: {
          tags: ["Payments"],
          summary: "Get payment details",
          description: "Access guarded details view.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden" },
            404: { description: "Not found" },
          },
        },
      },
      "/api/technician/profile": {
        put: {
          tags: ["Technician"],
          summary: "Update technician profile",
          description: "Updates profile details for the authenticated technician.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["skills", "experience", "hourlyRate"],
                  properties: {
                    skills: { type: "array", items: { type: "string" } },
                    experience: { type: "integer" },
                    hourlyRate: { type: "number" },
                    bio: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden - Role must be TECHNICIAN" },
          },
        },
      },
      "/api/technician/availability": {
        put: {
          tags: ["Technician"],
          summary: "Update technician availability",
          description: "Toggles availability status of the authenticated technician.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["isAvailable"],
                  properties: {
                    isAvailable: { type: "boolean" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden - Role must be TECHNICIAN" },
          },
        },
      },
      "/api/technician/bookings": {
        get: {
          tags: ["Technician"],
          summary: "Get technician bookings",
          description: "Lists bookings assigned to the authenticated technician.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden - Role must be TECHNICIAN" },
          },
        },
      },
      "/api/technician/bookings/{id}": {
        patch: {
          tags: ["Technician"],
          summary: "Update booking status",
          description: "Updates booking status (Technician or Customer).",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: {
                      type: "string",
                      enum: ["REQUESTED", "ACCEPTED", "DECLINED", "PAID", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Success" },
            400: { description: "Bad Request" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/reviews": {
        post: {
          tags: ["Reviews"],
          summary: "Submit review",
          description: "Customer reviews a COMPLETED booking. Enforces uniqueness.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["bookingId", "rating", "comment"],
                  properties: {
                    bookingId: { type: "string", format: "uuid" },
                    rating: { type: "integer", minimum: 1, maximum: 5 },
                    comment: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Review saved" },
            400: { description: "Booking status is not COMPLETED" },
            409: { description: "Already reviewed" },
          },
        },
      },
      "/api/admin/users": {
        get: {
          tags: ["Admin"],
          summary: "List all users",
          description: "Returns platform users list.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "role", in: "query", schema: { type: "string", enum: ["CUSTOMER", "TECHNICIAN", "ADMIN"] } },
            { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "BANNED"] } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/admin/users/{id}": {
        patch: {
          tags: ["Admin"],
          summary: "Ban/unban user",
          description: "Toggles user status (ACTIVE/BANNED). Self-ban is blocked.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["status"],
                  properties: {
                    status: { type: "string", enum: ["ACTIVE", "BANNED"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Updated" },
            400: { description: "Self-banning blocked" },
            404: { description: "User not found" },
          },
        },
      },
      "/api/admin/bookings": {
        get: {
          tags: ["Admin"],
          summary: "Oversee bookings",
          description: "Lists all bookings across the platform.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/admin/categories": {
        get: {
          tags: ["Admin"],
          summary: "List all categories for Admin",
          description: "Returns all categories on the platform.",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden" },
          },
        },
        post: {
          tags: ["Admin"],
          summary: "Create category",
          description: "Creates a new category. Enforces unique name.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["name"],
                  properties: {
                    name: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            409: { description: "Category name exists" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
