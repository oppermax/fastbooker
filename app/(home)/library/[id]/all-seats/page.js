"use client";

import { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { formatDate } from '@/lib/utils';
import DateSelector from '../floor/[floorId]/DateSelector';
import SeatTile from '../floor/[floorId]/SeatTile';
import getAllSeats from '@/lib/getAllSeats';

export default function AllSeats({ params }) {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const [seats, setSeats] = useState(null);
  const [email, setEmail] = useState('');
  const [search, setSearch] = useState('');
  const [hideNoVacancies, setHideNoVacancies] = useState(false);

  useEffect(() => {
    getAllSeats(params.id, selectedDate).then((data) => {
      setSeats(data);
      console.log(data);
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

  const handleHideNoVacanciesChange = (event) => {
    setHideNoVacancies(event.target.checked);
  };

  const hasVacancies = (seat) => {
    return seat.hours && seat.hours.some(hour => hour.places_available > 0);
  };

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">All Available Seats</h1>
          <p className="text-lg text-gray-600">Viewing seats across all rooms</p>
        </div>
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
        <div className="flex justify-center mb-6">
          <FormControlLabel
            control={
              <Switch 
                checked={hideNoVacancies} 
                onChange={handleHideNoVacanciesChange}
                color="primary"
              />
            }
            label="Hide seats without vacancies"
          />
        </div>
        <div className="flex flex-col items-center">
          {seats ? (
            seats
              .filter((seat) => 
                seat.resource_name.toLowerCase().includes(search.toLowerCase()) || 
                seat.description.toLowerCase().includes(search.toLowerCase()) ||
                seat.floor_name.toLowerCase().includes(search.toLowerCase())
              )
              .filter((seat) => !hideNoVacancies || hasVacancies(seat))
              .map((seat, i) => (
                <div key={i} className="w-full max-w-4xl mb-4">
                  <SeatTile
                    id={seat.resource_id}
                    name={seat.resource_name}
                    description={`${seat.floor_name} - ${seat.description}`}
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
