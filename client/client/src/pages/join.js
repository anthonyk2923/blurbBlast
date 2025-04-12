import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import { useState } from 'react';

export default function Join({ submitJoin, curId, socket }) {
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
          Whats your name?
        </h2>
        <InputGroup className='mb-3'>
          <Form.Control
            placeholder='Brr Brr Patapim'
            aria-label='Room Code'
            value={inputValue}
            onChange={handleInputChange}
            style={{
              borderTopLeftRadius: '1.5rem',
              borderBottomLeftRadius: '1.5rem',
              padding: '0.75rem',
              fontSize: '1.1rem',
            }}
          />{' '}
          <Button
            onClick={() => submitJoin(inputValue, 123456)}
            variant='primary'
            style={{
              borderTopRightRadius: '1.5rem',
              borderBottomRightRadius: '1.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1.1rem',
            }}
          >
            Join!
          </Button>
        </InputGroup>
      </div>
    </div>
  );
}
