"use client";

import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import getSeats from '@/lib/getSeats';
import CircularProgress from '@mui/material/CircularProgress';
import { formatDate } from '@/lib/utils';
import DateSelector from './DateSelector';
import SeatTile from './SeatTile';

export default function Floor({ params }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [seats, setSeats] = useState(null);
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getSeats(params.id, params.floorId, selectedDate).then((data) => {
      const allSeats = data.flat(1);
      setSeats(allSeats);
      console.log(allSeats);
    });
  }, [params.id, selectedDate]);

  const handleDateChange = (date) => {
    setSeats(null);
    setSelectedDate(date);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          <div className="flex-1 min-w-[250px] max-w-[350px]">
            <TextField 
              id="outlined-basic" 
              label="UniPD Email" 
              variant="outlined" 
              fullWidth
              value={email} 
              onChange={handleEmailChange} 
            />
          </div>
          <div className="flex-1 min-w-[250px] max-w-[350px]">
            <DateSelector onDateChange={handleDateChange} />
          </div>
          <div className="flex-1 min-w-[250px] max-w-[350px]">
            <TextField 
              id="outlined-basic" 
              label="Search" 
              variant="outlined" 
              fullWidth
              value={search} 
              onChange={handleSearchChange} 
            />
          </div>
        </div>
        <div className="flex flex-col items-center">
          {seats ? (
            seats
              .filter((seat) => seat.resource_name.toLowerCase().includes(search.toLowerCase()) || seat.description.toLowerCase().includes(search.toLowerCase()))
              .map((seat, i) => (
                <div key={i} className="w-full max-w-4xl mb-4">
                  <SeatTile
                    id={seat.resource_id}
                    name={seat.resource_name}
                    description={seat.description}
                    date={selectedDate}
                    hours={seat.hours}
                    email={email}
                  />
                </div>
              )))
              :
              <div className="mt-8">
                <CircularProgress />
              </div>
            }
        </div>
      </div>
    </div>
  );
}