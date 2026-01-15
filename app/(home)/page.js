"use client";

import { useState, useEffect, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import getLibraries from '@/lib/getLibraries';
import LibraryTile from './LibraryTile';

export default function Home() {
  const [libraries, setLibraries] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    getLibraries()
      .then(setLibraries)
      .catch(error => {
        console.error('Failed to load libraries:', error);
        setLibraries([]);
      });
  }, []);

  // Filter libraries based on search query - memoized for performance
  const filteredLibraries = useMemo(() => 
    libraries.filter(library => 
      library.primary_name.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [libraries, searchQuery]
  );

  return (
    <main className="py-8 px-4">
      <div className="flex justify-center mb-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome to FastBooker</h1>
          <p className="text-lg text-gray-600">Book your seat in one go!</p>
        </div>
      </div>
      
      {/* Search bar */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <TextField
          label="Search libraries"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="e.g., Biblioteca"
          sx={{ width: '100%', maxWidth: 500 }}
        />
      </Box>

      <div className="flex flex-wrap justify-center gap-6 max-w-7xl mx-auto">
        {filteredLibraries.map((library, i) => (
          <div key={i}>
            <LibraryTile
              name={library.primary_name}
              image={library.poster_image}
              id={library.id}
            />
          </div>
        ))}
      </div>
    </main>
  );
}