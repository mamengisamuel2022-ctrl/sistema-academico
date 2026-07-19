const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const gerarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'sistema_academico_secret_2024', {
    expiresIn: '7d'
  });
};

exports.registrar = async (req, res) => {
  try {
    console.log('📝 Registro - Dados recebidos:', { ...req.body, senha: '***' });
    
    const { nome, email, senha, matricula, curso } = req.body;

    // Validações
    if (!nome || !email || !senha || !matricula) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: nome, email, senha, matricula'
      });
    }

    // Verificar se email ou matrícula já existem
    const existente = await User.findOne({ 
      $or: [
        { email: email.toLowerCase().trim() },
        { matricula: matricula.trim() }
      ]
    });

    if (existente) {
      const campo = existente.email === email.toLowerCase().trim() ? 'email' : 'matrícula';
      return res.status(400).json({
        success: false,
        error: `Este ${campo} já está cadastrado`
      });
    }

    // Criar usuário com senha em texto puro (o middleware fará o hash)
    const usuario = await User.create({
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      senha: senha, // middleware fará o hash
      matricula: matricula.trim(),
      curso: curso ? curso.trim() : ''
    });

    console.log('✅ Registro - Usuário criado:', usuario._id);

    // Gerar token
    const token = gerarToken(usuario._id);

    res.status(201).json({
      success: true,
      token,
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        matricula: usuario.matricula,
        curso: usuario.curso,
        tipo: usuario.tipo
      }
    });

  } catch (error) {
    console.error('❌ Erro no registro:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: messages.join('. ')
      });
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Email ou matrícula já cadastrados'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, senha } = req.body;
    console.log('🔑 Login - Tentativa:', { email, senha: '***' });

    if (!email || !senha) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    // Buscar usuário COM senha
    const usuario = await User.findOne({ 
      email: email.toLowerCase().trim() 
    }).select('+senha');

    console.log('🔍 Login - Usuário encontrado:', usuario ? 'Sim' : 'Não');

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    // Verificar senha
    console.log('🔐 Login - Verificando senha...');
    const senhaValida = await usuario.compararSenha(senha);
    console.log('🔐 Login - Senha válida:', senhaValida);
    
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha inválidos'
      });
    }

    // Atualizar último acesso
    usuario.ultimoAcesso = new Date();
    await usuario.save();

    // Gerar token
    const token = gerarToken(usuario._id);

    console.log('✅ Login - Sucesso:', usuario.email);

    res.json({
      success: true,
      token,
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        matricula: usuario.matricula,
        curso: usuario.curso,
        tipo: usuario.tipo
      }
    });

  } catch (error) {
    console.error('❌ Erro no login:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao fazer login'
    });
  }
};

exports.perfil = async (req, res) => {
  try {
    const usuario = await User.findById(req.user.id);
    
    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      usuario
    });

  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar perfil'
    });
  }
};