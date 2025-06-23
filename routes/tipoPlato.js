const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/categories/plato', async (req, res) => {
    const [rows] = await db.execute('SELECT nombre FROM tipo_plato');
    res.json(rows.map(r => r.nombre));
  });

module.exports = router;