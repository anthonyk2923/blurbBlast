import Button from 'react-bootstrap/Button';
import { useEffect, useState } from 'react';

export default function WaitingRoom({ onStart, socket }) {
  const [participants, setParticipants] = useState([]);
  const [myId, setMyId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [blurbName, setBlurbName] = useState('');

  useEffect(() => {
    setMyId(socket.id); // Store your own socket ID

    socket.emit('getNames');
    socket.on('roomCreated', (msg) => {
      setRoomId(msg.roomId);
    });
    socket.on('newNames', (members) => {
      setParticipants(members);
    });

    socket.on('newName', (name) => {
      setParticipants((prev) => {
        if (prev.some((m) => m.name === name)) return prev;
        return [...prev, { id: 'temp', name }]; // temp ID unless sent from backend
      });
    });

    return () => {
      socket.off('newNames');
      socket.off('newName');
    };
  }, [socket]);

  const handleKick = (id) => {
    if (myId === participants[0]?.id) {
      socket.emit('kickUser', { id });
      socket.emit('getNames');
    }
  };

  const isHost = myId === participants[0]?.id;

  return (
    <div
      className='animated-bg d-flex flex-column align-items-center position-relative'
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

      {/* Start button in top-right corner, only host can see */}
      {isHost && (
        <Button
          onClick={onStart}
          variant='success'
          className='position-absolute'
          style={{ top: '1rem', right: '1rem', padding: '0.5rem 1rem' }}
        >
          Start
        </Button>
      )}

      <h5>Members: {participants.length - 1}</h5>

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
          {isHost ? 'Room ID:' + roomId : 'Waiting Room'}
        </h2>

        {/* Participants List */}
        <ul className='list-group'>
          {participants.map(({ id, name }, index) => (
            <li
              key={index}
              className='list-group-item d-flex justify-content-between align-items-center'
            >
              {name}
              {isHost && id !== myId && (
                <Button
                  variant='danger'
                  size='sm'
                  onClick={() => handleKick(id)}
                >
                  Kick
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
