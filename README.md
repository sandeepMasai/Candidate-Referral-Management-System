# Candidate-Referral-Management-System

## Backend environment

Create a `.env` file inside the `backend/` directory before starting the API server:

```
MONGODB_URI=<your full mongodb connection string>
# Optional helpers when your Mongo user is scoped to a specific database
MONGODB_DB_NAME=candidate_referrals
MONGODB_AUTH_SOURCE=candidate_referrals
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=5
JWT_SECRET=super-secret-key
JWT_EXPIRES_IN=7d
RESET_TOKEN_EXPIRES_MINUTES=30
```

If your MongoDB user was created inside a database other than `admin`, set
`MONGODB_AUTH_SOURCE` to that database name to avoid `bad auth` errors. When you
use an SRV connection string without a trailing database segment, MongoDB
defaults to authenticating against `test`, which often causes the authentication
failure shown in the logs. Providing `MONGODB_DB_NAME` (to pick which database
Mongoose should use) and `MONGODB_AUTH_SOURCE` (to pick where MongoDB should
authenticate the user) resolves the issue.

### Auth & profile routes

- `POST /api/auth/register` – create a user (defaults to role `user`)
- `POST /api/auth/login` – email + password, returns JWT + user
- `POST /api/auth/forgot-password` – generates a reset token (returned in the response for now)
- `POST /api/auth/reset-password` – submit the token + new password
- `GET /api/auth/me` – fetch the authenticated user
- `GET /api/profile` – returns the caller's profile (requires auth)
- `POST /api/profile` – create/update profile fields

All `/api/candidates` routes now require authentication. Only admins may update
statuses or delete candidates; regular users only see the candidates they
referred and can submit new referrals.

## Frontend environment

The frontend expects the API base URL via Vite env variables. Create
`frontend/.env` (or `.env.local`) with:

```
VITE_API_BASE_URL=http://localhost:5000/api
# Optional when static files (resume downloads) come from a different hostname
VITE_BACKEND_ORIGIN=http://localhost:5000
```

Restart `npm run dev` after adding or changing these values.
