'use strict';
const { validationResult } = require('express-validator');
const Tarea = require('../models/Tarea');

const listarTareas = async (req, res, next) => {
  try {
    const { estado, prioridad } = req.query;
    const filtro = { usuario: req.usuario._id };
    if (estado === 'completada') filtro.completada = true;
    if (estado === 'pendiente') filtro.completada = false;
    if (prioridad) filtro.prioridad = prioridad;
    const tareas = await Tarea.find(filtro).sort({ fechaLimite: 1 });
    res.status(200).json({ ok: true, total: tareas.length, tareas });
  } catch (error) { next(error); }
};

const obtenerTarea = async (req, res, next) => {
  try {
    const tarea = await Tarea.findOne({ _id: req.params.id, usuario: req.usuario._id });
    if (!tarea) return res.status(404).json({ ok: false, mensaje: 'Tarea no encontrada.' });
    res.status(200).json({ ok: true, tarea });
  } catch (error) { next(error); }
};

const crearTarea = async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    const { titulo, descripcion, fechaLimite, prioridad } = req.body;
    const tarea = await Tarea.create({ titulo, descripcion, fechaLimite, prioridad, usuario: req.usuario._id });
    const io = req.app.get('io');
    io.to(req.usuario._id.toString()).emit('tarea:nueva', tarea);
    res.status(201).json({ ok: true, mensaje: 'Tarea creada.', tarea });
  } catch (error) { next(error); }
};

const editarTarea = async (req, res, next) => {
  try {
    const errores = validationResult(req);
    if (!errores.isEmpty()) return res.status(400).json({ ok: false, errores: errores.array() });
    const tarea = await Tarea.findOneAndUpdate(
      { _id: req.params.id, usuario: req.usuario._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!tarea) return res.status(404).json({ ok: false, mensaje: 'Tarea no encontrada.' });
    const io = req.app.get('io');
    io.to(req.usuario._id.toString()).emit('tarea:actualizada', tarea);
    res.status(200).json({ ok: true, mensaje: 'Tarea actualizada.', tarea });
  } catch (error) { next(error); }
};

const completarTarea = async (req, res, next) => {
  try {
    const tarea = await Tarea.findOne({ _id: req.params.id, usuario: req.usuario._id });
    if (!tarea) return res.status(404).json({ ok: false, mensaje: 'Tarea no encontrada.' });
    if (tarea.completada) return res.status(400).json({ ok: false, mensaje: 'La tarea ya está completada.' });
    tarea.completada = true;
    tarea.fechaCompletada = new Date();
    await tarea.save();
    const io = req.app.get('io');
    io.to(req.usuario._id.toString()).emit('tarea:completada', tarea);
    res.status(200).json({ ok: true, mensaje: 'Tarea completada.', tarea });
  } catch (error) { next(error); }
};

const eliminarTarea = async (req, res, next) => {
  try {
    const tarea = await Tarea.findOneAndDelete({ _id: req.params.id, usuario: req.usuario._id });
    if (!tarea) return res.status(404).json({ ok: false, mensaje: 'Tarea no encontrada.' });
    const io = req.app.get('io');
    io.to(req.usuario._id.toString()).emit('tarea:eliminada', { id: req.params.id });
    res.status(200).json({ ok: true, mensaje: 'Tarea eliminada.' });
  } catch (error) { next(error); }
};

module.exports = { listarTareas, obtenerTarea, crearTarea, editarTarea, completarTarea, eliminarTarea };
