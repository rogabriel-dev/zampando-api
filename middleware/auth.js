const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if(!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Token invalido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, rol }
        next();
    } catch (err) {
        res.status(403).json({ error: 'Token invalido o expirado' });
    }
}

function requireAdmin(req, res, next) {
    if(!req.user || req.user.rol !== 1){
        return res.status(403).json({ error: 'Acceso restringido a administradores' });
    }
    next();
}

module.exports = {
    authMiddleware,
    requireAdmin,
}