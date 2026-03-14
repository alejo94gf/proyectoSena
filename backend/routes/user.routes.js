const router = require('express').Router();
const { listarUsuarios, toggleActivo, cambiarRol, actualizarPerfil, cambiarPassword } = require('../controllers/user.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

router.use(verificarToken);
router.get('/', soloAdmin, listarUsuarios);
router.put('/:id/toggle', soloAdmin, toggleActivo);
router.put('/:id/rol', soloAdmin, cambiarRol);
router.put('/perfil/actualizar', actualizarPerfil);
router.put('/perfil/password', cambiarPassword);

module.exports = router;
