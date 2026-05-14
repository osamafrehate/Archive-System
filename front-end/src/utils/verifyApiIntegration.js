/**
 * API Integration Verification Script
 * Run this to verify the API integration is configured correctly
 * 
 * Usage: Run in browser console or add to a utility page
 */

export async function verifyApiIntegration() {
  console.log('🔍 Starting API Integration Verification...\n');

  const results = {
    success: [],
    warnings: [],
    errors: []
  };

  // 1. Check environment configuration
  try {
    console.log('1️⃣  Checking Environment Configuration...');
    const apiUrl = process.env.REACT_APP_API_URL;
    if (apiUrl) {
      console.log(`   ✅ REACT_APP_API_URL=${apiUrl}`);
      results.success.push('Environment variable REACT_APP_API_URL is set');
    } else {
      console.warn('   ⚠️  REACT_APP_API_URL not set, using default');
      results.warnings.push('REACT_APP_API_URL environment variable not configured');
    }
  } catch (e) {
    results.errors.push(`Environment check failed: ${e.message}`);
  }

  // 2. Check API connectivity
  try {
    console.log('\n2️⃣  Checking API Connectivity...');
    const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5069/api';
    const response = await fetch(baseUrl, {
      method: 'HEAD',
      mode: 'no-cors'
    });
    console.log(`   ✅ API is reachable at ${baseUrl}`);
    results.success.push(`API endpoint reachable: ${baseUrl}`);
  } catch (e) {
    console.error(`   ❌ API unreachable: ${e.message}`);
    results.errors.push(`API connectivity failed: ${e.message}`);
  }

  // 3. Check localStorage setup
  try {
    console.log('\n3️⃣  Checking localStorage Configuration...');
    const testKey = '__api_integration_test__';
    localStorage.setItem(testKey, 'test');
    const testValue = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    
    if (testValue === 'test') {
      console.log('   ✅ localStorage is available and working');
      results.success.push('localStorage is properly configured');
    }
  } catch (e) {
    console.warn(`   ⚠️  localStorage may not be available: ${e.message}`);
    results.warnings.push('localStorage access issue detected');
  }

  // 4. Check tokens
  try {
    console.log('\n4️⃣  Checking Token Storage...');
    const accessToken = localStorage.getItem('archive_access_token');
    const refreshToken = localStorage.getItem('archive_refresh_token');
    
    if (accessToken) {
      console.log('   ✅ Access token found');
      results.success.push('Access token is stored');
      // Decode and check expiry
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const expiresAt = new Date(payload.exp * 1000);
        const isExpired = Date.now() > expiresAt;
        console.log(`      Token expires: ${expiresAt.toLocaleString()} (${isExpired ? '❌ EXPIRED' : '✅ valid'})`);
      } catch (e) {
        console.warn('      Could not parse token expiry');
      }
    } else {
      console.log('   ℹ️  No access token stored (user not logged in)');
    }
    
    if (refreshToken) {
      console.log('   ✅ Refresh token found');
      results.success.push('Refresh token is stored');
    } else {
      console.log('   ℹ️  No refresh token stored (user not logged in)');
    }
  } catch (e) {
    results.errors.push(`Token check failed: ${e.message}`);
  }

  // 5. Check API Service
  try {
    console.log('\n5️⃣  Checking API Service...');
    try {
      const { apiService } = require('../services/apiService');
      if (apiService && typeof apiService === 'object') {
        const methods = Object.keys(apiService);
        console.log(`   ✅ API Service loaded with ${methods.length} methods`);
        console.log(`      Methods: ${methods.slice(0, 5).join(', ')}...`);
        results.success.push(`API Service has ${methods.length} methods`);
      }
    } catch (e) {
      console.warn('   ⚠️  Could not dynamically load API service');
      results.warnings.push('API Service verification skipped (may be normal in some environments)');
    }
  } catch (e) {
    // This is expected in some environments
    console.log('   ℹ️  API Service check skipped');
  }

  // 6. Check browser compatibility
  try {
    console.log('\n6️⃣  Checking Browser Compatibility...');
    const features = {
      fetch: typeof fetch !== 'undefined',
      localStorage: typeof localStorage !== 'undefined',
      crypto: typeof crypto !== 'undefined',
      Promise: typeof Promise !== 'undefined',
      async: true // Modern browsers all support async/await
    };
    
    const allSupported = Object.values(features).every(v => v);
    if (allSupported) {
      console.log('   ✅ All required browser APIs are available');
      results.success.push('Browser has all required APIs');
    } else {
      const missing = Object.entries(features)
        .filter(([, supported]) => !supported)
        .map(([name]) => name);
      console.warn(`   ⚠️  Missing APIs: ${missing.join(', ')}`);
      results.warnings.push(`Missing browser APIs: ${missing.join(', ')}`);
    }
  } catch (e) {
    results.errors.push(`Browser compatibility check failed: ${e.message}`);
  }

  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 VERIFICATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${results.success.length}`);
  results.success.forEach(msg => console.log(`   • ${msg}`));
  
  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Warnings: ${results.warnings.length}`);
    results.warnings.forEach(msg => console.log(`   • ${msg}`));
  }
  
  if (results.errors.length > 0) {
    console.log(`\n❌ Errors: ${results.errors.length}`);
    results.errors.forEach(msg => console.log(`   • ${msg}`));
  }
  
  console.log('='.repeat(60));
  
  const allPassed = results.errors.length === 0;
  console.log(`\n${allPassed ? '✅ API Integration Verified Successfully!' : '❌ API Integration has issues. See above for details.'}`);
  
  return {
    passed: allPassed,
    ...results
  };
}

// Export for use in React components or scripts
export default verifyApiIntegration;
