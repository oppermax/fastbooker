"use client";

import { useState } from 'react';
import { TextField, Button } from '@mui/material';
import { FaArrowRight } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

function EmailInput() {
  const [email, setEmail] = useState('');
  const router = useRouter();

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Check if email ends with @unipd
    if (!email.endsWith('@unipd.it')) {
        alert('Please enter a valid UniPD email address');
    }
    else {
      alert("g");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="UniPD Email"
        type="email"
        variant="outlined"
        size="small"
        value={email}
        onChange={handleEmailChange}
      />
      <Button type="submit" variant="contained" className='mx-1'>
            Go <FaArrowRight className="ml-1" />
      </Button>
    </form>
  );
}

export default EmailInput;