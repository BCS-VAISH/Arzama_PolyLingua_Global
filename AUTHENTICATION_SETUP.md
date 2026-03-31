# Authentication & Review System Setup

This document describes the complete authentication and review system that has been implemented.

## Features Implemented

### 1. Authentication System
- **User Registration**: `/register` - Users can register with email, password, and optional name
- **User Login**: `/login` - Secure login with JWT tokens
- **Password Security**: Passwords are hashed using bcrypt before storage
- **JWT Authentication**: Tokens stored in HTTP-only cookies for security
- **Protected Routes**: Only authenticated users can post comments and reviews

### 2. Admin Dashboard
- **Admin Login**: `/admin/login` - Separate admin login page
- **Admin Dashboard**: `/admin` - Full admin panel with:
  - View all users
  - View all reviews with moderation (delete)
  - View all comments with moderation (delete)
  - Tabbed interface for easy navigation

### 3. User Profile
- **Profile Page**: `/profile` - User can view:
  - Their profile information
  - All their submitted reviews
  - All their submitted comments
  - Tabbed interface for reviews and comments

### 4. Comments & Reviews System
- **Comments**: Users can post comments on course pages (authenticated only)
- **Reviews**: Users can submit reviews with ratings (1-5 stars)
- **Duplicate Prevention**: Users can only submit one review per course
- **Average Rating**: Automatically calculated and displayed
- **Real-time Updates**: Comments and reviews update dynamically

### 5. Security Features
- **Input Validation**: All inputs are validated and sanitized
- **XSS Prevention**: Input sanitization to prevent cross-site scripting
- **Password Hashing**: bcrypt with salt rounds
- **JWT Tokens**: Secure token-based authentication
- **HTTP-only Cookies**: Tokens stored securely in cookies

### 6. Animations
- **Framer Motion**: Smooth animations for:
  - Loading states
  - Comment/review submissions
  - List rendering (fade-in, slide-up effects)

## Database Models

### User Model
- `email` (unique, required)
- `password` (hashed, required)
- `name` (optional)
- `role` (user/admin, default: user)
- `createdAt`, `updatedAt`

### Course Model
- `courseId` (unique identifier)
- `name`
- `description`
- `priceCents`
- `currency`

### Review Model
- `userId` (reference to User)
- `courseId` (reference to Course)
- `rating` (1-5)
- `comment`
- Unique constraint on (userId, courseId) - prevents duplicate reviews

### Comment Model
- `userId` (reference to User)
- `courseId` (reference to Course)
- `content`

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user

### Reviews
- `GET /api/reviews?courseId=...` - Get reviews for a course
- `POST /api/reviews` - Submit a review (authenticated)
- `DELETE /api/reviews/[id]` - Delete review (admin only)

### Comments
- `GET /api/comments?courseId=...` - Get comments for a course
- `POST /api/comments` - Submit a comment (authenticated)
- `DELETE /api/comments/[id]` - Delete comment (admin only)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/reviews` - Get all reviews (admin only)
- `GET /api/admin/comments` - Get all comments (admin only)

### User Profile
- `GET /api/user/reviews` - Get current user's reviews
- `GET /api/user/comments` - Get current user's comments

## Environment Variables

Add these to your `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key_change_in_production
JWT_EXPIRES_IN=7d
```

## Setup Instructions

1. **Install Dependencies**: Already installed (mongoose, bcryptjs, jsonwebtoken, motion)

2. **Set Environment Variables**: Add MongoDB URI and JWT secret to `.env.local`

3. **Create Admin User**: You can create an admin user by:
   - Registering normally through `/register`
   - Then manually updating the user's role to 'admin' in MongoDB:
     ```javascript
     db.users.updateOne(
       { email: "admin@example.com" },
       { $set: { role: "admin" } }
     )
     ```

4. **Start the Application**: 
   ```bash
   npm run dev
   ```

## Usage

### For Users
1. Register at `/register` or login at `/login`
2. Navigate to any course page
3. Submit reviews (with rating) and comments
4. View your profile at `/profile`

### For Admins
1. Login at `/admin/login`
2. Access admin dashboard at `/admin`
3. View and moderate all users, reviews, and comments
4. Delete inappropriate content

## Notes

- The English course page has been updated with the new authentication and comments system
- French and Portuguese course pages can be updated similarly by following the same pattern
- All authentication is handled via JWT tokens stored in HTTP-only cookies
- The system prevents duplicate reviews per user per course
- All inputs are validated and sanitized for security

