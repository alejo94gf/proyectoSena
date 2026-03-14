const pool = require('../config/db');

exports.dashboard = async (req, res) => {
  const userId = req.usuario.id;
  const ahora = new Date();
  const mes = ahora.getMonth() + 1;
  const anio = ahora.getFullYear();

  try {
    const [ingresos, gastos, metas, gastosPorCategoria, ultMovimientos] = await Promise.all([
      pool.query(
        'SELECT COALESCE(SUM(monto),0) as total FROM ingresos WHERE usuario_id=$1 AND EXTRACT(MONTH FROM fecha)=$2 AND EXTRACT(YEAR FROM fecha)=$3',
        [userId, mes, anio]
      ),
      pool.query(
        'SELECT COALESCE(SUM(monto),0) as total FROM gastos WHERE usuario_id=$1 AND EXTRACT(MONTH FROM fecha)=$2 AND EXTRACT(YEAR FROM fecha)=$3',
        [userId, mes, anio]
      ),
      pool.query(
        'SELECT COUNT(*) as total, SUM(CASE WHEN completada THEN 1 ELSE 0 END) as completadas FROM metas_ahorro WHERE usuario_id=$1',
        [userId]
      ),
      pool.query(
        `SELECT c.nombre, c.icono, c.color, COALESCE(SUM(g.monto),0) as total
         FROM categorias c
         LEFT JOIN gastos g ON g.categoria_id = c.id AND g.usuario_id=$1
           AND EXTRACT(MONTH FROM g.fecha)=$2 AND EXTRACT(YEAR FROM g.fecha)=$3
         WHERE c.es_global=true OR c.usuario_id=$1
         GROUP BY c.id ORDER BY total DESC`,
        [userId, mes, anio]
      ),
      pool.query(
        `(SELECT 'ingreso' as tipo, descripcion, monto, fecha FROM ingresos WHERE usuario_id=$1)
         UNION ALL
         (SELECT 'gasto' as tipo, descripcion, monto, fecha FROM gastos WHERE usuario_id=$1)
         ORDER BY fecha DESC LIMIT 10`,
        [userId]
      ),
    ]);

    const totalIngresos = parseFloat(ingresos.rows[0].total);
    const totalGastos = parseFloat(gastos.rows[0].total);

    res.json({
      resumen: {
        ingresos: totalIngresos,
        gastos: totalGastos,
        balance: totalIngresos - totalGastos,
        mes,
        anio,
      },
      metas: metas.rows[0],
      gastosPorCategoria: gastosPorCategoria.rows.filter(c => parseFloat(c.total) > 0),
      ultimosMovimientos: ultMovimientos.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener datos del dashboard' });
  }
};

exports.mensual = async (req, res) => {
  const userId = req.usuario.id;
  const anio = req.query.anio || new Date().getFullYear();

  try {
    const [ingresos, gastos] = await Promise.all([
      pool.query(
        `SELECT EXTRACT(MONTH FROM fecha) as mes, SUM(monto) as total
         FROM ingresos WHERE usuario_id=$1 AND EXTRACT(YEAR FROM fecha)=$2
         GROUP BY mes ORDER BY mes`,
        [userId, anio]
      ),
      pool.query(
        `SELECT EXTRACT(MONTH FROM fecha) as mes, SUM(monto) as total
         FROM gastos WHERE usuario_id=$1 AND EXTRACT(YEAR FROM fecha)=$2
         GROUP BY mes ORDER BY mes`,
        [userId, anio]
      ),
    ]);

    const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    const data = meses.map((nombre, i) => {
      const ing = ingresos.rows.find(r => parseInt(r.mes) === i + 1);
      const gas = gastos.rows.find(r => parseInt(r.mes) === i + 1);
      return {
        mes: nombre,
        ingresos: parseFloat(ing?.total || 0),
        gastos: parseFloat(gas?.total || 0),
      };
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reporte mensual' });
  }
};

// Solo admin
exports.global = async (req, res) => {
  try {
    const [usuarios, totalIngresos, totalGastos] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, SUM(CASE WHEN activo THEN 1 ELSE 0 END) as activos FROM usuarios'),
      pool.query('SELECT COALESCE(SUM(monto),0) as total FROM ingresos'),
      pool.query('SELECT COALESCE(SUM(monto),0) as total FROM gastos'),
    ]);

    res.json({
      usuarios: usuarios.rows[0],
      totalIngresos: parseFloat(totalIngresos.rows[0].total),
      totalGastos: parseFloat(totalGastos.rows[0].total),
    });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener reporte global' });
  }
};
