import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Geist, Geist_Mono } from 'next/font/google';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { io } from 'socket.io-client';

import Home from './home.js';
import Join from './join.js';
import Create from './create.js';
import WaitingRoom from './WaitingRoom.js';
import Start from './start.js';

const socket = io('http://localhost:3001');
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export default function Main() {
  const [view, setView] = useState('home');
  const [roomId, setRoomId] = useState('roomId');
  const [blurbName, setBlurbName] = useState('');
  const [curId, setCurId] = useState(null);

  const startGame = () => {
    socket.emit('startGame', roomId);
  };

  const createRoom = (name) => {
    socket.emit('newRoom', name);
    setBlurbName(name); // save blurb title
    setView('WaitingRoom');
  };
  const joinBtn = () => {
    setView('join');
  };
  const submitJoin = (name) => {
    socket.on('error', (msg) => {
      if (msg == 'Room not found') {
        alert('room not found');
      }
    });
    socket.on('roomJoined', (msg) => {
      setView('WaitingRoom');
    });
    console.log('submitJoin');
    console.log(roomId, name);
    socket.emit('joinRoom', { roomId, name });
  };
  const createBtn = () => {
    setView('join');
    console.log('create');
  };

  useEffect(() => {
    socket.on('gameStarted', (msg) => {
      setView('start');
      setCurId(msg.selectedPlayer);
    });
    return () => {
      socket.off('gameStarted');
    };
  }, []);

  return (
    <div>
      {/* Home Page */}
      {view === 'home' && (
        <Home
          onJoin={(roomId) => {
            setRoomId(roomId);
            setView('join');
          }}
          onCreate={() => setView('create')}
          setRoomId={setRoomId}
        />
      )}
      {view === 'join' && <Join submitJoin={submitJoin} />}
      {view === 'create' && (
        <Create onBack={() => setView('home')} onWaitRoom={createRoom} />
      )}
      {view === 'WaitingRoom' && (
        <WaitingRoom
          onStart={startGame} // go to Start when clicking Start
          socket={socket}
        />
      )}

      {view === 'start' && (
        <Start blurbName={blurbName} curId={curId} socket={socket} />
      )}

      <div></div>
      <div></div>
    </div>
  );
}
