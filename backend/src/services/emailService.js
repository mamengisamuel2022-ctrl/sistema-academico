const transporter = require('../config/email');

class EmailService {
  static async enviarBoasVindas(usuario) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: 'Bem-vindo ao Sistema Acadêmico',
      html: `
        <h1>Olá ${usuario.nome}!</h1>
        <p>Sua conta foi criada com sucesso no Sistema Acadêmico.</p>
        <p>Matrícula: ${usuario.matricula || 'N/A'}</p>
        <p>Agora você pode enviar reclamações, sugestões e elogios.</p>
        <a href="${process.env.FRONTEND_URL}/login">Acessar Sistema</a>
      `
    };

    await transporter.sendMail(mailOptions);
  }

  static async notificarStatusReclamacao(reclamacao, usuario) {
    const statusEmoji = {
      pendente: '⏳',
      em_analise: '🔍',
      encaminhado: '📤',
      resolvido: '✅',
      rejeitado: '❌'
    };

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: usuario.email,
      subject: `Atualização da ${reclamacao.tipo}: ${reclamacao.titulo}`,
      html: `
        <h1>${statusEmoji[reclamacao.status]} Status Atualizado</h1>
        <p>Sua ${reclamacao.tipo} teve o status atualizado para: <strong>${reclamacao.status}</strong></p>
        <p><strong>Título:</strong> ${reclamacao.titulo}</p>
        <p><strong>Matrícula:</strong> ${reclamacao.matriculaAutor}</p>
        ${reclamacao.resposta?.mensagem ? `<p><strong>Resposta:</strong> ${reclamacao.resposta.mensagem}</p>` : ''}
        <a href="${process.env.FRONTEND_URL}/reclamacao/${reclamacao._id}">Ver detalhes</a>
      `
    };

    await transporter.sendMail(mailOptions);
  }

  static async notificarNovoComentario(reclamacao, comentario, usuarioNotificado) {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: usuarioNotificado.email,
      subject: `Novo comentário em: ${reclamacao.titulo}`,
      html: `
        <h1>💬 Novo Comentário</h1>
        <p>${comentario.usuario.nome} comentou na ${reclamacao.tipo}:</p>
        <blockquote>${comentario.mensagem}</blockquote>
        <a href="${process.env.FRONTEND_URL}/reclamacao/${reclamacao._id}">Ver discussão</a>
      `
    };

    await transporter.sendMail(mailOptions);
  }
}

module.exports = EmailService;