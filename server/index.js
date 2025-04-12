console.clear();

const { Server } = require('socket.io');
const http = require('http');

const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

class Room {
  constructor(id, name, ownerId) {
    this.id = id;
    this.name = name;
    this.ownerId = ownerId;
    this.members = new Map(); // socketId -> name
    this.members.set(ownerId, 'Host');
    this.paragraph = ''; // Shared paragraph for the game
    this.currentTurn = null; // Track whose turn it is
  }

  addMember(id, name) {
    this.members.set(id, name);
  }

  removeMember(id) {
    this.members.delete(id);
  }

  hasMember(id) {
    return this.members.has(id);
  }

  getMemberName(id) {
    return this.members.get(id);
  }

  getAllMembers() {
    return Array.from(this.members.entries()).map(([id, name]) => ({
      id,
      name,
    }));
  }

  pickNextPlayer(excludeId) {
    const eligible = Array.from(this.members.keys()).filter(
      (id) => id !== this.ownerId && id !== excludeId
    );
    if (eligible.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * eligible.length);
    return eligible[randomIndex];
  }
}

class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom(name, ownerId) {
    const roomId = String(Date.now()).slice(-6);
    const room = new Room(roomId, name, ownerId);
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(id) {
    return this.rooms.get(id);
  }

  deleteRoom(id) {
    this.rooms.delete(id);
  }

  roomExists(id) {
    return this.rooms.has(id);
  }
}

const roomManager = new RoomManager();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('newRoom', ({ name }) => {
    const room = roomManager.createRoom(name, socket.id);
    socket.join(room.id);
    console.log(`Room created:`, room);
    socket.emit('roomCreated', { roomId: room.id, name: room.name });
  });

  socket.on('getNames', () => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    const roomId = rooms[0];
    const room = roomManager.getRoom(roomId);

    if (room) {
      const members = room.getAllMembers();
      socket.emit('newNames', members);
    } else {
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('joinRoom', ({ roomId, name }) => {
    const room = roomManager.getRoom(roomId);

    if (room) {
      room.addMember(socket.id, name);
      socket.join(roomId);
      console.log(`${socket.id} (${name}) joined room ${roomId}`);

      socket.emit('roomJoined', { roomId, members: room.getAllMembers() });
      socket.to(roomId).emit('userJoined', { id: socket.id, name });
      socket.to(roomId).emit('newName', name);
    } else {
      console.log(`Room ${roomId} not found`);
      socket.emit('error', 'Room not found');
    }
  });

  socket.on('kickUser', ({ id }) => {
    const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
    const roomId = rooms[0];
    const room = roomManager.getRoom(roomId);

    if (room && socket.id === room.ownerId) {
      const username = room.getMemberName(id);
      room.removeMember(id);
      io.to(roomId).emit('userLeft', { id, name: username });
      io.sockets.sockets.get(id)?.leave(roomId);
      io.sockets.sockets.get(id)?.disconnect(true);
    }
  });

socket.on('startGame', (msg = {}) => {
  // Try to get roomId from the message or from socket.rooms
  let roomId = msg.roomId || Array.from(socket.rooms).find((r) => r !== socket.id);
  const room = roomManager.getRoom(roomId);

  console.log(`[startGame] socket.id: ${socket.id}`);
  console.log(`[startGame] roomId: ${roomId}`);
  console.log(`[startGame] room?.ownerId: ${room?.ownerId}`);

  // Check if room exists and if the requester is the owner
  if (room && socket.id === room.ownerId) {
    const members = room.getAllMembers().filter((m) => m.id !== room.ownerId);
    if (members.length === 0) {
      socket.emit('error', 'No players to choose from');
      return;
    }

    // Select a random player to start the game
    const randomIndex = Math.floor(Math.random() * members.length);
    const selected = members[randomIndex];

    room.currentTurn = selected.id;
    room.paragraph = ''; // Reset paragraph

    io.to(roomId).emit('gameStarted', { selectedPlayer: selected });
    console.log(`[startGame] Game started in room ${roomId}, selected: ${selected.name}`);
  } else {
    console.log(`[startGame] Unauthorized attempt by ${socket.id}`);
    socket.emit('error', 'Only the owner can start the game');
  }
});

socket.on('sendMessage', ({ message }) => {
  const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
  const roomId = rooms[0];
  const room = roomManager.getRoom(roomId);

  if (!room) return;

  // Check if it's the player's turn
  if (socket.id !== room.currentTurn) {
    socket.emit('error', 'Not your turn!');
    return;
  }

  // Add the player's message to the paragraph
  room.paragraph += message + '\n ';
  io.to(roomId).emit('paragraphUpdate', { paragraph: room.paragraph });

  // Find the next player
  const nextPlayerId = room.pickNextPlayer(socket.id);
  if (nextPlayerId) {
    // Update the current turn to the next player
    room.currentTurn = nextPlayerId;

    // Notify the next player
    io.to(roomId).emit('nextTurn', { playerId: nextPlayerId });

    // Notify all players about the next player
    io.to(roomId).emit('info', `${room.getMemberName(nextPlayerId)}'s turn!`);
  } else {
    io.to(roomId).emit('info', 'No more players available to continue.');
  }
});

  socket.on('endGame', ({ roomId }) => {
    const room = roomManager.getRoom(roomId);
    if (room && socket.id === room.ownerId) {
      io.to(roomId).emit('gameEnded', { finalParagraph: room.paragraph });
      room.paragraph = '';
      room.currentTurn = null;
    } else {
      socket.emit('error', 'Only the teacher can end the game.');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    for (const [roomId, room] of roomManager.rooms) {
      if (room.hasMember(socket.id)) {
        const username = room.getMemberName(socket.id);
        room.removeMember(socket.id);
        socket.to(roomId).emit('userLeft', { id: socket.id, name: username });

        if (socket.id === room.ownerId) {
          roomManager.deleteRoom(roomId);
          io.to(roomId).emit('roomClosed');
          console.log(`Room ${roomId} closed because owner left.`);
        }
      }
    }
  });
});

server.listen(3001, () => {
  console.log('Server listening on port 3001');
});
