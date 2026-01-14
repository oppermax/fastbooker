"use client";

import FloorTile from '@/components/FloorTile';
import List from '@mui/material/List';
import Paper from '@mui/material/Paper';

export default function RoomList({ floors, libraryId, selectedDate }) {
  return (
    <div className="flex justify-center max-w-3xl mx-auto">
      <Paper
        elevation={2}
        sx={{
          width: '100%',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
      >
        <List sx={{ py: 0 }}>
          {floors.map((floor, i) => (
            <FloorTile
              key={i}
              name={floor.localized_description}
              description={floor.localized_subdescription}
              image={floor.image}
              libraryId={libraryId}
              id={floor.resource_type}
              selectedDate={selectedDate}
            />
          ))}
        </List>
      </Paper>
    </div>
  );
}

