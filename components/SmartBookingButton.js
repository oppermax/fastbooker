"use client";

import { useState } from 'react';
import { useCart } from '@/lib/cartContext';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import EventIcon from '@mui/icons-material/Event';
import ChairIcon from '@mui/icons-material/Chair';
import TimelineIcon from '@mui/icons-material/Timeline';
import { findOptimalSeatCombinations, formatRecommendation } from '@/lib/smartBooking';

export default function SmartBookingButton({ seats, date, email }) {
  const [open, setOpen] = useState(false);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [maxChunkSize, setMaxChunkSize] = useState(4); // Default 4 hours
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { addToCart } = useCart();

  const handleOpen = () => {
    setOpen(true);
    setError('');
  };

  const handleClose = () => {
    setOpen(false);
    setRecommendations([]);
    setError('');
  };

  const handleSearch = () => {
    setError('');
    setLoading(true);

    // Validate times
    if (!startTime || !endTime) {
      setError('Please enter both start and end times');
      setLoading(false);
      return;
    }

    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);

    if (startHour >= endHour) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    try {
      // Find optimal combinations with configurable max chunk size
      const maxChunkMinutes = maxChunkSize * 60; // Convert hours to minutes
      const results = findOptimalSeatCombinations(seats, startTime, endTime, 5, maxChunkMinutes);

      if (results.length === 0) {
        setError('No suitable seat combinations found for this time range. Try a shorter duration or different times.');
        setLoading(false);
        return;
      }

      const formatted = results.map(formatRecommendation);
      setRecommendations(formatted);
    } catch (err) {
      console.error('Smart booking error:', err);
      setError('An error occurred while searching. Please try again.');
    }

    setLoading(false);
  };

  const handleBookRecommendation = (recommendation) => {
    let addedCount = 0;

    // Add all segments to cart
    recommendation.segments.forEach(segment => {
      addToCart({
        seatId: segment.seatId,
        seatName: segment.seatName,
        date: date,
        startTime: segment.startTime,
        endTime: segment.endTime,
        email: email
      });
      addedCount++;
    });

    // Close dialog and show success
    alert(`Added ${addedCount} bookings to cart!`);
    handleClose();
  };

  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        size="large"
        startIcon={<AutoAwesomeIcon />}
        onClick={handleOpen}
        sx={{
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            backgroundColor: 'rgba(156, 39, 176, 0.04)'
          }
        }}
      >
        Smart Multi-Seat Booking
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesomeIcon color="primary" />
            <Typography variant="h6">Smart Multi-Seat Booking</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Find the best combination of seats to cover your desired study time
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* Time inputs */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, mt: 1 }}>
            <TextField
              label="Start Time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          {/* Max Chunk Size input */}
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Max Booking Duration (hours)"
              type="number"
              value={maxChunkSize}
              onChange={(e) => setMaxChunkSize(Number(e.target.value))}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: 1, max: 12, step: 0.5 }}
              fullWidth
              helperText="Maximum duration per booking slot. Note: Different libraries may have different limits (typically 2-4 hours)."
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleSearch}
            disabled={loading}
            fullWidth
            sx={{ mb: 3 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Find Best Combinations'}
          </Button>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Found {recommendations.length} recommendation{recommendations.length > 1 ? 's' : ''}:
              </Typography>

              {recommendations.map((rec, idx) => (
                <Box
                  key={idx}
                  sx={{
                    border: '2px solid',
                    borderColor: idx === 0 ? '#9c27b0' : '#e0e0e0',
                    borderRadius: 2,
                    p: 2,
                    mb: 2,
                    backgroundColor: idx === 0 ? 'rgba(156, 39, 176, 0.02)' : 'white'
                  }}
                >
                  {idx === 0 && (
                    <Chip
                      label="Best Option"
                      color="primary"
                      size="small"
                      sx={{ mb: 1 }}
                    />
                  )}

                  {/* Summary stats */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      icon={<EventIcon />}
                      label={`${rec.totalBookings} booking${rec.totalBookings > 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<ChairIcon />}
                      label={`${rec.seatChanges} seat change${rec.seatChanges !== 1 ? 's' : ''}`}
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      icon={<TimelineIcon />}
                      label={`${rec.coveragePercent}% coverage`}
                      size="small"
                      variant="outlined"
                      color={rec.coveragePercent >= 95 ? 'success' : 'default'}
                    />
                  </Box>

                  {/* Timeline */}
                  <Box sx={{ mb: 2 }}>
                    {rec.segments.map((segment, segIdx) => (
                      <Box key={segIdx} sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 100 }}>
                            {segment.startTime} - {segment.endTime}
                          </Typography>
                          <Divider orientation="vertical" flexItem />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {segment.seatName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {segment.floorName} • {Math.floor(segment.duration / 60)}h {segment.duration % 60}m
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant={idx === 0 ? 'contained' : 'outlined'}
                    size="small"
                    onClick={() => handleBookRecommendation(rec)}
                    fullWidth
                  >
                    Add All to Cart
                  </Button>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

