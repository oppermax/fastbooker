"use client";
import { IoIosArrowBack} from 'react-icons/io';
import { HiOutlineHome } from 'react-icons/hi';
import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { Quicksand } from 'next/font/google';
import { twMerge } from 'tailwind-merge';
import ShoppingCart from './ShoppingCart';

const font = Quicksand({ subsets: ['latin'], weight: ['400', '600'] })

export default function UNavbar() {
  return (
    <AppBar style={{
      position: 'relative', 
      background: 'linear-gradient(135deg, #991b1b 0%, #b91c1c 100%)',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
    }}>
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IoIosArrowBack
            size={28}
            className='mr-3 cursor-pointer transition-transform hover:scale-110'
            onClick={() => window.history.back()}
          />
          <HiOutlineHome
            size={28}
            className='mr-3 cursor-pointer transition-transform hover:scale-110'
            onClick={() => window.location.href = '/'}
          />
          <div className='mx-4'>
            <Typography variant="h6">
              <div className='flex items-center'>
                <div className='bg-white text-red-800 px-3 py-1.5 rounded-lg font-bold mr-3 shadow-md'>
                  UniPD
                </div>
                <p className={twMerge(font.className, 'font-semibold text-lg')}>Fast Booker</p>
              </div>
            </Typography>
          </div>
        </Box>

        {/* Cart on the right */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <ShoppingCart />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
