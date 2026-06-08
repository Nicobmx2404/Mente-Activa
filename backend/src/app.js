'use strict';
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const morgan     = require('morgan');
const http       = require('http');
const { Server } = require('socket.io');

const connectDB             = require('./config/db');
const authRoutes            = require('./routes/authRoutes');
const tareaRoutes           = require('./routes/tareaRoutes');
const errorHandler          = require('./middleware/errorHandler');
const configurarSockets     = require('./sockets/socketManager');
const { swaggerUi, specs }  = require('./swagger');

const app    = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  },
});
configurarSockets(io);
app.set('io', io);

app.use(cors({
  origin: function(origin, callback) {
    const allowed = [
      process.env.CLIENT_URL,
      'http://localhost:5173',
    ];
    // Permitir cualquier subdominio de vercel.app
    if (!origin || allowed.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/auth',   authRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api-docs',   swaggerUi.serve, swaggerUi.setup(specs));

// Healthcheck
app.get('/', (req, res) => {
  res.json({ ok: true, mensaje: '🧠 Mente Activa API corriendo.', version: '1.0.0' });
});

// 404
app.use((req, res) => {
  res.status(404).json({ ok: false, mensaje: 'Ruta no encontrada.' });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  connectDB();
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`🚀 Servidor: http://localhost:${PORT}`);
    console.log(`🔌 Socket.io: listo`);
  });
}

module.exports = app;