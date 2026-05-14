# API Integration - Quick Reference

## 🚀 Quick Start

### 1. Verify Configuration

```bash
# Check .env.local exists with correct API URL
cat .env.local
# Should output: REACT_APP_API_URL=http://192.168.3.33:5000/api
```

### 2. Start Development Server

```bash
npm start
# App opens at http://localhost:3000
```

### 3. Test Login

- Navigate to login page
- Enter valid credentials for your backend
- Should redirect to upload page after successful login

### 4. Verify API Connectivity

```javascript
// In browser console:
fetch("http://192.168.3.33:5000/api")
  .then((r) => console.log("API Status:", r.status))
  .catch((e) => console.error("API Error:", e.message));
```

## 📁 Key Files

| File                              | Purpose                                     |
| --------------------------------- | ------------------------------------------- |
| `.env.local`                      | Production API configuration (user-created) |
| `.env.example`                    | Environment variable template               |
| `src/services/apiService.js`      | API methods & authentication                |
| `src/services/apiConfig.js`       | Configuration constants                     |
| `src/services/apiErrorHandler.js` | Error handling utilities                    |
| `src/context/AuthContext.js`      | Global authentication state                 |
| `src/hooks/useAuth.js`            | Hook to access auth in components           |
| `API_INTEGRATION_GUIDE.md`        | Complete integration documentation          |
| `SETUP_CHECKLIST.md`              | Setup and deployment checklist              |

## 🔐 Authentication Flow

```
LoginPage (user enters credentials)
    ↓
apiService.login() → POST /api/auth/login
    ↓
Receive: { accessToken, refreshToken }
    ↓
Store in localStorage
    ↓
Update AuthContext
    ↓
Redirect to /upload
```

## 🔑 Key Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh` - Refresh token

### Files

- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file
- `GET /api/files/download/{id}` - Download file

### Categories

- `GET /api/categories` - List categories
- `POST /api/categories` - Create category

## 🛠️ Common Tasks

### Access Auth in Components

```javascript
import { useAuth } from "../hooks/useAuth";

export function MyComponent() {
  const { accessToken, username, logout } = useAuth();
  // Use tokens and methods...
}
```

### Make API Calls

```javascript
import { apiService } from "../services/apiService";
import { useAuth } from "../hooks/useAuth";

export function MyComponent() {
  const { accessToken } = useAuth();

  const handleUpload = async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await apiService.uploadFile(formData, accessToken);
      console.log("Success:", result);
    } catch (error) {
      console.error("Error:", error.message);
    }
  };
}
```

### Handle Errors

```javascript
try {
  const result = await apiService.someMethod(data, token);
} catch (error) {
  if (error.message.includes("401")) {
    // Token expired, user will be redirected to login
  } else if (error.message.includes("403")) {
    console.error("Access denied");
  } else {
    console.error("Error:", error.message);
  }
}
```

## ✅ Verification Checklist

- [ ] `.env.local` contains `REACT_APP_API_URL=http://192.168.3.33/api`
- [ ] App starts with `npm start` without errors
- [ ] Login works with valid credentials
- [ ] Tokens appear in localStorage after login
- [ ] Network requests go to `http://192.168.3.33/api`
- [ ] Upload/download operations work
- [ ] Logout clears tokens and redirects to login

## 🔍 Debugging Tips

### Check Tokens

```javascript
// In browser console:
localStorage.getItem("archive_access_token");
localStorage.getItem("archive_refresh_token");
```

### Decode Token

```javascript
// In browser console:
const token = localStorage.getItem("archive_access_token");
const payload = JSON.parse(atob(token.split(".")[1]));
console.log(payload); // Shows token contents and expiry
```

### Monitor Network

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Perform API operations
5. Click request to inspect details

### Check API Connectivity

```javascript
// In browser console:
import { API_BASE_URL } from "./services/apiConfig.js";
console.log("API Base URL:", API_BASE_URL);
```

## 🐛 Common Issues & Solutions

### "404 Not Found" on API Calls

- Verify `REACT_APP_API_URL` in `.env.local`
- Restart dev server after changing `.env`
- Check endpoint paths in `apiService.js`

### "CORS Error"

- Check backend CORS configuration
- Verify API URL is correct (not localhost)
- Check browser console for exact error

### "401 Unauthorized" Persists

- Clear localStorage: `localStorage.clear()`
- Log out and log in again
- Check token expiration time

### "Tokens Not Saving"

- Verify localStorage enabled in browser
- Check privacy/incognito mode settings
- Look for localStorage quota errors

## 📚 Documentation

For detailed information, see:

- **API_INTEGRATION_GUIDE.md** - Complete API reference
- **SETUP_CHECKLIST.md** - Setup and deployment steps
- **.env.example** - Environment variable template

## 🚀 Deployment

```bash
# 1. Build production version
npm run build

# 2. Deploy 'build' directory to hosting

# 3. Set environment variable on hosting:
REACT_APP_API_URL=http://192.168.3.33/api
```

---

**API Base URL:** http://192.168.3.33:5000/api  
**Frontend:** React 19 with React Router v7  
**Authentication:** JWT with automatic token refresh  
**Status:** ✅ Ready to use
