# API Integration Setup & Deployment Checklist

## ✅ Initial Setup (Developer Environment)

### Configuration

- [x] Created `.env.local` with `REACT_APP_API_URL=http://192.168.3.33:5000/api`
- [x] Created `.env.example` template for reference
- [ ] Verified `.env.local` is in `.gitignore`
- [ ] Set appropriate environment variables for your environment

### Files Created/Updated

- [x] `.env.local` - Production API configuration
- [x] `.env.example` - Template for environment variables
- [x] `src/services/apiConfig.js` - Centralized API configuration
- [x] `src/services/apiErrorHandler.js` - Enhanced error handling
- [x] `src/utils/verifyApiIntegration.js` - Integration verification script
- [x] `API_INTEGRATION_GUIDE.md` - Complete integration documentation

### Existing Files (Already Configured)

- [x] `src/services/apiService.js` - API layer (already set up with JWT auth)
- [x] `src/context/AuthContext.js` - Authentication context (already set up)
- [x] `src/hooks/useAuth.js` - Auth hook (already set up)
- [x] `src/components/LoginPage.js` - Login component (already set up)

## 🧪 Testing & Verification

### Pre-Deployment Testing

- [ ] Verify API connectivity

  ```bash
  npm start
  # Open browser console and run:
  fetch('http://192.168.3.33:5000/api').then(r => console.log(r.status))
  ```

- [ ] Test login functionality
  - [ ] Navigate to login page
  - [ ] Enter valid credentials
  - [ ] Verify tokens are stored in localStorage
  - [ ] Verify redirect to upload page

- [ ] Test upload functionality
  - [ ] Navigate to upload page
  - [ ] Select a file
  - [ ] Choose a category
  - [ ] Upload file
  - [ ] Verify file appears in search results

- [ ] Test search functionality
  - [ ] Navigate to search page
  - [ ] Search for uploaded files
  - [ ] Filter by category/status
  - [ ] Verify results display correctly

- [ ] Test admin panel (if applicable)
  - [ ] Navigate to admin panel
  - [ ] Manage categories
  - [ ] Manage permissions
  - [ ] Assign user permissions

- [ ] Test error handling
  - [ ] Logout and try accessing protected route (should redirect to login)
  - [ ] Simulate 401 error (clear tokens, try API call)
  - [ ] Test network error handling

### Network Tab Testing

- [ ] Open DevTools (F12) → Network tab
- [ ] Perform API operations
- [ ] Verify all requests go to `http://192.168.3.33:5000/api`
- [ ] Verify Authorization header contains Bearer token
- [ ] Verify 401 responses trigger token refresh automatically

### LocalStorage Verification

- [ ] Open DevTools → Application/Storage → LocalStorage
- [ ] Verify `archive_access_token` is present after login
- [ ] Verify `archive_refresh_token` is present after login
- [ ] Verify tokens are cleared after logout

### Integration Verification Script

- [ ] Run verification script in browser console:
  ```javascript
  import { verifyApiIntegration } from "./utils/verifyApiIntegration";
  verifyApiIntegration();
  ```
- [ ] All checks should pass with no errors

## 🚀 Production Deployment

### Pre-Deployment Checklist

- [ ] `.env.local` is properly configured with production API URL
- [ ] `.env.local` is in `.gitignore` (never commit sensitive configs)
- [ ] All API endpoints tested and working in staging
- [ ] CORS is configured on backend for frontend domain
- [ ] SSL/TLS certificate is valid and non-expired
- [ ] No console errors or warnings in production build
- [ ] Authentication flow works end-to-end
- [ ] File upload/download works correctly
- [ ] Admin functions work as expected
- [ ] Error handling displays user-friendly messages

### Build & Deploy

```bash
# 1. Install dependencies
npm install

# 2. Build for production
npm run build

# 3. Test production build locally
npx serve -s build

# 4. Deploy 'build/' directory to hosting
# Ensure web server is configured to serve index.html for all routes

# 5. Set environment variables on hosting platform
REACT_APP_API_URL=http://192.168.3.33:5000/api
```

### Post-Deployment Testing

- [ ] Verify application loads without errors
- [ ] Test login with production backend
- [ ] Test file operations
- [ ] Check Network tab for correct API URLs
- [ ] Monitor error logs for issues
- [ ] Test on multiple browsers/devices

## 🔧 Troubleshooting Guide

### API Requests Return 404

**Solution:**

1. Verify `REACT_APP_API_URL` in environment
2. Check backend endpoint exists
3. Verify endpoint path case-sensitivity
4. Check backend is running and accessible

### CORS Errors in Console

**Solution:**

1. Verify backend CORS configuration includes frontend origin
2. Check if requests are going to correct domain
3. Ensure credentials are properly configured
4. Check for https/http mismatch

### 401 Errors After Login

**Solution:**

1. Verify token refresh endpoint is working
2. Check token expiration time
3. Clear localStorage and login again
4. Verify backend token generation

### Tokens Not Persisting

**Solution:**

1. Verify localStorage is enabled
2. Check browser privacy settings
3. Verify tokens are being saved: `Object.keys(localStorage)`
4. Check for localStorage quota exceeded

### Files Not Uploading

**Solution:**

1. Check backend upload endpoint is working
2. Verify file size is within limits
3. Check network timeout settings
4. Review backend upload logs

## 📝 Documentation Files

### Important Files to Review

1. **API_INTEGRATION_GUIDE.md** - Complete API integration reference
2. **API_INTEGRATION_SETUP.md** - This file
3. **.env.example** - Environment variable template
4. **src/services/apiConfig.js** - API configuration constants
5. **src/services/apiErrorHandler.js** - Error handling utilities
6. **src/utils/verifyApiIntegration.js** - Verification script

### Key Components

- **src/components/LoginPage.js** - User authentication
- **src/context/AuthContext.js** - Global auth state
- **src/services/apiService.js** - API methods
- **src/hooks/useAuth.js** - Auth hook for components

## 🎯 Integration Checklist Summary

| Task                      | Status         | Notes                              |
| ------------------------- | -------------- | ---------------------------------- |
| Environment Configuration | ✅ Complete    | `.env.local` created               |
| API Configuration         | ✅ Complete    | `apiConfig.js` created             |
| Error Handling            | ✅ Complete    | `apiErrorHandler.js` created       |
| Verification Script       | ✅ Complete    | `verifyApiIntegration.js` created  |
| Documentation             | ✅ Complete    | `API_INTEGRATION_GUIDE.md` created |
| API Service               | ✅ Already Set | Using existing `apiService.js`     |
| Authentication            | ✅ Already Set | JWT + token refresh implemented    |
| Testing                   | ⏳ Pending     | Run verification checklist above   |
| Deployment                | ⏳ Pending     | Follow production checklist        |

## 📞 Support & Troubleshooting

For issues:

1. Check backend logs at API server
2. Review browser console for errors
3. Inspect Network tab for API requests
4. Run `verifyApiIntegration()` script
5. Review `API_INTEGRATION_GUIDE.md` for solutions

---

**Last Updated:** 2024
**API Base URL:** http://192.168.3.33:5000/api
**Status:** Ready for Testing & Deployment
