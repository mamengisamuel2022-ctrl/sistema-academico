const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { proteger } = require('../middleware/auth');

// Rota de teste
router.get('/test', (req, res) => {
  res.json({ message: 'Rota de autenticação funcionando!' });
});

// Rotas públicas
router.post('/registrar', authController.registrar);
router.post('/login', authController.login);

// Rota protegida
router.get('/perfil', proteger, authController.perfil);

module.exports = router;