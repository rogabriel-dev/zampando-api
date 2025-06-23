const express = require('express');
const db = require('../db');

// middleware, funciones admin:
const { authMiddleware, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Crear pedido
router.post('/', authMiddleware, async (req, res) => {
    const id_cliente = req.user.id; // usamos el id del usuario autenticado
    const { total, productos } = req.body; // solo esperamos total y productos (no id_cliente)

    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();
        
        const [pedidoResult] = await conn.execute(
            `INSERT INTO pedidos (id_cliente, fecha_pedido, estado, total) VALUES (?, NOW(), 'pendiente', ?)`,
            [id_cliente, total]
        );

        const id_pedido = pedidoResult.insertId;

        for (const item of productos) {
            await conn.execute(
              `INSERT INTO pedidos_menus (id_pedido, id_menu, cantidad) VALUES (?, ?, ?)`,
              [id_pedido, item.id_menu, item.cantidad]
            );
        }

        await conn.commit();
        res.status(201).json({ id_pedido });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Obtener todos los pedidos (solo admin)
router.get('/admin', authMiddleware, requireAdmin, async (req, res) => {
    try{
        const [pedidos] = await db.execute(`
            SELECT
                p.id_pedido,
                p.fecha_pedido,
                p.estado,
                p.total,
                u.id_usuario,
                u.nombre_usuario,
                u.email
            FROM pedidos p
            JOIN usuarios u ON p.id_cliente = u.id_usuario
            ORDER BY p.fecha_pedido DESC
        `);

        res.json(pedidos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Obtener pedidos por rango (solo admin)
router.get('/admin/rango', authMiddleware, requireAdmin, async (req, res) => {
  const { periodo } = req.query;
  let fechaInicio;

  switch (periodo) {
    case '7dias':
      fechaInicio = new Date();
      fechaInicio.setDate(fechaInicio.getDate() - 7);
      break;
    case 'mes':
      fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
      break;
    case '3meses':
      fechaInicio = new Date();
      fechaInicio.setMonth(fechaInicio.getMonth() - 3);
      break;
    default:
      return res.status(400).json({ error: 'Periodo inválido' });
  }

  try {
    const [pedidos] = await db.execute(`
      SELECT
        DATE(fecha_pedido) as dia,
        COUNT(*) as pedidos
      FROM pedidos
      WHERE fecha_pedido >= ?
      GROUP BY dia
      ORDER BY dia ASC
    `, [fechaInicio]);

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Top productos (más o menos populares) - solo admin
router.get('/admin/top-productos', authMiddleware, requireAdmin, async (req, res) => {
  const { tipo } = req.query; // 'mas' o 'menos'

  const order = tipo === 'menos' ? 'ASC' : 'DESC';

  try {
    const [productos] = await db.execute(`
      SELECT
        m.nombre_menu,
        SUM(pm.cantidad) AS vendidos
      FROM pedidos_menus pm
      JOIN menus m ON pm.id_menu = m.id_menu
      GROUP BY pm.id_menu
      ORDER BY vendidos ${order}
      LIMIT 5
    `);

    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// Leer pedidos del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [rows] = await db.execute(
            `SELECT id_pedido, fecha_pedido, estado, total FROM pedidos WHERE id_cliente = ? ORDER BY fecha_pedido DESC`,
            [req.user.id]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Actualizar estado de pedido (solo admin)
router.put('/:id/status', authMiddleware, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'enviado', 'entregado', 'cancelado'];
    if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ error: 'Estado no valido' });
    }

    try {
        const [result] = await db.execute(
            `UPDATE pedidos SET estado = ? WHERE id_pedido = ?`,
            [estado, id]
        );
        res.json({ updated: result.affectedRows > 0 });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancelar pedido (cliente)
router.put('/:id/cancelar', authMiddleware, async (req, res) => {
    const idPedido = req.params.id;
    const userId = req.user.id;
  
    try {
      // Verificamos que el pedido le pertenezca al usuario y esté pendiente
      const [rows] = await db.execute(
        `SELECT * FROM pedidos WHERE id_pedido = ? AND id_cliente = ? AND estado = 'pendiente'`,
        [idPedido, userId]
      );
  
      if (!rows.length) return res.status(403).json({ error: 'No autorizado o el pedido no puede cancelarse' });
  
      // Actualizamos el estado
      await db.execute(`UPDATE pedidos SET estado = 'cancelado' WHERE id_pedido = ?`, [idPedido]);
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

// Eliminar pedido (solo admin)
router.delete('/:id', authMiddleware, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const conn = await db.getConnection();

    try{
        await conn.beginTransaction();
        await conn.execute(`DELETE FROM pedidos_menus WHERE id_pedido = ?`, [id]); 
        const [result] = await conn.execute(`DELETE FROM pedidos WHERE id_pedido = ?`, [id]);
        await conn.commit();
        res.json({ deleted: result.affectedRows > 0 });
    } catch (err) {
        await conn.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        conn.release();
    }
});

// Leer pedido: detalle del pedido y productos asociados con JOIN
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
      // 1) Obtener info del pedido junto con datos del cliente
      const [[pedido]] = await db.execute(`
        SELECT
          p.id_pedido,
          p.fecha_pedido,
          p.estado,
          p.total,
          u.id_usuario    AS cliente_id,
          u.nombre_usuario,
          u.email,
          u.telefono
        FROM pedidos p
        JOIN usuarios u ON p.id_cliente = u.id_usuario
        WHERE p.id_pedido = ?
      `, [id]);
  
      if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
  
      // 2) Verificar acceso (propio o admin)
      if (pedido.cliente_id !== req.user.id && req.user.rol !== 1) {
        return res.status(403).json({ error: 'Acceso denegado a este pedido' });
      }
  
      // 3) Obtener productos del pedido
      const [productos] = await db.execute(`
        SELECT
          pm.id_menu,
          m.nombre_menu,
          m.precio,
          pm.cantidad
        FROM pedidos_menus pm
        JOIN menus m ON pm.id_menu = m.id_menu
        WHERE pm.id_pedido = ?
      `, [id]);
  
      // 4) Devolver toda la info
      res.json({
        id_pedido:     pedido.id_pedido,
        fecha_pedido:  pedido.fecha_pedido,
        estado:        pedido.estado,
        total:         pedido.total,
        cliente: {
          id:      pedido.cliente_id,
          nombre:  pedido.nombre_usuario,
          email:   pedido.email,
          telefono: pedido.telefono
        },
        productos
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;