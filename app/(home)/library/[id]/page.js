"use client";

import { useState, useEffect } from 'react';
import getFloors from '@/lib/getFloors';
import ViewAllSeatsButton from './ViewAllSeatsButton';
import RoomList from './RoomList';

export default function Home({params}) {
  const [floors, setFloors] = useState([]);
  const [libraryName, setLibraryName] = useState('Library');

  useEffect(() => {
    // Get library name from localStorage
    const storedName = localStorage.getItem(`library_${params.id}_name`);
    if (storedName) {
      setLibraryName(storedName);
    }

    // Fetch floors
    getFloors(params.id).then((floorsData) => {
      setFloors(floorsData);
    });
  }, [params.id]);

  return (
    <main className="py-8 px-4">
      <div className="flex justify-center mb-8">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{libraryName}</h1>
            <p className="text-lg text-gray-600">Select a Room</p>
          </div>
          <ViewAllSeatsButton libraryId={params.id} />
        </div>
      </div>
      <RoomList floors={floors} libraryId={params.id} />
    </main>
  );
}