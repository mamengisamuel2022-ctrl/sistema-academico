import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Container, Paper, TextField, Button, Typography,
  Box, Alert, CircularProgress
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

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
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
        {/* Tabela de Usuários */}
        <Accordion sx={{ mt: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Visibility fontSize="small" />
              <Typography variant="subtitle2">
                Ver credenciais de acesso
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Clique no email para preencher automaticamente
            </Typography>

            <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Nome</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Senha</TableCell>
                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#f5f5f5' }}>Categoria</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Admin */}
                  <TableRow 
                    hover 
                    sx={{ cursor: 'pointer', bgcolor: '#fff3e0' }}
                    onClick={() => handleQuickLogin('admin@sistema.edu', 'admin123')}
                  >
                    <TableCell>
                      <Chip label="Admin" size="small" color="error" />
                    </TableCell>
                    <TableCell>Administrador</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        admin@sistema.edu
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="admin123" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>Todas</TableCell>
                  </TableRow>

                  {/* Coordenador */}
                  <TableRow 
                    hover 
                    sx={{ cursor: 'pointer', bgcolor: '#e8f5e9' }}
                    onClick={() => handleQuickLogin('coordenador@sistema.edu', '123456')}
                  >
                    <TableCell>
                      <Chip label="Coordenador" size="small" color="success" />
                    </TableCell>
                    <TableCell>Coordenador</TableCell>
                    <TableCell>
                      <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>
                        coordenador@sistema.edu
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label="123456" size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>Múltiplas</TableCell>
                  </TableRow>

                  {/* Atendentes */}
                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('infra@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Infraestrutura</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>infra@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>🏗️ Infraestrutura</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('ensino@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Ensino</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>ensino@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>📚 Ensino</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('adm@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Administração</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>adm@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>📋 Administração</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('ti@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Tecnologia</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>ti@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>💻 Tecnologia</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('biblioteca@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Biblioteca</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>biblioteca@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>📖 Biblioteca</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('cantina@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Cantina</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>cantina@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>🍽️ Cantina</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('seguranca@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Segurança</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>seguranca@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>🛡️ Segurança</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('eventos@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Eventos</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>eventos@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>🎉 Eventos</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer' }} onClick={() => handleQuickLogin('geral@sistema.edu', '123456')}>
                    <TableCell><Chip label="Atendente" size="small" color="info" /></TableCell>
                    <TableCell>Geral</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>geral@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>📌 Geral</TableCell>
                  </TableRow>

                  {/* Estudantes */}
                  <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('ruthcololo8897@gmail.com', '123456')}>
                    <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                    <TableCell>Mamengi Samuel</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>ruthcololo8897@gmail.com</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>Direito</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('joao@sistema.edu', '123456')}>
                    <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                    <TableCell>João Silva</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>joao@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>Engenharia</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('maria@sistema.edu', '123456')}>
                    <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                    <TableCell>Maria Santos</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>maria@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>Medicina</TableCell>
                  </TableRow>

                  <TableRow hover sx={{ cursor: 'pointer', bgcolor: '#e3f2fd' }} onClick={() => handleQuickLogin('pedro@sistema.edu', '123456')}>
                    <TableCell><Chip label="Estudante" size="small" color="primary" /></TableCell>
                    <TableCell>Pedro Costa</TableCell>
                    <TableCell><Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }}>pedro@sistema.edu</Typography></TableCell>
                    <TableCell><Chip label="123456" size="small" variant="outlined" /></TableCell>
                    <TableCell>Administração</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      </Paper>
    </Container>
  );
};

export default Login;