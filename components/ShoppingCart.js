"use client";

import { useState, useEffect } from 'react';
import { useCart } from '@/lib/cartContext';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButtonMui from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import reserve from '@/lib/reservation';

export default function ShoppingCart() {
  const { cartItems, cartCount, removeFromCart, clearCart, getOptimizedBookings } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResults, setBookingResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [email, setEmail] = useState('');

  const optimizedBookings = getOptimizedBookings();

  // Load email from localStorage on mount and listen for changes
  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    if (savedEmail) {
      setEmail(savedEmail);
    }

    const handleEmailChange = (event) => {
      setEmail(event.detail);
    };

    window.addEventListener('emailChanged', handleEmailChange);
    return () => window.removeEventListener('emailChanged', handleEmailChange);
  }, []);

  // Save email to localStorage and dispatch event whenever it changes
  const handleEmailChange = (event) => {
    const newEmail = event.target.value;
    setEmail(newEmail);
    localStorage.setItem('userEmail', newEmail);

    // Dispatch custom event so other components can react to email changes
    window.dispatchEvent(new CustomEvent('emailChanged', { detail: newEmail }));
  };

  const handleBookAll = async () => {
    setIsBooking(true);
    setShowResults(false);
    const results = [];

    for (let i = 0; i < optimizedBookings.length; i++) {
      const booking = optimizedBookings[i];

      try {
        // Wait 1 second between bookings to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        const result = await reserve(
          booking.email,
          booking.date,
          booking.startTime,
          booking.endTime,
          booking.seatId
        );

        results.push({
          seatName: booking.seatName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          success: result[0] === 1,
          message: result[1]
        });
      } catch (error) {
        results.push({
          seatName: booking.seatName,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          success: false,
          message: 'Booking failed'
        });
      }
    }

    setBookingResults(results);
    setIsBooking(false);
    setShowResults(true);

    // If all successful, clear cart
    if (results.every(r => r.success)) {
      setTimeout(() => {
        clearCart();
        setShowResults(false);
      }, 3000);
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
  };

  return (
    <>
      <IconButton
        onClick={() => setIsOpen(true)}
        sx={{ color: 'white' }}
      >
        <Badge badgeContent={cartCount} color="error">
          <ShoppingCartIcon />
        </Badge>
      </IconButton>

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: { xs: '100%', sm: 400 } }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Booking Cart
            </Typography>
            <IconButtonMui onClick={() => setIsOpen(false)}>
              <CloseIcon />
            </IconButtonMui>
          </Box>

          {/* Email Input - at the top */}
          {!showResults && (
            <Box sx={{ mb: 2 }}>
              <TextField
                label="UniPD Email"
                variant="outlined"
                size="small"
                fullWidth
                value={email}
                onChange={handleEmailChange}
                placeholder="your.email@unipd.it"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#d1d5db',
                    },
                    '&:hover fieldset': {
                      borderColor: '#9ca3af',
                    },
                  }
                }}
              />
            </Box>
          )}

          {showResults ? (
            /* Booking Results */
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Booking Results:</Typography>
              {bookingResults.map((result, index) => (
                <Alert
                  key={index}
                  severity={result.success ? 'success' : 'error'}
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {result.seatName}
                  </Typography>
                  <Typography variant="caption">
                    {result.date} | {result.startTime} - {result.endTime}
                  </Typography>
                  <Typography variant="caption" display="block">
                    {result.message}
                  </Typography>
                </Alert>
              ))}
              <Button
                fullWidth
                variant="outlined"
                onClick={() => {
                  setShowResults(false);
                  setIsOpen(false);
                }}
                sx={{ mt: 2 }}
              >
                Close
              </Button>
            </Box>
          ) : cartItems.length === 0 ? (
            /* Empty Cart */
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                Your cart is empty
              </Typography>
            </Box>
          ) : (
            <>
              {/* Cart Items */}
              <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {cartItems.length} slot{cartItems.length !== 1 ? 's' : ''} selected • Will be booked as {optimizedBookings.length} booking{optimizedBookings.length !== 1 ? 's' : ''}
                </Typography>

                <List sx={{ p: 0 }}>
                  {optimizedBookings.map((booking, index) => (
                    <Box key={index}>
                      <ListItem
                        sx={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          mb: 1,
                          flexDirection: 'column',
                          alignItems: 'stretch',
                          backgroundColor: booking.duration > 240 ? '#fef2f2' : '#ffffff'
                        }}
                      >
                        <Box sx={{ width: '100%', mb: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {booking.seatName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {booking.date}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          <Typography variant="body2">
                            {booking.startTime} - {booking.endTime}
                          </Typography>
                          <Typography variant="caption" sx={{
                            backgroundColor: booking.duration > 240 ? '#fca5a5' : '#86efac',
                            color: booking.duration > 240 ? '#7f1d1d' : '#14532d',
                            px: 1,
                            py: 0.5,
                            borderRadius: '4px',
                            fontWeight: 600
                          }}>
                            {formatDuration(booking.duration)}
                          </Typography>
                        </Box>
                        {booking.duration > 240 && (
                          <Alert severity="warning" sx={{ mt: 1 }}>
                            Exceeds 4-hour limit! This booking may fail.
                          </Alert>
                        )}
                      </ListItem>
                    </Box>
                  ))}
                </List>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                  Individual slots (click to remove):
                </Typography>
                <List sx={{ p: 0 }}>
                  {cartItems.map((item) => (
                    <ListItem
                      key={item.id}
                      sx={{ px: 1, py: 0.5 }}
                      secondaryAction={
                        <IconButtonMui edge="end" onClick={() => removeFromCart(item.id)} size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButtonMui>
                      }
                    >
                      <ListItemText
                        primary={
                          <Typography variant="caption">
                            {item.seatName} - {item.startTime}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {item.date}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Actions */}
              <Box>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  onClick={handleBookAll}
                  disabled={isBooking || optimizedBookings.length === 0}
                  sx={{ mb: 1 }}
                >
                  {isBooking ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Booking... ({bookingResults.length}/{optimizedBookings.length})
                    </>
                  ) : (
                    `Book All (${optimizedBookings.length} booking${optimizedBookings.length !== 1 ? 's' : ''})`
                  )}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={clearCart}
                  disabled={isBooking}
                >
                  Clear Cart
                </Button>
              </Box>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}

