/**
 * Inicializacion de variables, conexion al servidor
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const usuariosRoutes = require('./routes/usuarios');
const menusRoutes = require('./routes/menus');
const pedidosRoutes = require('./routes/pedidos');
const tipoDietaRoutes = require('./routes/tipoDieta');
const tipoPlatoRoutes = require('./routes/tipoPlato');
const adminRoutes = require('./routes/admin');

app.use('/api/usuarios', usuariosRoutes);
app.use('/api/menus', menusRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/dietas', tipoDietaRoutes);
app.use('/api/platos', tipoPlatoRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor ejecutandose en puerto ${PORT}`));