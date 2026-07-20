import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, CircularProgress, Grid
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Registrar = () => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    matricula: '',
    curso: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { registrar } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = () => {
    if (!formData.nome.trim()) {
      setError('Nome é obrigatório');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email é obrigatório');
      return false;
    }
    if (!formData.matricula.trim()) {
      setError('Matrícula é obrigatória');
      return false;
    }
    if (formData.senha.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres');
      return false;
    }
    if (formData.senha !== formData.confirmarSenha) {
      setError('As senhas não coincidem');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      const result = await registrar({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        matricula: formData.matricula,
        curso: formData.curso
      });
      
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Erro ao registrar');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Criar Conta
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Registre-se no SISA IMETRO - Modulo Reclamações
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nome Completo"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                autoFocus
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Matrícula"
                name="matricula"
                value={formData.matricula}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Curso"
                name="curso"
                value={formData.curso}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Senha"
                name="senha"
                type="password"
                value={formData.senha}
                onChange={handleChange}
                required
                helperText="Mínimo 6 caracteres"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Confirmar Senha"
                name="confirmarSenha"
                type="password"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Registrar'}
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Já tem conta?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                Fazer login
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Registrar;