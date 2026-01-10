"use client";
import { IoIosArrowBack} from 'react-icons/io';
import { HiOutlineHome } from 'react-icons/hi';
import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';
import { Quicksand } from 'next/font/google'
import { twMerge } from 'tailwind-merge'
// next js quicksant font
const font = Quicksand({ subsets: ['latin'], weight: ['400'] })

export default function UNavbar() {
  return (
    <AppBar style={{position: 'relative', backgroundColor: '#9b1c1c'}}>
      <Toolbar>
        <IoIosArrowBack size={30} className='mr-2' onClick={() => window.history.back()}/>
        <HiOutlineHome size={30} className='mr-2' onClick={() => window.location.href = '/'}/>
        <div className='mx-4'>
        <Typography variant="h6">
          <div className='flex h-full align-middle'>
          <div className='bg-white text-red-800 px-2 py-1 rounded font-bold mr-2'>
            UniPD
          </div>
          
          <p className={twMerge(font.className, 'mx-2')}>Fast Booker</p>
          </div>
          </Typography>
          </div>
      </Toolbar>
    </AppBar>
  );
}

