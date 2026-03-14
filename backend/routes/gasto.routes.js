const router = require('express').Router();
const { listar, crear, actualizar, eliminar } = require('../controllers/gasto.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);
router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;
