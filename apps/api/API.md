# AutoCRM API Documentation

**Base URL:** `http://localhost:3000`

All responses are JSON. Request bodies must include `Content-Type: application/json`.

---

## Response Format

All endpoints follow a consistent response envelope:

```json
{
  "success": true,
  "message": "Human-readable result",
  "data": {},
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

On error:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error info",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## Health Check

### `GET /health`

Check if the server is running.

**Response:** `200 OK`

```json
{
  "status": "ok",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## Vehicles

### `GET /api/vehicles` — List all vehicles

Retrieve all available vehicles in the inventory.

**Query Parameters** (optional)

| Parameter | Type   | Description                              |
| --------- | ------ | ---------------------------------------- |
| `status`  | string | Filter by status (Available, Sold, etc.) |
| `make`    | string | Filter by manufacturer                   |
| `minYear` | number | Filter by minimum manufacturing year     |
| `maxYear` | number | Filter by maximum manufacturing year     |

**Example Request**

```bash
GET /api/vehicles?status=Available&make=Toyota
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "name": "vehicle-001",
      "make": "Toyota",
      "model": "Camry",
      "year": 2023,
      "status": "Available",
      "vin": "4T1BF1EK4CU123456",
      "mileage": 15000,
      "price": 28500,
      "description": "Like new condition, full service history",
      "images": ["https://example.com/image1.jpg"],
      "creation": "2026-03-14 10:00:00",
      "modified": "2026-03-14 10:00:00"
    }
  ],
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

### `GET /api/vehicles/:id` — Get a specific vehicle

Retrieve details for a single vehicle by ID.

**Path Parameters**

| Parameter | Type   | Description     |
| --------- | ------ | --------------- |
| `id`      | string | Vehicle name/ID |

**Example Request**

```bash
GET /api/vehicles/vehicle-001
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Vehicle retrieved successfully",
  "data": {
    "name": "vehicle-001",
    "make": "Toyota",
    "model": "Camry",
    "year": 2023,
    "status": "Available",
    "vin": "4T1BF1EK4CU123456",
    "mileage": 15000,
    "price": 28500,
    "description": "Like new condition, full service history",
    "images": ["https://example.com/image1.jpg"],
    "creation": "2026-03-14 10:00:00",
    "modified": "2026-03-14 10:00:00"
  },
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

**Error Response:** `404 Not Found`

```json
{
  "success": false,
  "message": "Vehicle not found",
  "error": "No vehicle with ID 'vehicle-001'",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## Leads

### `POST /api/leads` — Create a new lead

Create a customer inquiry/lead from the public form. This endpoint is **public** and requires no authentication.

**Request Body**

| Field               | Type   | Required | Description                                                |
| ------------------- | ------ | -------- | ---------------------------------------------------------- |
| `firstName`         | string | Yes      | Customer first name                                        |
| `lastName`          | string | Yes      | Customer last name                                         |
| `email`             | string | Yes      | Customer email address                                     |
| `phone`             | string | Yes      | Customer phone number                                      |
| `message`           | string | Yes      | Inquiry message                                            |
| `vehicleProperties` | string | Yes      | Denormalized vehicle descriptor: `"Color Make Model Year"` |

**Example Request**

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "message": "Interested in this vehicle.",
    "vehicleProperties": "Shark Blue Porsche 911 GT3 2023"
  }'
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "name": "lead-2026-001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "555-1234",
    "message": "Interested in this vehicle.",
    "vehicle_properties": "Shark Blue Porsche 911 GT3 2023",
    "status": "New",
    "creation": "2026-03-14 12:00:00",
    "modified": "2026-03-14 12:00:00"
  },
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

**Error Response:** `400 Bad Request`

```json
{
  "success": false,
  "message": "Validation error",
  "error": "Field 'email' is required",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## Rate Limiting

The API enforces rate limiting on all `/api` endpoints:

- **Limit:** 100 requests per 15 minutes per IP address
- **Headers:** Includes `RateLimit-*` headers in responses

When rate limit is exceeded:

**Response:** `429 Too Many Requests`

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## Error Handling

All errors follow the standard error response format with appropriate HTTP status codes:

| Status | Meaning               |
| ------ | --------------------- |
| 200    | Success               |
| 201    | Created               |
| 400    | Bad Request           |
| 404    | Not Found             |
| 429    | Too Many Requests     |
| 500    | Internal Server Error |

---

## Common Response Fields

- **`name`**: Unique identifier (returned in create/read responses)
- **`creation`**: Timestamp when the record was created
- **`modified`**: Timestamp when the record was last modified
- **`timestamp`**: ISO timestamp of the API response
