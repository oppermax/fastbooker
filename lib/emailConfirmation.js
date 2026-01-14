import axios from 'axios';

/**
 * Email Confirmation API Module
 * 
 * This module handles email verification/confirmation for libraries that require it.
 * The Affluences API supports email confirmation but the exact endpoints need to be
 * discovered through testing.
 * 
 * Possible API endpoints (to be verified):
 * - POST https://reservation.affluences.com/api/email/verify
 * - POST https://api.affluences.com/app/v3/email/send-confirmation
 * - GET https://reservation.affluences.com/api/email/confirm/{token}
 */

/**
 * Check if an error response indicates email confirmation is required
 * @param {Object} error - Axios error object
 * @returns {boolean} - True if error indicates email needs confirmation
 */
export function isEmailConfirmationRequired(error) {
  if (!error.response || !error.response.data) {
    return false;
  }

  const errorData = error.response.data;
  const errorMessage = errorData.errorMessage || errorData.message || '';
  
  // Common patterns for email confirmation errors
  const confirmationPatterns = [
    /email.*not.*verif/i,
    /email.*not.*confirm/i,
    /verify.*email/i,
    /confirm.*email/i,
    /email.*validation.*required/i,
    /please.*confirm.*email/i,
    /unverified.*email/i,
  ];

  return confirmationPatterns.some(pattern => pattern.test(errorMessage));
}

/**
 * Request email confirmation/verification
 * This function attempts to trigger the confirmation email to be sent
 * 
 * @param {string} email - Email address to confirm
 * @returns {Promise<Object>} - { success: boolean, message: string, endpoint?: string }
 */
export async function requestEmailConfirmation(email) {
  // List of potential endpoints to try (in order of likelihood)
  const potentialEndpoints = [
    'https://reservation.affluences.com/api/email/verify',
    'https://reservation.affluences.com/api/email/send-confirmation',
    'https://api.affluences.com/app/v3/email/verify',
    'https://api.affluences.com/app/v3/email/send-confirmation',
  ];

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  };

  // Try each endpoint
  for (const endpoint of potentialEndpoints) {
    try {
      const response = await axios.post(
        endpoint,
        { email },
        { headers, timeout: 5000 }
      );

      // If we get a successful response, return it
      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data.message || 'Confirmation email sent. Please check your inbox.',
          endpoint: endpoint,
        };
      }
    } catch (error) {
      // If we get a 404, try next endpoint
      if (error.response && error.response.status === 404) {
        continue;
      }
      
      // If we get any other error, it might still be the right endpoint
      // but with a different issue (e.g., rate limit, already confirmed, etc.)
      if (error.response && error.response.data) {
        const errorMsg = error.response.data.errorMessage || error.response.data.message;
        
        // If the error message indicates something other than "not found"
        // it's probably the right endpoint
        if (errorMsg && !errorMsg.toLowerCase().includes('not found')) {
          return {
            success: false,
            message: errorMsg,
            endpoint: endpoint,
          };
        }
      }
    }
  }

  // If none of the endpoints worked, return a helpful message
  return {
    success: false,
    message: 'Could not find email confirmation endpoint. The API may have changed. Please contact support or try booking to see if confirmation is automatically triggered.',
    endpoint: null,
  };
}

/**
 * Verify email with confirmation token
 * This is typically called when user clicks the link in the confirmation email
 * 
 * @param {string} token - Confirmation token from email link
 * @returns {Promise<Object>} - { success: boolean, message: string }
 */
export async function verifyEmailToken(token) {
  const potentialEndpoints = [
    `https://reservation.affluences.com/api/email/confirm/${token}`,
    `https://api.affluences.com/app/v3/email/confirm/${token}`,
  ];

  const headers = {
    'Accept': 'application/json, text/plain, */*',
  };

  for (const endpoint of potentialEndpoints) {
    try {
      const response = await axios.get(endpoint, { headers, timeout: 5000 });

      if (response.status >= 200 && response.status < 300) {
        return {
          success: true,
          message: response.data.message || 'Email verified successfully!',
        };
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        continue;
      }
      
      if (error.response && error.response.data) {
        return {
          success: false,
          message: error.response.data.errorMessage || error.response.data.message || 'Verification failed',
        };
      }
    }
  }

  return {
    success: false,
    message: 'Could not verify email token. The link may be invalid or expired.',
  };
}

/**
 * Store confirmed email in localStorage
 * @param {string} email - Confirmed email address
 */
export function storeConfirmedEmail(email) {
  const confirmedEmails = getConfirmedEmails();
  if (!confirmedEmails.includes(email)) {
    confirmedEmails.push(email);
    localStorage.setItem('confirmedEmails', JSON.stringify(confirmedEmails));
  }
}

/**
 * Get list of confirmed emails from localStorage
 * @returns {string[]} - Array of confirmed email addresses
 */
export function getConfirmedEmails() {
  try {
    const stored = localStorage.getItem('confirmedEmails');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Check if an email is already confirmed
 * @param {string} email - Email address to check
 * @returns {boolean} - True if email is confirmed
 */
export function isEmailConfirmed(email) {
  return getConfirmedEmails().includes(email);
}

/**
 * Remove a confirmed email (e.g., if user wants to re-verify)
 * @param {string} email - Email address to remove
 */
export function removeConfirmedEmail(email) {
  const confirmedEmails = getConfirmedEmails();
  const filtered = confirmedEmails.filter(e => e !== email);
  localStorage.setItem('confirmedEmails', JSON.stringify(filtered));
}
