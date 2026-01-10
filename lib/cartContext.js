/**
 * Shopping Cart Context for managing booking selections
 */
"use client";

import { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  // Add a time slot to cart
  const addToCart = useCallback((item) => {
    setCartItems(prev => {
      // Check if this exact slot already exists
      const exists = prev.some(
        i => i.seatId === item.seatId &&
             i.seatName === item.seatName &&
             i.date === item.date &&
             i.startTime === item.startTime &&
             i.endTime === item.endTime
      );

      if (exists) return prev;

      return [...prev, { ...item, id: Date.now() + Math.random() }];
    });
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Group items by seat and date, then bundle into 4-hour chunks
  const getOptimizedBookings = useCallback(() => {
    // Group by seat and date
    const grouped = cartItems.reduce((acc, item) => {
      const key = `${item.seatId}_${item.date}`;
      if (!acc[key]) {
        acc[key] = {
          seatId: item.seatId,
          seatName: item.seatName,
          date: item.date,
          email: item.email,
          slots: []
        };
      }
      acc[key].slots.push({
        startTime: item.startTime,
        endTime: item.endTime,
        id: item.id
      });
      return acc;
    }, {});

    // For each group, bundle into 4-hour chunks
    const optimizedBookings = [];

    Object.values(grouped).forEach(group => {
      // Sort slots by start time
      const sortedSlots = group.slots.sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
      });

      // Bundle consecutive slots into max 4-hour chunks
      let currentChunk = [];
      let chunkStartTime = null;
      let chunkDuration = 0;

      sortedSlots.forEach((slot, index) => {
        const slotStart = new Date(`1970-01-01T${slot.startTime}:00`);
        const slotEnd = new Date(`1970-01-01T${slot.endTime}:00`);
        const slotDuration = (slotEnd - slotStart) / (1000 * 60); // minutes

        if (currentChunk.length === 0) {
          // Start new chunk
          currentChunk = [slot];
          chunkStartTime = slotStart;
          chunkDuration = slotDuration;
        } else {
          // Check if this slot is consecutive
          const lastSlotEnd = new Date(`1970-01-01T${currentChunk[currentChunk.length - 1].endTime}:00`);
          const isConsecutive = slotStart.getTime() === lastSlotEnd.getTime();
          const newDuration = chunkDuration + slotDuration;

          if (isConsecutive && newDuration <= 240) { // 240 minutes = 4 hours
            // Add to current chunk
            currentChunk.push(slot);
            chunkDuration = newDuration;
          } else {
            // Save current chunk and start new one
            const chunkEndTime = new Date(`1970-01-01T${currentChunk[currentChunk.length - 1].endTime}:00`);
            optimizedBookings.push({
              seatId: group.seatId,
              seatName: group.seatName,
              date: group.date,
              email: group.email,
              startTime: currentChunk[0].startTime,
              endTime: currentChunk[currentChunk.length - 1].endTime,
              duration: chunkDuration,
              slotIds: currentChunk.map(s => s.id)
            });

            // Start new chunk
            currentChunk = [slot];
            chunkStartTime = slotStart;
            chunkDuration = slotDuration;
          }
        }

        // If this is the last slot, save the current chunk
        if (index === sortedSlots.length - 1 && currentChunk.length > 0) {
          optimizedBookings.push({
            seatId: group.seatId,
            seatName: group.seatName,
            date: group.date,
            email: group.email,
            startTime: currentChunk[0].startTime,
            endTime: currentChunk[currentChunk.length - 1].endTime,
            duration: chunkDuration,
            slotIds: currentChunk.map(s => s.id)
          });
        }
      });
    });

    return optimizedBookings;
  }, [cartItems]);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getOptimizedBookings,
    cartCount: cartItems.length
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
}

