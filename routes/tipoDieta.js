const express = require('express');
const db = require('../db');
const router = express.Router();

router.get('/', async (req, res) => {
    const [rows] = await db.execute(`SELECT * FROM tipo_dieta`);
    res.json(rows);
});

module.exports = router;