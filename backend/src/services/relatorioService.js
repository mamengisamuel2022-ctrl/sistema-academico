const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Reclamacao = require('../models/Reclamacao');

class RelatorioService {
  static async gerarPDF(filtros = {}) {
    const doc = new PDFDocument();
    const reclamacoes = await Reclamacao.find(filtros)
      .populate('autor', 'nome matricula')
      .sort({ createdAt: -1 });

    doc.fontSize(20).text('Relatório de Reclamações e Sugestões', { align: 'center' });
    doc.moveDown();
    
    // Informações do relatório
    doc.fontSize(12)
      .text(`Data: ${new Date().toLocaleDateString('pt-BR')}`)
      .text(`Total: ${reclamacoes.length} registros`)
      .moveDown();

    // Estatísticas
    const stats = await Reclamacao.aggregate([
      { $match: filtros },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    doc.fontSize(14).text('Resumo por Status:');
    stats.forEach(stat => {
      doc.fontSize(12).text(`  ${stat._id}: ${stat.count}`);
    });
    doc.moveDown();

    // Lista de reclamações
    reclamacoes.forEach((rec, index) => {
      doc.fontSize(12)
        .text(`${index + 1}. ${rec.titulo}`)
        .fontSize(10)
        .text(`   Tipo: ${rec.tipo} | Status: ${rec.status} | Prioridade: ${rec.prioridade}`)
        .text(`   Autor: ${rec.autor?.nome} (${rec.matriculaAutor})`)
        .text(`   Data: ${new Date(rec.createdAt).toLocaleDateString('pt-BR')}`)
        .moveDown(0.5);
    });

    return doc;
  }

  static async gerarExcel(filtros = {}) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reclamações');

    // Cabeçalhos
    worksheet.columns = [
      { header: 'ID', key: '_id', width: 30 },
      { header: 'Título', key: 'titulo', width: 40 },
      { header: 'Tipo', key: 'tipo', width: 15 },
      { header: 'Categoria', key: 'categoria', width: 20 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Prioridade', key: 'prioridade', width: 15 },
      { header: 'Matrícula', key: 'matriculaAutor', width: 15 },
      { header: 'Autor', key: 'autorNome', width: 30 },
      { header: 'Data Criação', key: 'createdAt', width: 20 },
      { header: 'Visualizações', key: 'visualizacoes', width: 15 },
      { header: 'Votos Positivos', key: 'votosPositivos', width: 15 },
      { header: 'Tempo Resolução (h)', key: 'tempoResolucao', width: 20 }
    ];

    // Dados
    const reclamacoes = await Reclamacao.find(filtros)
      .populate('autor', 'nome')
      .lean();

    reclamacoes.forEach(rec => {
      worksheet.addRow({
        _id: rec._id.toString(),
        titulo: rec.titulo,
        tipo: rec.tipo,
        categoria: rec.categoria,
        status: rec.status,
        prioridade: rec.prioridade,
        matriculaAutor: rec.matriculaAutor,
        autorNome: rec.autor?.nome,
        createdAt: new Date(rec.createdAt).toLocaleDateString('pt-BR'),
        visualizacoes: rec.visualizacoes,
        votosPositivos: rec.votos?.positivo?.length || 0,
        tempoResolucao: rec.tempoResolucao?.toFixed(2) || 'N/A'
      });
    });

    // Estilo
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };

    return workbook;
  }
}

module.exports = RelatorioService;