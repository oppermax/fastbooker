"use client";

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Button, CardActionArea, CardActions } from '@mui/material';

export default function LibraryTile({ name, image, id}) {
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
      <CardActionArea>
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
      <CardActions sx={{ padding: '12px 16px' }}>
        <Button 
          size="medium" 
          variant="contained"
          href={"/library/" + id}
          sx={{ 
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '8px',
            paddingX: '20px'
          }}
        >
          Select
        </Button>
      </CardActions>
    </Card>
  );
}