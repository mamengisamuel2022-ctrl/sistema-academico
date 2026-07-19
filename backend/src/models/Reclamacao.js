const mongoose = require('mongoose');

const historicoTicketSchema = new mongoose.Schema({
  acao: {
    type: String,
    enum: ['criado', 'atribuido', 'em_analise', 'respondido', 'encaminhado', 'resolvido', 'rejeitado', 'reaberto'],
    required: true
  },
  realizadoPor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  descricao: String,
  data: {
    type: Date,
    default: Date.now
  }
});

const comentarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mensagem: {
    type: String,
    required: [true, 'Mensagem é obrigatória']
  },
  tipo: {
    type: String,
    enum: ['comentario', 'nota_interna', 'resposta'],
    default: 'comentario'
  },
  visivelPara: {
    type: String,
    enum: ['todos', 'atendentes', 'autor'],
    default: 'todos'
  },
  anexos: [{
    nome: String,
    url: String,
    tipo: String
  }]
}, {
  timestamps: true
});

const reclamacaoSchema = new mongoose.Schema({
  titulo: {
    type: String,
    required: [true, 'Título é obrigatório'],
    trim: true,
    maxlength: [200, 'Título deve ter no máximo 200 caracteres']
  },
  descricao: {
    type: String,
    required: [true, 'Descrição é obrigatória'],
    maxlength: [5000, 'Descrição muito longa']
  },
  tipo: {
    type: String,
    enum: ['reclamacao', 'sugestao', 'elogio'],
    required: true
  },
  categoria: {
    type: String,
    enum: [
      'infraestrutura',
      'ensino',
      'administracao',
      'tecnologia',
      'biblioteca',
      'cantina',
      'seguranca',
      'eventos',
      'outros'
    ],
    required: true
  },
  status: {
    type: String,
    enum: ['pendente', 'em_analise', 'encaminhado', 'resolvido', 'rejeitado'],
    default: 'pendente'
  },
  prioridade: {
    type: String,
    enum: ['baixa', 'media', 'alta', 'urgente'],
    default: 'media'
  },
  visibilidade: {
    type: String,
    enum: ['publico', 'privado', 'anonimo'],
    default: 'publico'
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  matriculaAutor: {
    type: String,
    required: true
  },
  // Ticket para atendimento
  ticket: {
    numero: { type: String, unique: true },
    status: {
      type: String,
      enum: ['aberto', 'atribuido', 'em_atendimento', 'pendente_cliente', 'resolvido', 'fechado', 'reaberto'],
      default: 'aberto'
    },
    atribuidoPara: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    servico: String, 
    avaliacao: {
      nota: { type: Number, min: 1, max: 5 },
      comentario: String,
      data: Date
    },
    historico: [historicoTicketSchema]
  },
  resposta: {
    mensagem: String,
    respondidoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    dataResposta: Date,
    anexos: [{
      nome: String,
      url: String,
      tipo: String
    }]
  },
  anexos: [{
    nome: String,
    url: String,
    tipo: String,
    tamanho: Number
  }],
  comentarios: [comentarioSchema],
  votos: {
    positivo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    negativo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  },
  visualizacoes: { type: Number, default: 0 },
  dataResolucao: Date,
  tempoResolucao: Number,
  tags: [String],
  setorResponsavel: String
}, {
  timestamps: true
});

// Índices
reclamacaoSchema.index({ status: 1, createdAt: -1 });
reclamacaoSchema.index({ autor: 1 });
reclamacaoSchema.index({ matriculaAutor: 1 });
reclamacaoSchema.index({ categoria: 1, tipo: 1 });
reclamacaoSchema.index({ 'ticket.status': 1 });
reclamacaoSchema.index({ 'ticket.atribuidoPara': 1 });

// Middleware pre-save
reclamacaoSchema.pre('save', async function() {
  if (this.isNew && !this.ticket.numero) {
    const ano = new Date().getFullYear();
    const count = await mongoose.model('Reclamacao').countDocuments();
    this.ticket.numero = `TKT-${ano}-${String(count + 1).padStart(5, '0')}`;
    
    this.ticket.historico.push({
      acao: 'criado',
      realizadoPor: this.autor,
      descricao: 'Ticket criado',
      data: new Date()
    });
  }

  if (this.isModified('status') && this.status === 'resolvido' && !this.dataResolucao) {
    this.dataResolucao = new Date();
    if (this.createdAt) {
      this.tempoResolucao = (this.dataResolucao - this.createdAt) / (1000 * 60 * 60);
    }
  }
});

// Virtuals
reclamacaoSchema.virtual('totalVotos').get(function() {
  return (this.votos?.positivo?.length || 0) - (this.votos?.negativo?.length || 0);
});

reclamacaoSchema.set('toJSON', { virtuals: true });
reclamacaoSchema.set('toObject', { virtuals: true });

const Reclamacao = mongoose.model('Reclamacao', reclamacaoSchema);

module.exports = Reclamacao;