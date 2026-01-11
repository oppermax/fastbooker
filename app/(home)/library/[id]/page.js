"use client";

import { useState, useEffect } from 'react';
import getFloors from '@/lib/getFloors';
import { formatDate } from '@/lib/utils';
import DateSelector from './floor/[floorId]/DateSelector';
import ViewAllSeatsButton from './ViewAllSeatsButton';
import RoomList from './RoomList';

export default function Home({params}) {
  const [floors, setFloors] = useState([]);
  const [libraryName, setLibraryName] = useState('Library');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  useEffect(() => {
    // Get library name from localStorage
    const storedName = localStorage.getItem(`library_${params.id}_name`);
    if (storedName) {
      setLibraryName(storedName);
    }

    // Get stored date from localStorage if available
    const storedDate = localStorage.getItem(`library_${params.id}_selectedDate`);
    if (storedDate) {
      setSelectedDate(storedDate);
    }

    // Fetch floors
    getFloors(params.id).then((floorsData) => {
      setFloors(floorsData);
    });
  }, [params.id]);

  // Store selected date in localStorage so it persists across room navigation
  useEffect(() => {
    localStorage.setItem(`library_${params.id}_selectedDate`, selectedDate);
  }, [selectedDate, params.id]);

  const handleDateChange = (date) => {
    setSelectedDate(date);
  };

  return (
    <main className="py-8 px-4">
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{libraryName}</h1>
            <p className="text-lg text-gray-600">Select a Room</p>
          </div>

          {/* Date Selector */}
          <div className="mt-4">
            <DateSelector onDateChange={handleDateChange} initialDate={selectedDate} />
          </div>

          <ViewAllSeatsButton libraryId={params.id} selectedDate={selectedDate} />
        </div>
      </div>
      <RoomList floors={floors} libraryId={params.id} selectedDate={selectedDate} />
    </main>
  );
}