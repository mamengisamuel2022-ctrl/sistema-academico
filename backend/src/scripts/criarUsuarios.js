const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');

async function criarUsuarios() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');
    console.log('━'.repeat(60));
    console.log('   CRIANDO USUÁRIOS DO SISTEMA ACADÊMICO');
    console.log('━'.repeat(60));
    console.log('');

    const salt = await bcrypt.genSalt(10);
    const senhaPadrao = await bcrypt.hash('123456', salt);

    // ==========================================
    // 1. ADMIN PRINCIPAL
    // ==========================================
    const adminExiste = await User.findOne({ email: 'admin@sistema.edu' });
    
    if (!adminExiste) {
      await User.create({
        nome: 'Administrador do Sistema',
        email: 'admin@sistema.edu',
        senha: senhaPadrao,
        matricula: 'ADMIN001',
        tipo: 'admin',
        areas: [
          'infraestrutura', 'ensino', 'administracao', 'tecnologia',
          'biblioteca', 'cantina', 'seguranca', 'eventos', 'outros'
        ],
        statusAtendimento: 'online',
        curso: 'Administração'
      });
      console.log('👑 ADMIN criado:');
      console.log('   📧 admin@sistema.edu');
      console.log('   🔑 123456');
      console.log('   👤 Tipo: admin (acesso TOTAL)');
      console.log('');
    } else {
      // Atualizar admin existente
      await User.findByIdAndUpdate(adminExiste._id, {
        tipo: 'admin',
        areas: [
          'infraestrutura', 'ensino', 'administracao', 'tecnologia',
          'biblioteca', 'cantina', 'seguranca', 'eventos', 'outros'
        ],
        statusAtendimento: 'online'
      });
      console.log('👑 ADMIN atualizado: admin@sistema.edu');
      console.log('');
    }

    // ==========================================
    // 2. ATENDENTES POR CATEGORIA
    // ==========================================
    
    const atendentes = [
      {
        nome: 'Atendente Infraestrutura',
        email: 'infra@sistema.edu',
        matricula: 'ATEND001',
        tipo: 'atendente',
        areas: ['infraestrutura'],
        curso: 'Engenharia Civil'
      },
      {
        nome: 'Atendente Ensino',
        email: 'ensino@sistema.edu',
        matricula: 'ATEND002',
        tipo: 'atendente',
        areas: ['ensino'],
        curso: 'Pedagogia'
      },
      {
        nome: 'Atendente Administração',
        email: 'adm@sistema.edu',
        matricula: 'ATEND003',
        tipo: 'atendente',
        areas: ['administracao'],
        curso: 'Administração'
      },
      {
        nome: 'Atendente Tecnologia',
        email: 'ti@sistema.edu',
        matricula: 'ATEND004',
        tipo: 'atendente',
        areas: ['tecnologia'],
        curso: 'Ciência da Computação'
      },
      {
        nome: 'Atendente Biblioteca',
        email: 'biblioteca@sistema.edu',
        matricula: 'ATEND005',
        tipo: 'atendente',
        areas: ['biblioteca'],
        curso: 'Biblioteconomia'
      },
      {
        nome: 'Atendente Cantina',
        email: 'cantina@sistema.edu',
        matricula: 'ATEND006',
        tipo: 'atendente',
        areas: ['cantina'],
        curso: 'Nutrição'
      },
      {
        nome: 'Atendente Segurança',
        email: 'seguranca@sistema.edu',
        matricula: 'ATEND007',
        tipo: 'atendente',
        areas: ['seguranca'],
        curso: 'Segurança'
      },
      {
        nome: 'Atendente Eventos',
        email: 'eventos@sistema.edu',
        matricula: 'ATEND008',
        tipo: 'atendente',
        areas: ['eventos'],
        curso: 'Eventos'
      },
      {
        nome: 'Atendente Geral',
        email: 'geral@sistema.edu',
        matricula: 'ATEND009',
        tipo: 'atendente',
        areas: ['outros'],
        curso: 'Atendimento Geral'
      }
    ];

    const emojisCategoria = {
      infraestrutura: '🏗️',
      ensino: '📚',
      administracao: '📋',
      tecnologia: '💻',
      biblioteca: '📖',
      cantina: '🍽️',
      seguranca: '🛡️',
      eventos: '🎉',
      outros: '📌'
    };

    console.log('👥 ATENDENTES POR CATEGORIA:');
    console.log('');

    for (const atendente of atendentes) {
      const existe = await User.findOne({ email: atendente.email });
      
      if (!existe) {
        await User.create({
          ...atendente,
          senha: senhaPadrao,
          statusAtendimento: 'online'
        });
        console.log(`   ${emojisCategoria[atendente.areas[0]]} ${atendente.nome}`);
        console.log(`      📧 ${atendente.email}`);
        console.log(`      🔑 123456`);
        console.log(`      📂 Categoria: ${atendente.areas[0]}`);
        console.log('');
      } else {
        // Atualizar atendente existente
        await User.findByIdAndUpdate(existe._id, {
          tipo: 'atendente',
          areas: atendente.areas,
          statusAtendimento: 'online',
          curso: atendente.curso
        });
        console.log(`   ${emojisCategoria[atendente.areas[0]]} ${atendente.nome} (atualizado)`);
        console.log(`      📧 ${atendente.email}`);
        console.log('');
      }
    }

    // ==========================================
    // 3. COORDENADOR (múltiplas áreas)
    // ==========================================
    const coordExiste = await User.findOne({ email: 'coordenador@sistema.edu' });
    
    if (!coordExiste) {
      await User.create({
        nome: 'Coordenador Acadêmico',
        email: 'coordenador@sistema.edu',
        senha: senhaPadrao,
        matricula: 'COORD001',
        tipo: 'coordenador',
        areas: ['ensino', 'administracao', 'biblioteca', 'eventos'],
        statusAtendimento: 'online',
        curso: 'Coordenação'
      });
      console.log('👔 COORDENADOR criado:');
      console.log('   📧 coordenador@sistema.edu');
      console.log('   🔑 123456');
      console.log('   📂 Áreas: ensino, administração, biblioteca, eventos');
      console.log('');
    } else {
      await User.findByIdAndUpdate(coordExiste._id, {
        tipo: 'coordenador',
        areas: ['ensino', 'administracao', 'biblioteca', 'eventos']
      });
      console.log('👔 COORDENADOR atualizado: coordenador@sistema.edu');
      console.log('');
    }

    // ==========================================
    // 4. ESTUDANTES DE EXEMPLO
    // ==========================================
    const estudantes = [
      {
        nome: 'Mamengi Samuel',
        email: 'ruthcololo8897@gmail.com',
        matricula: '20252314',
        curso: 'Direito'
      },
      {
        nome: 'João Silva',
        email: 'joao@sistema.edu',
        matricula: '20240001',
        curso: 'Engenharia'
      },
      {
        nome: 'Maria Santos',
        email: 'maria@sistema.edu',
        matricula: '20240002',
        curso: 'Medicina'
      },
      {
        nome: 'Pedro Costa',
        email: 'pedro@sistema.edu',
        matricula: '20240003',
        curso: 'Administração'
      }
    ];

    console.log('👨‍🎓 ESTUDANTES:');
    console.log('');

    for (const estudante of estudantes) {
      const existe = await User.findOne({ email: estudante.email });
      
      if (!existe) {
        await User.create({
          ...estudante,
          senha: senhaPadrao,
          tipo: 'estudante',
          areas: [],
          statusAtendimento: 'offline'
        });
        console.log(`   👨‍🎓 ${estudante.nome}`);
        console.log(`      📧 ${estudante.email}`);
        console.log(`      🔑 123456`);
        console.log(`      📖 Curso: ${estudante.curso}`);
        console.log(`      🆔 Matrícula: ${estudante.matricula}`);
        console.log('');
      } else {
        // Apenas atualizar tipo para estudante se necessário
        if (existe.tipo !== 'admin' && existe.tipo !== 'atendente' && existe.tipo !== 'coordenador') {
          await User.findByIdAndUpdate(existe._id, {
            tipo: 'estudante',
            areas: [],
            statusAtendimento: 'offline',
            curso: estudante.curso || existe.curso
          });
        }
        console.log(`   👨‍🎓 ${estudante.nome} (já existente - atualizado)`);
        console.log(`      📧 ${estudante.email}`);
        console.log('');
      }
    }

    // ==========================================
    // RESUMO FINAL
    // ==========================================
    console.log('━'.repeat(60));
    console.log('   📊 RESUMO DO SISTEMA');
    console.log('━'.repeat(60));
    console.log('');

    const totalUsuarios = await User.countDocuments();
    const totalAdmin = await User.countDocuments({ tipo: 'admin' });
    const totalCoordenador = await User.countDocuments({ tipo: 'coordenador' });
    const totalAtendentes = await User.countDocuments({ tipo: 'atendente' });
    const totalEstudantes = await User.countDocuments({ tipo: 'estudante' });

    console.log(`   📊 Total de usuários: ${totalUsuarios}`);
    console.log(`   👑 Administradores: ${totalAdmin}`);
    console.log(`   👔 Coordenadores: ${totalCoordenador}`);
    console.log(`   👥 Atendentes: ${totalAtendentes}`);
    console.log(`   👨‍🎓 Estudantes: ${totalEstudantes}`);
    console.log('');

    console.log('━'.repeat(60));
    console.log('   🔑 CREDENCIAIS DE ACESSO');
    console.log('━'.repeat(60));
    console.log('');
    console.log('   👑 ADMIN (Acesso Total):');
    console.log('      📧 admin@sistema.edu / 🔑 123456');
    console.log('');
    console.log('   👔 COORDENADOR (Múltiplas áreas):');
    console.log('      📧 coordenador@sistema.edu / 🔑 123456');
    console.log('');
    console.log('   👥 ATENDENTES (Apenas sua categoria):');
    console.log('      🏗️  infra@sistema.edu / 🔑 123456');
    console.log('      📚 ensino@sistema.edu / 🔑 123456');
    console.log('      📋 adm@sistema.edu / 🔑 123456');
    console.log('      💻 ti@sistema.edu / 🔑 123456');
    console.log('      📖 biblioteca@sistema.edu / 🔑 123456');
    console.log('      🍽️  cantina@sistema.edu / 🔑 123456');
    console.log('      🛡️  seguranca@sistema.edu / 🔑 123456');
    console.log('      🎉 eventos@sistema.edu / 🔑 123456');
    console.log('      📌 geral@sistema.edu / 🔑 123456');
    console.log('');
    console.log('   👨‍🎓 ESTUDANTES:');
    console.log('      📧 ruthcololo8897@gmail.com / 🔑 123456');
    console.log('      📧 joao@sistema.edu / 🔑 123456');
    console.log('      📧 maria@sistema.edu / 🔑 123456');
    console.log('      📧 pedro@sistema.edu / 🔑 123456');
    console.log('');
    console.log('━'.repeat(60));
    console.log('   ✅ Usuários criados/atualizados com sucesso!');
    console.log('━'.repeat(60));

  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

criarUsuarios();