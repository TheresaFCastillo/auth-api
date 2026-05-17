# Auth API

A full-stack authentication REST API built with Node.js, Express, and MySQL.

## Live URL
- API: `coming soon`
- Frontend: `coming soon`

## Features
- User registration with email verification
- JWT authentication with refresh tokens
- Role-based access control (Admin/User)
- Password reset via email
- Swagger API documentation

## Setup Instructions

### Prerequisites
- Node.js
- MySQL

### Installation
1. Clone the repository
   ```bash
   git clone https://github.com/TheresaFCastillo/auth-api.git
   cd auth-api
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create `.env` file with the following keys:
   ```env
   NODE_ENV=development
   PORT=4000
   DB_HOST=
   DB_PORT=
   DB_NAME=
   DB_USER=
   DB_PASSWORD=
   JWT_SECRET=
   JWT_EXPIRES_IN=15m
   REFRESH_TOKEN_EXPIRES_DAYS=7
   EMAIL_FROM=
   SMTP_HOST=
   SMTP_PORT=
   SMTP_USER=
   SMTP_PASS=
   CORS_ORIGIN=
   ```

4. Run the development server
   ```bash
   npm run dev
   ```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /accounts/register | Register new account | Public |
| POST | /accounts/verify-email | Verify email address | Public |
| POST | /accounts/authenticate | Login | Public |
| POST | /accounts/refresh-token | Refresh JWT token | Public |
| POST | /accounts/revoke-token | Logout | Required |
| POST | /accounts/forgot-password | Request password reset | Public |
| POST | /accounts/validate-reset-token | Validate reset token | Public |
| POST | /accounts/reset-password | Reset password | Public |
| GET | /accounts | Get all accounts | Admin |
| GET | /accounts/:id | Get account by ID | Required |
| PUT | /accounts/:id | Update account | Required |
| DELETE | /accounts/:id | Delete account | Admin |


# edit README.md and replace "coming soon" with https://auth-api-ailu.onrender.com
git add README.md
git commit -m "Update README with live API URL"
git push
