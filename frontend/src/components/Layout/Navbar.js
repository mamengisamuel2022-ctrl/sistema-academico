import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Avatar, Menu, MenuItem, Chip, Divider
} from '@mui/material';
import { 
  School, Dashboard, Description, Logout, 
  ConfirmationNumber, Add 
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const { usuario, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <School sx={{ mr: 2 }} />
        <Typography 
          variant="h6" 
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          Sistema Acadêmico
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            
            {/* Menu diferente para admin */}
            {usuario?.tipo === 'admin' ? (
              <>
                <Button color="inherit" onClick={() => navigate('/reclamacoes')}>
                  <Description sx={{ mr: 1 }} /> Gerenciar
                </Button>
                <Button color="inherit" onClick={() => navigate('/dashboard')}>
                  <Dashboard sx={{ mr: 1 }} /> Dashboard
                </Button>
                <Button color="inherit" onClick={() => navigate('/tickets')}>
                  <ConfirmationNumber sx={{ mr: 1 }} /> Tickets
                </Button>
              </>
            ) : (
              <>
              {usuario?.tipo === 'admin' ? (
                <>
                    <Button color="inherit" onClick={() => navigate('/reclamacoes')}>
                    <Description sx={{ mr: 1 }} /> Gerenciar
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/dashboard')}>
                    <Dashboard sx={{ mr: 1 }} /> Dashboard
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/tickets')}>
                    <ConfirmationNumber sx={{ mr: 1 }} /> Tickets
                    </Button>
                </>
                ) : usuario?.tipo === 'estudante' ? (
                <>
                    {/* Menu para ESTUDANTE */}
                    <Button color="inherit" onClick={() => navigate('/reclamacoes')}>
                    <Description sx={{ mr: 1 }} /> Minhas Reclamações
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/nova-reclamacao')}>
                    <Add sx={{ mr: 1 }} /> Nova
                    </Button>
                </>
                ) : (
                <>
                    {/* Menu para ATENDENTE/COORDENADOR */}
                    <Button color="inherit" onClick={() => navigate('/reclamacoes')}>
                    <Description sx={{ mr: 1 }} /> Reclamações
                    </Button>
                    <Button color="inherit" onClick={() => navigate('/tickets')}>
                    <ConfirmationNumber sx={{ mr: 1 }} /> Tickets
                    </Button>
                </>
                )}
              </>
            )}

            {/* Perfil */}
            <Box>
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ width: 32, height: 32, bgcolor: usuario?.tipo === 'admin' ? 'error.main' : 'secondary.main' }}>
                  {usuario?.nome?.[0]?.toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu 
                anchorEl={anchorEl} 
                open={Boolean(anchorEl)} 
                onClose={handleClose}
                PaperProps={{
                  sx: { mt: 1.5, minWidth: 200 }
                }}
              >
                <MenuItem disabled>
                  <Box>
                    <Typography variant="body2" fontWeight="bold">
                      {usuario?.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {usuario?.email}
                    </Typography>
                    <Chip 
                      label={usuario?.tipo?.toUpperCase()} 
                      size="small" 
                      color={usuario?.tipo === 'admin' ? 'error' : 'primary'}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 1 }} /> Sair
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button color="inherit" onClick={() => navigate('/login')}>
              Login
            </Button>
            <Button color="inherit" onClick={() => navigate('/registrar')}>
              Registrar
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;