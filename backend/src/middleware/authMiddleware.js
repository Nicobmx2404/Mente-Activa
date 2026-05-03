'use strict';
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const proteger = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ ok: false, mensaje: 'Token no proporcionado.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id).select('-password');
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ ok: false, mensaje: 'Usuario no encontrado o inactivo.' });
    }
    req.usuario = usuario;
    next();
  } catch (error) {
    const mensaje = error.name === 'TokenExpiredError' ? 'Token expirado.' : 'Token inválido.';
    return res.status(401).json({ ok: false, mensaje });
  }
};

const autorizar = (...roles) => (req, res, next) => {
  if (!roles.includes(req.usuario.rol)) {
    return res.status(403).json({ ok: false, mensaje: 'Sin permisos para esta acción.' });
  }
  next();
};

module.exports = { proteger, autorizar };
