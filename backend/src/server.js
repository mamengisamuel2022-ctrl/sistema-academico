const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose'); // ✅ Movido para cá
require('dotenv').config();

const connectDB = require('./config/database');

connectDB();

const app = express();

// Criar diretório de uploads
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// CORS - Permitir tudo temporariamente para debug
app.use(cors({
  origin: '*',
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reclamacoes', require('./routes/reclamacoes'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'conectado' : 'desconectado'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({ message: 'API do Sistema Acadêmico' });
});

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro:', err.message);
  res.status(500).json({
    success: false,
    error: err.message || 'Erro interno do servidor'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});