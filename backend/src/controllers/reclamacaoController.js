const Reclamacao = require('../models/Reclamacao');

// Criar reclamação (qualquer usuário autenticado)
exports.criar = async (req, res) => {
  try {
    const dados = {
      titulo: req.body.titulo,
      descricao: req.body.descricao,
      tipo: req.body.tipo,
      categoria: req.body.categoria,
      prioridade: req.body.prioridade || 'media',
      visibilidade: req.body.visibilidade || 'publico',
      autor: req.user._id,
      matriculaAutor: req.user.matricula || req.body.matricula,
      setorResponsavel: req.body.setorResponsavel,
      tags: req.body.tags ? JSON.parse(req.body.tags) : []
    };

    if (req.files && req.files.length > 0) {
      dados.anexos = req.files.map(file => ({
        nome: file.originalname,
        url: `/uploads/${file.filename}`,
        tipo: file.mimetype,
        tamanho: file.size
      }));
    }

    const reclamacao = await Reclamacao.create(dados);
    await reclamacao.populate('autor', 'nome email matricula curso');

    res.status(201).json({
      success: true,
      data: reclamacao
    });
  } catch (error) {
    console.error('Erro ao criar:', error);
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Listar reclamações (com filtro por tipo de usuário)
exports.listar = async (req, res) => {
  try {
    const { status, tipo, categoria, search, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const filtro = {};

    // ✅ FILTRO POR TIPO DE USUÁRIO
    if (req.user.tipo === 'estudante') {
      // Estudante vê APENAS suas próprias reclamações OU reclamações públicas
      filtro.$or = [
        { autor: req.user._id },
        { visibilidade: 'publico' }
      ];
    } else if (req.user.tipo === 'atendente') {
      // Atendente vê reclamações da sua área OU atribuídas a ele
      filtro.$or = [
        { categoria: { $in: req.user.areas || [] } },
        { 'ticket.atribuidoPara': req.user._id }
      ];
    } else if (req.user.tipo === 'coordenador') {
      // Coordenador vê reclamações das suas áreas
      filtro.categoria = { $in: req.user.areas || [] };
    }
    // Admin vê tudo (sem filtro adicional)

    // Filtros opcionais
    if (status) filtro.status = status;
    if (tipo) filtro.tipo = tipo;
    if (categoria && req.user.tipo !== 'atendente') filtro.categoria = categoria;
    if (search) {
      filtro.$or = [
        { titulo: { $regex: search, $options: 'i' } },
        { descricao: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }

    const reclamacoes = await Reclamacao.find(filtro)
      .populate('autor', 'nome email matricula curso')
      .populate('ticket.atribuidoPara', 'nome')
      .sort(sort)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Reclamacao.countDocuments(filtro);

    res.json({
      success: true,
      data: reclamacoes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Buscar por ID
exports.buscarPorId = async (req, res) => {
  try {
    const reclamacao = await Reclamacao.findById(req.params.id)
      .populate('autor', 'nome email matricula curso')
      .populate('ticket.atribuidoPara', 'nome')
      .populate('comentarios.usuario', 'nome avatar');

    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Reclamação não encontrada'
      });
    }

    // ✅ Verificar permissão de visualização
    const podeVer = 
      req.user.tipo === 'admin' ||
      req.user.tipo === 'coordenador' ||
      (req.user.tipo === 'atendente' && req.user.areas?.includes(reclamacao.categoria)) ||
      reclamacao.autor._id.toString() === req.user._id.toString() ||
      reclamacao.visibilidade === 'publico';

    if (!podeVer) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para ver esta reclamação'
      });
    }

    reclamacao.visualizacoes += 1;
    await reclamacao.save();

    res.json({
      success: true,
      data: reclamacao
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Votar (qualquer usuário autenticado)
exports.votar = async (req, res) => {
  try {
    const { tipo } = req.body;
    
    if (!tipo || !['positivo', 'negativo'].includes(tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Tipo de voto inválido'
      });
    }

    const reclamacao = await Reclamacao.findById(req.params.id);
    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Reclamação não encontrada'
      });
    }

    const userId = req.user._id;

    // Remover voto existente
    reclamacao.votos.positivo = reclamacao.votos.positivo.filter(id => id.toString() !== userId.toString());
    reclamacao.votos.negativo = reclamacao.votos.negativo.filter(id => id.toString() !== userId.toString());

    // Adicionar novo voto
    if (tipo === 'positivo') {
      reclamacao.votos.positivo.push(userId);
    } else {
      reclamacao.votos.negativo.push(userId);
    }

    await reclamacao.save();

    res.json({
      success: true,
      data: {
        positivo: reclamacao.votos.positivo.length,
        negativo: reclamacao.votos.negativo.length,
        total: reclamacao.votos.positivo.length - reclamacao.votos.negativo.length
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Comentar (qualquer usuário autenticado)
exports.adicionarComentario = async (req, res) => {
  try {
    const { mensagem, tipo = 'comentario' } = req.body;

    if (!mensagem || !mensagem.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Mensagem é obrigatória'
      });
    }

    const comentario = {
      usuario: req.user._id,
      mensagem: mensagem.trim(),
      tipo,
      visivelPara: req.user.tipo === 'estudante' ? 'todos' : (req.body.visivelPara || 'todos')
    };

    if (req.files && req.files.length > 0) {
      comentario.anexos = req.files.map(file => ({
        nome: file.originalname,
        url: `/uploads/${file.filename}`,
        tipo: file.mimetype
      }));
    }

    const reclamacao = await Reclamacao.findByIdAndUpdate(
      req.params.id,
      { $push: { comentarios: comentario } },
      { new: true }
    ).populate('comentarios.usuario', 'nome avatar');

    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Reclamação não encontrada'
      });
    }

    res.json({
      success: true,
      data: reclamacao
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Atualizar status (apenas admin/coordenador/atendente da área)
exports.atualizarStatus = async (req, res) => {
  try {
    const reclamacao = await Reclamacao.findById(req.params.id);
    
    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Reclamação não encontrada'
      });
    }

    // ✅ Verificar permissão
    if (!req.user.isAdmin() && !req.user.podeAcessarCategoria(reclamacao.categoria)) {
      return res.status(403).json({
        success: false,
        error: 'Você não pode alterar reclamações desta categoria'
      });
    }

    const { status, prioridade } = req.body;
    if (status) reclamacao.status = status;
    if (prioridade) reclamacao.prioridade = prioridade;

    await reclamacao.save();

    res.json({
      success: true,
      data: reclamacao
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};

// Dashboard - APENAS ADMIN (vê tudo)
exports.dashboard = async (req, res) => {
  try {
    console.log('📊 Dashboard ADMIN acessado por:', req.user.email);

    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const inicioAno = new Date(hoje.getFullYear(), 0, 1);

    const [
      total,
      totalMes,
      totalAno,
      pendentes,
      resolvidos,
      porStatus,
      porTipo,
      porCategoria,
      porPrioridade,
      reclamacoesPorMes,
      topAutores,
      recentes,
      ticketsAbertos,
      ticketsFechados,
      slaViolados,
      tempoMedioResolucao
    ] = await Promise.all([
      // Totais
      Reclamacao.countDocuments(),
      Reclamacao.countDocuments({ createdAt: { $gte: inicioMes } }),
      Reclamacao.countDocuments({ createdAt: { $gte: inicioAno } }),
      Reclamacao.countDocuments({ status: 'pendente' }),
      Reclamacao.countDocuments({ status: 'resolvido' }),
      
      // Agrupamentos
      Reclamacao.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Reclamacao.aggregate([
        { $group: { _id: '$tipo', count: { $sum: 1 } } }
      ]),
      Reclamacao.aggregate([
        { $group: { _id: '$categoria', count: { $sum: 1 } } }
      ]),
      Reclamacao.aggregate([
        { $group: { _id: '$prioridade', count: { $sum: 1 } } }
      ]),
      
      // Por mês (últimos 12 meses)
      Reclamacao.aggregate([
        {
          $group: {
            _id: {
              ano: { $year: '$createdAt' },
              mes: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.ano': -1, '_id.mes': -1 } },
        { $limit: 12 }
      ]),
      
      // Top 5 autores
      Reclamacao.aggregate([
        { $group: { _id: '$autor', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'autor'
          }
        },
        { $unwind: '$autor' },
        {
          $project: {
            nome: '$autor.nome',
            matricula: '$autor.matricula',
            email: '$autor.email',
            total: 1
          }
        }
      ]),
      
      // Últimas 10 reclamações
      Reclamacao.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('autor', 'nome email matricula')
        .populate('ticket.atribuidoPara', 'nome')
        .lean(),
      
      // Tickets
      Reclamacao.countDocuments({ 'ticket.status': { $in: ['aberto', 'atribuido', 'em_atendimento'] } }),
      Reclamacao.countDocuments({ 'ticket.status': 'fechado' }),
      Reclamacao.countDocuments({ 'ticket.sla.violado': true }),
      
      // Tempo médio de resolução
      Reclamacao.aggregate([
        { $match: { status: 'resolvido', tempoResolucao: { $ne: null } } },
        { $group: { _id: null, media: { $avg: '$tempoResolucao' } } }
      ])
    ]);

    console.log('✅ Dashboard carregado com sucesso');

    res.json({
      success: true,
      data: {
        resumo: {
          total,
          esteMes: totalMes,
          esteAno: totalAno,
          pendentes,
          resolvidos,
          ticketsAbertos,
          ticketsFechados,
          slaViolados,
          tempoMedioResolucao: tempoMedioResolucao[0]?.media?.toFixed(2) || 0
        },
        porStatus,
        porTipo,
        porCategoria,
        porPrioridade,
        porMes: reclamacoesPorMes,
        topAutores,
        recentes
      }
    });
  } catch (error) {
    console.error('❌ Erro no dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao carregar dashboard: ' + error.message
    });
  }
};

// Deletar (apenas autor ou admin da área)
exports.deletar = async (req, res) => {
  try {
    const reclamacao = await Reclamacao.findById(req.params.id);

    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Reclamação não encontrada'
      });
    }

    const podeDeletar = 
      req.user.tipo === 'admin' ||
      reclamacao.autor.toString() === req.user._id.toString();

    if (!podeDeletar) {
      return res.status(403).json({
        success: false,
        error: 'Você não tem permissão para deletar esta reclamação'
      });
    }

    await Reclamacao.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Reclamação deletada com sucesso'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Buscar por matrícula
exports.buscarPorMatricula = async (req, res) => {
  try {
    const reclamacoes = await Reclamacao.find({
      matriculaAutor: req.params.matricula
    }).populate('autor', 'nome email curso');

    res.json({
      success: true,
      data: reclamacoes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Deletar - APENAS ADMIN
exports.deletar = async (req, res) => {
  try {
    // Verificar se é admin (redundante com o middleware, mas seguro)
    if (req.user.tipo !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas administradores podem deletar reclamações.'
      });
    }

    const reclamacao = await Reclamacao.findById(req.params.id);

    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Reclamação não encontrada'
      });
    }

    await Reclamacao.findByIdAndDelete(req.params.id);

    console.log(`🗑️ Reclamação deletada pelo admin ${req.user.email}: ${req.params.id}`);

    res.json({
      success: true,
      message: 'Reclamação deletada permanentemente com sucesso'
    });
  } catch (error) {
    console.error('❌ Erro ao deletar:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao deletar reclamação'
    });
  }
};

// Responder (apenas admin/coordenador/atendente da área)
exports.responder = async (req, res) => {
  try {
    const reclamacao = await Reclamacao.findById(req.params.id);
    
    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Reclamação não encontrada'
      });
    }

    if (!req.user.isAdmin() && !req.user.podeAcessarCategoria(reclamacao.categoria)) {
      return res.status(403).json({
        success: false,
        error: 'Você não pode responder reclamações desta categoria'
      });
    }

    reclamacao.resposta = {
      mensagem: req.body.mensagem,
      respondidoPor: req.user._id,
      dataResposta: new Date()
    };
    reclamacao.status = 'resolvido';

    await reclamacao.save();

    res.json({
      success: true,
      data: reclamacao
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
};