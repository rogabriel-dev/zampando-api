const express = require('express');
const db = require('../db');

// middleware, funciones admin:
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();


// Obtener todos los menús, con filtrado opcional por tipo de dieta y tipo de plato
router.get('/', async (req, res) => {
  try {
    const { dieta, plato, sortBy = 'menus.id_menu', order = 'asc' } = req.query;

    // Validación básica contra SQL injection
    const allowedSortBy = ['menus.id_menu', 'menus.precio', 'menus.calorias', 'menus.id_dieta', 'menus.id_plato'];
    const allowedOrder = ['asc', 'desc'];

    const column = allowedSortBy.includes(sortBy) ? sortBy : 'menus.id_menu';
    const direction = allowedOrder.includes(order.toLowerCase()) ? order.toUpperCase() : 'ASC';

    let query = `
      SELECT menus.*, tipo_dieta.nombre AS nombre_dieta, tipo_plato.nombre AS nombre_plato
      FROM menus
      INNER JOIN tipo_dieta ON menus.id_dieta = tipo_dieta.id_dieta
      INNER JOIN tipo_plato ON menus.id_plato = tipo_plato.id_plato
    `;
    const params = [];

    if (dieta) {
      query += ' WHERE tipo_dieta.nombre = ?';
      params.push(dieta);
    }

    if (plato) {
      if (params.length > 0) {
        query += ' AND tipo_plato.nombre = ?';
      } else {
        query += ' WHERE tipo_plato.nombre = ?';
      }
      params.push(plato);
    }

    query += ` ORDER BY ${column} ${direction}`;

    const [rows] = await db.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error al obtener menús:', err);
    res.status(500).json({ error: 'Error al obtener menús' });
  }
});

// Obtener un menú por su ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [[menu]] = await db.execute(
      `SELECT 
         m.*, 
         td.nombre    AS nombre_dieta, 
         tp.nombre    AS nombre_plato 
       FROM menus m
       JOIN tipo_dieta td  ON m.id_dieta  = td.id_dieta
       JOIN tipo_plato tp  ON m.id_plato  = tp.id_plato
       WHERE m.id_menu = ?`, 
      [id]
    );
    if (!menu) return res.status(404).json({ error: 'Menú no encontrado' });
    res.json(menu);
  } catch (err) {
    console.error('Error al obtener menú:', err);
    res.status(500).json({ error: 'Error al obtener menú' });
  }
});

// Crear un menu (solo admin)
router.post('/', authMiddleware, requireAdmin, async (req, res) => {
    const { nombre_menu, precio, descripcion, calorias, id_dieta, id_plato, imagen_url } = req.body;
    try {
        const [result] = await db.execute(
            `INSERT INTO menus (nombre_menu, precio, descripcion, calorias, id_dieta, id_plato, imagen_url)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [nombre_menu, precio, descripcion, calorias, id_dieta, id_plato, imagen_url]
        );
        res.status(201).json({ id: result.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar un menu (solo admin)
router.put('/:id', authMiddleware, requireAdmin, async (req, res) =>{
    const { id } = req.params;
    const { nombre_menu, precio, descripcion, calorias, id_dieta, id_plato, imagen_url } = req.body;

    try {
        const [result] = await db.execute(
            `UPDATE menus SET nombre_menu=?, precio=?, descripcion=?, calorias=?, id_dieta=?, id_plato=?, imagen_url=?
            WHERE id_menu = ?`,
            [nombre_menu, precio, descripcion, calorias, id_dieta, id_plato, imagen_url, id]
        );
        res.json({ updated: result.affectedRows > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Eliminar un menu ( solo admin )
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await db.execute(`DELETE FROM menus WHERE id_menu = ?`, [id]);
        res.json({ deleted: result.affectedRows > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener todas las categorías de tipo de dieta
router.get('/categories/dieta', async (req, res) => {
    try {
      const [rows] = await db.execute('SELECT nombre FROM tipo_dieta');
      const categorias = rows.map(row => row.nombre);
      res.json(categorias);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener categorías de dieta' });
    }
});
  
module.exports = router;