import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent,
  Chip, Button, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Alert, CircularProgress, Tooltip
} from '@mui/material';
import {
  PlayArrow, CheckCircle, Forward, Refresh,
  Lock, DoneAll, Delete
} from '@mui/icons-material';
import { reclamacaoService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const statusTicketColors = {
  aberto: 'error',
  atribuido: 'warning',
  em_atendimento: 'info',
  pendente_cliente: 'warning',
  resolvido: 'success',
  fechado: 'success',
  reaberto: 'error'
};

const GerenciarTickets = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('');
  
  // Dialog para ação
  const [dialogOpen, setDialogOpen] = useState(false);
  const [ticketSelecionado, setTicketSelecionado] = useState(null);
  const [acao, setAcao] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [servico, setServico] = useState('');
  const [processando, setProcessando] = useState(false);

  // ✅ Carregar tickets com useCallback
  const carregarTickets = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      if (filtroStatus) params.status = filtroStatus;
      
      const response = await reclamacaoService.listar({
        ...params,
        sort: '-createdAt',
        limit: 50
      });
      
      const ticketsComTicket = response.data.data?.filter(r => r.ticket?.numero) || [];
      setTickets(ticketsComTicket);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      toast.error('Erro ao carregar tickets');
    } finally {
      setLoading(false);
    }
  }, [filtroStatus]);

  useEffect(() => {
    carregarTickets();
  }, [carregarTickets]);

  // ✅ Função para pegar o status real
  const getStatusReal = (ticket) => {
    const ticketStatus = ticket.ticket?.status;
    const statusPrincipal = ticket.status;
    
    if (ticketStatus === 'fechado' || ticketStatus === 'resolvido' || 
        statusPrincipal === 'resolvido' || statusPrincipal === 'rejeitado') {
      return 'fechado';
    }
    
    if (ticketStatus) return ticketStatus;
    
    const mapeamento = {
      'pendente': 'aberto',
      'em_analise': 'em_atendimento',
      'encaminhado': 'pendente_cliente',
      'resolvido': 'fechado',
      'rejeitado': 'fechado'
    };
    
    return mapeamento[statusPrincipal] || 'aberto';
  };

  // ✅ Verificar se ticket está bloqueado
  const isTicketBloqueado = (ticket) => {
    return getStatusReal(ticket) === 'fechado';
  };

  // ✅ Pegar label do status para exibição
  const getStatusLabel = (ticket) => {
    const statusReal = getStatusReal(ticket);
    
    const labels = {
      'aberto': 'Aberto',
      'atribuido': 'Atribuído',
      'em_atendimento': 'Em Atendimento',
      'pendente_cliente': 'Pendente',
      'fechado': 'Resolvido'
    };
    
    return labels[statusReal] || statusReal.replace('_', ' ');
  };

  const abrirDialog = (ticket, acao) => {
    if (isTicketBloqueado(ticket)) {
      toast.warning('Este ticket já está fechado e não pode ser alterado.');
      return;
    }
    
    setTicketSelecionado(ticket);
    setAcao(acao);
    setMensagem('');
    setServico('');
    setDialogOpen(true);
  };

  const fecharDialog = () => {
    setDialogOpen(false);
    setTicketSelecionado(null);
    setAcao('');
    setMensagem('');
    setServico('');
  };

  const executarAcao = async () => {
    if (!ticketSelecionado) return;
    
    if (isTicketBloqueado(ticketSelecionado)) {
      toast.warning('Este ticket já está fechado.');
      fecharDialog();
      return;
    }
    
    setProcessando(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      switch (acao) {
        case 'iniciar':
          await fetch(`http://localhost:5000/api/reclamacoes/tickets/${ticketSelecionado._id}/iniciar`, {
            method: 'PATCH',
            headers
          });
          toast.success('✅ Atendimento iniciado!');
          break;
          
        case 'responder':
          if (!mensagem.trim()) {
            toast.error('A mensagem é obrigatória');
            setProcessando(false);
            return;
          }
          await fetch(`http://localhost:5000/api/reclamacoes/${ticketSelecionado._id}/responder`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ mensagem })
          });
          toast.success('✅ Ticket respondido e fechado!');
          break;
          
        case 'encaminhar':
          if (!servico) {
            toast.error('Selecione o serviço de destino');
            setProcessando(false);
            return;
          }
          await fetch(`http://localhost:5000/api/reclamacoes/tickets/${ticketSelecionado._id}/encaminhar`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ servico, motivo: mensagem })
          });
          toast.success('✅ Ticket encaminhado!');
          break;
          
        case 'fechar':
          if (!mensagem.trim()) {
            toast.error('A mensagem é obrigatória');
            setProcessando(false);
            return;
          }
          await fetch(`http://localhost:5000/api/reclamacoes/tickets/${ticketSelecionado._id}/fechar`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ resolucao: mensagem })
          });
          toast.success('✅ Ticket fechado!');
          break;
          
        default:
          break;
      }
      
      fecharDialog();
      carregarTickets();
    } catch (error) {
      console.error('Erro na ação:', error);
      toast.error('Erro ao executar ação');
    } finally {
      setProcessando(false);
    }
  };

  // ✅ Deletar ticket (apenas admin)
  const handleDeletarTicket = async (ticket) => {
    if (window.confirm(
      `⚠️ DELETAR TICKET PERMANENTEMENTE\n\n` +
      `Ticket: ${ticket.ticket?.numero}\n` +
      `Título: ${ticket.titulo}\n\n` +
      `Esta ação NÃO pode ser desfeita!`
    )) {
      try {
        await reclamacaoService.deletar(ticket._id);
        toast.success('✅ Ticket deletado!');
        carregarTickets();
      } catch (error) {
        toast.error(error.response?.data?.error || 'Erro ao deletar');
      }
    }
  };

  // ✅ Ações disponíveis baseado no status real
  const getProximaAcao = (ticket) => {
    if (isTicketBloqueado(ticket)) return [];
    
    const statusReal = getStatusReal(ticket);
    
    switch (statusReal) {
      case 'aberto':
      case 'atribuido':
        return [
          { acao: 'iniciar', label: 'Iniciar', icon: <PlayArrow />, cor: 'primary' },
          { acao: 'encaminhar', label: 'Encaminhar', icon: <Forward />, cor: 'warning' }
        ];
      case 'em_atendimento':
        return [
          { acao: 'responder', label: 'Responder', icon: <CheckCircle />, cor: 'success' },
          { acao: 'encaminhar', label: 'Encaminhar', icon: <Forward />, cor: 'warning' }
        ];
      case 'pendente_cliente':
        return [
          { acao: 'fechar', label: 'Fechar', icon: <CheckCircle />, cor: 'success' }
        ];
      default:
        return [];
    }
  };

  // ✅ Cards de resumo
  const ticketsAbertos = tickets.filter(t => ['aberto', 'atribuido'].includes(getStatusReal(t))).length;
  const ticketsEmAtendimento = tickets.filter(t => getStatusReal(t) === 'em_atendimento').length;
  const ticketsFechados = tickets.filter(t => getStatusReal(t) === 'fechado').length;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Gerenciar Tickets
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Filtrar Status</InputLabel>
            <Select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              label="Filtrar Status"
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="aberto">🟡 Aberto</MenuItem>
              <MenuItem value="atribuido">🟠 Atribuído</MenuItem>
              <MenuItem value="em_atendimento">🔵 Em Atendimento</MenuItem>
              <MenuItem value="pendente_cliente">🟡 Pendente</MenuItem>
              <MenuItem value="fechado">✅ Fechado</MenuItem>
              <MenuItem value="resolvido">✅ Resolvido</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={carregarTickets}
          >
            Atualizar
          </Button>
        </Box>
      </Box>

      {/* Cards de resumo */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h4" color="warning.main">{ticketsAbertos}</Typography>
            <Typography variant="body2">Abertos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h4" color="info.main">{ticketsEmAtendimento}</Typography>
            <Typography variant="body2">Em Atendimento</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h4" color="success.main">{ticketsFechados}</Typography>
            <Typography variant="body2">Resolvidos</Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
        </Grid>
      </Grid>

      {/* Lista de Tickets */}
      {loading ? (
        <Box textAlign="center" py={4}>
          <CircularProgress />
        </Box>
      ) : tickets.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            Nenhum ticket encontrado
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {tickets.map((ticket) => {
            const statusReal = getStatusReal(ticket);
            const bloqueado = isTicketBloqueado(ticket);
            const statusLabel = getStatusLabel(ticket);
            
            return (
              <Grid item xs={12} key={ticket._id}>
                <Card sx={{ 
                  borderLeft: 6,
                  borderColor: bloqueado 
                    ? 'success.main' 
                    : `${statusTicketColors[statusReal] || 'grey'}.main`,
                  opacity: bloqueado ? 0.9 : 1,
                  bgcolor: bloqueado ? '#fafafa' : 'white'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="h6" sx={{ cursor: 'pointer' }}
                            onClick={() => navigate(`/reclamacao/${ticket._id}`)}
                          >
                            {ticket.titulo}
                          </Typography>
                          {bloqueado && (
                            <Chip 
                              icon={<Lock />} 
                              label="FECHADO" 
                              size="small" 
                              color="success"
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Ticket: {ticket.ticket?.numero}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip
                          label={statusLabel}
                          color={bloqueado ? 'success' : (statusTicketColors[statusReal] || 'default')}
                          size="small"
                          icon={bloqueado ? <DoneAll /> : undefined}
                        />
                        <Chip
                          label={ticket.categoria}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={ticket.ticket?.prioridade || ticket.prioridade || 'media'}
                          color={ticket.ticket?.prioridade === 'urgente' ? 'error' : 'default'}
                          size="small"
                        />
                      </Box>
                    </Box>

                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {ticket.descricao?.substring(0, 150)}...
                    </Typography>

                    {ticket.resposta?.mensagem && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight="bold">✅ Resposta:</Typography>
                        {ticket.resposta.mensagem}
                        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                          Respondido por: {ticket.resposta.respondidoPor?.nome} em{' '}
                          {new Date(ticket.resposta.dataResposta).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Alert>
                    )}

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Autor: {ticket.autor?.nome} • Matrícula: {ticket.matriculaAutor}
                        </Typography>
                        {ticket.ticket?.atribuidoPara && (
                          <Typography variant="body2" color="text.secondary">
                            Atribuído: {ticket.ticket.atribuidoPara?.nome}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Criado: {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                        </Typography>
                        {ticket.dataResolucao && (
                          <Typography variant="caption" color="success.main" display="block">
                            ✅ Resolvido em: {new Date(ticket.dataResolucao).toLocaleDateString('pt-BR')}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {bloqueado ? (
                          <Tooltip title="Ticket fechado - Nenhuma ação disponível">
                            <Chip 
                              icon={<Lock />} 
                              label="Fechado" 
                              color="success" 
                              variant="outlined"
                            />
                          </Tooltip>
                        ) : (
                          getProximaAcao(ticket).map((botao) => (
                            <Tooltip key={botao.acao} title={botao.label}>
                              <Button
                                variant="contained"
                                color={botao.cor}
                                size="small"
                                startIcon={botao.icon}
                                onClick={() => abrirDialog(ticket, botao.acao)}
                              >
                                {botao.label}
                              </Button>
                            </Tooltip>
                          ))
                        )}
                        
                        {usuario?.tipo === 'admin' && (
                          <Tooltip title="Deletar permanentemente">
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<Delete />}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletarTicket(ticket);
                              }}
                            >
                              Deletar
                            </Button>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Dialog de Ação */}
      <Dialog open={dialogOpen} onClose={fecharDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {acao === 'iniciar' && '🚀 Iniciar Atendimento'}
          {acao === 'responder' && '✅ Responder e Fechar Ticket'}
          {acao === 'encaminhar' && '↗️ Encaminhar Ticket'}
          {acao === 'fechar' && '🔒 Fechar Ticket'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>
            {ticketSelecionado?.titulo}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Ticket: {ticketSelecionado?.ticket?.numero} • 
            Status atual: {getStatusLabel(ticketSelecionado || {})}
          </Typography>

          {acao === 'encaminhar' && (
            <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
              <InputLabel>Encaminhar para</InputLabel>
              <Select
                value={servico}
                onChange={(e) => setServico(e.target.value)}
                label="Encaminhar para"
              >
                <MenuItem value="reitoria">Reitoria</MenuItem>
                <MenuItem value="direcao">Direção</MenuItem>
                <MenuItem value="coordenacao">Coordenação</MenuItem>
                <MenuItem value="secretaria">Secretaria</MenuItem>
                <MenuItem value="ti">TI</MenuItem>
                <MenuItem value="manutencao">Manutenção</MenuItem>
                <MenuItem value="biblioteca">Biblioteca</MenuItem>
                <MenuItem value="financeiro">Financeiro</MenuItem>
                <MenuItem value="outros">Outros</MenuItem>
              </Select>
            </FormControl>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            label={
              acao === 'encaminhar' ? 'Motivo do encaminhamento' :
              acao === 'responder' ? 'Resposta ao estudante' :
              acao === 'fechar' ? 'Descrição da resolução' :
              'Observações'
            }
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            sx={{ mt: 2 }}
            required
            helperText={
              acao === 'responder' ? '⚠️ Após responder, o ticket será fechado e bloqueado.' : ''
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharDialog} disabled={processando}>
            Cancelar
          </Button>
          <Button
            onClick={executarAcao}
            variant="contained"
            color={acao === 'responder' || acao === 'fechar' ? 'success' : 'primary'}
            disabled={!mensagem.trim() || processando || (acao === 'encaminhar' && !servico)}
          >
            {processando ? (
              <CircularProgress size={24} />
            ) : acao === 'responder' ? (
              'Responder e Fechar'
            ) : acao === 'fechar' ? (
              'Fechar Ticket'
            ) : (
              'Confirmar'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default GerenciarTickets;