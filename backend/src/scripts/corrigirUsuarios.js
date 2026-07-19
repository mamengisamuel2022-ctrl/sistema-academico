const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function corrigirUsuarios() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    const usuarios = await User.find({});
    
    for (const user of usuarios) {
      console.log(`🔄 Corrigindo: ${user.nome} (${user.email})`);
      
      // Gerar novo hash para senha '123456'
      const salt = await bcrypt.genSalt(10);
      const novaSenhaHash = await bcrypt.hash('123456', salt);
      
      // Atualizar usuário
      const updates = {
        senha: novaSenhaHash,
        tipo: 'admin', // Tornar admin
        areas: [
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
        statusAtendimento: 'online'
      };
      
      await User.findByIdAndUpdate(user._id, updates);
      
      console.log(`   ✅ Senha: 123456`);
      console.log(`   ✅ Tipo: admin`);
      console.log(`   ✅ Áreas: todas`);
      console.log('');
    }

    console.log('━'.repeat(50));
    console.log('✅ TODOS OS USUÁRIOS FORAM CORRIGIDOS!');
    console.log('━'.repeat(50));
    console.log('');
    console.log('📋 Credenciais de acesso:');
    console.log('');
    
    for (const user of usuarios) {
      console.log(`   📧 ${user.email}`);
      console.log(`   🔑 Senha: 123456`);
      console.log(`   👤 Tipo: admin (acesso total)`);
      console.log('');
    }

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

corrigirUsuarios();