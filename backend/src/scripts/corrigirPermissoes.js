const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function corrigirPermissoes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Gerar hash para senha padrão
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash('123456', salt);

    // 1. CORRIGIR ADMIN PRINCIPAL
    const admin = await User.findOne({ email: 'admin@sistema.edu' });
    if (admin) {
      await User.findByIdAndUpdate(admin._id, {
        senha: senhaHash,
        tipo: 'admin',
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
      });
      console.log('✅ Admin principal configurado:');
      console.log('   📧 admin@sistema.edu');
      console.log('   🔑 123456');
      console.log('   👑 Acesso TOTAL (admin)\n');
    }

    // 2. CORRIGIR ATENDENTES (mantêm acesso restrito às suas áreas)
    const atendenteTI = await User.findOne({ email: 'ti@sistema.edu' });
    if (atendenteTI) {
      await User.findByIdAndUpdate(atendenteTI._id, {
        senha: senhaHash,
        tipo: 'atendente',
        areas: ['tecnologia'],
        statusAtendimento: 'online'
      });
      console.log('✅ Atendente TI configurado:');
      console.log('   📧 ti@sistema.edu');
      console.log('   🔑 123456');
      console.log('   🖥️ Acesso apenas: tecnologia\n');
    }

    const atendenteInfra = await User.findOne({ email: 'infra@sistema.edu' });
    if (atendenteInfra) {
      await User.findByIdAndUpdate(atendenteInfra._id, {
        senha: senhaHash,
        tipo: 'atendente',
        areas: ['infraestrutura'],
        statusAtendimento: 'online'
      });
      console.log('✅ Atendente Infraestrutura configurado:');
      console.log('   📧 infra@sistema.edu');
      console.log('   🔑 123456');
      console.log('   🏗️ Acesso apenas: infraestrutura\n');
    }

    // 3. CORRIGIR TODOS OS ESTUDANTES (acesso básico)
    const estudantes = await User.find({ 
      tipo: { $ne: 'admin' },
      email: { $nin: ['ti@sistema.edu', 'infra@sistema.edu', 'admin@sistema.edu'] }
    });

    for (const estudante of estudantes) {
      await User.findByIdAndUpdate(estudante._id, {
        senha: senhaHash,
        tipo: 'estudante',
        areas: [],
        statusAtendimento: 'offline'
      });
    }

    console.log(`✅ ${estudantes.length} estudantes configurados:`);
    estudantes.forEach(e => {
      console.log(`   📧 ${e.email} - 👨‍🎓 Estudante`);
    });

    console.log('\n' + '━'.repeat(50));
    console.log('📋 RESUMO DAS PERMISSÕES:');
    console.log('━'.repeat(50));
    console.log('');
    console.log('👑 ADMIN (acesso total):');
    console.log('   📧 admin@sistema.edu / 🔑 123456');
    console.log('   - Vê todas as reclamações');
    console.log('   - Atende qualquer categoria');
    console.log('   - Acessa dashboard completo');
    console.log('   - Gerencia usuários');
    console.log('');
    console.log('🖥️ ATENDENTES (acesso por área):');
    console.log('   📧 ti@sistema.edu / 🔑 123456 - Área: tecnologia');
    console.log('   📧 infra@sistema.edu / 🔑 123456 - Área: infraestrutura');
    console.log('   - Veem apenas reclamações da sua área');
    console.log('   - Atendem apenas sua categoria');
    console.log('   - Dashboard da sua área');
    console.log('');
    console.log('👨‍🎓 ESTUDANTES (acesso básico):');
    estudantes.forEach(e => {
      console.log(`   📧 ${e.email} / 🔑 123456`);
    });
    console.log('   - Criam reclamações/sugestões/elogios');
    console.log('   - Veem apenas suas próprias reclamações');
    console.log('   - Comentam e votam');
    console.log('');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

corrigirPermissoes();