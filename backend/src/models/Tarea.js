'use strict';
const mongoose = require('mongoose');

const tareaSchema = new mongoose.Schema(
  {
    titulo: {
      type: String,
      required: [true, 'El título es obligatorio'],
      trim: true,
      maxlength: [200, 'Máximo 200 caracteres'],
    },
    descripcion: {
      type: String,
      trim: true,
      maxlength: [1000, 'Máximo 1000 caracteres'],
    },
    fechaLimite: {
      type: Date,
      required: [true, 'La fecha límite es obligatoria'],
    },
    prioridad: {
      type: String,
      enum: { values: ['alta', 'media', 'baja'], message: 'Prioridad inválida' },
      default: 'media',
    },
    completada: { type: Boolean, default: false },
    fechaCompletada: { type: Date, default: null },
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Usuario',
      required: true,
    },
  },
  { timestamps: true }
);

tareaSchema.index({ usuario: 1, completada: 1, fechaLimite: 1 });

tareaSchema.virtual('vencida').get(function () {
  return !this.completada && this.fechaLimite < new Date();
});

tareaSchema.set('toJSON', { virtuals: true });
tareaSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Tarea', tareaSchema);
