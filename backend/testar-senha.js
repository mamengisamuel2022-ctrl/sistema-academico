const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');

async function testar() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Buscar TODOS os usuários (com senha)
    const usuarios = await User.find({}).select('+senha');
    
    console.log(`📊 Total de usuários: ${usuarios.length}\n`);
    
    for (const user of usuarios) {
      console.log('━'.repeat(50));
      console.log(`👤 Usuário: ${user.nome}`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`🔑 Senha hash: ${user.senha.substring(0, 20)}...`);
      console.log(`👤 Tipo: ${user.tipo}`);
      
      // Testar senha '123456'
      const teste123456 = await bcrypt.compare('123456', user.senha);
      console.log(`✅ Senha '123456' funciona: ${teste123456}`);
      
      // Testar senha 'admin123'
      const testeAdmin = await bcrypt.compare('admin123', user.senha);
      console.log(`✅ Senha 'admin123' funciona: ${testeAdmin}`);
    }

    console.log('\n━'.repeat(50));
    console.log('💡 Se as senhas não funcionarem, execute:');
    console.log('   node src/scripts/criarAdmin.js');

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testar();