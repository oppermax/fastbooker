/**
 * Email Confirmation API Testing Utilities
 * 
 * This file contains utility functions to help discover and test
 * the Affluences email confirmation API endpoints.
 * 
 * Usage: Import these functions in browser console or test files
 * to manually test API endpoints and capture responses.
 */

/**
 * Test a single API endpoint for email confirmation
 * Logs detailed information about the request and response
 * 
 * @param {string} endpoint - Full URL to test
 * @param {string} email - Email address to use for testing
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @returns {Promise<Object>} - Test results
 */
export async function testEmailEndpoint(endpoint, email, method = 'POST') {
  console.log('🧪 Testing endpoint:', endpoint);
  console.log('📧 Email:', email);
  console.log('🔧 Method:', method);

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  };

  const options = {
    method,
    headers,
  };

  if (method === 'POST') {
    options.body = JSON.stringify({ email });
  }

  try {
    const startTime = Date.now();
    const response = await fetch(endpoint, options);
    const duration = Date.now() - startTime;

    console.log('⏱️  Response time:', duration, 'ms');
    console.log('📊 Status:', response.status, response.statusText);
    console.log('📋 Headers:', Object.fromEntries(response.headers.entries()));

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
      console.log('📦 Response data:', data);
    } else {
      const text = await response.text();
      console.log('📄 Response text:', text);
      data = { text };
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data,
      duration,
      endpoint,
    };

    console.log('✅ Test complete:', result.success ? 'SUCCESS' : 'FAILED');
    return result;
  } catch (error) {
    console.error('❌ Error:', error.message);
    return {
      success: false,
      error: error.message,
      endpoint,
    };
  }
}

/**
 * Test multiple endpoints in sequence
 * Useful for discovering which endpoint works
 * 
 * @param {string[]} endpoints - Array of URLs to test
 * @param {string} email - Email address to use
 * @returns {Promise<Object[]>} - Array of test results
 */
export async function testMultipleEndpoints(endpoints, email) {
  console.log('🔍 Testing', endpoints.length, 'endpoints...\n');
  
  const results = [];
  
  for (let i = 0; i < endpoints.length; i++) {
    console.log(`\n📍 Test ${i + 1}/${endpoints.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const result = await testEmailEndpoint(endpoints[i], email);
    results.push(result);
    
    // Wait between requests to avoid rate limiting
    if (i < endpoints.length - 1) {
      console.log('⏳ Waiting 2 seconds before next test...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n📊 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  results.forEach((result, i) => {
    console.log(`${i + 1}. ${result.endpoint}`);
    console.log(`   Status: ${result.status || 'ERROR'} ${result.success ? '✅' : '❌'}`);
  });
  
  return results;
}

/**
 * Intercept and log all network requests in the browser
 * This helps capture what the official Affluences app is doing
 * 
 * Call this function before using the official Affluences app/website
 * to see what API calls they make for email confirmation
 */
export function interceptNetworkRequests() {
  console.log('🎯 Starting network interception...');
  console.log('💡 Use the Affluences app now, and all API calls will be logged here.\n');

  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options = {}] = args;
    
    // Only log Affluences API calls
    if (url.includes('affluences.com')) {
      console.log('\n🌐 API Request Intercepted:');
      console.log('URL:', url);
      console.log('Method:', options.method || 'GET');
      if (options.body) {
        try {
          console.log('Body:', JSON.parse(options.body));
        } catch {
          console.log('Body:', options.body);
        }
      }
      if (options.headers) {
        console.log('Headers:', options.headers);
      }
    }

    const response = await originalFetch(...args);
    
    // Log response for Affluences APIs
    if (url.includes('affluences.com')) {
      const clonedResponse = response.clone();
      try {
        const data = await clonedResponse.json();
        console.log('Response:', data);
      } catch {
        console.log('Response: (non-JSON)');
      }
      console.log('Status:', response.status);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    }

    return response;
  };

  console.log('✅ Network interception active!');
  console.log('⚠️  To stop interception, refresh the page.\n');
}

/**
 * Test the current reservation endpoint to capture error messages
 * This helps understand what error messages mean email confirmation is needed
 * 
 * @param {string} resourceId - Resource ID to test booking
 * @param {string} email - Email address to test with
 * @returns {Promise<Object>} - Error response data
 */
export async function testBookingError(resourceId, email) {
  const url = `https://reservation.affluences.com/api/reserve/${resourceId}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  };

  const data = {
    auth_type: null,
    email: email,
    date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
    start_time: '09:00',
    end_time: '11:00',
    note: null,
    user_firstname: null,
    user_lastname: null,
    user_phone: null,
    person_count: 1,
  };

  console.log('🎫 Testing booking with potentially unconfirmed email...');
  console.log('Resource ID:', resourceId);
  console.log('Email:', email);
  console.log('Date:', data.date);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    const responseData = await response.json();
    
    console.log('\n📊 Response:');
    console.log('Status:', response.status);
    console.log('Data:', responseData);
    
    if (!response.ok) {
      console.log('\n🔍 Error Analysis:');
      const errorMessage = responseData.errorMessage || responseData.message || '';
      console.log('Error Message:', errorMessage);
      
      const needsConfirmation = /email.*not.*verif|email.*not.*confirm|verify.*email|confirm.*email/i.test(errorMessage);
      console.log('Likely needs confirmation?', needsConfirmation ? '✅ YES' : '❌ NO');
      
      if (needsConfirmation) {
        console.log('\n💡 Add this error pattern to emailConfirmation.js:');
        console.log(`/${errorMessage.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/i`);
      }
    } else {
      console.log('✅ Booking succeeded (or would have)');
    }

    return responseData;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return { error: error.message };
  }
}

/**
 * Quick test of all potential email confirmation endpoints
 * Run this in browser console: testAllEmailEndpoints('your.email@unipd.it')
 */
export async function testAllEmailEndpoints(email) {
  const endpoints = [
    'https://reservation.affluences.com/api/email/verify',
    'https://reservation.affluences.com/api/email/send-confirmation',
    'https://reservation.affluences.com/api/email/request-confirmation',
    'https://reservation.affluences.com/api/email/send-verification',
    'https://api.affluences.com/app/v3/email/verify',
    'https://api.affluences.com/app/v3/email/send-confirmation',
    'https://api.affluences.com/app/v3/email/request-confirmation',
    'https://api.affluences.com/app/v3/auth/email/verify',
  ];

  return await testMultipleEndpoints(endpoints, email);
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.EmailTestUtils = {
    testEmailEndpoint,
    testMultipleEndpoints,
    interceptNetworkRequests,
    testBookingError,
    testAllEmailEndpoints,
  };
  console.log('✅ Email Test Utils loaded!');
  console.log('💡 Available functions:');
  console.log('  - EmailTestUtils.testEmailEndpoint(url, email)');
  console.log('  - EmailTestUtils.testAllEmailEndpoints(email)');
  console.log('  - EmailTestUtils.interceptNetworkRequests()');
  console.log('  - EmailTestUtils.testBookingError(resourceId, email)');
}
