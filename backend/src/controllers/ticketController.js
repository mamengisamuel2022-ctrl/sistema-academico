const Reclamacao = require('../models/Reclamacao');
const User = require('../models/User');

// Atribuir ticket a um atendente
exports.atribuirTicket = async (req, res) => {
  try {
    const { ticketId, atendenteId } = req.body;

    const reclamacao = await Reclamacao.findById(ticketId);
    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado'
      });
    }

    const atendente = await User.findById(atendenteId);
    if (!atendente || !['admin', 'coordenador', 'atendente'].includes(atendente.tipo)) {
      return res.status(400).json({
        success: false,
        error: 'Atendente inválido'
      });
    }

    // Verificar se o atendente pode atender esta categoria
    if (atendente.tipo === 'atendente' && !atendente.areas.includes(reclamacao.categoria)) {
      return res.status(400).json({
        success: false,
        error: 'Este atendente não pode atender esta categoria'
      });
    }

    reclamacao.ticket.atribuidoPara = atendente._id;
    reclamacao.ticket.status = 'atribuido';
    reclamacao.ticket.historico.push({
      acao: 'atribuido',
      realizadoPor: req.user._id,
      descricao: `Ticket atribuído para ${atendente.nome}`,
      data: new Date()
    });

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

// Listar tickets do atendente logado
exports.meusTickets = async (req, res) => {
  try {
    const filtro = {};

    // Se for admin, pode ver todos ou filtrar
    if (req.user.tipo === 'admin') {
      // Pode ver tudo
    } else {
      // Atendente/coordenador vê apenas seus tickets OU tickets da sua área
      filtro.$or = [
        { 'ticket.atribuidoPara': req.user._id },
        { categoria: { $in: req.user.areas || [] } }
      ];
    }

    // Filtros adicionais
    if (req.query.status) {
      filtro['ticket.status'] = req.query.status;
    }
    if (req.query.prioridade) {
      filtro['ticket.prioridade'] = req.query.prioridade;
    }

    const tickets = await Reclamacao.find(filtro)
      .populate('autor', 'nome matricula')
      .populate('ticket.atribuidoPara', 'nome')
      .sort({ 'ticket.prioridade': -1, createdAt: -1 });

    res.json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Aceitar/Iniciar atendimento
exports.iniciarAtendimento = async (req, res) => {
  try {
    const reclamacao = await Reclamacao.findById(req.params.id);

    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado'
      });
    }

    // Verificar se o atendente pode atender
    if (req.user.tipo === 'atendente' && !req.user.areas.includes(reclamacao.categoria)) {
      return res.status(403).json({
        success: false,
        error: 'Você não pode atender esta categoria'
      });
    }

    reclamacao.ticket.atribuidoPara = req.user._id;
    reclamacao.ticket.status = 'em_atendimento';
    reclamacao.status = 'em_analise';
    reclamacao.ticket.historico.push({
      acao: 'em_analise',
      realizadoPor: req.user._id,
      descricao: `${req.user.nome} iniciou o atendimento`,
      data: new Date()
    });

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

// Encaminhar ticket para outro setor
exports.encaminharTicket = async (req, res) => {
  try {
    const { servico, motivo } = req.body;

    const reclamacao = await Reclamacao.findById(req.params.id);
    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado'
      });
    }

    reclamacao.ticket.servico = servico;
    reclamacao.ticket.status = 'pendente_cliente';
    reclamacao.status = 'encaminhado';
    reclamacao.ticket.historico.push({
      acao: 'encaminhado',
      realizadoPor: req.user._id,
      descricao: `Encaminhado para ${servico}. Motivo: ${motivo}`,
      data: new Date()
    });

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

// Fechar ticket
exports.fecharTicket = async (req, res) => {
  try {
    const { resolucao, avaliacao } = req.body;

    const reclamacao = await Reclamacao.findById(req.params.id);
    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado'
      });
    }

    reclamacao.ticket.status = 'fechado';
    reclamacao.status = 'resolvido';
    reclamacao.resposta = {
      mensagem: resolucao,
      respondidoPor: req.user._id,
      dataResposta: new Date()
    };

    if (avaliacao) {
      reclamacao.ticket.avaliacao = {
        nota: avaliacao,
        data: new Date()
      };
    }

    reclamacao.ticket.historico.push({
      acao: 'resolvido',
      realizadoPor: req.user._id,
      descricao: 'Ticket fechado e resolvido',
      data: new Date()
    });

    // Atualizar estatísticas do atendente
    if (req.user.tipo === 'atendente' || req.user.tipo === 'admin') {
      await User.findByIdAndUpdate(req.user._id, {
        $inc: { 'estatisticas.ticketsResolvidos': 1, 'estatisticas.ticketsPendentes': -1 }
      });
    }

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



// Dashboard do atendente
exports.dashboardAtendente = async (req, res) => {
  try {
    const filtro = req.user.tipo === 'admin' ? {} : {
      $or: [
        { 'ticket.atribuidoPara': req.user._id },
        { categoria: { $in: req.user.areas || [] } }
      ]
    };

    const [
      totalTickets,
      ticketsAbertos,
      ticketsEmAtendimento,
      ticketsResolvidos,
      ticketsPorPrioridade,
      ticketsPorCategoria,
      ticketsRecentes,
    ] = await Promise.all([
      Reclamacao.countDocuments(filtro),
      Reclamacao.countDocuments({ ...filtro, 'ticket.status': 'aberto' }),
      Reclamacao.countDocuments({ ...filtro, 'ticket.status': 'em_atendimento' }),
      Reclamacao.countDocuments({ ...filtro, 'ticket.status': 'fechado' }),
      Reclamacao.aggregate([
        { $match: filtro },
        { $group: { _id: '$ticket.prioridade', count: { $sum: 1 } } }
      ]),
      Reclamacao.aggregate([
        { $match: filtro },
        { $group: { _id: '$categoria', count: { $sum: 1 } } }
      ]),
      Reclamacao.find(filtro)
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('autor', 'nome')
        .populate('ticket.atribuidoPara', 'nome')
        .lean(),
    ]);

    res.json({
      success: true,
      data: {
        resumo: {
          total: totalTickets,
          abertos: ticketsAbertos,
          emAtendimento: ticketsEmAtendimento,
          resolvidos: ticketsResolvidos,
        },
        porPrioridade: ticketsPorPrioridade,
        porCategoria: ticketsPorCategoria,
        recentes: ticketsRecentes
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};