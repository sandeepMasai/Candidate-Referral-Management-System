# API Documentation

Complete API reference for the Candidate Referral Management System.

**Base URL**: `http://localhost:5000/api`

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## Health Check

### GET /health

Check if the server is running.

**No authentication required**

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### POST /api/auth/register

Register a new user.

**No authentication required**

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user" // Optional: "admin" | "user" | "hr_manager" (default: "user")
}
```

**Validation**:
- `name`: Required, non-empty string
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `role`: Optional, must be one of: "admin", "user", "hr_manager"

**Response** (201 Created):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `400`: Validation error
- `409`: Email already registered

---

### POST /api/auth/login

Login with email and password.

**No authentication required**

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Validation**:
- `email`: Required, valid email format
- `password`: Required, non-empty

**Response** (200 OK):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:
- `400`: Validation error
- `401`: Invalid email or password

---

### POST /api/auth/forgot-password

Request a password reset token.

**No authentication required**

**Request Body**:
```json
{
  "email": "john@example.com"
}
```

**Validation**:
- `email`: Required, valid email format

**Response** (200 OK):
```json
{
  "message": "Password reset token sent to email",
  "token": "reset-token-here" // Only in development mode
}
```

**Error Responses**:
- `400`: Validation error
- `404`: User not found

---

### POST /api/auth/reset-password

Reset password using reset token.

**No authentication required**

**Request Body**:
```json
{
  "token": "reset-token-here",
  "password": "newpassword123"
}
```

**Validation**:
- `token`: Required, non-empty
- `password`: Required, minimum 8 characters

**Response** (200 OK):
```json
{
  "message": "Password reset successfully"
}
```

**Error Responses**:
- `400`: Validation error or invalid token
- `404`: Invalid or expired reset token

---

### GET /api/auth/me

Get current authenticated user information.

**Authentication required**

**Response** (200 OK):
```json
{
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  }
}
```

**Error Responses**:
- `401`: Unauthorized (invalid or missing token)

---

## Profile Endpoints

### GET /api/profile

Get user profile information.

**Authentication required**

**Response** (200 OK):
```json
{
  "profile": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439011",
    "headline": "Software Engineer",
    "phone": "+1234567890",
    "location": "New York, NY",
    "linkedin": "https://linkedin.com/in/johndoe",
    "bio": "Experienced software developer...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response** (200 OK) - No profile:
```json
{
  "profile": null
}
```

---

### POST /api/profile

Create or update user profile.

**Authentication required**

**Request Body**:
```json
{
  "headline": "Software Engineer", // Optional, max 120 characters
  "phone": "+1234567890", // Optional, 7-20 digits
  "location": "New York, NY", // Optional, max 120 characters
  "linkedin": "https://linkedin.com/in/johndoe", // Optional, valid URL
  "bio": "Experienced software developer..." // Optional, max 2000 characters
}
```

**Validation**:
- All fields are optional
- `headline`: Max 120 characters
- `phone`: 7-20 digits (allows +, spaces, dashes, parentheses)
- `location`: Max 120 characters
- `linkedin`: Valid URL format
- `bio`: Max 2000 characters

**Response** (200 OK):
```json
{
  "profile": {
    "_id": "507f1f77bcf86cd799439011",
    "user": "507f1f77bcf86cd799439011",
    "headline": "Software Engineer",
    "phone": "+1234567890",
    "location": "New York, NY",
    "linkedin": "https://linkedin.com/in/johndoe",
    "bio": "Experienced software developer...",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized

---

## Candidate Endpoints

### GET /api/candidates

Get list of candidates.

**Authentication required**

**Query Parameters**:
- `status` (optional): Filter by status - "pending" | "reviewed" | "hired"
- `jobTitle` (optional): Filter by job title (case-insensitive partial match)
- `q` (optional): Search query (searches name, email, jobTitle, status)

**Note**: 
- Regular users see only their own referrals
- Admin and HR Manager see all candidates

**Response** (200 OK):
```json
{
  "candidates": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567890",
      "jobTitle": "Software Engineer",
      "status": "pending",
      "resumeUrl": "https://res.cloudinary.com/.../resume.pdf",
      "resumeFileName": "Jane_Smith_Resume.pdf",
      "referredBy": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /api/candidates/metrics

Get candidate metrics/statistics.

**Authentication required**

**Note**: 
- Regular users see metrics for their own referrals only
- Admin sees system-wide metrics

**Response** (200 OK):
```json
{
  "total": 25,
  "byStatus": {
    "pending": 10,
    "reviewed": 12,
    "hired": 3
  }
}
```

---

### POST /api/candidates

Create a new candidate referral.

**Authentication required**

**Request**: `multipart/form-data`

**Form Data Fields**:
- `name` (required): Candidate name
- `email` (required): Candidate email
- `phone` (required): Candidate phone (7-20 digits)
- `jobTitle` (required): Job title
- `resume` (optional): PDF file (max 5MB)

**Validation**:
- `name`: Required, non-empty
- `email`: Required, valid email format
- `phone`: Required, 7-20 digits
- `jobTitle`: Required, non-empty
- `resume`: Optional, must be PDF, max 5MB

**Response** (201 Created):
```json
{
  "message": "Candidate referred successfully",
  "candidate": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "+1234567890",
    "jobTitle": "Software Engineer",
    "status": "pending",
    "resumeUrl": "https://res.cloudinary.com/.../resume.pdf",
    "resumeFileName": "Jane_Smith_Resume.pdf",
    "resumePublicId": "candidate-resumes/1234567890-Jane_Smith_Resume.pdf",
    "referredBy": "507f1f77bcf86cd799439012",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses**:
- `400`: Validation error, invalid file format/size, or duplicate email
- `401`: Unauthorized
- `500`: Server error (Cloudinary upload failure, etc.)

**Example cURL**:
```bash
curl -X POST http://localhost:5000/api/candidates \
  -H "Authorization: Bearer <token>" \
  -F "name=Jane Smith" \
  -F "email=jane@example.com" \
  -F "phone=+1234567890" \
  -F "jobTitle=Software Engineer" \
  -F "resume=@/path/to/resume.pdf"
```

---

### PUT /api/candidates/:id/status

Update candidate status.

**Authentication required**  
**Authorization**: Admin or HR Manager only

**URL Parameters**:
- `id`: Candidate MongoDB ObjectId

**Request Body**:
```json
{
  "status": "reviewed" // "pending" | "reviewed" | "hired"
}
```

**Validation**:
- `id`: Must be valid MongoDB ObjectId
- `status`: Required, must be one of: "pending", "reviewed", "hired"

**Response** (200 OK):
```json
{
  "message": "Status updated successfully",
  "candidate": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Jane Smith",
    "status": "reviewed",
    ...
  }
}
```

**Error Responses**:
- `400`: Validation error
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Candidate not found

---

### DELETE /api/candidates/:id

Delete a candidate.

**Authentication required**  
**Authorization**: Admin only

**URL Parameters**:
- `id`: Candidate MongoDB ObjectId

**Note**: This will also delete the resume from Cloudinary if it exists.

**Response** (200 OK):
```json
{
  "message": "Candidate removed"
}
```

**Error Responses**:
- `400`: Invalid candidate id
- `401`: Unauthorized
- `403`: Forbidden (insufficient permissions)
- `404`: Candidate not found

---

## Admin Endpoints

All admin endpoints require:
- **Authentication**: Valid JWT token
- **Authorization**: Admin role only

### GET /api/admin/stats

Get system-wide statistics.

**Response** (200 OK):
```json
{
  "totalUsers": 50,
  "totalAdmins": 3,
  "totalCandidates": 125,
  "candidatesByStatus": {
    "pending": 45,
    "reviewed": 60,
    "hired": 20
  },
  "topReferrers": [
    {
      "user": {
        "_id": "507f1f77bcf86cd799439012",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "count": 15
    }
  ],
  "recentCandidates": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "jobTitle": "Software Engineer",
      "status": "pending",
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### GET /api/admin/users

Get all users in the system.

**Response** (200 OK):
```json
{
  "users": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

---

### PUT /api/admin/users/:id/role

Update user role.

**URL Parameters**:
- `id`: User MongoDB ObjectId

**Request Body**:
```json
{
  "role": "hr_manager" // "admin" | "user" | "hr_manager"
}
```

**Validation**:
- `id`: Must be valid MongoDB ObjectId
- `role`: Required, must be one of: "admin", "user", "hr_manager"

**Response** (200 OK):
```json
{
  "message": "User role updated successfully",
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "hr_manager",
    ...
  }
}
```

**Error Responses**:
- `400`: Validation error or invalid role
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: User not found

---

### DELETE /api/admin/users/:id

Delete a user.

**URL Parameters**:
- `id`: User MongoDB ObjectId

**Note**: Cannot delete your own account.

**Response** (200 OK):
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses**:
- `400`: Invalid user id or attempting to delete own account
- `401`: Unauthorized
- `403`: Forbidden (not admin)
- `404`: User not found

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "message": "Validation error",
  "errors": ["Name is required", "Email must be valid"]
}
```

### 401 Unauthorized
```json
{
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "message": "Access forbidden. Admin role required."
}
```

### 404 Not Found
```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Something went wrong",
  "stack": "..." // Only in development mode
}
```

---

## Status Codes Reference

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Validation error or invalid input |
| 401 | Unauthorized - Missing or invalid authentication token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists (e.g., duplicate email) |
| 500 | Internal Server Error - Server error |

---

## Candidate Status Values

- `pending`: Newly submitted referral (default)
- `reviewed`: Candidate under review
- `hired`: Candidate has been hired

---

## User Roles

- `admin`: Full system access
- `hr_manager`: Can manage candidates (update status)
- `user`: Can submit referrals and view own referrals (default)

---

## Notes

1. **File Uploads**: Resume files are uploaded to Cloudinary. Maximum file size is 5MB. Only PDF files are accepted.

2. **Authentication**: JWT tokens expire after 7 days (configurable via `JWT_EXPIRES_IN`).

3. **Pagination**: Currently, all endpoints return all matching results. Pagination may be added in future versions.

4. **Rate Limiting**: Not currently implemented. Consider adding for production.

5. **CORS**: Configured to allow requests from frontend origin. Update `CLIENT_ORIGIN` in `.env` for production.

