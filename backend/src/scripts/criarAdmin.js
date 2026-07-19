const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function criarAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    const salt = await bcrypt.genSalt(10);
    const senhaAdmin = await bcrypt.hash('admin123', salt);
    const senhaPadrao = await bcrypt.hash('123456', salt);

    // ==========================================
    // 1. ADMIN PRINCIPAL
    // ==========================================
    let admin = await User.findOne({ email: 'admin@sistema.edu' });
    
    if (!admin) {
      admin = await User.create({
        nome: 'Administrador do Sistema',
        email: 'admin@sistema.edu',
        senha: senhaAdmin,
        matricula: 'ADMIN001',
        tipo: 'admin',
        areas: [
          'infraestrutura', 'ensino', 'administracao', 'tecnologia',
          'biblioteca', 'cantina', 'seguranca', 'eventos', 'outros'
        ],
        statusAtendimento: 'online',
        curso: 'Administração'
      });
      console.log('👑 ADMIN criado com sucesso!');
    } else {
      await User.findByIdAndUpdate(admin._id, {
        senha: senhaAdmin,
        tipo: 'admin',
        areas: [
          'infraestrutura', 'ensino', 'administracao', 'tecnologia',
          'biblioteca', 'cantina', 'seguranca', 'eventos', 'outros'
        ]
      });
      console.log('👑 ADMIN atualizado!');
    }
    console.log('   📧 admin@sistema.edu');
    console.log('   🔑 admin123');
    console.log('');

    // ==========================================
    // 2. COORDENADOR
    // ==========================================
    let coordenador = await User.findOne({ email: 'coordenador@sistema.edu' });
    
    if (!coordenador) {
      coordenador = await User.create({
        nome: 'Coordenador Acadêmico',
        email: 'coordenador@sistema.edu',
        senha: senhaPadrao,
        matricula: 'COORD001',
        tipo: 'coordenador',
        areas: ['ensino', 'administracao', 'biblioteca', 'eventos'],
        statusAtendimento: 'online',
        curso: 'Coordenação'
      });
      console.log('👔 COORDENADOR criado!');
    } else {
      await User.findByIdAndUpdate(coordenador._id, {
        senha: senhaPadrao,
        tipo: 'coordenador',
        areas: ['ensino', 'administracao', 'biblioteca', 'eventos']
      });
      console.log('👔 COORDENADOR atualizado!');
    }
    console.log('   📧 coordenador@sistema.edu');
    console.log('   🔑 123456');
    console.log('');

    // ==========================================
    // 3. ATENDENTES - USANDO findOneAndUpdate COM upsert
    // ==========================================
    console.log('👥 ATENDENTES POR CATEGORIA:');
    console.log('');

    const todosAtendentes = [
      {
        email: 'infra@sistema.edu',
        nome: 'Atendente Infraestrutura',
        matricula: 'ATEND001',
        areas: ['infraestrutura'],
        curso: 'Engenharia Civil',
        emoji: '🏗️'
      },
      {
        email: 'ensino@sistema.edu',
        nome: 'Atendente Ensino',
        matricula: 'ATEND002',
        areas: ['ensino'],
        curso: 'Pedagogia',
        emoji: '📚'
      },
      {
        email: 'adm@sistema.edu',
        nome: 'Atendente Administração',
        matricula: 'ATEND003',
        areas: ['administracao'],
        curso: 'Administração',
        emoji: '📋'
      },
      {
        email: 'ti@sistema.edu',
        nome: 'Atendente Tecnologia',
        matricula: 'ATEND004',
        areas: ['tecnologia'],
        curso: 'Ciência da Computação',
        emoji: '💻'
      },
      {
        email: 'biblioteca@sistema.edu',
        nome: 'Atendente Biblioteca',
        matricula: 'ATEND005',
        areas: ['biblioteca'],
        curso: 'Biblioteconomia',
        emoji: '📖'
      },
      {
        email: 'cantina@sistema.edu',
        nome: 'Atendente Cantina',
        matricula: 'ATEND006',
        areas: ['cantina'],
        curso: 'Nutrição',
        emoji: '🍽️'
      },
      {
        email: 'seguranca@sistema.edu',
        nome: 'Atendente Segurança',
        matricula: 'ATEND007',
        areas: ['seguranca'],
        curso: 'Segurança Patrimonial',
        emoji: '🛡️'
      },
      {
        email: 'eventos@sistema.edu',
        nome: 'Atendente Eventos',
        matricula: 'ATEND008',
        areas: ['eventos'],
        curso: 'Produção de Eventos',
        emoji: '🎉'
      },
      {
        email: 'geral@sistema.edu',
        nome: 'Atendente Geral',
        matricula: 'ATEND009',
        areas: ['outros'],
        curso: 'Atendimento Geral',
        emoji: '📌'
      }
    ];

    for (const atendente of todosAtendentes) {
      try {
        // ✅ Usar findOneAndUpdate com upsert para evitar duplicatas
        const resultado = await User.findOneAndUpdate(
          { email: atendente.email },  // Buscar por email
          {
            $setOnInsert: { matricula: atendente.matricula }, // Só define matrícula se for novo
            $set: {
              nome: atendente.nome,
              email: atendente.email,
              senha: senhaPadrao,
              tipo: 'atendente',
              areas: atendente.areas,
              curso: atendente.curso,
              statusAtendimento: 'online'
            }
          },
          { 
            upsert: true,  // Cria se não existir
            new: true,     // Retorna o documento atualizado
            runValidators: true
          }
        );

        console.log(`   ${atendente.emoji} ${atendente.nome}`);
        console.log(`      📧 ${atendente.email}`);
        console.log(`      🔑 123456`);
        console.log(`      📂 Categoria: ${atendente.areas[0]}`);
        console.log(`      ✅ ${resultado._id ? 'Criado/Atualizado' : 'OK'}`);
        console.log('');
      } catch (err) {
        console.log(`   ${atendente.emoji} ${atendente.nome}`);
        console.log(`      ⚠️ Já existe com matrícula diferente, pulando...`);
        console.log(`      📧 ${atendente.email}`);
        console.log('');
      }
    }

    // ==========================================
    // 4. ESTUDANTES
    // ==========================================
    console.log('👨‍🎓 ESTUDANTES:');
    console.log('');

    const estudantes = [
      {
        email: 'ruthcololo8897@gmail.com',
        nome: 'Mamengi Samuel',
        matricula: '20252314',
        curso: 'Direito'
      },
      {
        email: 'joao@sistema.edu',
        nome: 'João Silva',
        matricula: '20240001',
        curso: 'Engenharia'
      },
      {
        email: 'maria@sistema.edu',
        nome: 'Maria Santos',
        matricula: '20240002',
        curso: 'Medicina'
      },
      {
        email: 'pedro@sistema.edu',
        nome: 'Pedro Costa',
        matricula: '20240003',
        curso: 'Administração'
      }
    ];

    for (const estudante of estudantes) {
      try {
        // Verificar se já existe com outro tipo
        const existente = await User.findOne({ email: estudante.email });
        
        if (existente && ['admin', 'atendente', 'coordenador'].includes(existente.tipo)) {
          console.log(`   👨‍🎓 ${estudante.nome}`);
          console.log(`      ⚠️ Já é ${existente.tipo}, mantendo tipo atual`);
          console.log(`      📧 ${estudante.email}`);
          console.log('');
          continue;
        }

        await User.findOneAndUpdate(
          { email: estudante.email },
          {
            $setOnInsert: { matricula: estudante.matricula },
            $set: {
              nome: estudante.nome,
              email: estudante.email,
              senha: senhaPadrao,
              tipo: 'estudante',
              areas: [],
              curso: estudante.curso,
              statusAtendimento: 'offline'
            }
          },
          { upsert: true, new: true }
        );

        console.log(`   👨‍🎓 ${estudante.nome}`);
        console.log(`      📧 ${estudante.email}`);
        console.log(`      🔑 123456`);
        console.log(`      🆔 Matrícula: ${estudante.matricula}`);
        console.log(`      📖 Curso: ${estudante.curso}`);
        console.log('');
      } catch (err) {
        console.log(`   👨‍🎓 ${estudante.nome}`);
        console.log(`      ⚠️ Erro: ${err.message}`);
        console.log('');
      }
    }

    // ==========================================
    // 5. RESUMO
    // ==========================================
    console.log('━'.repeat(60));
    console.log('   📊 RESUMO FINAL');
    console.log('━'.repeat(60));
    console.log('');

    const total = await User.countDocuments();
    const totalAdmin = await User.countDocuments({ tipo: 'admin' });
    const totalCoord = await User.countDocuments({ tipo: 'coordenador' });
    const totalAtend = await User.countDocuments({ tipo: 'atendente' });
    const totalEstud = await User.countDocuments({ tipo: 'estudante' });

    console.log(`   📊 Total de usuários: ${total}`);
    console.log(`   👑 Admin: ${totalAdmin}`);
    console.log(`   👔 Coordenadores: ${totalCoord}`);
    console.log(`   👥 Atendentes: ${totalAtend}`);
    console.log(`   👨‍🎓 Estudantes: ${totalEstud}`);
    console.log('');

    console.log('━'.repeat(60));
    console.log('   🔑 CREDENCIAIS PADRÃO');
    console.log('━'.repeat(60));
    console.log('');
    console.log('   👑 ADMIN:');
    console.log('      admin@sistema.edu / admin123');
    console.log('');
    console.log('   👔 COORDENADOR:');
    console.log('      coordenador@sistema.edu / 123456');
    console.log('');
    console.log('   👥 ATENDENTES (senha: 123456):');
    console.log('      🏗️  infra@sistema.edu       - Infraestrutura');
    console.log('      📚 ensino@sistema.edu        - Ensino');
    console.log('      📋 adm@sistema.edu           - Administração');
    console.log('      💻 ti@sistema.edu            - Tecnologia');
    console.log('      📖 biblioteca@sistema.edu    - Biblioteca');
    console.log('      🍽️  cantina@sistema.edu      - Cantina');
    console.log('      🛡️  seguranca@sistema.edu    - Segurança');
    console.log('      🎉 eventos@sistema.edu       - Eventos');
    console.log('      📌 geral@sistema.edu         - Geral');
    console.log('');
    console.log('   👨‍🎓 ESTUDANTES (senha: 123456):');
    console.log('      ruthcololo8897@gmail.com');
    console.log('      joao@sistema.edu');
    console.log('      maria@sistema.edu');
    console.log('      pedro@sistema.edu');
    console.log('');
    console.log('━'.repeat(60));
    console.log('   ✅ Script executado com sucesso!');
    console.log('   💡 Use estas credenciais para testar o sistema.');
    console.log('━'.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

criarAdmin();