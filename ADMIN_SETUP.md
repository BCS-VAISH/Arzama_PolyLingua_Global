# Admin Authentication & Course Management System

## ✅ Features Implemented

### 1. Admin Authentication
- **Admin-only access**: Only users with `role: "admin"` can access the admin panel
- **Protected routes**: All admin routes are protected with JWT and role-based middleware
- **Admin login**: Separate login page at `/admin/login`

### 2. Course Management (CRUD)
- **Create**: Add new courses with all required fields
- **Read**: View all courses in a grid layout
- **Update**: Edit existing courses
- **Delete**: Remove courses from the system

### 3. Course Fields
Each course includes:
- **title** (required): Course title
- **description** (required): Course description
- **price** (required): Course price in ₹
- **discount** (optional): Discount percentage (0-100)
- **category** (required): Course category
- **thumbnail** (optional): URL to thumbnail image
- **videoLink** (optional): URL to course video
- **duration** (optional): Course duration (e.g., "10 hours", "5 weeks")
- **level** (required): Course level (beginner, intermediate, advanced)

### 4. Admin Dashboard
- **Statistics Dashboard**: 
  - Total Users
  - Total Courses
  - Total Reviews
  - Total Comments
  - Average Rating
  - Total Revenue
- **Animated Cards**: Beautiful gradient cards with animations
- **Tabbed Interface**: Easy navigation between sections

### 5. Protected Routes
All admin routes are protected:
- `/api/admin/*` - All admin API routes require admin role
- `/admin` - Admin dashboard requires admin authentication
- JWT token validation on every request

## 🚀 How to Create an Admin User

### Method 1: Using MongoDB Compass or MongoDB Shell

1. **Register a regular user** through the registration page at `/register`

2. **Update the user's role to admin** in MongoDB:

```javascript
// In MongoDB Compass or MongoDB Shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 2: Using MongoDB Atlas Web Interface

1. Go to your MongoDB Atlas dashboard
2. Navigate to your cluster → Browse Collections
3. Find the `users` collection
4. Find your user document
5. Edit the `role` field from `"user"` to `"admin"`
6. Save the changes

### Method 3: Direct Database Insert (for first admin)

```javascript
// In MongoDB Shell
use arzama_db

db.users.insertOne({
  email: "admin@example.com",
  password: "$2a$10$hashedPasswordHere", // Use bcrypt to hash password
  name: "Admin User",
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

**Note**: For Method 3, you'll need to hash the password first. It's easier to register normally and then update the role.

## 📋 Admin Routes

### API Routes (All require admin authentication)

- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/courses` - Get all courses
- `POST /api/admin/courses` - Create new course
- `GET /api/admin/courses/[id]` - Get single course
- `PUT /api/admin/courses/[id]` - Update course
- `DELETE /api/admin/courses/[id]` - Delete course
- `GET /api/admin/users` - Get all users
- `GET /api/admin/reviews` - Get all reviews
- `GET /api/admin/comments` - Get all comments

### Frontend Routes

- `/admin/login` - Admin login page
- `/admin` - Admin dashboard (protected)

## 🎨 Admin Dashboard Features

### Dashboard Tab
- Real-time statistics
- Animated stat cards
- Color-coded metrics
- Responsive grid layout

### Courses Tab
- Grid view of all courses
- Create new course button
- Edit course functionality
- Delete course with confirmation
- Course cards with thumbnail, price, discount, category, and level

### Users Tab
- Table view of all users
- User email, name, role, and creation date
- Role badges (admin/user)

### Reviews Tab
- List of all reviews
- Star ratings display
- Course association
- Delete functionality

### Comments Tab
- List of all comments
- Course association
- Delete functionality

## 🔒 Security Features

1. **JWT Authentication**: All admin routes require valid JWT token
2. **Role-based Access Control**: Only users with `role: "admin"` can access
3. **Input Validation**: All inputs are validated and sanitized
4. **XSS Prevention**: Input sanitization on all user inputs
5. **Protected API Routes**: Middleware checks admin role on every request

## 🎯 Usage Instructions

### For Admins:

1. **Login**: Go to `/admin/login` and enter your admin credentials
2. **Dashboard**: View statistics and overview
3. **Manage Courses**:
   - Click "Courses" tab
   - Click "Create Course" to add new course
   - Click "Edit" on any course to modify it
   - Click delete icon to remove a course
4. **Manage Users**: View all registered users
5. **Moderate Content**: Delete inappropriate reviews or comments

### Course Creation Form:

1. Fill in required fields (title, description, price, category, level)
2. Optionally add discount, thumbnail URL, video link, and duration
3. Click "Create Course" to save

### Course Editing:

1. Click "Edit" on any course card
2. Modify any fields
3. Click "Update Course" to save changes

## 📝 Notes

- All course prices are stored in the main currency (₹)
- Discounts are applied as percentages (0-100)
- Course IDs are auto-generated from the title (URL-friendly)
- Thumbnails and video links should be valid URLs
- All timestamps are automatically managed by MongoDB

## 🐛 Troubleshooting

### "Access denied" error
- Ensure your user has `role: "admin"` in the database
- Check that you're logged in with the correct account

### Course creation fails
- Check that all required fields are filled
- Verify price is a positive number
- Ensure discount is between 0-100 if provided
- Check that level is one of: beginner, intermediate, advanced

### Can't see admin dashboard
- Verify you're logged in as admin
- Check browser console for errors
- Ensure JWT token is valid



