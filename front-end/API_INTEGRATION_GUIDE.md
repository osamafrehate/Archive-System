# API Integration Guide

## Overview

This React frontend is integrated with the ASP.NET Core backend API deployed at `http://192.168.3.33:5000/api`.

## Configuration

### Environment Variables

The API base URL is configured via the `.env.local` file:

```env
REACT_APP_API_URL=http://192.168.3.33:5000/api
```

**Note:** Never commit `.env.local` to version control. Use `.env` for default/template values.

### API Base URL

- **Development:** `http://localhost:5000/api` (fallback if env var not set)
- **Production:** `http://192.168.3.33:5000/api` (configured in `.env.local`)

## Authentication

### JWT Token Management

- Access tokens and refresh tokens are stored in `localStorage`
- Storage keys:
  - `archive_access_token` - JWT access token
  - `archive_refresh_token` - Refresh token for obtaining new access tokens

### Token Refresh Strategy

- Tokens are automatically refreshed on 401 (Unauthorized) responses
- If refresh fails, user is redirected to login page
- Automatic refresh happens transparently to the user

### Login Flow

1. User submits credentials via `LoginPage`
2. `apiService.login()` sends POST request to `/api/auth/login`
3. Backend returns `accessToken` and `refreshToken`
4. Tokens are stored in localStorage
5. User is redirected to `/upload` page

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint         | Description                  | Auth Required       |
| ------ | ---------------- | ---------------------------- | ------------------- |
| POST   | `/auth/login`    | Login with username/password | No                  |
| POST   | `/auth/register` | Register new user            | No                  |
| POST   | `/auth/logout`   | Logout user                  | Yes                 |
| POST   | `/auth/refresh`  | Refresh access token         | Yes (refresh token) |
| GET    | `/auth/me`       | Get current user info        | Yes                 |

### Categories (`/api/categories`)

| Method | Endpoint                                   | Description                         | Auth Required |
| ------ | ------------------------------------------ | ----------------------------------- | ------------- |
| GET    | `/categories`                              | Get all categories                  | Yes           |
| GET    | `/categories/active`                       | Get active categories               | Yes           |
| GET    | `/categories/UserCategories`               | Get user's categories               | Yes           |
| GET    | `/categories/UserCategoriesReadPermission` | Get categories with read permission | Yes           |
| GET    | `/categories/UserCategoriesEditPermission` | Get categories with edit permission | Yes           |
| POST   | `/categories?name={name}`                  | Create new category                 | Yes           |
| PUT    | `/categories/activate-by-name?name={name}` | Activate category by name           | Yes           |

### Files (`/api/files`)

| Method | Endpoint                   | Description                          | Auth Required |
| ------ | -------------------------- | ------------------------------------ | ------------- |
| GET    | `/files`                   | List files (with pagination/filters) | Yes           |
| POST   | `/files/upload`            | Upload new file                      | Yes           |
| GET    | `/files/preview/{fileId}`  | Preview file content                 | Yes           |
| GET    | `/files/download/{fileId}` | Download file                        | Yes           |
| PUT    | `/files/{fileId}/rename`   | Rename file                          | Yes           |

### Permissions (`/api/permissions`)

| Method | Endpoint            | Description         | Auth Required |
| ------ | ------------------- | ------------------- | ------------- |
| GET    | `/permissions`      | Get all permissions | Yes           |
| POST   | `/permissions`      | Create permission   | Yes           |
| PUT    | `/permissions/{id}` | Update permission   | Yes           |
| DELETE | `/permissions/{id}` | Delete permission   | Yes           |

### Admin (`/api/admin`)

| Method | Endpoint                                     | Description                         | Auth Required |
| ------ | -------------------------------------------- | ----------------------------------- | ------------- |
| POST   | `/admin/assign-permissions`                  | Assign category permissions to user | Yes (admin)   |
| GET    | `/admin/users/{userId}/category-permissions` | Get user's category permissions     | Yes (admin)   |

### Users (`/api/users`)

| Method | Endpoint                          | Description  | Auth Required |
| ------ | --------------------------------- | ------------ | ------------- |
| GET    | `/users/search?keyword={keyword}` | Search users | Yes           |

## API Service Layer

### Main API Service: `src/services/apiService.js`

Provides all API methods with automatic authentication and error handling.

**Key Features:**

- Centralized API base URL
- JWT bearer token attachment to all authenticated requests
- Automatic token refresh on 401
- Comprehensive error handling
- Request/response validation

**Usage Example:**

```javascript
import { apiService } from "../services/apiService";
import { useAuth } from "../hooks/useAuth";

export function MyComponent() {
  const { accessToken } = useAuth();

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);

      const result = await apiService.uploadFile(formData, accessToken);
      console.log("Upload successful:", result);
    } catch (error) {
      console.error("Upload failed:", error.message);
    }
  };

  return <button onClick={handleUpload}>Upload File</button>;
}
```

### API Configuration: `src/services/apiConfig.js`

Centralized configuration with:

- `API_BASE_URL` - Base URL for all requests
- `API_ENDPOINTS` - Mapping of all backend endpoints
- `HTTP_STATUS` - HTTP status code constants
- `ERROR_MESSAGES` - User-friendly error messages
- `STORAGE_KEYS` - LocalStorage key constants
- `TOKEN_CONFIG` - JWT token configuration

### Error Handler: `src/services/apiErrorHandler.js`

Advanced error handling with:

- `ApiError` class - Custom error type
- `parseErrorResponse()` - Parse API error responses
- `handleNetworkError()` - Handle network failures
- `handleHttpError()` - Handle HTTP errors
- `logApiError()` - Log errors for debugging
- `shouldLogoutOnError()` - Determine if logout needed

## Authentication Context

### `src/context/AuthContext.js`

Manages authentication state with:

- `accessToken` - Current JWT access token
- `refreshToken` - Refresh token
- `isAuthenticated` - Boolean authentication state
- `userId` - Current user ID
- `username` - Current username
- `role` - User role (Admin/User)

**Key Methods:**

- `login(accessToken, refreshToken)` - Store tokens and update auth state
- `logout()` - Clear tokens and redirect to login
- `refreshAccessToken()` - Manually refresh access token

### `src/hooks/useAuth.js`

React hook for accessing auth context in components:

```javascript
import { useAuth } from "../hooks/useAuth";

export function MyComponent() {
  const { isAuthenticated, accessToken, username, login, logout } = useAuth();

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {username}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  );
}
```

## Error Handling

### Common Error Scenarios

#### 401 Unauthorized

- **Cause:** Access token expired or invalid
- **Action:** Automatically attempts token refresh
- **If refresh fails:** User is redirected to login page

#### 403 Forbidden

- **Cause:** User lacks required permissions
- **Action:** User sees error message (access denied)

#### 500 Internal Server Error

- **Cause:** Backend error
- **Action:** Generic error message displayed, check server logs

#### Network Error

- **Cause:** No internet connection or network failure
- **Action:** User-friendly error message, retry option

### Handling Errors in Components

```javascript
const handleAction = async () => {
  try {
    const result = await apiService.someMethod(data, token);
    // Success handling
  } catch (error) {
    if (error.message.includes("401")) {
      // Handle unauthorized
    } else if (error.message.includes("403")) {
      // Handle forbidden
    } else {
      // Handle other errors
      console.error("Error:", error.message);
    }
  }
};
```

## CORS Configuration

The frontend communicates with the backend using CORS. Ensure your backend allows requests from:

- Development: `http://localhost:3000`
- Production: Your deployed frontend URL

## Testing API Integration

### 1. Verify API Base URL

```javascript
// In browser console:
fetch("http://192.168.3.33:5000/api")
  .then((r) => console.log("API reachable:", r.status))
  .catch((e) => console.error("API unreachable:", e));
```

### 2. Test Login

Open `LoginPage` and attempt login with valid credentials.

### 3. Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform API actions (login, upload, search, etc.)
4. Verify requests go to `http://192.168.3.33:5000/api`

### 4. Verify Tokens

In browser console:

```javascript
localStorage.getItem("archive_access_token"); // Should return JWT
localStorage.getItem("archive_refresh_token"); // Should return refresh token
```

## Troubleshooting

### API Requests Failing with 404

- Check that `REACT_APP_API_URL` in `.env.local` is correct
- Verify the backend endpoint exists and matches the request URL
- Check endpoint capitalization (APIs are case-sensitive)

### CORS Errors

- Verify backend CORS configuration allows frontend origin
- Check that requests are going to correct domain
- Ensure `credentials: 'include'` is set for cross-origin requests

### 401 Unauthorized Errors Persist

- Clear localStorage: `localStorage.clear()`
- Log out and log in again
- Check token expiration time
- Verify backend token generation is working correctly

### Tokens Not Persisting Across Page Reloads

- Ensure `localStorage` is not disabled
- Check browser's storage settings
- Verify tokens are being stored: `Object.keys(localStorage)`

## Development Tips

### Using Environment Variables

Create `.env.local` for local overrides:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_DEBUG=true
```

Restart React dev server after changing `.env.local`.

### Debugging API Calls

Enable verbose logging in `src/services/apiService.js`:

```javascript
async function fetchWithAuth(url, options = {}) {
  console.log("API Request:", url, options);
  const response = await fetch(url, { ...options, headers });
  console.log("API Response:", response.status);
  return response;
}
```

### Mock API for Testing

To test without backend, create mock responses:

```javascript
export const apiService = {
  login: async (username, password) => {
    // Return mock tokens for testing
    return {
      accessToken: "mock.token.here",
      refreshToken: "mock.refresh.token",
    };
  },
  // ... other mock methods
};
```

## Production Deployment

### Pre-deployment Checklist

- [ ] `.env.local` has correct production API URL
- [ ] `.env.local` is in `.gitignore` (never commit)
- [ ] All API endpoints are tested and working
- [ ] CORS is properly configured on backend
- [ ] SSL/TLS certificate is valid for API domain
- [ ] No console errors in production build
- [ ] Authentication flow works end-to-end

### Build Production Version

```bash
npm run build
```

This creates an optimized build in the `build/` directory.

### Deploy Frontend

1. Build the application: `npm run build`
2. Deploy `build/` directory to your hosting service
3. Configure web server to serve `index.html` for all routes (SPA routing)
4. Ensure `.env.local` is set up on hosting environment

## Support

For API issues:

1. Check backend logs at `http://192.168.3.33:5000/swagger/index.html`
2. Review error messages in browser console
3. Verify network requests in DevTools Network tab
4. Check API response format matches expected structure
