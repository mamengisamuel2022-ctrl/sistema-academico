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
  
  // Responder imediatamente a OPTIONS
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

// Rotas
app.get('/', (req, res) => {
  res.json({ message: 'API Online' });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online',
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/reclamacoes', require('./routes/reclamacoes'));

// Tratamento de erros
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