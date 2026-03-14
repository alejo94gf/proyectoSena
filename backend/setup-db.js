require('dotenv').config();
const { Client } = require('pg');

async function setup() {
  // Conectar a postgres (DB por defecto) para crear ahorro_db
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    await client.connect();
    console.log('✅ Conectado a PostgreSQL');

    // Crear la base de datos si no existe
    const existe = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'ahorro_db'"
    );
    if (existe.rows.length === 0) {
      await client.query('CREATE DATABASE ahorro_db');
      console.log('✅ Base de datos ahorro_db creada');
    } else {
      console.log('ℹ️  ahorro_db ya existe');
    }
    await client.end();

    // Ahora conectar a ahorro_db y crear las tablas
    const db = new Client({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: 'ahorro_db',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });
    await db.connect();

    await db.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('admin', 'usuario')),
        reset_token VARCHAR(255),
        reset_token_expiry TIMESTAMP,
        activo BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla usuarios OK');

    await db.query(`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        icono VARCHAR(50) DEFAULT '💰',
        color VARCHAR(20) DEFAULT '#6366f1',
        usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
        es_global BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla categorias OK');

    await db.query(`
      CREATE TABLE IF NOT EXISTS ingresos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        descripcion VARCHAR(255) NOT NULL,
        monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
        fecha DATE NOT NULL DEFAULT CURRENT_DATE,
        fuente VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla ingresos OK');

    await db.query(`
      CREATE TABLE IF NOT EXISTS gastos (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
        descripcion VARCHAR(255) NOT NULL,
        monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
        fecha DATE NOT NULL DEFAULT CURRENT_DATE,
        notas TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla gastos OK');

    await db.query(`
      CREATE TABLE IF NOT EXISTS metas_ahorro (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        monto_objetivo DECIMAL(12,2) NOT NULL CHECK (monto_objetivo > 0),
        monto_actual DECIMAL(12,2) DEFAULT 0,
        fecha_limite DATE,
        completada BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Tabla metas_ahorro OK');

    // Categorías globales
    const catExiste = await db.query("SELECT 1 FROM categorias WHERE es_global = true LIMIT 1");
    if (catExiste.rows.length === 0) {
      await db.query(`
        INSERT INTO categorias (nombre, icono, color, es_global) VALUES
          ('Alimentación', '🍔', '#ef4444', true),
          ('Transporte', '🚗', '#f97316', true),
          ('Entretenimiento', '🎮', '#8b5cf6', true),
          ('Salud', '🏥', '#10b981', true),
          ('Educación', '📚', '#3b82f6', true),
          ('Ropa', '👕', '#ec4899', true),
          ('Hogar', '🏠', '#f59e0b', true),
          ('Servicios', '💡', '#6366f1', true),
          ('Otros', '📦', '#6b7280', true);
      `);
      console.log('✅ Categorías globales insertadas');
    }

    // Admin por defecto (password: Admin123!)
    const bcrypt = require('bcryptjs');
    const adminExiste = await db.query("SELECT 1 FROM usuarios WHERE email = 'admin@ahorro.com'");
    if (adminExiste.rows.length === 0) {
      const hash = await bcrypt.hash('Admin123!', 10);
      await db.query(
        "INSERT INTO usuarios (nombre, email, password, rol) VALUES ($1,$2,$3,'admin')",
        ['Administrador', 'admin@ahorro.com', hash]
      );
      console.log('✅ Usuario admin creado: admin@ahorro.com / Admin123!');
    }

    await db.end();
    console.log('\n🎉 Base de datos lista. Puedes iniciar el servidor con: npm run dev');
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
}

setup();
