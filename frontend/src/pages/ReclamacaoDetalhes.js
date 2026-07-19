import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container, Paper, Typography, Box, Grid, Chip, Button,
  TextField, Avatar, IconButton, Divider, Alert, Card,
  CardContent
} from '@mui/material';
import {
  ThumbUp, ThumbDown, ArrowBack, Send,
  Download, PictureAsPdf, TableChart
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { reclamacaoService } from '../services/api';

const ReclamacaoDetalhes = () => {
  const { id } = useParams();
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [reclamacao, setReclamacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comentario, setComentario] = useState('');
  const [enviandoComentario, setEnviandoComentario] = useState(false);

  useEffect(() => {
    carregarReclamacao();
  }, [id]);

  const carregarReclamacao = async () => {
    try {
      const response = await reclamacaoService.buscar(id);
      setReclamacao(response.data.data);
    } catch (err) {
      setError('Erro ao carregar reclamação');
    } finally {
      setLoading(false);
    }
  };

  const handleVotar = async (tipo) => {
    try {
      const response = await reclamacaoService.votar(id, tipo);
      setReclamacao(prev => ({
        ...prev,
        votos: {
          positivo: response.data.data.positivo,
          negativo: response.data.data.negativo,
        }
      }));
    } catch (error) {
      console.error('Erro ao votar:', error);
    }
  };

  const handleComentar = async () => {
    if (!comentario.trim()) return;
    
    setEnviandoComentario(true);
    try {
      await reclamacaoService.comentar(id, { mensagem: comentario });
      setComentario('');
      carregarReclamacao();
    } catch (error) {
      console.error('Erro ao comentar:', error);
    } finally {
      setEnviandoComentario(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Carregando...</Typography>
      </Container>
    );
  }

  if (error || !reclamacao) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Reclamação não encontrada'}</Alert>
        <Button onClick={() => navigate('/reclamacoes')} sx={{ mt: 2 }}>
          Voltar
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate('/reclamacoes')}
        sx={{ mb: 2 }}
      >
        Voltar
      </Button>

      <Paper sx={{ p: 4 }}>
        {/* Cabeçalho */}
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Typography variant="h4">
              {reclamacao.titulo}
            </Typography>
            <Box>
              <Chip
                label={reclamacao.tipo}
                color="primary"
                sx={{ mr: 1 }}
              />
              <Chip
                label={reclamacao.status.replace('_', ' ')}
                color={
                  reclamacao.status === 'resolvido' ? 'success' :
                  reclamacao.status === 'rejeitado' ? 'error' :
                  reclamacao.status === 'em_analise' ? 'info' : 'warning'
                }
              />
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Categoria: {reclamacao.categoria}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Prioridade: {reclamacao.prioridade}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="body2" color="text.secondary">
                Visibilidade: {reclamacao.visibilidade}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Descrição */}
        <Typography variant="body1" sx={{ mb: 3, whiteSpace: 'pre-wrap' }}>
          {reclamacao.descricao}
        </Typography>

        {/* Tags */}
        {reclamacao.tags?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            {reclamacao.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Box>
        )}

        {/* Anexos */}
        {reclamacao.anexos?.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Anexos:
            </Typography>
            {reclamacao.anexos.map((anexo, index) => (
              <Button
                key={index}
                variant="outlined"
                size="small"
                startIcon={<Download />}
                href={`http://localhost:5000${anexo.url}`}
                target="_blank"
                sx={{ mr: 1, mb: 1 }}
              >
                {anexo.nome}
              </Button>
            ))}
          </Box>
        )}

        {/* Informações do Autor */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Avatar sx={{ mr: 2 }}>
            {reclamacao.autor?.nome?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle2">
              {reclamacao.visibilidade === 'anonimo' ? 'Anônimo' : reclamacao.autor?.nome}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Matrícula: {reclamacao.matriculaAutor} • 
              {new Date(reclamacao.createdAt).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Typography>
          </Box>
        </Box>

        {/* Votos */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => handleVotar('positivo')} color="primary">
            <ThumbUp />
          </IconButton>
          <Typography sx={{ mr: 2 }}>{reclamacao.votos?.positivo?.length || 0}</Typography>
          
          <IconButton onClick={() => handleVotar('negativo')} color="error">
            <ThumbDown />
          </IconButton>
          <Typography>{reclamacao.votos?.negativo?.length || 0}</Typography>

          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto' }}>
            {reclamacao.visualizacoes} visualizações
          </Typography>
        </Box>

        {/* Resposta Oficial */}
        {reclamacao.resposta?.mensagem && (
          <Box sx={{ mb: 3, p: 3, bgcolor: '#e3f2fd', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom color="primary">
              Resposta Oficial
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {reclamacao.resposta.mensagem}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Respondido por {reclamacao.resposta.respondidoPor?.nome} em{' '}
              {new Date(reclamacao.resposta.dataResposta).toLocaleDateString('pt-BR')}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Comentários */}
        <Typography variant="h6" gutterBottom>
          Comentários ({reclamacao.comentarios?.length || 0})
        </Typography>

        {/* Formulário de Comentário */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Adicione um comentário..."
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            endIcon={<Send />}
            onClick={handleComentar}
            disabled={!comentario.trim() || enviandoComentario}
          >
            {enviandoComentario ? 'Enviando...' : 'Comentar'}
          </Button>
        </Box>

        {/* Lista de Comentários */}
        {reclamacao.comentarios?.map((comentario, index) => (
          <Card key={index} sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'start', mb: 1 }}>
                <Avatar sx={{ mr: 2, width: 32, height: 32 }}>
                  {comentario.usuario?.nome?.[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">
                    {comentario.usuario?.nome}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(comentario.createdAt).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {comentario.mensagem}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Paper>
    </Container>
  );
};

export default ReclamacaoDetalhes;