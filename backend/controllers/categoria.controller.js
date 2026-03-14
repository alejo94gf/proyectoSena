const pool = require('../config/db');

exports.listar = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categorias WHERE es_global = true OR usuario_id = $1 ORDER BY nombre',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

exports.crear = async (req, res) => {
  const { nombre, icono, color } = req.body;
  if (!nombre) return res.status(400).json({ error: 'Nombre es requerido' });

  try {
    const result = await pool.query(
      'INSERT INTO categorias (nombre, icono, color, usuario_id) VALUES ($1,$2,$3,$4) RETURNING *',
      [nombre, icono || '📦', color || '#6b7280', req.usuario.id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'DELETE FROM categorias WHERE id=$1 AND usuario_id=$2 AND es_global=false RETURNING id',
      [id, req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Categoría no encontrada o no eliminable' });
    res.json({ mensaje: 'Categoría eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};
