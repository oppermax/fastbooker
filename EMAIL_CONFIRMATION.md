# Email Confirmation Feature

## Overview

Some libraries in the Affluences system require users to confirm their email addresses before they can make bookings. This feature implements detection and handling of email confirmation requirements.

## How It Works

### 1. Detection
The system automatically detects when a booking fails due to an unconfirmed email by analyzing the error response from the Affluences API. Common error patterns include:
- "email not verified"
- "email not confirmed"
- "verify your email"
- "email validation required"

### 2. User Flow
When an email confirmation is required:

1. **Booking Attempt**: User tries to book a seat
2. **Error Detection**: System detects the error requires email confirmation
3. **Dialog Display**: Email Confirmation Dialog appears automatically
4. **Confirmation Options**:
   - **Option A**: Click "Request Confirmation Email" to attempt automatic email verification
   - **Option B**: Use the official Affluences app/website to complete verification
5. **Manual Confirmation**: After verifying via email link, user clicks "I've Confirmed My Email"
6. **Retry**: User can now retry their booking

### 3. Storage
Once an email is confirmed, it's stored in localStorage so users don't need to confirm it again:
- Confirmed emails are stored in `localStorage.confirmedEmails`
- The system checks this list before showing the confirmation dialog

## Implementation Details

### Files Created/Modified

#### New Files:
1. **`lib/emailConfirmation.js`** - Core email confirmation API module
   - `isEmailConfirmationRequired(error)` - Detects if error is email-related
   - `requestEmailConfirmation(email)` - Attempts to trigger confirmation email
   - `verifyEmailToken(token)` - Verifies email confirmation tokens
   - `storeConfirmedEmail(email)` - Stores confirmed emails in localStorage
   - `isEmailConfirmed(email)` - Checks if email is already confirmed
   
2. **`components/EmailConfirmationDialog.js`** - UI component for email confirmation
   - Displays when confirmation is needed
   - Guides user through confirmation process
   - Handles both automatic and manual confirmation

#### Modified Files:
1. **`lib/reservation.js`**
   - Now imports and uses `isEmailConfirmationRequired`
   - Returns a third element in the result array indicating if email confirmation is needed
   - Format: `[success, message, 'EMAIL_CONFIRMATION_REQUIRED']`

2. **`components/ShoppingCart.js`**
   - Imports `EmailConfirmationDialog`
   - Detects email confirmation errors during batch booking
   - Shows confirmation dialog when needed
   - Allows user to retry after confirmation

## API Endpoint Discovery

The email confirmation feature includes an endpoint discovery mechanism. It attempts multiple potential API endpoints in order:

### Potential Endpoints (to be verified):
1. `https://reservation.affluences.com/api/email/verify`
2. `https://reservation.affluences.com/api/email/send-confirmation`
3. `https://api.affluences.com/app/v3/email/verify`
4. `https://api.affluences.com/app/v3/email/send-confirmation`

### Token Verification Endpoints:
1. `https://reservation.affluences.com/api/email/confirm/{token}`
2. `https://api.affluences.com/app/v3/email/confirm/{token}`

**Note**: These endpoints are educated guesses based on common REST API patterns. The actual endpoints used by Affluences may differ and need to be discovered through testing.

## Testing & Validation

Since we cannot access the Affluences API directly in the development environment, the feature includes:

1. **Graceful Degradation**: If automatic confirmation fails, users are directed to use the official Affluences app
2. **Manual Override**: Users can mark their email as confirmed after verifying through the official app
3. **Debug Information**: The dialog shows which endpoint was attempted (when in debug mode)
4. **Error Messages**: Clear error messages guide users when automatic confirmation isn't available

## Future Improvements

To fully implement this feature, you'll need to:

1. **Test with Real API**: Make actual booking attempts to libraries requiring email confirmation
2. **Capture Error Responses**: Document the exact error messages and response format
3. **Discover Endpoints**: Find the actual email confirmation API endpoints
4. **Refine Detection**: Update error detection patterns based on real responses
5. **Add Tests**: Create automated tests once API behavior is known

## Usage Example

### For Users:
1. Enter your UniPD email in the booking interface
2. Select seats and click "Book All"
3. If email confirmation is required, a dialog will appear
4. Follow the dialog instructions to confirm your email
5. After confirmation, retry your booking

### For Developers:
```javascript
// Check if an error requires email confirmation
import { isEmailConfirmationRequired } from '@/lib/emailConfirmation';

try {
  const result = await reserve(email, date, startTime, endTime, seatId);
} catch (error) {
  if (isEmailConfirmationRequired(error)) {
    // Show email confirmation dialog
  }
}

// Request email confirmation
import { requestEmailConfirmation } from '@/lib/emailConfirmation';

const result = await requestEmailConfirmation('user@unipd.it');
if (result.success) {
  console.log('Confirmation email sent!');
}

// Store confirmed email
import { storeConfirmedEmail } from '@/lib/emailConfirmation';
storeConfirmedEmail('user@unipd.it');
```

## Debugging

To debug email confirmation issues:

1. **Check Console**: Error responses are logged to the browser console
2. **Network Tab**: Inspect actual API requests and responses
3. **LocalStorage**: Check `confirmedEmails` array in localStorage
4. **Dialog Messages**: The dialog displays detailed error messages and attempted endpoints

## Security Considerations

- Email addresses are stored in browser localStorage (client-side only)
- No sensitive data is transmitted to third parties
- Confirmation tokens should be handled securely
- The feature respects Affluences' rate limiting by spacing requests

## Contributing

If you discover the actual Affluences email confirmation endpoints:

1. Update the endpoint lists in `lib/emailConfirmation.js`
2. Update error detection patterns based on real error messages
3. Add tests to verify the functionality
4. Update this documentation with confirmed information
