const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const connectDB = require('./config/database');

// Conectar ao banco de dados
connectDB();

const app = express();

// Criar diretório de uploads
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Middlewares básicos
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', uploadDir)));

// Rotas da API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/reclamacoes', require('./routes/reclamacoes'));

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
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