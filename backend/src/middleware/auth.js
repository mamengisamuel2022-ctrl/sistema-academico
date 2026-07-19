const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rotas - verifica autenticação
exports.proteger = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Acesso não autorizado. Faça login.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'sistema_academico_secret_2024');
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido ou expirado'
    });
  }
};

// Autorizar por tipo de usuário
exports.autorizar = (...tipos) => {
  return (req, res, next) => {
    if (!tipos.includes(req.user.tipo)) {
      return res.status(403).json({
        success: false,
        error: `Acesso negado. Requer permissão de: ${tipos.join(' ou ')}`
      });
    }
    next();
  };
};

// ✅ Permitir APENAS estudantes criarem reclamações
exports.apenasEstudante = (req, res, next) => {
  if (req.user.tipo !== 'estudante') {
    return res.status(403).json({
      success: false,
      error: 'Apenas estudantes podem criar reclamações.'
    });
  }
  next();
};