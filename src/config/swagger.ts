import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "RentNest API",
      version: "1.0.0",
      description: "Comprehensive REST API backend for RentNest - a rental property marketplace platform.",
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
          description: "Registers a tenant or landlord user. Self-registering admins is blocked.",
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
                    role: { type: "string", enum: ["TENANT", "LANDLORD"] },
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
          tags: ["Categories"],
          summary: "List all categories",
          description: "Public endpoint to retrieve all categories.",
          responses: {
            200: {
              description: "Success",
            },
          },
        },
      },
      "/api/properties": {
        get: {
          tags: ["Properties"],
          summary: "Search available properties",
          description: "Public endpoint listing properties with status AVAILABLE.",
          parameters: [
            { name: "location", in: "query", schema: { type: "string" } },
            { name: "minPrice", in: "query", schema: { type: "number" } },
            { name: "maxPrice", in: "query", schema: { type: "number" } },
            { name: "propertyType", in: "query", schema: { type: "string" } },
            { name: "categoryId", in: "query", schema: { type: "string" } },
            { name: "amenities", in: "query", schema: { type: "string" }, description: "Comma separated list" },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: {
              description: "List of properties with landlord details (name only)",
            },
          },
        },
      },
      "/api/properties/{id}": {
        get: {
          tags: ["Properties"],
          summary: "Get property details",
          description: "Public endpoint returning a single property.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            200: { description: "Success" },
            404: { description: "Property not found" },
          },
        },
      },
      "/api/properties/{id}/reviews": {
        get: {
          tags: ["Properties"],
          summary: "Get property reviews",
          description: "Public endpoint returning all reviews of a property.",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Paginated list of reviews with reviewer name" },
            404: { description: "Property not found" },
          },
        },
      },
      "/api/landlord/properties": {
        get: {
          tags: ["Landlord Properties"],
          summary: "List landlord properties",
          description: "Returns all properties owned by the authenticated landlord, including unavailable ones.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
            403: { description: "Forbidden - Role must be LANDLORD" },
          },
        },
        post: {
          tags: ["Landlord Properties"],
          summary: "Create property",
          description: "Creates a new property listing. Landlord ID derived automatically from JWT.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "description", "location", "price", "propertyType", "categoryId"],
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    location: { type: "string" },
                    price: { type: "number" },
                    propertyType: { type: "string" },
                    categoryId: { type: "string", format: "uuid" },
                    amenities: { type: "array", items: { type: "string" } },
                    images: { type: "array", items: { type: "string" } },
                    availability: { type: "string", enum: ["AVAILABLE", "RENTED", "MAINTENANCE"] },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Created" },
            400: { description: "Bad Request / Category not found" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/landlord/properties/{id}": {
        put: {
          tags: ["Landlord Properties"],
          summary: "Update property",
          description: "Updates own property listing details.",
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
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    location: { type: "string" },
                    price: { type: "number" },
                    propertyType: { type: "string" },
                    categoryId: { type: "string", format: "uuid" },
                    amenities: { type: "array", items: { type: "string" } },
                    images: { type: "array", items: { type: "string" } },
                    availability: { type: "string", enum: ["AVAILABLE", "RENTED", "MAINTENANCE"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Updated" },
            403: { description: "Forbidden - Not property owner" },
            404: { description: "Property not found" },
          },
        },
        delete: {
          tags: ["Landlord Properties"],
          summary: "Delete property",
          description: "Deletes own property listing. Blocked if active/approved bookings exist.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            200: { description: "Deleted" },
            400: { description: "Cannot delete - Booking requests active" },
            403: { description: "Forbidden" },
            404: { description: "Property not found" },
          },
        },
      },
      "/api/rentals": {
        get: {
          tags: ["Rentals"],
          summary: "List rental requests",
          description: "Lists rental requests. Tenants see theirs, Landlords see requests for their properties. Admins receive redirect warnings.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string", enum: ["PENDING", "APPROVED", "REJECTED", "ACTIVE", "COMPLETED"] } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
          },
        },
        post: {
          tags: ["Rentals"],
          summary: "Submit booking request",
          description: "Submits a rental request for an AVAILABLE property (Tenant only).",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["propertyId", "startDate", "duration"],
                  properties: {
                    propertyId: { type: "string", format: "uuid" },
                    startDate: { type: "string", format: "date-time", description: "ISO datetime string" },
                    duration: { type: "integer", minimum: 1, description: "Days" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Submitted" },
            400: { description: "Property not available" },
            409: { description: "Duplicate pending request exists" },
          },
        },
      },
      "/api/rentals/{id}": {
        get: {
          tags: ["Rentals"],
          summary: "Get rental details",
          description: "Returns booking details. Restricted to requester tenant and property landlord.",
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
      "/api/landlord/requests": {
        get: {
          tags: ["Landlord Bookings"],
          summary: "List incoming bookings",
          description: "Lists incoming requests for properties owned by Landlord.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
          },
        },
      },
      "/api/landlord/requests/{id}": {
        patch: {
          tags: ["Landlord Bookings"],
          summary: "Process booking request",
          description: "Approve or reject a pending request.",
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
                  required: ["action"],
                  properties: {
                    action: { type: "string", enum: ["APPROVE", "REJECT"] },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Processed" },
            400: { description: "Request already processed" },
            403: { description: "Forbidden" },
          },
        },
      },
      "/api/payments/create": {
        post: {
          tags: ["Payments"],
          summary: "Create Stripe Checkout session",
          description: "Tenant initiates booking payment. Status must be APPROVED.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rentalRequestId"],
                  properties: {
                    rentalRequestId: { type: "string", format: "uuid" },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: "Checkout session generated" },
            400: { description: "Request status is not APPROVED" },
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
          description: "Returns payments log. Tenants see theirs, Landlords see their properties logs.",
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
      "/api/reviews": {
        post: {
          tags: ["Reviews"],
          summary: "Submit review",
          description: "Tenant reviews COMPLETED bookings. Enforces uniqueness.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["rentalRequestId", "rating", "comment"],
                  properties: {
                    rentalRequestId: { type: "string", format: "uuid" },
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
          tags: ["Admin User Management"],
          summary: "List all users",
          description: "Returns platform users list.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "role", in: "query", schema: { type: "string", enum: ["TENANT", "LANDLORD", "ADMIN"] } },
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
          tags: ["Admin User Management"],
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
      "/api/admin/properties": {
        get: {
          tags: ["Admin Platform Oversight"],
          summary: "Oversee properties",
          description: "Lists all properties on the platform.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "availability", in: "query", schema: { type: "string" } },
            { name: "landlordId", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
          },
        },
      },
      "/api/admin/rentals": {
        get: {
          tags: ["Admin Platform Oversight"],
          summary: "Oversee rentals",
          description: "Lists all rental requests across the platform.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
          },
        },
      },
      "/api/admin/payments": {
        get: {
          tags: ["Admin Platform Oversight"],
          summary: "Oversee payments",
          description: "Lists all payments logged across the platform.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "status", in: "query", schema: { type: "string" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 10 } },
          ],
          responses: {
            200: { description: "Success" },
          },
        },
      },
      "/api/admin/categories": {
        post: {
          tags: ["Admin Category Management"],
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
                    description: { type: "string" },
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
      "/api/admin/categories/{id}": {
        put: {
          tags: ["Admin Category Management"],
          summary: "Update category",
          description: "Modifies category name/description.",
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
                  properties: {
                    name: { type: "string" },
                    description: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "Updated" },
            404: { description: "Category not found" },
            409: { description: "Name already exists" },
          },
        },
        delete: {
          tags: ["Admin Category Management"],
          summary: "Delete category",
          description: "Removes category. Blocked if properties reference it.",
          security: [{ bearerAuth: [] }],
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } },
          ],
          responses: {
            200: { description: "Deleted" },
            400: { description: "Cannot delete category - referenced by properties" },
            404: { description: "Category not found" },
          },
        },
      },
    },
  },
  apis: [],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
