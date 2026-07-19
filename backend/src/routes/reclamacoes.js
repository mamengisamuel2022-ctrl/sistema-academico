const express = require('express');
const router = express.Router();
const controller = require('../controllers/reclamacaoController');
const ticketController = require('../controllers/ticketController');
const { proteger, autorizar, apenasEstudante } = require('../middleware/auth');
const upload = require('../middleware/upload');
const Reclamacao = require('../models/Reclamacao');

// Middleware para verificar se ticket NÃO está bloqueado
const verificarTicketNaoBloqueado = async (req, res, next) => {
  try {
    const reclamacao = await Reclamacao.findById(req.params.id);
    
    if (!reclamacao) {
      return res.status(404).json({
        success: false,
        error: 'Ticket não encontrado'
      });
    }

    const statusBloqueados = ['fechado', 'resolvido'];
    if (statusBloqueados.includes(reclamacao.ticket?.status) || 
        statusBloqueados.includes(reclamacao.status)) {
      return res.status(403).json({
        success: false,
        error: 'Este ticket está fechado e não pode ser alterado.'
      });
    }

    req.reclamacao = reclamacao;
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Todas as rotas precisam de autenticação
router.use(proteger);

// ============================================
// ROTAS ESPECÍFICAS (antes das rotas com :id)
// ============================================

// Dashboard - APENAS ADMIN
router.get('/dashboard', autorizar('admin'), controller.dashboard);

// Tickets do atendente/coordenador/admin
router.get('/tickets/meus', autorizar('admin', 'coordenador', 'atendente'), ticketController.meusTickets);

// Atribuir ticket - admin e coordenador
router.post('/tickets/atribuir', autorizar('admin', 'coordenador'), ticketController.atribuirTicket);

// Iniciar atendimento - com verificação de bloqueio
router.patch('/tickets/:id/iniciar', 
  autorizar('admin', 'coordenador', 'atendente'), 
  verificarTicketNaoBloqueado,
  ticketController.iniciarAtendimento
);

// Encaminhar ticket - com verificação de bloqueio
router.patch('/tickets/:id/encaminhar', 
  autorizar('admin', 'coordenador', 'atendente'), 
  verificarTicketNaoBloqueado,
  ticketController.encaminharTicket
);

// Fechar ticket - com verificação de bloqueio
router.patch('/tickets/:id/fechar', 
  autorizar('admin', 'coordenador', 'atendente'), 
  verificarTicketNaoBloqueado,
  ticketController.fecharTicket
);

// Buscar por matrícula
router.get('/matricula/:matricula', controller.buscarPorMatricula);

// ============================================
// ROTAS GERAIS
// ============================================

// Criar reclamação - APENAS ESTUDANTE
router.post('/', apenasEstudante, upload.array('anexos', 5), controller.criar);

// Listar reclamações - TODOS
router.get('/', controller.listar);

// ============================================
// ROTAS COM PARÂMETRO :id (POR ÚLTIMO)
// ============================================

// Buscar por ID - TODOS
router.get('/:id', controller.buscarPorId);

// Atualizar status - admin/coordenador/atendente
router.patch('/:id/status', autorizar('admin', 'coordenador', 'atendente'), controller.atualizarStatus);

// Responder - admin/coordenador/atendente
router.post('/:id/responder', autorizar('admin', 'coordenador', 'atendente'), controller.responder);

// Comentar - TODOS
router.post('/:id/comentario', upload.array('anexos', 3), controller.adicionarComentario);

// Votar - TODOS
router.post('/:id/votar', controller.votar);

// ✅ DELETAR - APENAS ADMIN
router.delete('/:id', autorizar('admin'), controller.deletar);

module.exports = router;