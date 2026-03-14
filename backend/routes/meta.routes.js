const router = require('express').Router();
const { listar, crear, actualizar, abonar, eliminar } = require('../controllers/meta.controller');
const { verificarToken } = require('../middleware/auth.middleware');

router.use(verificarToken);
router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.post('/:id/abonar', abonar);
router.delete('/:id', eliminar);

module.exports = router;
