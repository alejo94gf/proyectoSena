const router = require('express').Router();
const { body } = require('express-validator');
const { registro, login, perfil } = require('../controllers/auth.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.post('/registro', [
  body('nombre').notEmpty().withMessage('Nombre requerido'),
  body('email').isEmail().withMessage('Email inválido'),
  body('password').isLength({ min: 6 }).withMessage('Mínimo 6 caracteres'),
], registro);

router.post('/login', [
  body('email').isEmail(),
  body('password').notEmpty(),
], login);

router.get('/perfil', verificarToken, perfil);

module.exports = router;
