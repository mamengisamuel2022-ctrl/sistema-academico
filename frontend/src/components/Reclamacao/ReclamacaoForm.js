import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Box, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Typography, Paper, Grid, Chip, IconButton,
  Alert, LinearProgress
} from '@mui/material';
import { CloudUpload, Close } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { reclamacaoService } from '../../services/api';

const ReclamacaoForm = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState([]);

  const [form, setForm] = useState({
    titulo: '',
    descricao: '',
    tipo: 'reclamacao',
    categoria: 'outros',
    prioridade: 'media',
    visibilidade: 'publico',
    tags: [],
    setorResponsavel: ''
  });

  const [tagInput, setTagInput] = useState('');

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput && !form.tags.includes(tagInput)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      Object.keys(form).forEach(key => {
        if (key === 'tags') {
          formData.append(key, JSON.stringify(form[key]));
        } else {
          formData.append(key, form[key]);
        }
      });
      
      files.forEach(file => {
        formData.append('anexos', file);
      });

      await reclamacaoService.criar(formData);
      navigate('/reclamacoes');
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao criar reclamação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Nova Reclamação/Sugestão/Elogio
      </Typography>
      
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Matrícula: {usuario?.matricula} | Autor: {usuario?.nome}
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Título"
              value={form.titulo}
              onChange={(e) => setForm(prev => ({ ...prev, titulo: e.target.value }))}
              required
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={form.tipo}
                onChange={(e) => setForm(prev => ({ ...prev, tipo: e.target.value }))}
                label="Tipo"
              >
                <MenuItem value="reclamacao">Reclamação</MenuItem>
                <MenuItem value="sugestao">Sugestão</MenuItem>
                <MenuItem value="elogio">Elogio</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Categoria</InputLabel>
              <Select
                value={form.categoria}
                onChange={(e) => setForm(prev => ({ ...prev, categoria: e.target.value }))}
                label="Categoria"
              >
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

          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Prioridade</InputLabel>
              <Select
                value={form.prioridade}
                onChange={(e) => setForm(prev => ({ ...prev, prioridade: e.target.value }))}
                label="Prioridade"
              >
                <MenuItem value="baixa">Baixa</MenuItem>
                <MenuItem value="media">Média</MenuItem>
                <MenuItem value="alta">Alta</MenuItem>
                <MenuItem value="urgente">Urgente</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={6}
              label="Descrição detalhada"
              value={form.descricao}
              onChange={(e) => setForm(prev => ({ ...prev, descricao: e.target.value }))}
              required
              helperText={`${form.descricao.length}/5000 caracteres`}
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <TextField
                size="small"
                label="Adicionar tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button variant="outlined" onClick={addTag}>Adicionar</Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {form.tags.map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  size="small"
                />
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Paper
              {...getRootProps()}
              sx={{
                p: 3,
                textAlign: 'center',
                backgroundColor: '#f5f5f5',
                cursor: 'pointer',
                border: '2px dashed #ccc'
              }}
            >
              <input {...getInputProps()} />
              <CloudUpload sx={{ fontSize: 48, color: 'primary.main' }} />
              <Typography>
                Arraste arquivos aqui ou clique para selecionar
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Máximo 5 arquivos (5MB cada)
              </Typography>
            </Paper>
            {files.length > 0 && (
              <Box sx={{ mt: 2 }}>
                {files.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeFile(index)}
                    deleteIcon={<Close />}
                    sx={{ m: 0.5 }}
                  />
                ))}
              </Box>
            )}
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Setor Responsável"
              value={form.setorResponsavel}
              onChange={(e) => setForm(prev => ({ ...prev, setorResponsavel: e.target.value }))}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Visibilidade</InputLabel>
              <Select
                value={form.visibilidade}
                onChange={(e) => setForm(prev => ({ ...prev, visibilidade: e.target.value }))}
                label="Visibilidade"
              >
                <MenuItem value="publico">Público</MenuItem>
                <MenuItem value="privado">Privado</MenuItem>
                <MenuItem value="anonimo">Anônimo</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Enviando...' : 'Enviar'}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default ReclamacaoForm;