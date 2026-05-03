'use strict';
const { Router } = require('express');
const { body } = require('express-validator');
const { registro, login, perfil } = require('../controllers/authController');
const { proteger } = require('../middleware/authMiddleware');

const router = Router();

const validarRegistro = [
  body('nombre').trim().notEmpty().withMessage('El nombre es obligatorio'),
  body('correo').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Mínimo 8 caracteres')
    .matches(/[A-Z]/).withMessage('Debe incluir al menos una mayúscula')
    .matches(/[0-9]/).withMessage('Debe incluir al menos un número'),
  body('semestre').optional().isInt({ min: 1, max: 12 }).withMessage('Semestre entre 1 y 12'),
];

const validarLogin = [
  body('correo').isEmail().withMessage('Correo inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('La contraseña es obligatoria'),
];

router.post('/registro', validarRegistro, registro);
router.post('/login',    validarLogin,    login);
router.get('/perfil',    proteger,        perfil);

module.exports = router;
