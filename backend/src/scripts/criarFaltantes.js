const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function criarFaltantes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    const salt = await bcrypt.genSalt(10);
    const senhaPadrao = await bcrypt.hash('123456', salt);
    const senhaAdmin = await bcrypt.hash('admin123', salt);

    const usuariosParaCriar = [
      // Admin
      { email: 'admin@sistema.edu', nome: 'Administrador do Sistema', senha: senhaAdmin, matricula: 'ADMIN001', tipo: 'admin', areas: ['infraestrutura','ensino','administracao','tecnologia','biblioteca','cantina','seguranca','eventos','outros'] },
      
      // Coordenador
      { email: 'coordenador@sistema.edu', nome: 'Coordenador Acadêmico', senha: senhaPadrao, matricula: 'COORD001', tipo: 'coordenador', areas: ['ensino','administracao','biblioteca','eventos'] },
      
      // Atendentes
      { email: 'infra@sistema.edu', nome: 'Atendente Infraestrutura', senha: senhaPadrao, matricula: 'ATEND101', tipo: 'atendente', areas: ['infraestrutura'] },
      { email: 'ensino@sistema.edu', nome: 'Atendente Ensino', senha: senhaPadrao, matricula: 'ATEND102', tipo: 'atendente', areas: ['ensino'] },
      { email: 'adm@sistema.edu', nome: 'Atendente Administração', senha: senhaPadrao, matricula: 'ATEND103', tipo: 'atendente', areas: ['administracao'] },
      { email: 'ti@sistema.edu', nome: 'Atendente Tecnologia', senha: senhaPadrao, matricula: 'ATEND104', tipo: 'atendente', areas: ['tecnologia'] },
      { email: 'biblioteca@sistema.edu', nome: 'Atendente Biblioteca', senha: senhaPadrao, matricula: 'ATEND105', tipo: 'atendente', areas: ['biblioteca'] },
      { email: 'cantina@sistema.edu', nome: 'Atendente Cantina', senha: senhaPadrao, matricula: 'ATEND106', tipo: 'atendente', areas: ['cantina'] },
      { email: 'seguranca@sistema.edu', nome: 'Atendente Segurança', senha: senhaPadrao, matricula: 'ATEND107', tipo: 'atendente', areas: ['seguranca'] },
      { email: 'eventos@sistema.edu', nome: 'Atendente Eventos', senha: senhaPadrao, matricula: 'ATEND108', tipo: 'atendente', areas: ['eventos'] },
      { email: 'geral@sistema.edu', nome: 'Atendente Geral', senha: senhaPadrao, matricula: 'ATEND109', tipo: 'atendente', areas: ['outros'] },
      
      // Estudantes
      { email: 'ruthcololo8897@gmail.com', nome: 'Mamengi Samuel', senha: senhaPadrao, matricula: '20252314', tipo: 'estudante', areas: [] },
      { email: 'joao@sistema.edu', nome: 'João Silva', senha: senhaPadrao, matricula: '20240001', tipo: 'estudante', areas: [] },
      { email: 'maria@sistema.edu', nome: 'Maria Santos', senha: senhaPadrao, matricula: '20240002', tipo: 'estudante', areas: [] },
      { email: 'pedro@sistema.edu', nome: 'Pedro Costa', senha: senhaPadrao, matricula: '20240003', tipo: 'estudante', areas: [] }
    ];

    let criados = 0;
    let atualizados = 0;
    let erros = 0;

    for (const user of usuariosParaCriar) {
      try {
        const existente = await User.findOne({ email: user.email });
        
        if (existente) {
          // Atualizar senha e tipo
          await User.findByIdAndUpdate(existente._id, {
            senha: user.senha,
            tipo: user.tipo,
            areas: user.areas,
            nome: user.nome,
            statusAtendimento: user.tipo !== 'estudante' ? 'online' : 'offline'
          });
          atualizados++;
          console.log(`🔄 ATUALIZADO: ${user.email} (${user.tipo})`);
        } else {
          // Criar novo
          await User.create({
            ...user,
            statusAtendimento: user.tipo !== 'estudante' ? 'online' : 'offline',
            curso: user.tipo === 'estudante' ? 'Não definido' : 'Atendimento'
          });
          criados++;
          console.log(`✅ CRIADO: ${user.email} (${user.tipo})`);
        }
      } catch (error) {
        erros++;
        console.log(`❌ ERRO: ${user.email} - ${error.message}`);
      }
    }

    console.log('\n━'.repeat(50));
    console.log(`📊 Total: ${criados} criados, ${atualizados} atualizados, ${erros} erros`);
    console.log('━'.repeat(50));
    
    // Lista final
    const todos = await User.find({}).select('email tipo nome');
    console.log('\n📋 TODOS OS USUÁRIOS:');
    todos.forEach(u => {
      const tipo = u.tipo === 'admin' ? '👑' : u.tipo === 'coordenador' ? '👔' : u.tipo === 'atendente' ? '👥' : '👨‍🎓';
      console.log(`${tipo} ${u.email} - ${u.nome} (${u.tipo})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

criarFaltantes();