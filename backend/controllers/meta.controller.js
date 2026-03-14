const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM metas_ahorro WHERE usuario_id = $1 ORDER BY created_at DESC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener metas' });
  }
};

exports.crear = async (req, res) => {
  const { nombre, descripcion, monto_objetivo, fecha_limite } = req.body;
  if (!nombre || !monto_objetivo) return res.status(400).json({ error: 'Nombre y monto objetivo son requeridos' });

  try {
    const result = await pool.query(
      'INSERT INTO metas_ahorro (usuario_id, nombre, descripcion, monto_objetivo, fecha_limite) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [req.usuario.id, nombre, descripcion, monto_objetivo, fecha_limite]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear meta' });
  }
};

exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, monto_objetivo, monto_actual, fecha_limite, completada } = req.body;
  try {
    const result = await pool.query(
      `UPDATE metas_ahorro SET nombre=$1, descripcion=$2, monto_objetivo=$3, monto_actual=$4,
       fecha_limite=$5, completada=$6, updated_at=NOW()
       WHERE id=$7 AND usuario_id=$8 RETURNING *`,
      [nombre, descripcion, monto_objetivo, monto_actual, fecha_limite, completada, id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar meta' });
  }
};

exports.abonar = async (req, res) => {
  const { id } = req.params;
  const { monto } = req.body;
  if (!monto || monto <= 0) return res.status(400).json({ error: 'Monto inválido' });

  try {
    const result = await pool.query(
      `UPDATE metas_ahorro SET monto_actual = LEAST(monto_actual + $1, monto_objetivo),
       completada = (monto_actual + $1 >= monto_objetivo), updated_at=NOW()
       WHERE id=$2 AND usuario_id=$3 RETURNING *`,
      [monto, id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al abonar a meta' });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM metas_ahorro WHERE id=$1 AND usuario_id=$2 RETURNING id',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Meta no encontrada' });
    res.json({ mensaje: 'Meta eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar meta' });
  }
};
