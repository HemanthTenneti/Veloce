# Veloce API Reference

**Base URL:** `http://localhost:3000`

All request bodies and responses use `application/json`. Timestamps are ISO 8601.

---

## Response Envelope

All endpoints return a consistent envelope:

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

### GET /health

Returns server status. No authentication required.

**Response — 200 OK**

```json
{
  "status": "ok",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## Vehicles

### GET /api/vehicles

Returns all vehicle records from the `Vehicle Inventory` DocType.

**Query Parameters**

| Parameter | Type   | Description                           |
| --------- | ------ | ------------------------------------- |
| status    | string | Filter by status: `Available`, `Sold` |
| make      | string | Filter by manufacturer                |
| minYear   | number | Minimum manufacturing year            |
| maxYear   | number | Maximum manufacturing year            |

**Response — 200 OK**

```json
{
  "success": true,
  "message": "Vehicles retrieved successfully",
  "data": [
    {
      "name": "vehicle-001",
      "make": "Porsche",
      "model": "911 GT3",
      "year": 2023,
      "color": "Shark Blue",
      "thumbnail": "/files/911gt3-thumb.jpg",
      "image_1": "/files/911gt3-01.jpg",
      "image_2": "/files/911gt3-02.jpg",
      "vin": "WP0AC2A91RS272401",
      "mileage": 3200,
      "price": 189000,
      "description": "Full PPF, factory options, delivery mileage only.",
      "status": "Available",
      "creation": "2026-03-14 10:00:00",
      "modified": "2026-03-14 10:00:00"
    }
  ],
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

### GET /api/vehicles/:id

Returns a single vehicle record by its Frappe document name.

**Path Parameters**

| Parameter | Type   | Description           |
| --------- | ------ | --------------------- |
| id        | string | Vehicle document name |

**Response — 200 OK**

Same structure as the list response `data` array, with a single object under `data`.

**Response — 404 Not Found**

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

### POST /api/leads

Creates a customer enquiry record in the `Lead` DocType. This endpoint is public and requires no authentication.

**Request Body**

| Field             | Type   | Required | Description                                                |
| ----------------- | ------ | -------- | ---------------------------------------------------------- |
| firstName         | string | Yes      | Customer first name                                        |
| lastName          | string | Yes      | Customer last name                                         |
| email             | string | Yes      | Customer email address                                     |
| phone             | string | Yes      | Customer phone number                                      |
| message           | string | Yes      | Enquiry message body                                       |
| vehicleProperties | string | Yes      | Denormalized vehicle descriptor: `"Color Make Model Year"` |

`vehicleProperties` is captured automatically from the vehicle card and stored as a plain string to avoid a secondary vehicle lookup on lead submission.

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

**Response — 201 Created**

```json
{
  "success": true,
  "message": "Lead created successfully",
  "data": {
    "name": "lead-2026-001",
    "first_name": "John",
    "last_name": "Doe",
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

**Response — 400 Bad Request**

```json
{
  "success": false,
  "message": "Validation error",
  "error": "Field 'vehicleProperties' is required",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## Rate Limiting

All `/api` endpoints are rate-limited per IP address:

- **Limit:** 100 requests per 15-minute window
- **Headers:** Standard `RateLimit-*` headers are included in every response

**Response — 429 Too Many Requests**

```json
{
  "success": false,
  "message": "Too many requests, please try again later",
  "timestamp": "2026-03-14T12:00:00.000Z"
}
```

---

## HTTP Status Codes

| Status | Meaning               |
| ------ | --------------------- |
| 200    | Success               |
| 201    | Created               |
| 400    | Bad Request           |
| 404    | Not Found             |
| 429    | Too Many Requests     |
| 500    | Internal Server Error |
