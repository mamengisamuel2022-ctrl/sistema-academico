const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Verificar se a URI está definida
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      console.error('❌ ERRO: MONGODB_URI não está definida no arquivo .env');
      console.log('📝 Certifique-se de criar o arquivo .env com MONGODB_URI=mongodb://localhost:27017/sistema-academico');
      process.exit(1);
    }

    console.log('🔄 Tentando conectar ao MongoDB...');
    console.log(`📝 URI: ${mongoURI}`);

    const conn = await mongoose.connect(mongoURI, {
      // Removendo opções depreciadas
    });
    
    console.log(`✅ MongoDB conectado com sucesso: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ Erro ao conectar ao MongoDB: ${error.message}`);
    console.error('📝 Verifique se:');
    console.error('   1. MongoDB está instalado e rodando');
    console.error('   2. A URI está correta no arquivo .env');
    console.error('   3. O serviço do MongoDB está ativo');
    process.exit(1);
  }
};

module.exports = connectDB;