"use client";

import { useState, useMemo } from 'react';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import LibraryTile from './LibraryTile';

export default function LibraryList({ libraries = [] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter libraries based on search query - memoized for performance
  const filteredLibraries = useMemo(() => 
    libraries.filter(library => 
      library?.primary_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [libraries, searchQuery]
  );

  return (
    <>
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
        {filteredLibraries.map((library) => (
          <div key={library.id}>
            <LibraryTile
              name={library.primary_name}
              image={library.poster_image}
              id={library.id}
            />
          </div>
        ))}
      </div>
    </>
  );
}
