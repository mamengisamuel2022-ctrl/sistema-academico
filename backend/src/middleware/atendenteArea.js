// Middleware para verificar se o atendente pode atender determinada categoria
exports.verificarArea = (req, res, next) => {
  const usuario = req.user;
  
  // Admin pode tudo
  if (usuario.tipo === 'admin') {
    return next();
  }

  // Se for atendente ou coordenador, verificar áreas
  if (usuario.tipo === 'atendente' || usuario.tipo === 'coordenador') {
    const categoria = req.body.categoria || req.params.categoria;
    
    if (!categoria) {
      // Se não tiver categoria, permite (será filtrado depois)
      return next();
    }

    if (!usuario.areas || usuario.areas.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem áreas atribuídas para atendimento'
      });
    }

    if (!usuario.areas.includes(categoria)) {
      return res.status(403).json({
        success: false,
        error: `Você não tem permissão para atender a categoria: ${categoria}`
      });
    }
  }

  next();
};

// Middleware para filtrar tickets por área do atendente
exports.filtrarPorArea = (req, res, next) => {
  const usuario = req.user;
  
  // Admin vê tudo
  if (usuario.tipo === 'admin') {
    return next();
  }

  // Atendente/Coordenador vê apenas suas áreas
  if (usuario.tipo === 'atendente' || usuario.tipo === 'coordenador') {
    if (usuario.areas && usuario.areas.length > 0) {
      // Adicionar filtro de categoria
      req.query.categorias = usuario.areas.join(',');
    }
  }

  next();
};