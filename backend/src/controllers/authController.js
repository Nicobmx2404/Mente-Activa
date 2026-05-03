'use strict';
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Usuario = require('../models/Usuario');

const generarToken = (id, rol) =>
  jwt.sign({ id, rol }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '8h' });

const registro = async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    const { nombre, correo, password, semestre, programa } = req.body;
    const existente = await Usuario.findOne({ correo });
    if (existente) return res.status(400).json({ ok: false, mensaje: 'El correo ya está registrado.' });
    const usuario = await Usuario.create({ nombre, correo, password, semestre, programa });
    const token = generarToken(usuario._id, usuario.rol);
    res.status(201).json({
      ok: true, mensaje: 'Usuario registrado exitosamente.', token,
      usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    const { correo, password } = req.body;
    const usuario = await Usuario.findOne({ correo }).select('+password');
    if (!usuario || !usuario.activo)
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas.' });
    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta)
      return res.status(401).json({ ok: false, mensaje: 'Credenciales inválidas.' });
    const token = generarToken(usuario._id, usuario.rol);
    res.status(200).json({
      ok: true, mensaje: 'Inicio de sesión exitoso.', token,
      usuario: { id: usuario._id, nombre: usuario.nombre, correo: usuario.correo, rol: usuario.rol },
    });
  } catch (error) { next(error); }
};

const perfil = (req, res) => res.status(200).json({ ok: true, usuario: req.usuario });

module.exports = { registro, login, perfil };
