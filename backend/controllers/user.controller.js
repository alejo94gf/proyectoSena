const pool = require('../config/db');
const bcrypt = require('bcryptjs');

// Solo admin
exports.listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at FROM usuarios ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

exports.toggleActivo = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET activo = NOT activo WHERE id=$1 RETURNING id, nombre, email, activo',
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

exports.cambiarRol = async (req, res) => {
  const { id } = req.params;
  const { rol } = req.body;
  if (!['admin', 'usuario'].includes(rol)) return res.status(400).json({ error: 'Rol inválido' });

  try {
    const result = await pool.query(
      'UPDATE usuarios SET rol=$1 WHERE id=$2 RETURNING id, nombre, email, rol',
      [rol, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar rol' });
  }
};

exports.actualizarPerfil = async (req, res) => {
  const { nombre, email } = req.body;
  try {
    const result = await pool.query(
      'UPDATE usuarios SET nombre=$1, email=$2, updated_at=NOW() WHERE id=$3 RETURNING id, nombre, email, rol',
      [nombre, email, req.usuario.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

exports.cambiarPassword = async (req, res) => {
  const { passwordActual, passwordNuevo } = req.body;
  try {
    const result = await pool.query('SELECT password FROM usuarios WHERE id=$1', [req.usuario.id]);
    const valido = await bcrypt.compare(passwordActual, result.rows[0].password);
    if (!valido) return res.status(400).json({ error: 'Contraseña actual incorrecta' });

    const hash = await bcrypt.hash(passwordNuevo, 10);
    await pool.query('UPDATE usuarios SET password=$1 WHERE id=$2', [hash, req.usuario.id]);
    res.json({ mensaje: 'Contraseña actualizada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
};
