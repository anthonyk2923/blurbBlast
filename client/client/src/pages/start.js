import { useState, useEffect } from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';

export default function Start({ blurbName, curId, socket }) {
  const [inputValue, setInputValue] = useState('');
  const [submittedText, setSubmittedText] = useState('');
  const [currentTurnId, setCurrentTurnId] = useState(curId.id); // Track current player
  const [paragraph, setParagraph] = useState(''); // Track the full paragraph

  // Submit handler for submitting the text
  const handleSubmit = () => {
    setSubmittedText(inputValue);
    setInputValue('');

    // Emit message and move to the next turn
    socket.emit('sendMessage', { message: inputValue });
  };

  // Listen for 'nextTurn' event to update the current player's turn
  useEffect(() => {
    socket.on('nextTurn', (data) => {
      setCurrentTurnId(data.playerId); // Set the next player's turn
      setSubmittedText(''); // Clear the displayed text
    });

    // Listen for paragraph updates from the server
    socket.on('paragraphUpdate', (data) => {
      setParagraph(data.paragraph); // Update the full paragraph from the server
    });

    // Clean up on component unmount
    return () => {
      socket.off('nextTurn');
      socket.off('paragraphUpdate');
    };
  }, [socket]);

  return (
    <div
      className='animated-bg d-flex flex-column justify-content-between align-items-center'
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

      {/* Blurb title at the top */}
      <h1 className='text-center mt-4' style={{ fontWeight: 700 }}>
        {blurbName}
      </h1>

      {/* Display box in the middle */}
      <div
        className='rounded shadow d-flex justify-content-center align-items-center text-center'
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          width: '100%',
          maxWidth: '900px', // Increased width
          height: '300px', // Increased height
          margin: '2rem 0',
          color: '#333',
          fontSize: '1.5rem', // Slightly larger text
          padding: '2rem',
        }}
      >
        {
          <div style={{ whiteSpace: 'pre-wrap', width: '100%' }}>
            {paragraph || 'Your blurb will show up here.'}
          </div>
        }
      </div>

      {/* Show the input and button only if the socket is the owner or current turn */}
      {socket.id === currentTurnId && (
        <div>
          {/* Textbox and submit button at the bottom */}
          <div style={{ width: '100%', maxWidth: '800px' }}>
            <InputGroup className='mb-4'>
              <Form.Control
                as='textarea'
                rows={1}
                placeholder='Write your blurb here...'
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  borderRadius: '1.5rem',
                  padding: '1rem',
                  fontSize: '1.1rem',
                  resize: 'vertical',
                }}
              />

              <Button
                variant='primary'
                onClick={handleSubmit}
                style={{
                  borderTopRightRadius: '1.5rem',
                  borderBottomRightRadius: '1.5rem',
                  padding: '0.75rem 1.5rem',
                  fontSize: '1.1rem',
                }}
              >
                Submit
              </Button>
            </InputGroup>
          </div>
        </div>
      )}
    </div>
  );
}
