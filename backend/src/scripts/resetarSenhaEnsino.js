const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function resetarSenhaEnsino() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar o atendente de ensino
    const usuario = await User.findOne({ email: 'ensino@sistema.edu' });

    if (!usuario) {
      console.log('❌ Usuário ensino@sistema.edu não encontrado!');
      
      // Criar o usuário se não existir
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash('123456', salt);
      
      const novo = await User.create({
        nome: 'Atendente Ensino',
        email: 'ensino@sistema.edu',
        senha: senhaHash,
        matricula: 'ATEND102',
        tipo: 'atendente',
        areas: ['ensino'],
        curso: 'Pedagogia',
        statusAtendimento: 'online'
      });
      
      console.log('✅ Atendente Ensino CRIADO:');
      console.log('   📧 ensino@sistema.edu');
      console.log('   🔑 123456');
      console.log('   📂 Categoria: ensino');
    } else {
      // Resetar senha
      const salt = await bcrypt.genSalt(10);
      const novaSenha = await bcrypt.hash('123456', salt);
      
      await User.findByIdAndUpdate(usuario._id, {
        senha: novaSenha,
        tipo: 'atendente',
        areas: ['ensino'],
        curso: 'Pedagogia',
        statusAtendimento: 'online'
      });
      
      console.log('✅ Senha do Atendente Ensino RESETADA:');
      console.log('   📧 ensino@sistema.edu');
      console.log('   🔑 123456');
      console.log('   📂 Categoria: ensino');
    }

    // Verificar se a senha funciona
    const verificado = await User.findOne({ email: 'ensino@sistema.edu' }).select('+senha');
    if (verificado) {
      const senhaOk = await bcrypt.compare('123456', verificado.senha);
      console.log(`\n🔍 Teste de senha: ${senhaOk ? '✅ FUNCIONA' : '❌ NÃO FUNCIONA'}`);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

resetarSenhaEnsino();