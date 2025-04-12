import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Geist, Geist_Mono } from 'next/font/google';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { io } from 'socket.io-client';
import { createBtn, joinBtn } from './index.js';

const socket = io('http://localhost:3001');
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Home({ onJoin, onCreate }) {
  const [inputValue, setInputValue] = useState('');

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };
  return (
    <div
      className='animated-bg d-flex flex-column justify-content-center align-items-center'
      style={{
        minHeight: '100vh',
        fontFamily: 'var(--font-geist-sans)',
        padding: '2rem',
        color: '#fff',
        transition: 'background 1s ease-in-out',
      }}
    >
      <style jsx>{`
        .animated-bg {
          background: linear-gradient(
            -45deg,
            #ff6ec4,
            #7873f5,
            #4ade80,
            #60a5fa
          );
          background-size: 400% 400%;
          animation: gradientShift 15s ease infinite;
        }

        @keyframes gradientShift {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      <h1 style={{ fontSize: '3rem', fontWeight: '700', marginBottom: '2rem' }}>
        Welcome to BlurbBlast! 🎉
      </h1>

      <div className='mb-4'>
        <Button
          onClick={onCreate}
          variant='light'
          size='lg'
          style={{
            padding: '0.75rem 2rem',
            fontSize: '1.25rem',
            borderRadius: '1.5rem',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}
        >
          Create Room
        </Button>
      </div>

      <div
        className='p-4 rounded shadow'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          maxWidth: '420px',
          width: '100%',
        }}
      >
        <h2
          className='text-center mb-3'
          style={{ fontWeight: '600', color: '#222' }}
        >
          Join a Room
        </h2>
        <InputGroup className='mb-3'>
          <Form.Control
            placeholder='Enter Room Code'
            aria-label='Room Code'
            value={inputValue}
            onChange={handleInputChange}
            style={{
              borderTopLeftRadius: '1.5rem',
              borderBottomLeftRadius: '1.5rem',
              padding: '0.75rem',
              fontSize: '1.1rem',
            }}
          />
          <Button
            onClick={() => onJoin(inputValue)}
            variant='primary'
            style={{
              borderTopRightRadius: '1.5rem',
              borderBottomRightRadius: '1.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem',
            }}
          >
            Join Room
          </Button>
        </InputGroup>
      </div>
    </div>
  );
}
