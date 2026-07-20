const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ✅ CORS - Permitir TUDO de qualquer origem
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false
}));

// ✅ Headers manuais como garantia extra
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB conectado'))
  .catch(err => console.error('❌ MongoDB erro:', err.message));

// ============================================
// Rota raiz
// ============================================
app.get('/', (req, res) => {
  res.json({ message: 'API Online' });
});

// ============================================
// Health check
// ============================================
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

// ============================================
// ⚠️ ROTA TEMPORÁRIA - CRIAR USUÁRIOS
// Executar apenas UMA VEZ e depois REMOVER
// ============================================
app.get('/api/setup', async (req, res) => {
  try {
    const bcrypt = require('bcryptjs');
    const User = require('./models/User');
    const salt = await bcrypt.genSalt(10);
    
    const usuarios = [
      {
        email: 'admin@sistema.edu',
        nome: 'Administrador do Sistema',
        senha: await bcrypt.hash('admin123', salt),
        tipo: 'admin',
        matricula: 'ADMIN001',
        areas: ['infraestrutura','ensino','administracao','tecnologia','biblioteca','cantina','seguranca','eventos','outros'],
        statusAtendimento: 'online',
        curso: 'Administração'
      },
      {
        email: 'coordenador@sistema.edu',
        nome: 'Coordenador Acadêmico',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'coordenador',
        matricula: 'COORD001',
        areas: ['ensino','administracao','biblioteca','eventos'],
        statusAtendimento: 'online',
        curso: 'Coordenação'
      },
      {
        email: 'infra@sistema.edu',
        nome: 'Atendente Infraestrutura',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND101',
        areas: ['infraestrutura'],
        statusAtendimento: 'online',
        curso: 'Engenharia Civil'
      },
      {
        email: 'ensino@sistema.edu',
        nome: 'Atendente Ensino',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND102',
        areas: ['ensino'],
        statusAtendimento: 'online',
        curso: 'Pedagogia'
      },
      {
        email: 'adm@sistema.edu',
        nome: 'Atendente Administração',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND103',
        areas: ['administracao'],
        statusAtendimento: 'online',
        curso: 'Administração'
      },
      {
        email: 'ti@sistema.edu',
        nome: 'Atendente Tecnologia',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND104',
        areas: ['tecnologia'],
        statusAtendimento: 'online',
        curso: 'Ciência da Computação'
      },
      {
        email: 'biblioteca@sistema.edu',
        nome: 'Atendente Biblioteca',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND105',
        areas: ['biblioteca'],
        statusAtendimento: 'online',
        curso: 'Biblioteconomia'
      },
      {
        email: 'cantina@sistema.edu',
        nome: 'Atendente Cantina',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND106',
        areas: ['cantina'],
        statusAtendimento: 'online',
        curso: 'Nutrição'
      },
      {
        email: 'seguranca@sistema.edu',
        nome: 'Atendente Segurança',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND107',
        areas: ['seguranca'],
        statusAtendimento: 'online',
        curso: 'Segurança'
      },
      {
        email: 'eventos@sistema.edu',
        nome: 'Atendente Eventos',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND108',
        areas: ['eventos'],
        statusAtendimento: 'online',
        curso: 'Eventos'
      },
      {
        email: 'geral@sistema.edu',
        nome: 'Atendente Geral',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'atendente',
        matricula: 'ATEND109',
        areas: ['outros'],
        statusAtendimento: 'online',
        curso: 'Geral'
      },
      {
        email: 'ruthcololo8897@gmail.com',
        nome: 'Mamengi Samuel',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'estudante',
        matricula: '20252314',
        areas: [],
        statusAtendimento: 'offline',
        curso: 'Direito'
      },
      {
        email: 'joao@sistema.edu',
        nome: 'João Silva',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'estudante',
        matricula: '20240001',
        areas: [],
        statusAtendimento: 'offline',
        curso: 'Engenharia'
      },
      {
        email: 'maria@sistema.edu',
        nome: 'Maria Santos',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'estudante',
        matricula: '20240002',
        areas: [],
        statusAtendimento: 'offline',
        curso: 'Medicina'
      },
      {
        email: 'pedro@sistema.edu',
        nome: 'Pedro Costa',
        senha: await bcrypt.hash('123456', salt),
        tipo: 'estudante',
        matricula: '20240003',
        areas: [],
        statusAtendimento: 'offline',
        curso: 'Administração'
      }
    ];

    const resultados = [];
    
    for (const u of usuarios) {
      const existe = await User.findOne({ email: u.email });
      
      if (existe) {
        await User.findByIdAndUpdate(existe._id, { $set: u });
        resultados.push(`🔄 Atualizado: ${u.email} (${u.tipo})`);
      } else {
        await User.create(u);
        resultados.push(`✅ Criado: ${u.email} (${u.tipo})`);
      }
    }

    const total = await User.countDocuments();

    res.json({
      success: true,
      message: `${resultados.length} usuários processados!`,
      total,
      resultados
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// ============================================
// Rotas da API
// ============================================
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reclamacoes', require('./routes/reclamacoes'));

// ============================================
// Tratamento de erros
// ============================================
app.use((err, req, res, next) => {
  console.error('❌ Erro:', err.message);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});