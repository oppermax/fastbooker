/**
 * Smart Booking Algorithm
 * Finds optimal combinations of seats to cover a time range
 */

/**
 * Parse time string to minutes since midnight
 */
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes to time string
 */
function minutesToTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

/**
 * Extract seat number from seat name for proximity calculation
 */
function extractSeatNumber(seatName) {
  const match = seatName.match(/(\d+)/);
  return match ? parseInt(match[0]) : 0;
}

/**
 * Calculate proximity score between two seats (0-1, higher is better)
 */
function calculateProximity(seat1, seat2) {
  // Same room = 1.0, different room = 0.3
  if (seat1.floor_id !== seat2.floor_id) {
    return 0.3;
  }

  // Same room, calculate number proximity
  const num1 = extractSeatNumber(seat1.resource_name);
  const num2 = extractSeatNumber(seat2.resource_name);
  const diff = Math.abs(num1 - num2);

  // Closer numbers = higher score
  if (diff === 0) return 1.0;
  if (diff <= 5) return 0.9;
  if (diff <= 10) return 0.8;
  if (diff <= 20) return 0.7;
  if (diff <= 50) return 0.6;
  return 0.5;
}

/**
 * Split a time block into chunks of maximum 4 hours (240 minutes)
 * This is required by Affluences API - bookings cannot exceed 4 hours
 */
function splitBlockIntoMaxChunks(block, maxMinutes = 240) {
  const chunks = [];
  let currentStart = block.start;

  while (currentStart < block.end) {
    const remainingTime = block.end - currentStart;
    const chunkDuration = Math.min(remainingTime, maxMinutes);

    chunks.push({
      start: currentStart,
      end: currentStart + chunkDuration
    });

    currentStart += chunkDuration;
  }

  return chunks;
}

/**
 * Find available time blocks for a seat
 * Blocks are automatically split to respect 4-hour maximum booking limit
 */
function findAvailableBlocks(seat, startMinutes, endMinutes) {
  const blocks = [];
  let currentBlockStart = null;

  // Sort hours by time
  const sortedHours = [...seat.hours].sort((a, b) =>
    timeToMinutes(a.hour) - timeToMinutes(b.hour)
  );

  for (const hour of sortedHours) {
    const hourStart = timeToMinutes(hour.hour);
    const hourEnd = hourStart + 30; // 30-minute slots

    // Check if this slot is in our time range and available
    if (hourEnd <= startMinutes || hourStart >= endMinutes) continue;
    if (hour.places_available === 0) {
      // End current block
      if (currentBlockStart !== null) {
        const blockEnd = Math.max(currentBlockStart + 30, hourStart);
        // Split into 4-hour chunks
        const chunks = splitBlockIntoMaxChunks({ start: currentBlockStart, end: blockEnd });
        blocks.push(...chunks);
        currentBlockStart = null;
      }
      continue;
    }

    // Start or continue block
    if (currentBlockStart === null) {
      currentBlockStart = Math.max(hourStart, startMinutes);
    }
  }

  // Close final block
  if (currentBlockStart !== null) {
    const blockEnd = Math.min(endMinutes, currentBlockStart + (sortedHours.length * 30));
    // Split into 4-hour chunks
    const chunks = splitBlockIntoMaxChunks({ start: currentBlockStart, end: blockEnd });
    blocks.push(...chunks);
  }

  return blocks;
}

/**
 * Calculate a score for a booking combination
 * Lower score is better
 */
function scoreCombination(combination, targetDuration) {
  let score = 0;

  // Penalty for number of seat changes (heavily weighted)
  score += combination.length * 100;

  // Penalty for gaps in coverage
  const totalCovered = combination.reduce((sum, seg) =>
    sum + (seg.endMinutes - seg.startMinutes), 0
  );
  const gapPenalty = Math.max(0, targetDuration - totalCovered) * 5;
  score += gapPenalty;

  // Penalty for proximity (seat changes)
  for (let i = 1; i < combination.length; i++) {
    const proximity = calculateProximity(combination[i-1].seat, combination[i].seat);
    score += (1 - proximity) * 50; // Lower proximity = higher penalty
  }

  // Penalty for very short bookings (but not 4-hour chunks which are good)
  for (const segment of combination) {
    const duration = segment.endMinutes - segment.startMinutes;
    // Only penalize bookings shorter than 1 hour
    // 4-hour blocks (240 min) or close to it are ideal
    if (duration < 60) {
      score += (60 - duration) * 0.5;
    }
  }

  // Bonus for longer bookings (2-4 hours are ideal)
  const avgDuration = totalCovered / combination.length;
  if (avgDuration >= 120 && avgDuration <= 240) {
    score -= 30; // 2-4 hour blocks are perfect
  }

  return score;
}

/**
 * Find optimal seat combinations using dynamic programming approach
 */
export function findOptimalSeatCombinations(seats, startTime, endTime, maxOptions = 5) {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const targetDuration = endMinutes - startMinutes;

  // Build availability map for each seat
  const seatAvailability = seats.map(seat => ({
    seat,
    blocks: findAvailableBlocks(seat, startMinutes, endMinutes)
  })).filter(sa => sa.blocks.length > 0);

  if (seatAvailability.length === 0) {
    return [];
  }

  // Try to find combinations using greedy approach with backtracking
  const combinations = [];

  // Strategy 1: Try each seat as starting point
  for (const startSeat of seatAvailability) {
    for (const startBlock of startSeat.blocks) {
      const combination = buildCombination(
        [{
          seat: startSeat.seat,
          startMinutes: startBlock.start,
          endMinutes: startBlock.end
        }],
        startBlock.end,
        endMinutes,
        seatAvailability
      );

      if (combination && combination.length > 0) {
        combinations.push(combination);
      }
    }
  }

  // Score and sort combinations
  const scoredCombinations = combinations
    .map(combo => ({
      combination: combo,
      score: scoreCombination(combo, targetDuration),
      coverage: combo.reduce((sum, seg) => sum + (seg.endMinutes - seg.startMinutes), 0),
      coveragePercent: (combo.reduce((sum, seg) => sum + (seg.endMinutes - seg.startMinutes), 0) / targetDuration) * 100
    }))
    .filter(sc => sc.coveragePercent >= 80) // At least 80% coverage
    .sort((a, b) => a.score - b.score)
    .slice(0, maxOptions);

  return scoredCombinations;
}

/**
 * Recursively build combination from current state
 */
function buildCombination(currentCombo, currentTime, targetEndTime, seatAvailability, depth = 0) {
  // Limit recursion depth to prevent infinite loops
  if (depth > 10 || currentCombo.length > 6) {
    return currentCombo;
  }

  // If we've covered the time range, return
  if (currentTime >= targetEndTime) {
    return currentCombo;
  }

  const lastSeat = currentCombo[currentCombo.length - 1].seat;

  // Find next best seat/block
  let bestNext = null;
  let bestScore = Infinity;

  for (const seatAvail of seatAvailability) {
    const proximity = calculateProximity(lastSeat, seatAvail.seat);

    for (const block of seatAvail.blocks) {
      // Block must start at or after current time
      if (block.start >= currentTime) {
        const gap = block.start - currentTime;
        const duration = block.end - block.start;

        // Score this option
        const score = gap * 2 + (1 - proximity) * 30 - duration * 0.1;

        if (score < bestScore) {
          bestScore = score;
          bestNext = {
            seat: seatAvail.seat,
            startMinutes: block.start,
            endMinutes: block.end,
            gap
          };
        }
      }
    }
  }

  if (!bestNext || bestNext.gap > 60) { // Don't allow gaps > 1 hour
    return currentCombo;
  }

  // Add to combination and recurse
  return buildCombination(
    [...currentCombo, bestNext],
    bestNext.endMinutes,
    targetEndTime,
    seatAvailability,
    depth + 1
  );
}

/**
 * Format recommendation for display
 */
export function formatRecommendation(scoredCombo) {
  const { combination, coverage, coveragePercent } = scoredCombo;

  // Calculate actual seat changes (only count when seat ID changes)
  let actualSeatChanges = 0;
  for (let i = 1; i < combination.length; i++) {
    if (combination[i].seat.resource_id !== combination[i-1].seat.resource_id) {
      actualSeatChanges++;
    }
  }

  return {
    segments: combination.map(seg => ({
      seatId: seg.seat.resource_id,
      seatName: seg.seat.resource_name,
      floorName: seg.seat.floor_name || 'Room',
      startTime: minutesToTime(seg.startMinutes),
      endTime: minutesToTime(seg.endMinutes),
      duration: seg.endMinutes - seg.startMinutes
    })),
    totalBookings: combination.length,
    totalDuration: coverage,
    coveragePercent: Math.round(coveragePercent),
    seatChanges: actualSeatChanges
  };
}

