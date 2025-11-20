# Candidate Referral Management System

A full-stack web application for managing candidate referrals with user authentication, role-based access control, and cloud-based resume storage.

## 🚀 Features

### User Features
- **Authentication & Authorization**
  - User registration and login
  - JWT-based authentication
  - Password reset functionality
  - Profile management

- **Candidate Management**
  - Submit candidate referrals with resume uploads
  - View all referred candidates
  - Track candidate status (Pending, Reviewed, Hired)
  - Filter candidates by status
  - View referrer information for each candidate

- **Resume Handling**
  - Direct upload to Cloudinary (cloud storage)
  - Secure PDF file uploads
  - View/download resumes from cloud storage
  - Automatic file validation (PDF only, size limits)

### Admin Features
- **Dashboard**
  - System-wide statistics and metrics
  - Total users, admins, and candidates count
  - Candidates by status breakdown
  - Top referrers analytics
  - Recent candidates list

- **User Management**
  - View all system users
  - Update user roles (admin, user, hr_manager)
  - Delete users
  - View user activity

- **Candidate Management**
  - View all candidates system-wide
  - Update candidate status
  - Delete candidates
  - View referrer information for all candidates

### HR Manager Features
- Access to candidate management features
- View and manage referrals
- Update candidate statuses

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Storage**: Cloudinary (cloud-based)
- **Validation**: Express Validator
- **Other**: Bcryptjs (password hashing), Multer (file handling), Morgan (logging)

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **Styling**: CSS3 with modern animations
- **Build Tool**: Vite
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **Cloudinary** account (free tier available)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Candidate-Referral-Management-System
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

## ⚙️ Configuration

### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database Configuration
MONGODB_URI=<your-mongodb-connection-string>
MONGODB_DB_NAME=candidate_referrals
MONGODB_AUTH_SOURCE=candidate_referrals

# Server Configuration
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
RESET_TOKEN_EXPIRES_MINUTES=30

# File Upload Configuration
MAX_FILE_SIZE_MB=5

# Cloudinary Configuration (Required for Resume Upload)
CLOUDINARY_CLOUD_NAME=<your-cloudinary-cloud-name>
CLOUDINARY_API_KEY=<your-cloudinary-api-key>
CLOUDINARY_API_SECRET=<your-cloudinary-api-secret>
```

### Setting up MongoDB

1. **Local MongoDB**: Install MongoDB locally or use MongoDB Atlas
2. **Connection String**: Use your MongoDB connection string in `MONGODB_URI`
3. **Database Name**: The system will use `candidate_referrals` as the database name

**Note**: If your MongoDB user is scoped to a specific database, set `MONGODB_AUTH_SOURCE` to that database name to avoid authentication errors.

### Setting up Cloudinary

1. **Create Account**: Sign up for a free account at [Cloudinary](https://cloudinary.com/)
2. **Get Credentials**: From your Cloudinary Dashboard:
   - Copy **Cloud Name** → `CLOUDINARY_CLOUD_NAME`
   - Copy **API Key** → `CLOUDINARY_API_KEY`
   - Copy **API Secret** → `CLOUDINARY_API_SECRET`
3. **Enable PDF Delivery**:
   - Go to **Settings** → **Security**
   - Enable **"PDF and ZIP files delivery"**
   - Save changes
4. **Add to .env**: Add these values to your backend `.env` file

### Frontend Configuration

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BACKEND_ORIGIN=http://localhost:5000
```

**Note**: Restart the development server after adding or changing these values.

## 🚀 Running the Application Locally

Follow these steps to run the project on your local machine:

### Step 1: Environment Setup

1. **Create Backend `.env` file**
   - Navigate to the `backend/` directory
   - Create a `.env` file (copy from `.env.example` if available)
   - Add all required environment variables (see Configuration section above)

2. **Create Frontend `.env` file**
   - Navigate to the `frontend/` directory
   - Create a `.env` file with:
     ```env
     VITE_API_BASE_URL=http://localhost:5000/api
     VITE_BACKEND_ORIGIN=http://localhost:5000
     ```

### Step 2: Start MongoDB

- **Option A: Local MongoDB**
  ```bash
  # Make sure MongoDB is running locally
  mongod
  ```

- **Option B: MongoDB Atlas**
  - Use your MongoDB Atlas connection string in `MONGODB_URI`

### Step 3: Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:5000`

**Verify Backend is Running:**
- Visit `http://localhost:5000/health` in your browser
- You should see: `{"status":"ok","timestamp":"..."}`

### Step 4: Start Frontend Development Server

Open a **new terminal** and run:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Step 5: Access the Application

1. Open your browser and navigate to `http://localhost:5173`
2. You should see the login page
3. Register a new user or login with existing credentials

### Development Mode Summary

- **Backend**: `http://localhost:5000`
- **Frontend**: `http://localhost:5173`
- **Health Check**: `http://localhost:5000/health`
- **API Base**: `http://localhost:5000/api`

### Production Build

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   ```
   The build output will be in `frontend/dist/`

2. **Start the backend**
   ```bash
   cd backend
   npm start
   ```

## 📚 API Documentation

Complete API documentation is available in [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

**Quick Links:**
- **Full API Reference**: See `API_DOCUMENTATION.md` for detailed endpoint documentation
- **Postman Collection**: Import `Candidate_Referral_API.postman_collection.json` into Postman

### API Endpoints Overview

**Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/me` - Get current user

**Profile**
- `GET /api/profile` - Get user profile
- `POST /api/profile` - Update user profile

**Candidates**
- `GET /api/candidates` - Get candidates (with filters)
- `GET /api/candidates/metrics` - Get candidate metrics
- `POST /api/candidates` - Create candidate (with resume upload)
- `PUT /api/candidates/:id/status` - Update status (Admin/HR Manager)
- `DELETE /api/candidates/:id` - Delete candidate (Admin only)

**Admin**
- `GET /api/admin/stats` - Get system statistics
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/role` - Update user role
- `DELETE /api/admin/users/:id` - Delete user

**Health Check**
- `GET /health` - Server health check

For detailed request/response schemas, validation rules, and examples, please refer to [`API_DOCUMENTATION.md`](./API_DOCUMENTATION.md)

## 👥 User Roles

The system supports three user roles:

1. **User** (Default)
   - Can submit candidate referrals
   - Can view their own referrals
   - Can update their profile

2. **HR Manager**
   - All User permissions
   - Can view all candidates
   - Can update candidate statuses

3. **Admin**
   - All HR Manager permissions
   - Can manage users (create, update roles, delete)
   - Can delete candidates
   - Access to admin dashboard with system statistics

## 🎨 Features & UI

### Responsive Design
- Mobile-first approach
- Optimized for mobile, tablet, and desktop
- Smooth animations and transitions
- Modern card-based layouts

### View Modes
- **Table View**: Compact list view for admins
- **Card View**: Visual card layout for all users
- Toggle between views seamlessly

### Status Tracking
- Visual status badges with color coding
- Real-time status updates
- Status filtering capabilities

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- Secure file uploads with validation
- CORS protection
- Environment variable protection
- Secure Cloudinary uploads with signed URLs

## 📝 Candidate Status Flow

1. **Pending** - Newly submitted referral (default)
2. **Reviewed** - Candidate under review
3. **Hired** - Candidate has been hired

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Verify `MONGODB_URI` is correct
   - Check `MONGODB_AUTH_SOURCE` matches your user's database
   - Ensure MongoDB is running (if local)

2. **Cloudinary Upload Fails**
   - Verify all Cloudinary credentials in `.env`
   - Ensure PDF delivery is enabled in Cloudinary settings
   - Check file size limits (default: 5MB)

3. **PDF Not Loading**
   - Enable "PDF and ZIP files delivery" in Cloudinary Security settings
   - Ensure `access_mode: 'public'` is set (handled automatically)
   - Verify the PDF file is valid and not corrupted

4. **Authentication Errors**
   - Check JWT token expiration
   - Verify `JWT_SECRET` is set
   - Clear browser localStorage and re-login

5. **CORS Errors**
   - Verify `CLIENT_ORIGIN` in backend `.env` matches frontend URL
   - Add multiple origins if needed: `http://localhost:5173,http://localhost:3000`

## 📁 Project Structure

```
Candidate-Referral-Management-System/
├── backend/
│   ├── src/
│   │   ├── config/          # Database and Cloudinary configuration
│   │   ├── controllers/     # Route handlers
│   │   ├── middleware/      # Authentication, validation, error handling
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API routes
│   │   └── utils/           # Utility functions
│   ├── uploads/             # Legacy uploads (backward compatibility)
│   ├── .env                 # Environment variables
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # API client
│   │   ├── store/           # Redux store
│   │   └── types.ts         # TypeScript types
│   ├── .env                 # Frontend environment variables
│   └── package.json
└── README.md
```

## 🚧 Development Notes

- Resumes are stored on Cloudinary (cloud storage) for scalability
- The `/uploads` static route is maintained for backward compatibility
- All candidate routes require authentication
- Admin and HR Manager routes have additional role checks

## 📄 License

This project is private and proprietary.

## 👨‍💻 Development

### Running Tests
```bash
# Backend tests (when implemented)
cd backend
npm test

# Frontend tests (when implemented)
cd frontend
npm test
```

### Building for Production
```bash
# Build frontend
cd frontend
npm run build

# The build output will be in frontend/dist/
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📞 Support

For issues or questions, please contact the development team.

---

## ⚠️ Assumptions and Limitations

### Assumptions

1. **User Roles**
   - Default role for new users is `user`
   - Only admins can create other admins
   - User roles can be changed by admins only

2. **Candidate Referrals**
   - Each candidate can only be referred once (unique email constraint)
   - Candidates are linked to the user who referred them
   - Resume upload is optional but recommended

3. **File Uploads**
   - Only PDF files are accepted for resumes
   - Maximum file size is 5MB (configurable via `MAX_FILE_SIZE_MB`)
   - Files are uploaded to Cloudinary cloud storage
   - Files are automatically deleted when a candidate is deleted

4. **Authentication**
   - JWT tokens expire after 7 days (configurable)
   - Tokens are stored in localStorage (frontend)
   - Password reset tokens expire after 30 minutes

5. **Data Access**
   - Regular users can only see their own referrals
   - HR Managers can see all candidates and update statuses
   - Admins have full system access

### Limitations

1. **No Pagination**
   - All list endpoints return all matching results
   - May cause performance issues with large datasets
   - Pagination should be added for production use

2. **No Rate Limiting**
   - API endpoints don't have rate limiting
   - Should be implemented for production to prevent abuse

3. **Password Reset**
   - Email sending is not implemented
   - Reset tokens are returned in response (development mode only)
   - Requires email service integration for production

4. **File Validation**
   - Only validates file extension and MIME type
   - Doesn't verify actual PDF content integrity
   - Malicious files disguised as PDFs may pass validation

5. **Search Functionality**
   - Basic text search only (no advanced filtering)
   - No full-text search capabilities
   - Search is case-insensitive but limited to name, email, jobTitle, status

6. **CORS Configuration**
   - Currently allows all origins in development
   - Should be restricted to specific domains in production

7. **Error Handling**
   - Detailed error messages in development mode
   - Generic messages in production
   - Consider implementing structured error responses

8. **Database**
   - No database migrations system
   - Manual schema updates required
   - No database backup/restore utilities included

9. **Testing**
   - Unit tests not included
   - Integration tests not included
   - Manual testing required

10. **Monitoring & Logging**
    - Basic logging with Morgan
    - No structured logging
    - No monitoring/alerting system
    - No performance metrics collection

11. **Scalability**
    - Single server deployment
    - No load balancing considerations
    - No horizontal scaling support
    - File uploads may bottleneck on large files

12. **Security**
    - JWT secret should be strong in production
    - No HTTPS enforcement
    - No request signing/verification
    - No API key rotation mechanism

### Future Enhancements

- [ ] Add pagination to list endpoints
- [ ] Implement rate limiting
- [ ] Add email service for password reset
- [ ] Enhance file validation (PDF content verification)
- [ ] Add advanced search/filtering
- [ ] Implement database migrations
- [ ] Add comprehensive test suite
- [ ] Add monitoring and structured logging
- [ ] Implement caching layer
- [ ] Add export functionality (CSV, Excel)
- [ ] Implement notification system
- [ ] Add audit logging
- [ ] Implement soft delete for candidates/users
- [ ] Add file preview functionality
- [ ] Implement batch operations

---

**Built with ❤️ using React, Node.js, MongoDB, and Cloudinary**
