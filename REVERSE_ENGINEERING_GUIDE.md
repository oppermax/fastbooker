# How to Reverse Engineer Affluences Email Confirmation

This guide explains how to discover the exact API endpoints and error messages that Affluences uses for email confirmation.

## Prerequisites

- A UniPD email address (`@unipd.it`)
- Access to a library that requires email confirmation
- A web browser with Developer Tools (Chrome, Firefox, Edge, etc.)

## Method 1: Using Browser Network Tab (Recommended)

This is the most reliable way to discover the actual API calls.

### Step 1: Open Developer Tools
1. Open the official Affluences website: https://affluences.com
2. Press `F12` or right-click → "Inspect Element"
3. Go to the "Network" tab
4. Enable "Preserve log" (checkbox at the top)
5. Clear the network log (trash icon)

### Step 2: Filter for API Calls
1. In the filter box, type: `api` or `affluences`
2. This will show only relevant network requests

### Step 3: Try to Book a Seat
1. Navigate to a library that requires email confirmation
2. Select a seat and time slot
3. Enter your UniPD email address
4. Click "Book" or "Reserve"

### Step 4: Capture the Error
When the booking fails (if your email is unconfirmed):

1. Look in the Network tab for failed requests (they'll be red)
2. Click on the failed request
3. Check the "Response" tab - this shows the error message
4. Check the "Headers" tab - this shows the endpoint URL
5. **Copy all this information!**

Example of what to look for:
```
URL: https://reservation.affluences.com/api/reserve/abc123
Method: POST
Status: 400 Bad Request

Response:
{
  "errorMessage": "Please verify your email address",
  "errorCode": "EMAIL_NOT_VERIFIED"
}
```

### Step 5: Look for Confirmation Endpoint
After seeing the error, look for:
1. Any subsequent API call that might be for email confirmation
2. Check if clicking a "resend email" button makes a new API call
3. Note the endpoint and request body

## Method 2: Using the Test Utilities

We've created test utilities to automate endpoint discovery.

### Step 1: Load the Test Utils
1. Open FastBooker in your browser
2. Open Developer Console (`F12` → Console tab)
3. Type this and press Enter:
```javascript
import('/lib/emailConfirmationTestUtils.js').then(m => window.EmailTestUtils = m)
```

### Step 2: Test All Potential Endpoints
```javascript
// Replace with your actual email
await EmailTestUtils.testAllEmailEndpoints('your.email@unipd.it')
```

This will test multiple possible endpoints and show which ones respond.

### Step 3: Test a Booking Error
```javascript
// Replace with actual resource ID from a library requiring confirmation
await EmailTestUtils.testBookingError('resource-id-here', 'your.email@unipd.it')
```

### Step 4: Intercept Network Requests
```javascript
// Run this BEFORE using the Affluences app
EmailTestUtils.interceptNetworkRequests()

// Now use the official Affluences app/website
// All API calls will be logged to the console
```

## Method 3: Check Email Links

If you receive a confirmation email from Affluences:

### Step 1: Examine the Email
1. Check your email inbox (and spam folder) for messages from Affluences
2. Look for a confirmation or verification email

### Step 2: Inspect the Link
**DO NOT CLICK IT YET!**

1. Right-click on the confirmation link
2. Select "Copy Link Address"
3. Paste it in a text editor

The link might look like:
```
https://affluences.com/confirm?token=abc123xyz
https://reservation.affluences.com/email/verify/abc123xyz
https://api.affluences.com/email/confirm?token=abc123xyz
```

### Step 3: Analyze the Link
- Note the domain (`reservation.affluences.com` vs `api.affluences.com`)
- Note the path (`/email/confirm`, `/email/verify`, etc.)
- Note how the token is passed (URL parameter, path parameter, etc.)

### Step 4: Test the Endpoint Pattern
Once you know the pattern, you can test it:
```javascript
// If the link is: https://reservation.affluences.com/email/confirm?token=abc123
// The endpoint pattern is: https://reservation.affluences.com/email/confirm

await EmailTestUtils.testEmailEndpoint(
  'https://reservation.affluences.com/email/confirm',
  'your.email@unipd.it',
  'POST'
)
```

## Method 4: Check Official Mobile App

If there's an Affluences mobile app:

### Android (with ADB)
1. Install the app on Android device
2. Enable USB debugging
3. Connect device to computer
4. Run: `adb logcat | grep -i affluences`
5. Use the app to trigger email confirmation
6. API calls will appear in the logs

### iOS (with Proxy)
1. Set up a proxy (e.g., Charles Proxy, mitmproxy)
2. Configure iOS device to use the proxy
3. Install SSL certificates
4. Use the app
5. Observe API calls in the proxy

## What to Look For

When you find information, document:

### 1. Error Messages
```javascript
// Add to lib/emailConfirmation.js confirmationPatterns array
{
  errorMessage: "Please verify your email address",
  errorCode: "EMAIL_NOT_VERIFIED",
  pattern: /verify.*email/i
}
```

### 2. Confirmation Request Endpoint
```javascript
// Add to lib/emailConfirmation.js potentialEndpoints array
'https://reservation.affluences.com/api/email/verify'
```

### 3. Token Verification Endpoint
```javascript
// Add to lib/emailConfirmation.js verifyEmailToken function
'https://reservation.affluences.com/api/email/confirm/{token}'
```

### 4. Request/Response Format
```javascript
// Document the exact request body needed
{
  email: "user@unipd.it",
  // Any other required fields?
}

// Document the response format
{
  success: true,
  message: "Verification email sent"
  // Any other fields?
}
```

## Reporting Your Findings

Once you've discovered the endpoints:

1. **Create an Issue** on GitHub with your findings
2. Include:
   - The exact endpoint URLs
   - Request method (GET, POST, etc.)
   - Request body structure
   - Response structure
   - Error messages you encountered
   - Screenshots of the Network tab

3. **Test Your Findings**:
```javascript
// Update lib/emailConfirmation.js with the real endpoints
// Update the error detection patterns
// Test that it works end-to-end
```

## Example Finding Report

```markdown
## Email Confirmation Endpoint Discovery

### Booking Error
- **URL**: https://reservation.affluences.com/api/reserve/abc123
- **Status**: 400
- **Error Message**: "Email address must be verified before booking"
- **Error Code**: "UNVERIFIED_EMAIL"

### Confirmation Request Endpoint
- **URL**: https://reservation.affluences.com/api/email/send-verification
- **Method**: POST
- **Request Body**:
  ```json
  {
    "email": "user@unipd.it"
  }
  ```
- **Success Response**:
  ```json
  {
    "success": true,
    "message": "Verification email sent"
  }
  ```

### Email Link
- **Format**: https://affluences.com/verify-email?token=abc123xyz
- **Token**: URL parameter named "token"

### Verification Endpoint
- **URL**: https://api.affluences.com/app/v3/email/verify
- **Method**: POST
- **Request Body**:
  ```json
  {
    "token": "abc123xyz"
  }
  ```
```

## Tips

1. **Use a fresh email**: Test with an email that hasn't been used before
2. **Check spam**: Confirmation emails might go to spam
3. **Be patient**: Some emails take time to arrive
4. **Rate limits**: Space out your API tests to avoid being blocked
5. **Respect ToS**: This is for educational purposes only

## Next Steps After Discovery

1. Update `lib/emailConfirmation.js` with real endpoints
2. Update error detection patterns
3. Test the complete flow
4. Update documentation
5. Submit a PR with your changes

## Questions?

If you have questions or need help:
1. Open an issue on GitHub
2. Include as much detail as possible
3. Attach screenshots of the Network tab
4. Include any error messages you see

Good luck with the reverse engineering! 🔍
