const express = require('express');
const db = require('../db');
const { authMiddleware, requireAdmin } = require('../middleware/auth');
const router = express.Router();

router.get('/metrics', authMiddleware, requireAdmin, async (req, res) => {
  try {
    // 1) Total de pedidos y total de ingresos
    const [[{ totalPedidos, ingresosTotales }]] = await db.execute(`
      SELECT
        COUNT(*) AS totalPedidos,
        COALESCE(SUM(total),0) AS ingresosTotales
      FROM pedidos
    `);

    // 2) Pedidos por día (últimos 7 días)
    const [pedidosPorDia] = await db.execute(`
      SELECT DATE(fecha_pedido) AS dia, COUNT(*) AS pedidos
      FROM pedidos
      WHERE fecha_pedido >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
      GROUP BY DATE(fecha_pedido)
      ORDER BY DATE(fecha_pedido)
    `);

    // 3) Productos más vendidos (top 5)
    const [topProductos] = await db.execute(`
      SELECT m.nombre_menu, SUM(pm.cantidad) AS vendidos
      FROM pedidos_menus pm
      JOIN menus m ON pm.id_menu = m.id_menu
      GROUP BY pm.id_menu
      ORDER BY vendidos DESC
      LIMIT 5
    `);

    // 4) Usuarios registrados
    const [[{ totalUsuarios }]] = await db.execute(`
      SELECT COUNT(*) AS totalUsuarios FROM usuarios
    `);

    res.json({
      totalPedidos,
      ingresosTotales: Number(ingresosTotales),
      pedidosPorDia,      // [{ dia: '2025-05-01', pedidos: 3 }, …]
      topProductos,       // [{ nombre_menu: 'Pizza', vendidos: 42 }, …]
      totalUsuarios
    });
  } catch (err) {
    console.error('Error obteniendo métricas:', err);
    res.status(500).json({ error: 'Error al obtener métricas' });
  }
});

module.exports = router;