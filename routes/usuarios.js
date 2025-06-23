const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Registro
router.post('/registro', async (req, res) => {
    const { nombre_usuario, email, password_usuario, telefono, rol_admin } = req.body;

    // Aseguramos que el rol_admin esté definido y sea un valor booleano (por defecto false)
    const rol = rol_admin === undefined ? false : rol_admin;

    try {
        // Hashear la contraseña
        const hash = await bcrypt.hash(password_usuario, 10);

        // Guardamos el usuario en la base de datos
        const [result] = await db.execute(
            `INSERT INTO usuarios (nombre_usuario, email, password_usuario, telefono, rol_admin) VALUES (?, ?, ?, ?, ?)`,
            [nombre_usuario, email, hash, telefono, rol]
        );

        res.status(201).json({ id: result.insertId, email });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password_usuario } = req.body;

    try {
        // Buscar el usuario por su email
        const [rows] = await db.execute(`SELECT * FROM usuarios WHERE email = ?`, [email]);
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });

        const usuario = rows[0];

        // Comparar la contraseña proporcionada con el hash de la base de datos
        const match = await bcrypt.compare(password_usuario, usuario.password_usuario);
        if (!match) return res.status(401).json({ error: 'Contraseña incorrecta' });

        // Generar el token JWT
        const token = jwt.sign(
            { id: usuario.id_usuario, rol: usuario.rol_admin },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        // Devolver el token y los datos del usuario (sin la contraseña)
        res.json({
            token,
            usuario: {
                id: usuario.id_usuario,
                nombre: usuario.nombre_usuario,
                email: usuario.email,
                rol_admin: usuario.rol_admin
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

//  RUTAS 'ME', USUARIO AUTENTICADO
//
// Datos del usuario logueado
router.get('/me', authMiddleware, async (req, res) => {
    try {
      const [rows] = await db.execute(
        `SELECT id_usuario AS id, nombre_usuario AS nombre, email, telefono, rol_admin
         FROM usuarios WHERE id_usuario = ?`,
        [req.user.id]
      );
      if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

// Permitimos que el usuario actualice sus datos
router.put('/me', authMiddleware, async (req, res) => {
    const id = req.user.id;
    const { nombre, email, telefono, password_usuario } = req.body;
    try {
      const fields = [];
      const params = [];
  
      if (nombre) {
        fields.push('nombre_usuario = ?');
        params.push(nombre);
      }
      if (email) {
        fields.push('email = ?');
        params.push(email);
      }
      if (telefono) {
        fields.push('telefono = ?');
        params.push(telefono);
      }
      if (password_usuario) {
        const hash = await bcrypt.hash(password_usuario, 10);
        fields.push('password_usuario = ?');
        params.push(hash);
      }
  
      if (!fields.length) {
        return res.status(400).json({ error: 'Nada para actualizar' });
      }
  
      params.push(id);
      await db.execute(
        `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`,
        params
      );
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

//  RUTAS ADMINISTRADOR
//
//

// Listar todos los usuarios
router.get('/admin', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [users] = await db.execute(`
      SELECT id_usuario AS id,
             nombre_usuario AS nombre,
             email,
             telefono,
             rol_admin
      FROM usuarios
      ORDER BY nombre_usuario
    `);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obtener un usuario por ID
router.get('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT id_usuario AS id, nombre_usuario AS nombre, email, telefono, rol_admin
       FROM usuarios WHERE id_usuario = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Permitimos que el admin edite cualquier usuario
router.put('/:id', authMiddleware, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { nombre, email, telefono, rol_admin } = req.body;
  try {
    const fields = [];
    const params = [];

    if (nombre) { fields.push('nombre_usuario = ?'); params.push(nombre); }
    if (email) { fields.push('email = ?'); params.push(email); }
    if (telefono){ fields.push('telefono = ?'); params.push(telefono); }
    if (rol_admin !== undefined) {
      fields.push('rol_admin = ?');
      params.push(rol_admin ? 1 : 0);
    }

    if (!fields.length) {
      return res.status(400).json({ error: 'Nada para actualizar' });
    }

    params.push(id);
    await db.execute(
      `UPDATE usuarios SET ${fields.join(', ')} WHERE id_usuario = ?`,
      params
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Eliminar un usuario (admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
  try {
    const [result] = await db.execute(
      `DELETE FROM usuarios WHERE id_usuario = ?`,
      [req.params.id]
    );
    res.json({ deleted: result.affectedRows > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;