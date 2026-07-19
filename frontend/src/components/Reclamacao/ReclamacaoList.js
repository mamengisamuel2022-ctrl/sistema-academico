import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Card, CardContent,
  Chip, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, IconButton, Pagination, InputAdornment, Tooltip,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Alert  // ✅ Adicionar Alert
} from '@mui/material';
import {
  Add, Search, ThumbUp, ThumbDown, Visibility, Comment,
  Delete
} from '@mui/icons-material';
import { reclamacaoService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

const statusColors = {
  pendente: 'warning',
  em_analise: 'info',
  encaminhado: 'primary',
  resolvido: 'success',
  rejeitado: 'error'
};

const ReclamacaoList = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reclamacoes, setReclamacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Dialog de confirmação para deletar
  const [dialogDelete, setDialogDelete] = useState(false);
  const [itemParaDeletar, setItemParaDeletar] = useState(null);
  
  const [filtros, setFiltros] = useState({
    status: '',
    tipo: '',
    categoria: '',
    search: '',
    sort: '-createdAt'
  });

  const carregarReclamacoes = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      
      if (filtros.status) params.status = filtros.status;
      if (filtros.tipo) params.tipo = filtros.tipo;
      if (filtros.categoria) params.categoria = filtros.categoria;
      if (filtros.search) params.search = filtros.search;
      if (filtros.sort) params.sort = filtros.sort;

      const response = await reclamacaoService.listar(params);
      
      setReclamacoes(response.data.data || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      setReclamacoes([]);
    } finally {
      setLoading(false);
    }
  }, [page, filtros]);

  useEffect(() => {
    carregarReclamacoes();
  }, [carregarReclamacoes]);

  const handleVotar = async (id, tipo) => {
    try {
      await reclamacaoService.votar(id, tipo);
      carregarReclamacoes();
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const handleNovaReclamacao = () => {
    navigate('/nova-reclamacao');
  };

  // Abrir dialog de confirmação para deletar
  const handleAbrirDialogDelete = (id, titulo) => {
    setItemParaDeletar({ id, titulo });
    setDialogDelete(true);
  };

  // Fechar dialog
  const handleFecharDialogDelete = () => {
    setDialogDelete(false);
    setItemParaDeletar(null);
  };

  // Confirmar e deletar
  const handleConfirmarDelete = async () => {
    if (!itemParaDeletar) return;
    
    try {
      await reclamacaoService.deletar(itemParaDeletar.id);
      toast.success('✅ Reclamação deletada permanentemente!');
      carregarReclamacoes();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erro ao deletar reclamação');
      console.error('Erro ao deletar:', error);
    } finally {
      handleFecharDialogDelete();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Cabeçalho */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          {usuario?.tipo === 'admin' 
            ? 'Gerenciar Reclamações' 
            : usuario?.tipo === 'estudante'
              ? 'Minhas Reclamações'
              : 'Reclamações da Área'}
        </Typography>
        
        {/* Botão NOVA RECLAMAÇÃO - APENAS ESTUDANTE */}
        {usuario?.tipo === 'estudante' && (
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<Add />}
            onClick={handleNovaReclamacao}
            sx={{ px: 4, py: 1.5 }}
          >
            Nova Reclamação
          </Button>
        )}
      </Box>

      {/* Filtros */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar..."
              value={filtros.search}
              onChange={(e) => setFiltros(prev => ({ ...prev, search: e.target.value }))}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({ ...prev, status: e.target.value }))}
                label="Status"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="pendente">Pendente</MenuItem>
                <MenuItem value="em_analise">Em Análise</MenuItem>
                <MenuItem value="resolvido">Resolvido</MenuItem>
                <MenuItem value="rejeitado">Rejeitado</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Tipo</InputLabel>
              <Select
                value={filtros.tipo}
                onChange={(e) => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
                label="Tipo"
              >
                <MenuItem value="">Todos</MenuItem>
                <MenuItem value="reclamacao">Reclamação</MenuItem>
                <MenuItem value="sugestao">Sugestão</MenuItem>
                <MenuItem value="elogio">Elogio</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Categoria</InputLabel>
              <Select
                value={filtros.categoria}
                onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value }))}
                label="Categoria"
              >
                <MenuItem value="">Todas</MenuItem>
                <MenuItem value="infraestrutura">Infraestrutura</MenuItem>
                <MenuItem value="ensino">Ensino</MenuItem>
                <MenuItem value="administracao">Administração</MenuItem>
                <MenuItem value="tecnologia">Tecnologia</MenuItem>
                <MenuItem value="biblioteca">Biblioteca</MenuItem>
                <MenuItem value="cantina">Cantina</MenuItem>
                <MenuItem value="seguranca">Segurança</MenuItem>
                <MenuItem value="eventos">Eventos</MenuItem>
                <MenuItem value="outros">Outros</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Ordenar</InputLabel>
              <Select
                value={filtros.sort}
                onChange={(e) => setFiltros(prev => ({ ...prev, sort: e.target.value }))}
                label="Ordenar"
              >
                <MenuItem value="-createdAt">Mais Recentes</MenuItem>
                <MenuItem value="createdAt">Mais Antigos</MenuItem>
                <MenuItem value="-visualizacoes">Mais Vistos</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Lista */}
      {loading ? (
        <Box textAlign="center" py={4}>
          <Typography>Carregando...</Typography>
        </Box>
      ) : reclamacoes.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhuma reclamação encontrada
          </Typography>
          {usuario?.tipo === 'estudante' && (
            <Button
              variant="contained"
              onClick={handleNovaReclamacao}
              sx={{ mt: 2 }}
            >
              Criar Primeira Reclamação
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <Grid container spacing={2}>
            {reclamacoes.map((reclamacao) => (
              <Grid item xs={12} key={reclamacao._id}>
                <Card 
                  sx={{ 
                    '&:hover': { boxShadow: 6 }
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                        onClick={() => navigate(`/reclamacao/${reclamacao._id}`)}
                      >
                        {reclamacao.titulo}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={reclamacao.tipo}
                          color="primary"
                          size="small"
                        />
                        <Chip
                          label={reclamacao.status?.replace('_', ' ') || 'pendente'}
                          color={statusColors[reclamacao.status] || 'default'}
                          size="small"
                        />
                        
                        {/* Botão DELETAR - APENAS ADMIN */}
                        {usuario?.tipo === 'admin' && (
                          <Tooltip title="Deletar permanentemente">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAbrirDialogDelete(reclamacao._id, reclamacao.titulo);
                              }}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>

                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {reclamacao.descricao?.substring(0, 200)}
                      {reclamacao.descricao?.length > 200 ? '...' : ''}
                    </Typography>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Por: {reclamacao.autor?.nome || 'Anônimo'} • Matrícula: {reclamacao.matriculaAutor}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(reclamacao.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                        {reclamacao.categoria && (
                          <Chip
                            label={reclamacao.categoria}
                            size="small"
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVotar(reclamacao._id, 'positivo');
                          }}
                          color="primary"
                        >
                          <ThumbUp fontSize="small" />
                        </IconButton>
                        <Typography variant="body2">
                          {reclamacao.votos?.positivo?.length || 0}
                        </Typography>
                        
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleVotar(reclamacao._id, 'negativo');
                          }}
                          color="error"
                        >
                          <ThumbDown fontSize="small" />
                        </IconButton>
                        <Typography variant="body2">
                          {reclamacao.votos?.negativo?.length || 0}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <Visibility fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {reclamacao.visualizacoes || 0}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                          <Comment fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>
                            {reclamacao.comentarios?.length || 0}
                          </Typography>
                        </Box>
                        
                        {/* Informação do ticket */}
                        {(usuario?.tipo === 'admin' || usuario?.tipo === 'atendente' || usuario?.tipo === 'coordenador') && 
                         reclamacao.ticket?.numero && (
                          <Chip
                            label={`Ticket: ${reclamacao.ticket.numero}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                            sx={{ ml: 2 }}
                          />
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Dialog de confirmação para deletar */}
      <Dialog
        open={dialogDelete}
        onClose={handleFecharDialogDelete}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Delete /> Confirmar Exclusão
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Tem certeza que deseja <strong>DELETAR PERMANENTEMENTE</strong> esta reclamação?
          </Typography>
          <Paper sx={{ p: 2, bgcolor: '#fff3e0', mt: 2 }}>
            <Typography variant="subtitle1" color="error">
              "{itemParaDeletar?.titulo}"
            </Typography>
          </Paper>
          <Alert severity="error" sx={{ mt: 2 }}>
            ⚠️ Esta ação é irreversível! Todos os dados, comentários e votos serão perdidos.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleFecharDialogDelete} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmarDelete} 
            variant="contained" 
            color="error"
            startIcon={<Delete />}
          >
            Deletar Permanentemente
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReclamacaoList;