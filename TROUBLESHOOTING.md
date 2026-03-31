# Troubleshooting Guide

## Common Issues and Solutions

### 1. "Registration Failed" or "Login Failed" Errors

#### Check MongoDB Connection
- Ensure your `.env.local` file has a valid MongoDB connection string
- The connection string should look like:
  ```
  DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority"
  ```
- Make sure the database name is included in the connection string

#### Verify Environment Variables
Your `.env.local` should have:
```env
DATABASE_URL=your_complete_mongodb_connection_string
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
```

#### Check MongoDB Atlas (if using)
- Ensure your IP address is whitelisted
- Verify your username and password are correct
- Check that the cluster is running

### 2. Database Connection Errors

#### Error: "MongoDB connection failed"
1. Check your connection string format
2. Verify network connectivity
3. Check if MongoDB service is running (for local MongoDB)
4. For MongoDB Atlas, verify IP whitelist settings

#### Test Connection
You can test your connection string by running:
```bash
node -e "const mongoose = require('mongoose'); mongoose.connect('YOUR_CONNECTION_STRING').then(() => console.log('Connected!')).catch(e => console.error('Error:', e))"
```

### 3. Authentication Errors

#### "Invalid email or password"
- Verify the user exists in the database
- Check if password was hashed correctly during registration
- Ensure you're using the correct email (case-insensitive)

#### "Email already registered"
- The email is already in use
- Try logging in instead of registering
- Or use a different email address

### 4. Password Issues

#### Password not working
- Passwords are case-sensitive
- Minimum 6 characters required
- Ensure you're using the correct password

### 5. Development vs Production

#### Development Mode
- Error messages include more details
- Check browser console for full error messages
- Check server logs for detailed error information

#### Production Mode
- Error messages are generic for security
- Check server logs for actual errors

## Quick Fixes

### Reset Database Connection
1. Stop the development server
2. Clear the connection cache by restarting
3. Verify `.env.local` file is in the correct location (`global/.env.local`)
4. Restart the server

### Clear User Data
If you need to reset users:
```javascript
// In MongoDB shell or Compass
db.users.deleteMany({})
```

### Create Admin User Manually
```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Still Having Issues?

1. Check the server console for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible from your network
4. Check that all required npm packages are installed:
   ```bash
   npm install mongoose bcryptjs jsonwebtoken
   ```



