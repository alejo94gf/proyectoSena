const router = require('express').Router();
const { dashboard, mensual, global } = require('../controllers/reporte.controller');
const { verificarToken, soloAdmin } = require('../middleware/auth.middleware');

router.use(verificarToken);
router.get('/dashboard', dashboard);
router.get('/mensual', mensual);
router.get('/global', soloAdmin, global);

module.exports = router;
