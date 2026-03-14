require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const ingresoRoutes = require('./routes/ingreso.routes');
const gastoRoutes = require('./routes/gasto.routes');
const metaRoutes = require('./routes/meta.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const reporteRoutes = require('./routes/reporte.routes');

const app = express();

app.use(cors({ origin: /^http:\/\/localhost:\d+$/, credentials: true }));
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/ingresos', ingresoRoutes);
app.use('/api/gastos', gastoRoutes);
app.use('/api/metas', metaRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/reportes', reporteRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
