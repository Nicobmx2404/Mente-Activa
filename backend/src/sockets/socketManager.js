'use strict';
const jwt = require('jsonwebtoken');

/**
 * Configura Socket.io.
 * Cada usuario autenticado se une a su propio canal (room)
 * usando su userId para recibir solo sus propios eventos.
 */
const configurarSockets = (io) => {
  // Autenticación de socket con JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Token no proporcionado'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch {
      next(new Error('Token inválido'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(socket.userId); // Canal privado por usuario
    console.log(`🔌 Socket conectado: ${socket.userId}`);
    socket.on('disconnect', () => {
      console.log(`🔌 Socket desconectado: ${socket.userId}`);
    });
  });
};

module.exports = configurarSockets;
