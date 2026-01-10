"use client";

import * as React from 'react';
import { useState } from 'react';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import ListItem from '@mui/material/ListItem';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { useCart } from '@/lib/cartContext';

export default function SeatTile({name, description, hours, id, email, date}) {
  const [expanded, setExpanded] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState(new Set());
  const [message, setMessage] = useState('');
  const { addToCart } = useCart();

  const availableHours = hours.filter(hour => hour.places_available > 0);
  const hasAvailableSlots = availableHours.length > 0;

  const toggleSlot = (hour) => {
    const slotKey = hour.hour;
    setSelectedSlots(prev => {
      const newSet = new Set(prev);
      if (newSet.has(slotKey)) {
        newSet.delete(slotKey);
      } else {
        newSet.add(slotKey);
      }
      return newSet;
    });
  };

  const handleAddToCart = () => {
    if (selectedSlots.size === 0) {
      setMessage('Please select at least one time slot');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    let addedCount = 0;
    selectedSlots.forEach(slotKey => {
      const hour = availableHours.find(h => h.hour === slotKey);
      if (hour) {
        const startTime = hour.hour;
        const endTime = new Date(`1970-01-01T${startTime}:00`);
        endTime.setMinutes(endTime.getMinutes() + 30);
        const endTimeStr = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;

        addToCart({
          seatId: id,
          seatName: name,
          date: date,
          startTime: startTime,
          endTime: endTimeStr,
          email: email
        });
        addedCount++;
      }
    });

    setMessage(`Added ${addedCount} slot${addedCount !== 1 ? 's' : ''} to cart!`);
    setSelectedSlots(new Set());
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSelectAll = () => {
    if (selectedSlots.size === availableHours.length) {
      setSelectedSlots(new Set());
    } else {
      setSelectedSlots(new Set(availableHours.map(h => h.hour)));
    }
  };
  
  return (
    <ListItem
      sx={{
        flexDirection: 'column',
        alignItems: 'stretch',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        mb: 2,
        p: 0,
        overflow: 'hidden',
        backgroundColor: hasAvailableSlots ? '#ffffff' : '#f9fafb'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          cursor: hasAvailableSlots ? 'pointer' : 'default',
          '&:hover': hasAvailableSlots ? {
            backgroundColor: '#f9fafb'
          } : {}
        }}
        onClick={() => hasAvailableSlots && setExpanded(!expanded)}
      >
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1f2937', mb: 0.5 }}>
            {name}
          </Typography>
          {description && (
            <Typography variant="body2" sx={{ color: '#6b7280' }}>
              {description}
            </Typography>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {hasAvailableSlots ? (
            <>
              <Chip
                label={`${availableHours.length} slot${availableHours.length !== 1 ? 's' : ''}`}
                size="small"
                sx={{
                  backgroundColor: '#22c55e',
                  color: 'white',
                  fontWeight: 600
                }}
              />
              <IconButton size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </>
          ) : (
            <Chip
              label="No available slots"
              size="small"
              sx={{
                backgroundColor: '#ef4444',
                color: 'white',
                fontWeight: 600
              }}
            />
          )}
        </Box>
      </Box>

      {hasAvailableSlots && (
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Box sx={{ p: 2, pt: 0, borderTop: '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: 500 }}>
                Select time slots ({selectedSlots.size} selected):
              </Typography>
              <Button
                size="small"
                onClick={handleSelectAll}
                sx={{ textTransform: 'none' }}
              >
                {selectedSlots.size === availableHours.length ? 'Deselect All' : 'Select All'}
              </Button>
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {availableHours.map((hour, i) => {
                const isSelected = selectedSlots.has(hour.hour);
                return (
                  <Box
                    key={i}
                    onClick={() => toggleSlot(hour)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '70px',
                      px: 1.5,
                      py: 0.5,
                      border: '2px solid',
                      borderColor: isSelected ? '#991b1b' : '#d1d5db',
                      borderRadius: '6px',
                      backgroundColor: isSelected ? '#fef2f2' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: '#991b1b',
                        backgroundColor: isSelected ? '#fee2e2' : '#fef2f2',
                      }
                    }}
                  >
                    <Checkbox
                      checked={isSelected}
                      size="small"
                      sx={{ p: 0, mr: 0.5 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {hour.hour}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={selectedSlots.size === 0}
              startIcon={<ShoppingCartIcon />}
              sx={{ mt: 1 }}
            >
              Add to Cart ({selectedSlots.size})
            </Button>

            {message && (
              <Alert severity="success" sx={{ mt: 2 }}>
                {message}
              </Alert>
            )}
          </Box>
        </Collapse>
      )}
    </ListItem>
  );
}
