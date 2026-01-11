"use client";

import { useRouter } from 'next/navigation';
import Button from '@mui/material/Button';

export default function ViewAllSeatsButton({ libraryId, selectedDate }) {
  const router = useRouter();

  const handleClick = () => {
    // Store selected date in localStorage so all-seats page can use it
    if (selectedDate) {
      localStorage.setItem(`library_${libraryId}_selectedDate`, selectedDate);
    }
    router.push(`/library/${libraryId}/all-seats`);
  };

  return (
    <Button
      variant="contained"
      color="primary"
      size="large"
      onClick={handleClick}
    >
      View All Seats
    </Button>
  );
}
