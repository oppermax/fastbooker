"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { CardActionArea } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LibraryTile({ name, image, id }) {
  const router = useRouter();

  const handleClick = (e) => {
    e.preventDefault();
    // Store library name in localStorage for use in child pages
    localStorage.setItem(`library_${id}_name`, name);
    router.push(`/library/${id}`);
  };

  return (
    <Card sx={{ 
      width: 320, 
      height: '100%',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      borderRadius: '12px',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
      }
    }}>
      <CardActionArea onClick={handleClick}>
        <CardMedia
          component="img"
          height="180"
          image={image}
          alt={`${name} library`}
          sx={{ objectFit: 'cover' }}
        />
        <CardContent sx={{ minHeight: '80px' }}>
          <Typography gutterBottom variant="h6" component="div" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
            {name}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}