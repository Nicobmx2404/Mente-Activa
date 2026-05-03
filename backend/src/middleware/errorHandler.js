'use strict';
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let mensaje = err.message || 'Error interno del servidor';
  if (err.name === 'ValidationError') {
    statusCode = 400;
    mensaje = Object.values(err.errors).map((e) => e.message).join('. ');
  }
  if (err.code === 11000) {
    statusCode = 400;
    const campo = Object.keys(err.keyValue)[0];
    mensaje = `El ${campo} ingresado ya está registrado.`;
  }
  if (err.name === 'CastError') {
    statusCode = 400;
    mensaje = `ID inválido: ${err.value}`;
  }
  res.status(statusCode).json({
    ok: false,
    mensaje,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
module.exports = errorHandler;
