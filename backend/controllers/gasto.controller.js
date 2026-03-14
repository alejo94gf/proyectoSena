const pool = require('../config/db');

exports.listar = async (req, res) => {
  const { mes, anio } = req.query;
  let query = `
    SELECT g.*, c.nombre as categoria_nombre, c.icono as categoria_icono, c.color as categoria_color
    FROM gastos g
    LEFT JOIN categorias c ON g.categoria_id = c.id
    WHERE g.usuario_id = $1
  `;
  const params = [req.usuario.id];

  if (mes && anio) {
    query += ' AND EXTRACT(MONTH FROM g.fecha) = $2 AND EXTRACT(YEAR FROM g.fecha) = $3';
    params.push(mes, anio);
  }
  query += ' ORDER BY g.fecha DESC';

  try {
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
};

exports.crear = async (req, res) => {
  const { descripcion, monto, fecha, categoria_id, notas } = req.body;
  if (!descripcion || !monto) return res.status(400).json({ error: 'Descripción y monto son requeridos' });

  try {
    const result = await pool.query(
      'INSERT INTO gastos (usuario_id, descripcion, monto, fecha, categoria_id, notas) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [req.usuario.id, descripcion, monto, fecha || new Date(), categoria_id, notas]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear gasto' });
  }
};

exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { descripcion, monto, fecha, categoria_id, notas } = req.body;
  try {
    const result = await pool.query(
      'UPDATE gastos SET descripcion=$1, monto=$2, fecha=$3, categoria_id=$4, notas=$5 WHERE id=$6 AND usuario_id=$7 RETURNING *',
      [descripcion, monto, fecha, categoria_id, notas, id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar gasto' });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM gastos WHERE id=$1 AND usuario_id=$2 RETURNING id',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json({ mensaje: 'Gasto eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
};
