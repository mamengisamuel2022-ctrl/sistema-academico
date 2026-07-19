const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true
  },
  senha: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  matricula: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  curso: {
    type: String,
    default: '',
    trim: true
  },
  tipo: {
    type: String,
    enum: ['estudante', 'admin', 'coordenador', 'atendente'],
    default: 'estudante'
  },
  // Áreas que o usuário pode gerenciar (apenas para admin/coordenador/atendente)
  areas: [{
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
    ]
  }],
  statusAtendimento: {
    type: String,
    enum: ['online', 'offline', 'ocupado'],
    default: 'offline'
  },
  estatisticas: {
    ticketsResolvidos: { type: Number, default: 0 },
    ticketsPendentes: { type: Number, default: 0 },
    tempoMedioResolucao: { type: Number, default: 0 },
    avaliacaoMedia: { type: Number, default: 0 }
  },
  ativo: {
    type: Boolean,
    default: true
  },
  ultimoAcesso: Date
}, {
  timestamps: true
});

// Middleware pre-save para hash de senha
userSchema.pre('save', async function() {
  if (this.isModified('senha')) {
    const salt = await bcrypt.genSalt(10);
    this.senha = await bcrypt.hash(this.senha, salt);
  }
});

// Método para comparar senhas
userSchema.methods.compararSenha = async function(senhaDigitada) {
  return await bcrypt.compare(senhaDigitada, this.senha);
};

// Método para verificar se usuário pode acessar uma categoria
userSchema.methods.podeAcessarCategoria = function(categoria) {
  // Admin pode tudo
  if (this.tipo === 'admin') return true;
  
  // Estudante não gerencia categorias
  if (this.tipo === 'estudante') return false;
  
  // Atendente/Coordenador verificam suas áreas
  return this.areas && this.areas.includes(categoria);
};

// Método para verificar se usuário é administrador
userSchema.methods.isAdmin = function() {
  return this.tipo === 'admin';
};

// Método para verificar se usuário é atendente ou superior
userSchema.methods.isAtendente = function() {
  return ['admin', 'coordenador', 'atendente'].includes(this.tipo);
};

const User = mongoose.model('User', userSchema);

module.exports = User;