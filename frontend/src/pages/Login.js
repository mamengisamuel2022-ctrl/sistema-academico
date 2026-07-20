import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, CircularProgress, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow,
  Chip
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    senha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.senha);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  const handleQuickLogin = (email, senha) => {
    setFormData({ email, senha });
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Sistema Acadêmico - Reclamações e Sugestões
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />
          
          <TextField
            fullWidth
            label="Senha"
            name="senha"
            type="password"
            value={formData.senha}
            onChange={handleChange}
            required
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Entrar'}
          </Button>

          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2">
              Não tem conta?{' '}
              <Link to="/registrar" style={{ textDecoration: 'none' }}>
                Registrar-se
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* ✅ TABELA SEMPRE VISÍVEL */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Credenciais de Acesso
          </Typography>
            <Typography variant="h6" gutterBottom>
                OBS: Essa tabela só está aqui a titulo de disponibilizar os testes || O Professor pode criar outros usuários mais serão do Tipo Estudante 
            </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Clique em uma linha para preencher automaticamente
          </Typography>

          <TableContainer component={Paper} sx={{ maxHeight: 450 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>Tipo</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>Nome</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>Senha</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', bgcolor: '#1976d2', color: 'white' }}>Área</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* Admin */}
                <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#fff3e0' }} onClick={() => handleQuickLogin('admin@sistema.edu', 'admin123')}>
                  <TableCell><Chip label="Admin" size="small" color="error" /></TableCell>
                  <TableCell>Administrador</TableCell>
                  <TableCell>admin@sistema.edu</TableCell>
                  <TableCell><Chip label="admin123" size="small" variant="outlined" /></TableCell>
                  <TableCell>Todas</TableCell>
                </TableRow>

                {/* Coordenador */}
                <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e8f5e9' }} onClick={() => handleQuickLogin('coordenador@sistema.edu', '123456')}>
                  <TableCell><Chip label="Coordenador" size="small" color="success" /></TableCell>
                  <TableCell>Coordenador</TableCell>
                  <TableCell>coordenador@sistema.edu</TableCell>
                  <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                  <TableCell>Múltiplas</TableCell>
                </TableRow>

                {/* Atendentes */}
                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('infra@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Infraestrutura</TableCell>
                  <TableCell>infra@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>🏗️ Infraestrutura</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('ensino@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Ensino</TableCell>
                  <TableCell>ensino@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>📚 Ensino</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('adm@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Administração</TableCell>
                  <TableCell>adm@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>📋 Administração</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('ti@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Tecnologia</TableCell>
                  <TableCell>ti@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>💻 Tecnologia</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('biblioteca@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Biblioteca</TableCell>
                  <TableCell>biblioteca@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>📖 Biblioteca</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('cantina@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Cantina</TableCell>
                  <TableCell>cantina@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>🍽️ Cantina</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('seguranca@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Segurança</TableCell>
                  <TableCell>seguranca@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>🛡️ Segurança</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('eventos@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Eventos</TableCell>
                  <TableCell>eventos@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>🎉 Eventos</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('geral@sistema.edu', '123456')}>
                  <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                  <TableCell>Geral</TableCell>
                  <TableCell>geral@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>📌 Outros</TableCell>
                </TableRow>

                {/* Estudantes */}
                <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('ruthcololo8897@gmail.com', '123456')}>
                  <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                  <TableCell>Mamengi Samuel</TableCell>
                  <TableCell>ruthcololo8897@gmail.com</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>Direito</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('joao@sistema.edu', '123456')}>
                  <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                  <TableCell>João Silva</TableCell>
                  <TableCell>joao@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>Engenharia</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('maria@sistema.edu', '123456')}>
                  <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                  <TableCell>Maria Santos</TableCell>
                  <TableCell>maria@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>Medicina</TableCell>
                </TableRow>

                <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('pedro@sistema.edu', '123456')}>
                  <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                  <TableCell>Pedro Costa</TableCell>
                  <TableCell>pedro@sistema.edu</TableCell>
                  <TableCell>123456</TableCell>
                  <TableCell>Administração</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;