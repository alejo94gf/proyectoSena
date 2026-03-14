const pool = require('../config/db');

exports.listar = async (req, res) => {
  const { mes, anio } = req.query;
  let query = 'SELECT * FROM ingresos WHERE usuario_id = $1';
  const params = [req.usuario.id];

  if (mes && anio) {
    query += ' AND EXTRACT(MONTH FROM fecha) = $2 AND EXTRACT(YEAR FROM fecha) = $3';
    params.push(mes, anio);
  }
  query += ' ORDER BY fecha DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener ingresos' });
  }
};

exports.crear = async (req, res) => {
  const { descripcion, monto, fecha, fuente } = req.body;
  if (!descripcion || !monto) return res.status(400).json({ error: 'Descripción y monto son requeridos' });

  try {
    const result = await pool.query(
      'INSERT INTO ingresos (usuario_id, descripcion, monto, fecha, fuente) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.usuario.id, descripcion, monto, fecha || new Date(), fuente]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear ingreso' });
  }
};

exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, fecha, fuente } = req.body;
  try {
    const result = await pool.query(
      'UPDATE ingresos SET descripcion=$1, monto=$2, fecha=$3, fuente=$4 WHERE id=$5 AND usuario_id=$6 RETURNING *',
      [descripcion, monto, fecha, fuente, id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar ingreso' });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM ingresos WHERE id=$1 AND usuario_id=$2 RETURNING id',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ingreso no encontrado' });
    res.json({ mensaje: 'Ingreso eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar ingreso' });
  }
};
