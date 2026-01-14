"use client";

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { requestEmailConfirmation, storeConfirmedEmail } from '@/lib/emailConfirmation';

/**
 * Email Confirmation Dialog Component
 * 
 * Displays when a booking fails due to unconfirmed email.
 * Guides the user through the email confirmation process.
 */
export default function EmailConfirmationDialog({ open, onClose, email, onConfirmed }) {
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestResult, setRequestResult] = useState(null);
  const [hasRequestedConfirmation, setHasRequestedConfirmation] = useState(false);

  const handleRequestConfirmation = async () => {
    setIsRequesting(true);
    setRequestResult(null);

    try {
      const result = await requestEmailConfirmation(email);
      setRequestResult(result);
      
      if (result.success) {
        setHasRequestedConfirmation(true);
      }
    } catch (error) {
      setRequestResult({
        success: false,
        message: 'An error occurred while requesting confirmation. Please try again.',
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const handleManualConfirmation = () => {
    // If user confirms they've clicked the link, mark as confirmed
    storeConfirmedEmail(email);
    if (onConfirmed) {
      onConfirmed();
    }
    handleClose();
  };

  const handleClose = () => {
    setRequestResult(null);
    setHasRequestedConfirmation(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Email Confirmation Required</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This library requires you to confirm your email address before booking.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Email: <strong>{email}</strong>
          </Typography>

          {!hasRequestedConfirmation ? (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Click the button below to request a confirmation email. You&apos;ll receive an email with a link to verify your address.
              </Alert>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                <strong>Alternative:</strong> Try making a booking through the official Affluences app or website first. 
                They will send you a confirmation email automatically.
              </Typography>
            </>
          ) : (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                {requestResult?.message || 'Confirmation request sent!'}
              </Alert>
              
              <Typography variant="body2" sx={{ mb: 2 }}>
                Please check your email inbox (including spam folder) for a confirmation link from Affluences.
              </Typography>
              
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                After clicking the confirmation link in your email, come back here and click &quot;I&apos;ve Confirmed My Email&quot; below.
              </Typography>
            </>
          )}

          {requestResult && !requestResult.success && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              {requestResult.message}
              {requestResult.endpoint === null && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="caption">
                    <strong>Recommended:</strong> Visit the official Affluences app/website to complete email confirmation, 
                    then return here to book.
                  </Typography>
                </Box>
              )}
            </Alert>
          )}

          {requestResult?.endpoint && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
              Debug info: Using endpoint {requestResult.endpoint}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {!hasRequestedConfirmation ? (
          <>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              onClick={handleRequestConfirmation}
              variant="contained"
              disabled={isRequesting}
            >
              {isRequesting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Sending...
                </>
              ) : (
                'Request Confirmation Email'
              )}
            </Button>
          </>
        ) : (
          <>
            <Button onClick={handleClose}>Close</Button>
            <Button
              onClick={handleManualConfirmation}
              variant="contained"
              color="success"
            >
              I&apos;ve Confirmed My Email
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
