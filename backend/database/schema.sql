-- ============================================
-- ESQUEMA DE BASE DE DATOS - Gestión de Ahorros
-- ============================================

CREATE DATABASE ahorro_db;
\c ahorro_db;

-- Tabla de usuarios
CREATE TABLE usuarios (
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

-- Tabla de categorías de gastos
CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  icono VARCHAR(50) DEFAULT '💰',
  color VARCHAR(20) DEFAULT '#6366f1',
  usuario_id INTEGER REFERENCES usuarios(id) ON DELETE CASCADE,
  es_global BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de ingresos
CREATE TABLE ingresos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  fuente VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de gastos
CREATE TABLE gastos (
  id SERIAL PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  descripcion VARCHAR(255) NOT NULL,
  monto DECIMAL(12,2) NOT NULL CHECK (monto > 0),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  notas TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de metas de ahorro
CREATE TABLE metas_ahorro (
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

-- Categorías globales por defecto
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

-- Usuario administrador por defecto (password: Admin123!)
INSERT INTO usuarios (nombre, email, password, rol) VALUES
  ('Administrador', 'admin@ahorro.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin');
