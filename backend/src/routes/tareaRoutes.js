'use strict';
const { Router } = require('express');
const { body } = require('express-validator');
const {
  listarTareas, obtenerTarea, crearTarea,
  editarTarea, completarTarea, eliminarTarea,
} = require('../controllers/tareaController');
const { proteger } = require('../middleware/authMiddleware');

const router = Router();
router.use(proteger);

const validarTarea = [
  body('titulo').trim().notEmpty().withMessage('El título es obligatorio'),
  body('fechaLimite').isISO8601().withMessage('Fecha inválida (ISO 8601)'),
  body('prioridad').optional().isIn(['alta', 'media', 'baja']).withMessage('Prioridad inválida'),
];

router.get('/',                listarTareas);
router.get('/:id',             obtenerTarea);
router.post('/',               validarTarea, crearTarea);
router.put('/:id',             validarTarea, editarTarea);
router.patch('/:id/completar', completarTarea);
router.delete('/:id',          eliminarTarea);

module.exports = router;
